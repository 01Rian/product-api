const ProductRepository = require('../Repository/productRepository');
const logger = require('../Config/logger');

class ProductController {
  createProduct = async (req, res) => {
    try {
      logger.logWithContext('info', 'Iniciando criação de produto', {
        productData: {
          ...req.body,
          password: undefined,
          token: undefined,
          apiKey: undefined
        },
        userId: req.user?.id 
      });

      const product = await ProductRepository.createProduct(req.body);

      logger.logWithContext('info', 'Produto criado com sucesso', {
        productId: product.id,
        productName: product.name
      });

      res.status(201).json(product);
    } catch (error) {
      logger.logWithContext('error', 'Erro ao criar produto', {
        error: error.message,
        stack: error.stack,
        productData: req.body
      });

      res.status(500).json({ message: error.message });
    }
  }

  getAllProducts = async (req, res) => {
    try {
      const { page = 1, limit = 10, search, minPrice, maxPrice } = req.query;

      logger.logWithContext('info', 'Iniciando busca de todos os produtos', {
        userId: req.user?.id,
        filters: { page, limit, search, minPrice, maxPrice }
      });

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
      };

      const result = await ProductRepository.findAllProducts(filters);

      logger.logWithContext('info', 'Produtos recuperados com sucesso', {
        count: result.products.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });

      res.status(200).json({
        products: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.logWithContext('error', 'Erro ao buscar produtos', {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({ message: error.message });
    }
  }

  getProductById = async (req, res) => {
    try {
      logger.logWithContext('info', 'Iniciando busca de produto por ID', {
        productId: req.params.id,
        userId: req.user?.id
      });

      const productById = await ProductRepository.findProductById(req.params.id);
      
      if (productById.length > 0) {
        logger.logWithContext('info', 'Produto encontrado com sucesso', {
          productId: req.params.id,
          productName: productById[0].name
        });
        res.status(200).json(productById[0]);
      } else {
        logger.logWithContext('warn', 'Produto não encontrado', {
          productId: req.params.id
        });
        res.status(404).json({ message: 'Produto não encontrado' });
      }
    } catch (error) {
      logger.logWithContext('error', 'Erro ao buscar produto por ID', {
        error: error.message,
        stack: error.stack,
        productId: req.params.id
      });

      res.status(500).json({ message: error.message });
    }
  }

  deleteProduct = async (req, res) => {
    try {
      logger.logWithContext('info', 'Iniciando exclusão de produto', {
        productId: req.params.id,
        userId: req.user?.id
      });

      const productDeleted = await ProductRepository.deleteProductById(req.params.id);
      
      if (productDeleted.rowCount > 0) {
        logger.logWithContext('info', 'Produto excluído com sucesso', {
          productId: req.params.id
        });
        res.status(204).end();
      } else {
        logger.logWithContext('warn', 'Produto não encontrado para exclusão', {
          productId: req.params.id
        });
        res.status(404).json({ message: 'Produto não encontrado' });
      }
    } catch (error) {
      logger.logWithContext('error', 'Erro ao excluir produto', {
        error: error.message,
        stack: error.stack,
        productId: req.params.id
      });

      res.status(500).json({ message: error.message });
    }
  }

  updateProduct = async (req, res) => {
    try {
      logger.logWithContext('info', 'Iniciando atualização de produto', {
        productId: req.params.id,
        updateData: req.body
      });

      const updatedProduct = await ProductRepository.updateProductById(req.params.id, req.body);
      
      if (!updatedProduct) {
        logger.logWithContext('warn', 'Produto não encontrado para atualização', {
          productId: req.params.id
        });
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      logger.logWithContext('info', 'Produto atualizado com sucesso', {
        productId: updatedProduct.id,
        productName: updatedProduct.name
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      logger.logWithContext('error', 'Erro ao atualizar produto', {
        error: error.message,
        stack: error.stack,
        productId: req.params.id,
        updateData: req.body
      });

      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController(); 