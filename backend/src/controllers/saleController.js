const Sale = require('../models/Sale');
const User = require('../models/User');
const { Op } = require('sequelize');
const database = require('../config/database');

class SaleController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, product, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (product) {
        whereClause.product = product;
      }

      if (status) {
        whereClause.status = status;
      }

      if (req.user.isAdvisor()) {
        whereClause.created_by = req.userId;
      }

      const { count, rows: sales } = await Sale.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          sales: sales.map(sale => this.formatSale(sale)),
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ventas',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const sale = await Sale.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'status_changer',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        });
      }

      if (req.user.isAdvisor() && sale.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta venta'
        });
      }

      res.json({
        success: true,
        data: this.formatSale(sale)
      });
    } catch (error) {
      console.error('Get sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener venta',
        error: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const { product, requestedAmount, franchise, interestRate } = req.body;

      const saleData = {
        product,
        requested_amount: requestedAmount,
        franchise: franchise || null,
        interest_rate: interestRate || null,
        created_by: req.userId,
        updated_by: req.userId,
        status: Sale.STATUSES.OPEN
      };

      const sale = await Sale.create(saleData);

      const saleWithUsers = await Sale.findByPk(sale.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Venta creada exitosamente',
        data: this.formatSale(saleWithUsers)
      });
    } catch (error) {
      console.error('Create sale error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear venta',
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { product, requestedAmount, franchise, interestRate } = req.body;

      const sale = await Sale.findByPk(id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        });
      }

      if (req.user.isAdvisor() && sale.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta venta'
        });
      }

      const updateData = {
        updated_by: req.userId
      };

      if (product !== undefined) updateData.product = product;
      if (requestedAmount !== undefined) updateData.requested_amount = requestedAmount;
      if (franchise !== undefined) updateData.franchise = franchise;
      if (interestRate !== undefined) updateData.interest_rate = interestRate;

      await sale.update(updateData);

      const updatedSale = await Sale.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Venta actualizada exitosamente',
        data: this.formatSale(updatedSale)
      });
    } catch (error) {
      console.error('Update sale error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar venta',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const sale = await Sale.findByPk(id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        });
      }

      if (req.user.isAdvisor() && sale.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta venta'
        });
      }

      await sale.destroy();

      res.json({
        success: true,
        message: 'Venta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Delete sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar venta',
        error: error.message
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const sale = await Sale.findByPk(id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        });
      }

      await sale.update({
        status,
        status_changed_at: new Date(),
        status_changed_by: req.userId,
        updated_by: req.userId
      });

      const updatedSale = await Sale.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'status_changer',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: this.formatSale(updatedSale)
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado',
        error: error.message
      });
    }
  }

  async getTotalAmount(req, res) {
    try {
      const whereClause = {};

      if (req.user.isAdvisor()) {
        whereClause.created_by = req.userId;
      }

      const result = await Sale.sum('requested_amount', { where: whereClause });
      const total = result || 0;

      res.json({
        success: true,
        data: {
          total: parseFloat(total)
        }
      });
    } catch (error) {
      console.error('Get total amount error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener total',
        error: error.message
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const whereClause = {};

      if (req.user.isAdvisor()) {
        whereClause.created_by = req.userId;
      }

      const sequelize = database.getSequelize();

      const salesByProduct = await Sale.findAll({
        where: whereClause,
        attributes: [
          'product',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('requested_amount')), 'total_amount']
        ],
        group: ['product'],
        raw: true
      });

      let salesByAdvisor = [];
      if (req.user.isAdmin()) {
        salesByAdvisor = await Sale.findAll({
          attributes: [
            'created_by',
            [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('requested_amount')), 'total_amount']
          ],
          include: [{
            model: User,
            as: 'creator',
            attributes: ['name', 'email']
          }],
          group: ['created_by', 'creator.id', 'creator.name', 'creator.email'],
          raw: true,
          nest: true
        });
      }

      const salesByStatus = await Sale.findAll({
        where: whereClause,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesByDate = await Sale.findAll({
        where: {
          ...whereClause,
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true
      });

      const totalSales = await Sale.count({ where: whereClause });
      const totalAmount = await Sale.sum('requested_amount', { where: whereClause }) || 0;

      res.json({
        success: true,
        data: {
          summary: {
            totalSales,
            totalAmount: parseFloat(totalAmount)
          },
          salesByProduct: salesByProduct.map(item => ({
            product: item.product,
            count: parseInt(item.count),
            totalAmount: parseFloat(item.total_amount || 0)
          })),
          salesByAdvisor: salesByAdvisor.map(item => ({
            advisorId: item.created_by,
            advisorName: item.creator?.name || 'Unknown',
            advisorEmail: item.creator?.email || '',
            count: parseInt(item.count),
            totalAmount: parseFloat(item.total_amount || 0)
          })),
          salesByStatus: salesByStatus.map(item => ({
            status: item.status,
            count: parseInt(item.count)
          })),
          salesByDate: salesByDate.map(item => ({
            date: item.date,
            count: parseInt(item.count)
          }))
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  formatSale(sale) {
    return {
      id: sale.id,
      product: sale.product,
      requestedAmount: parseFloat(sale.requested_amount),
      franchise: sale.franchise,
      interestRate: sale.interest_rate ? parseFloat(sale.interest_rate) : null,
      status: sale.status,
      statusChangedAt: sale.status_changed_at,
      statusChangedBy: sale.status_changer ? {
        id: sale.status_changer.id,
        name: sale.status_changer.name
      } : null,
      creator: {
        id: sale.creator.id,
        name: sale.creator.name,
        email: sale.creator.email
      },
      updater: {
        id: sale.updater.id,
        name: sale.updater.name,
        email: sale.updater.email
      },
      createdAt: sale.created_at,
      updatedAt: sale.updated_at
    };
  }
}

const saleController = new SaleController();
module.exports = saleController;