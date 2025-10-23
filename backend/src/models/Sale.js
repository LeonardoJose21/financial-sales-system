const { DataTypes, Model } = require('sequelize');
const database = require('../config/database');

class Sale extends Model {
  static PRODUCTS = {
    CONSUMER_CREDIT: 'Credito de Consumo',
    FREE_INVESTMENT: 'Libranza Libre Inversión',
    CREDIT_CARD: 'Tarjeta de Credito'
  };

  static FRANCHISES = {
    AMEX: 'AMEX',
    VISA: 'VISA',
    MASTERCARD: 'MASTERCARD'
  };

  static STATUSES = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Proceso',
    COMPLETED: 'Finalizado'
  };

  static async initialize() {
    Sale.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'El producto es obligatorio' },
            isIn: {
              args: [Object.values(Sale.PRODUCTS)],
              msg: 'Tipo de producto inválido'
            }
          }
        },
        requested_amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'El cupo solicitado es obligatorio' },
            isDecimal: { msg: 'El cupo debe ser un número válido' },
            min: {
              args: [0],
              msg: 'El cupo debe ser mayor a 0'
            }
          }
        },
        franchise: {
          type: DataTypes.STRING(20),
          allowNull: true,
          validate: {
            isIn: {
              args: [Object.values(Sale.FRANCHISES)],
              msg: 'Franquicia inválida'
            },
            isValidFranchise(value) {
              if (this.product === Sale.PRODUCTS.CREDIT_CARD && !value) {
                throw new Error('La franquicia es obligatoria para tarjetas de crédito');
              }
              if (this.product !== Sale.PRODUCTS.CREDIT_CARD && value) {
                throw new Error('La franquicia solo aplica para tarjetas de crédito');
              }
            }
          }
        },
        interest_rate: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: true,
          validate: {
            isDecimal: { msg: 'La tasa debe ser un número válido' },
            min: {
              args: [0],
              msg: 'La tasa debe ser mayor o igual a 0'
            },
            max: {
              args: [99.99],
              msg: 'La tasa debe ser menor a 100'
            },
            isValidRate(value) {
              const requiresRate = [
                Sale.PRODUCTS.CONSUMER_CREDIT,
                Sale.PRODUCTS.FREE_INVESTMENT
              ].includes(this.product);

              if (requiresRate && !value) {
                throw new Error('La tasa es obligatoria para este tipo de producto');
              }
              if (!requiresRate && value) {
                throw new Error('La tasa solo aplica para créditos de consumo y libranza');
              }
            }
          }
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: Sale.STATUSES.OPEN,
          validate: {
            isIn: {
              args: [Object.values(Sale.STATUSES)],
              msg: 'Estado inválido'
            }
          }
        },
        status_changed_at: {
          type: DataTypes.DATE,
          allowNull: true
        },
        status_changed_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        }
      },
      {
        sequelize: database.getSequelize(),
        modelName: 'Sale',
        tableName: 'sales',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    );

    return Sale;
  }

  static associate(models) {
    Sale.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Sale.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });

    Sale.belongsTo(models.User, {
      foreignKey: 'status_changed_by',
      as: 'status_changer'
    });
  }

  isCreditCard() {
    return this.product === Sale.PRODUCTS.CREDIT_CARD;
  }

  requiresInterestRate() {
    return [
      Sale.PRODUCTS.CONSUMER_CREDIT,
      Sale.PRODUCTS.FREE_INVESTMENT
    ].includes(this.product);
  }

  isOpen() {
    return this.status === Sale.STATUSES.OPEN;
  }

  isInProgress() {
    return this.status === Sale.STATUSES.IN_PROGRESS;
  }

  isCompleted() {
    return this.status === Sale.STATUSES.COMPLETED;
  }
}

module.exports = Sale;