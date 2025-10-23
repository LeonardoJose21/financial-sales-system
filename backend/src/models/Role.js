const { DataTypes, Model } = require('sequelize');
const database = require('../config/database');

class Role extends Model {
  static ADMIN = 'Administrador';
  static ADVISOR = 'Asesor';

  static async initialize() {
    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            isIn: [[Role.ADMIN, Role.ADVISOR]]
          }
        }
      },
      {
        sequelize: database.getSequelize(),
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    );

    return Role;
  }

  static async seedRoles() {
    const roles = [Role.ADMIN, Role.ADVISOR];
    
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName }
      });
    }
    
    console.log('Roles seeded successfully');
  }

  isAdmin() {
    return this.name === Role.ADMIN;
  }

  isAdvisor() {
    return this.name === Role.ADVISOR;
  }
}

module.exports = Role;