const express = require('express');
const ProductRepository = require('../Repository/productRepository')
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const product = await ProductRepository.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
})

router.get('/', async (req, res) => {
  try {
    const allProduct = await ProductRepository.findAllProducts();
    res.status(200).json(allProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
})

router.get('/:id', async (req, res) => {
  try {
    const productById = await ProductRepository.findProductById(req.params.id);
    productById.length > 0 ? res.status(200).json(productById[0]) : res.status(404).json({ message : 'Produto não encontrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const productDeleted = await ProductRepository.deleteProductById(req.params.id);
    productDeleted.rowCount > 0 ? res.status(204).end() : res.status(404).json({ message : 'Produto não encontrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
})

router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await ProductRepository.updateProductById(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
})

module.exports = router;