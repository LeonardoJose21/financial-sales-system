require('dotenv').config();
const database = require('../config/database');
const modelManager = require('../models');
const Role = require('../models/Role');
const User = require('../models/User');

class DatabaseInitializer {
  async initialize() {
    try {
      console.log('Empezando la inicialización de la base de datos...\n');

      // Connect to database
      console.log('1. Conectando a la base de datos...');
      await database.connect();

      // Initialize models
      console.log('2. Inicializando modelos...');
      await modelManager.initialize();

      // Sync database (force: true will drop existing tables)
      console.log('3. Sincronizando la base de datos...');
      await database.sync({ force: true });
      await Role.seedRoles();

      // Create default admin user
      console.log('5. Creando usuarios por defecto...');
      await this.createDefaultUsers();

      console.log('\n=================================');
      console.log('Base de datos inicializada con exito!');
      console.log('=================================\n');
      console.log('Se han creado con exito los usuarios por defecto:');
      console.log('');
      console.log('Administrador:');
      console.log('  Email: admin@banco.com');
      console.log('  Password: Admin123!');
      console.log('');
      console.log('Asesor:');
      console.log('  Email: asesor@banco.com');
      console.log('  Password: Asesor123!');
      console.log('=================================\n');

      await database.close();
      process.exit(0);
    } catch (error) {
      console.error('Error inicializando la base de datos:', error);
      await database.close();
      process.exit(1);
    }
  }

  async createDefaultUsers() {
    const adminRole = await Role.findOne({ where: { name: 'Administrador' } });
    const advisorRole = await Role.findOne({ where: { name: 'Asesor' } });

    // Create admin user
    await User.findOrCreate({
      where: { email: 'admin@banco.com' },
      defaults: {
        name: 'Administrador Sistema',
        email: 'admin@banco.com',
        password: 'Admin123!',
        role_id: adminRole.id
      }
    });

    // Create advisor user
    await User.findOrCreate({
      where: { email: 'asesor@banco.com' },
      defaults: {
        name: 'Asesor Comercial',
        email: 'asesor@banco.com',
        password: 'Asesor123!',
        role_id: advisorRole.id
      }
    });

    console.log('Se han creado con exito los usuarios por defecto.');
  }
}

const initializer = new DatabaseInitializer();
initializer.initialize();
