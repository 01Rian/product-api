const express = require('express');
const ProductController = require('./ProductController');
const router = express.Router();

router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.delete('/:id', ProductController.deleteProduct);
router.put('/:id', ProductController.updateProduct);

module.exports = router;