const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const saleRoutes = require('./routes/sales');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde'
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde'
    });

    this.app.use('/api/auth/login', authLimiter);
    this.app.use('/api/', limiter);
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/sales', saleRoutes);

    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    });
  }

  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('Error:', err);

      const statusCode = err.statusCode || 500;
      const message = err.message || 'Error interno del servidor';

      res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();