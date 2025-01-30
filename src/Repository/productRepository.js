const db = require('../config/database');
const Product = require('../Model/productModel');

const ProductRepository = {
  createProduct: (productData) => {
    const product = Product.createProduct(productData);
    return db.one(
      'INSERT INTO products (name, price, description, image, category, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [product.name, product.price, product.description, product.image, product.category, product.quantity, product.createdAt, product.updatedAt]
    );
  },

  findAllProducts: () => {
    return db.any('SELECT * FROM products ORDER BY id ASC');
  },

  findProductById: (id) => {
    return db.any('SELECT * FROM products WHERE id = $1', [id]);
  },

  deleteProductById: (id) => {
    return db.result('DELETE FROM products WHERE id = $1', [id]);
  },

  updateProductById: (id, productData) => {
    return db.tx(async (transaction) => {
      // Primeiro verifica se o produto existe
      const existingProduct = await transaction.oneOrNone('SELECT * FROM products WHERE id = $1', [id]);
      
      if (!existingProduct) {
        return null;
      }

      // Cria uma nova instância do produto com os dados atualizados
      const product = Product.createProduct(productData);
      
      // Se existir, realiza a atualização
      return transaction.oneOrNone(
        'UPDATE products SET name = $1, price = $2, description = $3, image = $4, category = $5, quantity = $6, updated_at = $7 WHERE id = $8 RETURNING *',
        [product.name, product.price, product.description, product.image, product.category, product.quantity, product.updatedAt, id]
      );
    });
  }
}

module.exports = ProductRepository;