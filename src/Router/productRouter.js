const express = require('express');
const ProductController = require('../Controller/productController');
const { 
  validateProductFields, 
  validateProductId, 
  sanitizeProductData,
  formatDates,
  formatDateResponse,
  methodNotAllowed,
  handleInvalidRoute
} = require('../Middleware/productValidationMiddleware');
const router = express.Router();

// Aplica o middleware de formatação de datas em todas as rotas
router.use(formatDateResponse);

// Rotas principais
router.post('/', validateProductFields, sanitizeProductData, formatDates, ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', validateProductId, ProductController.getProductById);
router.delete('/:id', validateProductId, ProductController.deleteProduct);
router.put('/:id', validateProductId, validateProductFields, sanitizeProductData, formatDates, ProductController.updateProduct);

// Tratamento de métodos não permitidos
router.all('/', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    return next();
  }
  methodNotAllowed(req, res);
});

router.all('/:id', (req, res, next) => {
  if (['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }
  methodNotAllowed(req, res);
});

// Tratamento de rotas inválidas
router.all('*', handleInvalidRoute);

module.exports = router;