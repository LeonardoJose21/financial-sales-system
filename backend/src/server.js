require('dotenv').config();
const app = require('./app');
const database = require('./config/database');
const modelManager = require('./models');

class Server {
  constructor() {
    this.port = process.env.PORT || 5000;
    this.server = null;
  }

  async start() {
    try {
      console.log('Connecting to database...');
      await database.connect();

      console.log('Initializing models...');
      await modelManager.initialize();

      console.log('Synchronizing database...');
      await database.sync();

      this.server = app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      this.setupGracefulShutdown();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async () => {
          console.log('HTTP server closed');
          await database.close();
          console.log('Database connection closed');
          process.exit(0);
        });
      }

      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

const server = new Server();
server.start();