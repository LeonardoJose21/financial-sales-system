const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const captchaService = require('../services/captchaService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password, captchaId, captchaAnswer } = req.body;

      // Verify captcha
      const captchaVerification = captchaService.verifyCaptcha(captchaId, captchaAnswer);
      if (!captchaVerification.valid) {
        return res.status(400).json({
          success: false,
          message: captchaVerification.message
        });
      }

      // Find user
      const user = await User.findOne({
        where: { email },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  }

  // --- Register new user ---
  async register(req, res) {
    try {
      const { name, email, password, captchaId, captchaAnswer } = req.body;

      // Verify captcha
      const captchaVerification = captchaService.verifyCaptcha(captchaId, captchaAnswer);
      if (!captchaVerification.valid) {
        return res.status(400).json({
          success: false,
          message: captchaVerification.message
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      // Find or create default role (Asesor)
      const [defaultRole, created] = await Role.findOrCreate({
        where: { name: Role.ADVISOR }, // 'Asesor'
        defaults: { name: Role.ADVISOR }
      });

      // Create user with the default role
      const user = await User.create({
        name,
        email,
        password,
        role_id: defaultRole.id
      });

      // Get user with role for response
      const userWithRole = await User.findByPk(user.id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      // Generate JWT token for auto-login
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          token,
          user: {
            id: userWithRole.id,
            name: userWithRole.name,
            email: userWithRole.email,
            role: userWithRole.role.name
          }
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      
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
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  }

  async getCaptcha(req, res) {
    try {
      const captcha = captchaService.generateCaptcha();
      res.json({
        success: true,
        data: captcha
      });
    } catch (error) {
      console.error('Captcha generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar captcha'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
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
          role: user.role.name
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario actual'
      });
    }
  }

  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión'
      });
    }
  }
}

const authController = new AuthController();
module.exports = authController;