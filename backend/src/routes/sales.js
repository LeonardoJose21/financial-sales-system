const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const validation = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/statistics', saleController.getStatistics.bind(saleController));
router.get('/total', saleController.getTotalAmount.bind(saleController));
router.get('/', saleController.getAll.bind(saleController));
router.get('/:id', validation.validateId(), saleController.getById.bind(saleController));
router.post('/', validation.validateCreateSale(), saleController.create.bind(saleController));
router.put('/:id', validation.validateUpdateSale(), saleController.update.bind(saleController));
router.patch('/:id/status', validation.validateUpdateStatus(), saleController.updateStatus.bind(saleController));
router.delete('/:id', validation.validateId(), saleController.delete.bind(saleController));

module.exports = router;