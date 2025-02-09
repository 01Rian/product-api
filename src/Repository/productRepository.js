const db = require('../Config/database');
const Product = require('../Model/productModel');
const logger = require('../Config/logger');

const ProductRepository = {
  createProduct: async (productData) => {
    const start = process.hrtime();
    try {
      const product = Product.createProduct(productData);
      logger.logWithContext('info', 'Iniciando inserção de produto no banco de dados', {
        operation: 'createProduct',
        productData: { ...product, price: product.price.toString() }
      });

      const result = await db.one(
        'INSERT INTO products (name, price, description, image, category, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [product.name, product.price, product.description, product.image, product.category, product.quantity, product.createdAt, product.updatedAt]
      );

      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      logger.logWithContext('info', 'Produto inserido com sucesso no banco de dados', {
        operation: 'createProduct',
        productId: result.id,
        duration: `${duration.toFixed(2)}ms`
      });

      return result;
    } catch (error) {
      logger.logWithContext('error', 'Erro ao inserir produto no banco de dados', {
        operation: 'createProduct',
        error: error.message,
        productData
      });
      throw error;
    }
  },

  findAllProducts: async () => {
    const start = process.hrtime();
    try {
      logger.logWithContext('info', 'Iniciando busca de todos os produtos');
      
      const results = await db.any('SELECT * FROM products ORDER BY id ASC');
      
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      logger.logWithContext('info', 'Produtos recuperados com sucesso', {
        operation: 'findAllProducts',
        count: results.length,
        duration: `${duration.toFixed(2)}ms`
      });

      return results;
    } catch (error) {
      logger.logWithContext('error', 'Erro ao buscar todos os produtos', {
        operation: 'findAllProducts',
        error: error.message
      });
      throw error;
    }
  },

  findProductById: async (id) => {
    const start = process.hrtime();
    try {
      logger.logWithContext('info', 'Iniciando busca de produto por ID', {
        operation: 'findProductById',
        productId: id
      });

      const result = await db.any('SELECT * FROM products WHERE id = $1', [id]);

      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      if (result.length === 0) {
        logger.logWithContext('warn', 'Produto não encontrado', {
          operation: 'findProductById',
          productId: id,
          duration: `${duration.toFixed(2)}ms`
        });
      } else {
        logger.logWithContext('info', 'Produto encontrado com sucesso', {
          operation: 'findProductById',
          productId: id,
          duration: `${duration.toFixed(2)}ms`
        });
      }

      return result;
    } catch (error) {
      logger.logWithContext('error', 'Erro ao buscar produto por ID', {
        operation: 'findProductById',
        productId: id,
        error: error.message
      });
      throw error;
    }
  },

  deleteProductById: async (id) => {
    const start = process.hrtime();
    try {
      logger.logWithContext('info', 'Iniciando exclusão de produto', {
        operation: 'deleteProductById',
        productId: id
      });

      const result = await db.result('DELETE FROM products WHERE id = $1', [id]);

      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      logger.logWithContext('info', 'Operação de exclusão concluída', {
        operation: 'deleteProductById',
        productId: id,
        rowCount: result.rowCount,
        duration: `${duration.toFixed(2)}ms`
      });

      return result;
    } catch (error) {
      logger.logWithContext('error', 'Erro ao excluir produto', {
        operation: 'deleteProductById',
        productId: id,
        error: error.message
      });
      throw error;
    }
  },

  updateProductById: async (id, productData) => {
    const start = process.hrtime();
    try {
      logger.logWithContext('info', 'Iniciando atualização de produto', {
        operation: 'updateProductById',
        productId: id,
        productData
      });

      const result = await db.tx(async (transaction) => {
        const existingProduct = await transaction.oneOrNone('SELECT * FROM products WHERE id = $1', [id]);
        
        if (!existingProduct) {
          logger.logWithContext('warn', 'Produto não encontrado para atualização', {
            operation: 'updateProductById',
            productId: id
          });
          return null;
        }

        const product = Product.createProduct(productData);
        
        return transaction.oneOrNone(
          'UPDATE products SET name = $1, price = $2, description = $3, image = $4, category = $5, quantity = $6, updated_at = $7 WHERE id = $8 RETURNING *',
          [product.name, product.price, product.description, product.image, product.category, product.quantity, product.updatedAt, id]
        );
      });

      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      if (result) {
        logger.logWithContext('info', 'Produto atualizado com sucesso', {
          operation: 'updateProductById',
          productId: id,
          duration: `${duration.toFixed(2)}ms`
        });
      }

      return result;
    } catch (error) {
      logger.logWithContext('error', 'Erro ao atualizar produto', {
        operation: 'updateProductById',
        productId: id,
        error: error.message,
        productData
      });
      throw error;
    }
  }
}

module.exports = ProductRepository;