const { body, param, validationResult } = require('express-validator');
const Sale = require('../models/Sale');

class ValidationMiddleware {
  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg
        }))
      });
    }
    next();
  }

  validateLogin() {
    return [
      body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .isLength({ max: 50 }).withMessage('El correo debe tener máximo 50 caracteres'),
      body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6, max: 20 }).withMessage('La contraseña debe tener entre 6 y 20 caracteres'),
      body('captchaAnswer')
        .notEmpty().withMessage('La respuesta del captcha es obligatoria')
        .isInt().withMessage('La respuesta del captcha debe ser un número'),
      this.handleValidationErrors
    ];
  }

  validateCreateUser() {
    return [
      body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 1, max: 50 }).withMessage('El nombre debe tener entre 1 y 50 caracteres'),
      body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .isLength({ max: 50 }).withMessage('El correo debe tener máximo 50 caracteres'),
      body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6, max: 20 }).withMessage('La contraseña debe tener entre 6 y 20 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
      body('roleId')
        .notEmpty().withMessage('El tipo de usuario es obligatorio')
        .isInt().withMessage('El tipo de usuario debe ser un número válido'),
      this.handleValidationErrors
    ];
  }

  validateUpdateUser() {
    return [
      param('id')
        .isInt().withMessage('ID de usuario inválido'),
      body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('El nombre debe tener entre 1 y 50 caracteres'),
      body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .isLength({ max: 50 }).withMessage('El correo debe tener máximo 50 caracteres'),
      body('password')
        .optional()
        .isLength({ min: 6, max: 20 }).withMessage('La contraseña debe tener entre 6 y 20 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
      body('roleId')
        .optional()
        .isInt().withMessage('El tipo de usuario debe ser un número válido'),
      this.handleValidationErrors
    ];
  }

  validateCreateSale() {
    return [
      body('product')
        .notEmpty().withMessage('El producto es obligatorio')
        .isIn(Object.values(Sale.PRODUCTS)).withMessage('Tipo de producto inválido'),
      body('requestedAmount')
        .notEmpty().withMessage('El cupo solicitado es obligatorio')
        .isFloat({ min: 0 }).withMessage('El cupo debe ser un número válido mayor a 0'),
      body('franchise')
        .custom((value, { req }) => {
          if (req.body.product === Sale.PRODUCTS.CREDIT_CARD && !value) {
            throw new Error('La franquicia es obligatoria para tarjetas de crédito');
          }
          if (req.body.product !== Sale.PRODUCTS.CREDIT_CARD && value) {
            throw new Error('La franquicia solo aplica para tarjetas de crédito');
          }
          if (value && !Object.values(Sale.FRANCHISES).includes(value)) {
            throw new Error('Franquicia inválida');
          }
          return true;
        }),
      body('interestRate')
        .custom((value, { req }) => {
          const requiresRate = [
            Sale.PRODUCTS.CONSUMER_CREDIT,
            Sale.PRODUCTS.FREE_INVESTMENT
          ].includes(req.body.product);

          if (requiresRate && !value) {
            throw new Error('La tasa es obligatoria para este tipo de producto');
          }
          if (!requiresRate && value) {
            throw new Error('La tasa solo aplica para créditos de consumo y libranza');
          }
          if (value && (isNaN(value) || value < 0 || value >= 100)) {
            throw new Error('La tasa debe ser un número entre 0 y 99.99');
          }
          return true;
        }),
      this.handleValidationErrors
    ];
  }

  validateUpdateSale() {
    return [
      param('id')
        .isInt().withMessage('ID de venta inválido'),
      ...this.validateCreateSale()
    ];
  }

  validateUpdateStatus() {
    return [
      param('id')
        .isInt().withMessage('ID de venta inválido'),
      body('status')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(Object.values(Sale.STATUSES)).withMessage('Estado inválido'),
      this.handleValidationErrors
    ];
  }

  validateId() {
    return [
      param('id')
        .isInt().withMessage('ID inválido'),
      this.handleValidationErrors
    ];
  }

  validateRegister() {
    return [
      body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 1, max: 50 }).withMessage('El nombre debe tener entre 1 y 50 caracteres'),
      body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .isLength({ max: 50 }).withMessage('El correo debe tener máximo 50 caracteres'),
      body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6, max: 20 }).withMessage('La contraseña debe tener entre 6 y 20 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
      body('captchaAnswer')
        .notEmpty().withMessage('La respuesta del captcha es obligatoria')
        .isInt().withMessage('La respuesta del captcha debe ser un número'),
      this.handleValidationErrors
    ];
  }
}

const validationMiddleware = new ValidationMiddleware();

module.exports = validationMiddleware;