const User = require('../models/User');
const Role = require('../models/Role');
const { Op } = require('sequelize');

class UserController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = search
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          }
        : {};

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        include: [{
          model: Role,
          as: 'role'
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            roleId: user.role_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          })),
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          roleId: user.role_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const { name, email, password, roleId } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido'
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role_id: roleId
      });

      const userWithRole = await User.findByPk(user.id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: userWithRole.id,
          name: userWithRole.name,
          email: userWithRole.email,
          role: userWithRole.role.name,
          roleId: userWithRole.role_id,
          createdAt: userWithRole.created_at
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      
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
        message: 'Error al crear usuario',
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, roleId } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'El correo electrónico ya está registrado'
          });
        }
      }

      if (roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Rol inválido'
          });
        }
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (roleId) updateData.role_id = roleId;

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role.name,
          roleId: updatedUser.role_id,
          updatedAt: updatedUser.updated_at
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      
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
        message: 'Error al actualizar usuario',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (parseInt(id) === req.userId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propio usuario'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario',
        error: error.message
      });
    }
  }

  async getRoles(req, res) {
    try {
      const roles = await Role.findAll();

      res.json({
        success: true,
        data: roles.map(role => ({
          id: role.id,
          name: role.name
        }))
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles'
      });
    }
  }
}

const userController = new UserController();
module.exports = userController;