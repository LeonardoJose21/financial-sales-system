// import { Sequelize } from "sequelize";
// import dotenv from "dotenv";
// dotenv.config();

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false, // Needed for Neon, Supabase, etc.
//     },
//   },
//   logging: false,
// });

// export const getSequelize = () => sequelize;
// export default sequelize;

const { Sequelize } = require('sequelize');
require('dotenv').config();

class Database {
  constructor() {
    // Use DATABASE_URL directly
    this.sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    });
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('✓ Database connection established successfully.');
      return true;
    } catch (error) {
      console.error('✗ Unable to connect to the database:', error.message);
      return false;
    }
  }

  async sync(options = {}) {
    try {
      await this.sequelize.sync(options);
      console.log('✓ Database synchronized successfully.');
      return true;
    } catch (error) {
      console.error('✗ Error synchronizing database:', error.message);
      return false;
    }
  }

  getSequelize() {
    return this.sequelize;
  }

  async close() {
    await this.sequelize.close();
    console.log('✓ Database connection closed.');
  }
}

module.exports = new Database();

