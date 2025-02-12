const ProductRepository = require('../../Repository/productRepository');
const logger = require('../../Config/logger');
const productController = require('../productController');

jest.mock('../../Repository/productRepository');
jest.mock('../../Config/logger');
jest.mock('../../Config/database', () => ({
  db: {}
}));

describe('ProductController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
  });

  describe('Validações Gerais', () => {
    test('deve limitar número máximo de itens por página', async () => {
      req = {
        query: { limit: '1000', page: '1' },
        user: { id: 1 }
      };

      const expectedFilters = {
        page: 1,
        limit: 10,
        search: undefined,
        minPrice: undefined,
        maxPrice: undefined
      };

      const mockResponse = {
        products: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      ProductRepository.findAllProducts.mockResolvedValue(mockResponse);

      await productController.getAllProducts(req, res);

      expect(ProductRepository.findAllProducts).toHaveBeenCalledWith(expectedFilters);
    });

    test('deve converter parâmetros numéricos para o padrão quando inválidos', async () => {
      req = {
        query: {
          page: '-1',
          limit: 'abc',
          minPrice: 'invalid',
          maxPrice: 'NaN'
        },
        user: { id: 1 }
      };

      const mockResponse = {
        products: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      ProductRepository.findAllProducts.mockResolvedValue(mockResponse);

      await productController.getAllProducts(req, res);

      expect(ProductRepository.findAllProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        minPrice: undefined,
        maxPrice: undefined
      });
    });
  });

  describe('Operações CRUD', () => {
    describe('createProduct', () => {
      const mockProduct = {
        id: 1,
        name: 'Produto Teste',
        price: 99.99,
        quantity: 10
      };

      beforeEach(() => {
        req = {
          body: {
            name: 'Produto Teste',
            price: 99.99,
            quantity: 10
          },
          user: { id: 1 }
        };
      });

      test('deve criar um produto com sucesso', async () => {
        ProductRepository.createProduct.mockResolvedValue(mockProduct);

        await productController.createProduct(req, res);

        expect(ProductRepository.createProduct).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockProduct);
        expect(logger.logWithContext).toHaveBeenCalledWith(
          'info',
          'Produto criado com sucesso',
          expect.objectContaining({
            productId: mockProduct.id,
            productName: mockProduct.name
          })
        );
      });

      test('deve garantir que logs não contenham informações sensíveis', async () => {
        await productController.createProduct(req, res);

        expect(logger.logWithContext).toHaveBeenCalledWith(
          'info',
          'Iniciando criação de produto',
          expect.not.objectContaining({
            password: expect.any(String),
            token: expect.any(String),
            apiKey: expect.any(String)
          })
        );
      });

      test('deve retornar erro 500 quando falhar ao criar produto', async () => {
        const error = new Error('Erro ao criar produto');
        ProductRepository.createProduct.mockRejectedValue(error);

        await productController.createProduct(req, res);

        expect(logger.logWithContext).toHaveBeenCalledWith('error', 'Erro ao criar produto', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: error.message });
      });
    });

    describe('updateProduct', () => {
      const mockUpdatedProduct = {
        id: 1,
        name: 'Produto Atualizado',
        price: 149.99,
        quantity: 15
      };

      beforeEach(() => {
        req = {
          params: { id: '1' },
          body: {
            name: 'Produto Atualizado',
            price: 149.99
          },
          user: { id: 1 }
        };
      });

      test('deve atualizar um produto com sucesso', async () => {
        ProductRepository.updateProductById.mockResolvedValue(mockUpdatedProduct);

        await productController.updateProduct(req, res);

        expect(ProductRepository.updateProductById).toHaveBeenCalledWith('1', req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUpdatedProduct);
        expect(logger.logWithContext).toHaveBeenCalledWith(
          'info',
          'Produto atualizado com sucesso',
          expect.objectContaining({
            productId: mockUpdatedProduct.id,
            productName: mockUpdatedProduct.name
          })
        );
      });

      test('deve retornar 404 quando produto não for encontrado', async () => {
        ProductRepository.updateProductById.mockResolvedValue(null);

        await productController.updateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
      });

      test('deve retornar erro 500 quando falhar ao atualizar', async () => {
        const error = new Error('Erro ao atualizar produto');
        ProductRepository.updateProductById.mockRejectedValue(error);

        await productController.updateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: error.message });
      });
    });

    describe('deleteProduct', () => {
      beforeEach(() => {
        req = {
          params: { id: '1' },
          user: { id: 1 }
        };
      });

      test('deve deletar um produto com sucesso', async () => {
        ProductRepository.deleteProductById.mockResolvedValue({ rowCount: 1 });

        await productController.deleteProduct(req, res);

        expect(ProductRepository.deleteProductById).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.end).toHaveBeenCalled();
        expect(logger.logWithContext).toHaveBeenCalledWith(
          'info',
          'Produto excluído com sucesso',
          expect.objectContaining({
            productId: req.params.id
          })
        );
      });

      test('deve retornar 404 quando produto não for encontrado', async () => {
        ProductRepository.deleteProductById.mockResolvedValue({ rowCount: 0 });

        await productController.deleteProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
      });

      test('deve retornar erro 500 quando falhar ao deletar', async () => {
        const error = new Error('Erro ao deletar produto');
        ProductRepository.deleteProductById.mockRejectedValue(error);

        await productController.deleteProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: error.message });
      });
    });

    describe('getProductById', () => {
      const mockProduct = { id: 1, name: 'Produto Teste', price: 99.99 };

      beforeEach(() => {
        req = {
          params: { id: '1' },
          user: { id: 1 }
        };
      });

      test('deve retornar um produto específico com sucesso', async () => {
        ProductRepository.findProductById.mockResolvedValue([mockProduct]);

        await productController.getProductById(req, res);

        expect(ProductRepository.findProductById).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockProduct);
      });

      test('deve retornar 404 quando produto não for encontrado', async () => {
        ProductRepository.findProductById.mockResolvedValue([]);

        await productController.getProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
      });

      test('deve retornar erro 500 quando falhar ao buscar produto', async () => {
        const error = new Error('Erro ao buscar produto');
        ProductRepository.findProductById.mockRejectedValue(error);

        await productController.getProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: error.message });
      });
    });
  });
});
