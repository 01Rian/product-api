// Mock das dependências antes de importar o módulo que as usa
jest.mock('../../Config/database');
jest.mock('../../Model/productModel');
jest.mock('../../Config/logger');

const ProductRepository = require('../productRepository');
const Product = require('../../Model/productModel');
const db = require('../../Config/database');
const logger = require('../../Config/logger');

describe('ProductRepository', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    // Mock do método de log para todos os testes
    logger.logWithContext = jest.fn();
  });

  describe('createProduct', () => {
    const mockProductData = {
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Test Category',
      quantity: 10
    };

    const mockCreatedProduct = {
      ...mockProductData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('deve criar um produto com sucesso', async () => {
      // Mock do Product.createProduct
      Product.createProduct.mockReturnValue(mockCreatedProduct);

      // Mock do db.one para simular inserção
      const mockDbResult = { id: 1, ...mockCreatedProduct };
      db.one.mockResolvedValue(mockDbResult);

      const result = await ProductRepository.createProduct(mockProductData);

      expect(Product.createProduct).toHaveBeenCalledWith(mockProductData);
      expect(db.one).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          mockCreatedProduct.name,
          mockCreatedProduct.price,
          mockCreatedProduct.description,
          mockCreatedProduct.image,
          mockCreatedProduct.category,
          mockCreatedProduct.quantity,
          mockCreatedProduct.createdAt,
          mockCreatedProduct.updatedAt
        ])
      );
      expect(result).toEqual(mockDbResult);
      expect(logger.logWithContext).toHaveBeenCalledTimes(2);
    });

    it('deve propagar erro ao criar produto', async () => {
      const error = new Error('Database error');
      Product.createProduct.mockReturnValue(mockCreatedProduct);
      db.one.mockRejectedValue(error);

      await expect(ProductRepository.createProduct(mockProductData))
        .rejects.toThrow('Database error');

      expect(logger.logWithContext).toHaveBeenCalledWith(
        'error',
        'Erro ao inserir produto no banco de dados',
        expect.any(Object)
      );
    });
  });

  describe('findAllProducts', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 }
    ];

    it('deve buscar produtos com sucesso', async () => {
      db.one.mockResolvedValue({ count: '2' });
      db.any.mockResolvedValue(mockProducts);

      const result = await ProductRepository.findAllProducts({});

      expect(result).toEqual({
        products: mockProducts,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      });
      expect(logger.logWithContext).toHaveBeenCalledTimes(2);
    });

    it('deve aplicar filtros corretamente', async () => {
      db.one.mockResolvedValue({ count: '1' });
      db.any.mockResolvedValue([mockProducts[0]]);

      const filters = {
        page: 2,
        limit: 5,
        search: 'test',
        minPrice: 50,
        maxPrice: 150
      };

      await ProductRepository.findAllProducts(filters);

      expect(db.any).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['%test%', 50, 150])
      );
    });

    it('deve propagar erro na busca', async () => {
      const error = new Error('Database error');
      db.one.mockRejectedValue(error);

      await expect(ProductRepository.findAllProducts({}))
        .rejects.toThrow('Database error');

      expect(logger.logWithContext).toHaveBeenCalledWith(
        'error',
        'Erro ao buscar todos os produtos',
        expect.any(Object)
      );
    });
  });

  describe('findProductById', () => {
    const mockProduct = { id: 1, name: 'Test Product' };

    it('deve encontrar produto por ID com sucesso', async () => {
      db.any.mockResolvedValue([mockProduct]);

      const result = await ProductRepository.findProductById(1);

      expect(result).toEqual([mockProduct]);
      expect(db.any).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
      expect(logger.logWithContext).toHaveBeenCalledTimes(2);
    });

    it('deve retornar array vazio quando produto não existe', async () => {
      db.any.mockResolvedValue([]);

      const result = await ProductRepository.findProductById(999);

      expect(result).toEqual([]);
      expect(logger.logWithContext).toHaveBeenCalledWith(
        'warn',
        'Produto não encontrado',
        expect.any(Object)
      );
    });

    it('deve propagar erro na busca por ID', async () => {
      const error = new Error('Database error');
      db.any.mockRejectedValue(error);

      await expect(ProductRepository.findProductById(1))
        .rejects.toThrow('Database error');

      expect(logger.logWithContext).toHaveBeenCalledWith(
        'error',
        'Erro ao buscar produto por ID',
        expect.any(Object)
      );
    });
  });

  describe('deleteProductById', () => {
    it('deve deletar produto com sucesso', async () => {
      const mockResult = { rowCount: 1 };
      db.result.mockResolvedValue(mockResult);

      const result = await ProductRepository.deleteProductById(1);

      expect(result).toEqual(mockResult);
      expect(db.result).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
      expect(logger.logWithContext).toHaveBeenCalledTimes(2);
    });

    it('deve propagar erro ao deletar', async () => {
      const error = new Error('Database error');
      db.result.mockRejectedValue(error);

      await expect(ProductRepository.deleteProductById(1))
        .rejects.toThrow('Database error');

      expect(logger.logWithContext).toHaveBeenCalledWith(
        'error',
        'Erro ao excluir produto',
        expect.any(Object)
      );
    });
  });

  describe('updateProductById', () => {
    const mockProductData = {
      name: 'Updated Product',
      price: 150,
      description: 'Updated Description',
      image: 'updated.jpg',
      category: 'Updated Category',
      quantity: 15
    };

    const mockUpdatedProduct = {
      id: 1,
      ...mockProductData,
      updatedAt: new Date()
    };

    it('deve atualizar produto com sucesso', async () => {
      const mockTx = {
        oneOrNone: jest.fn()
      };

      mockTx.oneOrNone
        .mockResolvedValueOnce({ id: 1 }) // Simula produto existente
        .mockResolvedValueOnce(mockUpdatedProduct); // Simula atualização

      db.tx.mockImplementation(callback => callback(mockTx));
      Product.createProduct.mockReturnValue(mockProductData);

      const result = await ProductRepository.updateProductById(1, mockProductData);

      expect(result).toEqual(mockUpdatedProduct);
      expect(Product.createProduct).toHaveBeenCalledWith(mockProductData);
      expect(logger.logWithContext).toHaveBeenCalledTimes(2);
    });

    it('deve retornar null quando produto não existe', async () => {
      const mockTx = {
        oneOrNone: jest.fn().mockResolvedValue(null)
      };

      db.tx.mockImplementation(callback => callback(mockTx));

      const result = await ProductRepository.updateProductById(999, mockProductData);

      expect(result).toBeNull();
      expect(logger.logWithContext).toHaveBeenCalledWith(
        'warn',
        'Produto não encontrado para atualização',
        expect.any(Object)
      );
    });

    it('deve propagar erro na atualização', async () => {
      const error = new Error('Database error');
      db.tx.mockRejectedValue(error);

      await expect(ProductRepository.updateProductById(1, mockProductData))
        .rejects.toThrow('Database error');

      expect(logger.logWithContext).toHaveBeenCalledWith(
        'error',
        'Erro ao atualizar produto',
        expect.any(Object)
      );
    });
  });
});