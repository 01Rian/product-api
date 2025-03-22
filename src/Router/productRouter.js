const express = require('express');
const ProductController = require('../Controller/productController');
const { 
  validateProductFields, 
  validateProductId, 
  sanitizeProductData,
  formatDates,
  formatDateResponse,
  methodNotAllowed,
  handleInvalidRoute,
  searchParamsValidation
} = require('../Middleware/index');
const router = express.Router();

// Aplica o middleware de formatação de datas em todas as rotas
router.use(formatDateResponse);

// Rotas principais
router.post('/', searchParamsValidation, validateProductFields, sanitizeProductData, formatDates, ProductController.createProduct);
router.get('/', searchParamsValidation, ProductController.getAllProducts);
router.get('/:id', searchParamsValidation, validateProductId, ProductController.getProductById);
router.delete('/:id', searchParamsValidation, validateProductId, ProductController.deleteProduct);
router.put('/:id', searchParamsValidation, validateProductId, validateProductFields, sanitizeProductData, formatDates, ProductController.updateProduct);

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