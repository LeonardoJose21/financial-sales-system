const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

class AuthMiddleware {
  async authenticate(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No se proporcionó token de autenticación'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      req.user = user;
      req.userId = user.id;
      req.token = token;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error en la autenticación'
      });
    }
  }

  requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
    }

    next();
  }

  requireAdvisor(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!req.user.isAdvisor() && !req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de asesor'
      });
    }

    next();
  }
}

const authMiddleware = new AuthMiddleware();

module.exports = {
  authenticate: authMiddleware.authenticate.bind(authMiddleware),
  requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),
  requireAdvisor: authMiddleware.requireAdvisor.bind(authMiddleware)
};