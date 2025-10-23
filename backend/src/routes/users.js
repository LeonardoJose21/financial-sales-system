const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

router.get('/roles', userController.getRoles.bind(userController));
router.get('/', userController.getAll.bind(userController));
router.get('/:id', validation.validateId(), userController.getById.bind(userController));
router.post('/', validation.validateCreateUser(), userController.create.bind(userController));
router.put('/:id', validation.validateUpdateUser(), userController.update.bind(userController));
router.delete('/:id', validation.validateId(), userController.delete.bind(userController));

module.exports = router;