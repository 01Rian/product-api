const express = require('express');
const ProductController = require('./productController');
const { 
  validateProductFields, 
  validateProductId, 
  sanitizeProductData,
  formatDates,
  formatDateResponse
} = require('../Middleware/productValidationMiddleware');
const router = express.Router();

// Aplica o middleware de formatação de datas em todas as rotas
router.use(formatDateResponse);

router.post('/', validateProductFields, sanitizeProductData, formatDates, ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', validateProductId, ProductController.getProductById);
router.delete('/:id', validateProductId, ProductController.deleteProduct);
router.put('/:id', validateProductId, validateProductFields, sanitizeProductData, formatDates, ProductController.updateProduct);

module.exports = router;