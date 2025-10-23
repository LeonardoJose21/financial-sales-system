const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const database = require('../config/database');

class User extends Model {
  static async initialize() {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'El nombre es obligatorio' },
            len: {
              args: [1, 50],
              msg: 'El nombre debe tener entre 1 y 50 caracteres'
            }
          }
        },
        email: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: {
            msg: 'El correo electrónico ya está registrado'
          },
          validate: {
            notEmpty: { msg: 'El correo electrónico es obligatorio' },
            isEmail: { msg: 'Debe ser un correo electrónico válido' },
            len: {
              args: [1, 50],
              msg: 'El correo debe tener entre 1 y 50 caracteres'
            }
          }
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'La contraseña es obligatoria' }
          }
        },
        role_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id'
          }
        }
      },
      {
        sequelize: database.getSequelize(),
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
          beforeCreate: async (user) => {
            if (user.password) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
          beforeUpdate: async (user) => {
            if (user.changed('password')) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          }
        }
      }
    );

    return User;
  }

  static associate(models) {
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });
    
    User.hasMany(models.Sale, {
      foreignKey: 'created_by',
      as: 'created_sales'
    });
    
    User.hasMany(models.Sale, {
      foreignKey: 'updated_by',
      as: 'updated_sales'
    });
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }

  isAdmin() {
    return this.role && this.role.name === 'Administrador';
  }

  isAdvisor() {
    return this.role && this.role.name === 'Asesor';
  }
}

module.exports = User;