const Product = require('../productModel');

describe('Product Model', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    test('deve criar um produto com todos os campos obrigatórios', () => {
      const produto = new Product('Smartphone', 999.99, null, null, null, 10);
      
      expect(produto.name).toBe('Smartphone');
      expect(produto.price).toBe(999.99);
      expect(produto.quantity).toBe(10);
      expect(produto.createdAt).toEqual(new Date('2025-01-01'));
      expect(produto.updatedAt).toEqual(new Date('2025-01-01'));
    });

    test('deve usar valores padrão para campos opcionais', () => {
      const produto = new Product('Smartphone', 999.99, null, null, null, 10);
      
      expect(produto.description).toBe('');
      expect(produto.image).toBe('');
      expect(produto.category).toBe('');
    });

    test('deve aceitar todos os campos opcionais', () => {
      const produto = new Product(
        'Smartphone',
        999.99,
        'Um smartphone incrível',
        'smartphone.jpg',
        'Eletrônicos',
        10
      );
      
      expect(produto.description).toBe('Um smartphone incrível');
      expect(produto.image).toBe('smartphone.jpg');
      expect(produto.category).toBe('Eletrônicos');
    });
  });

  describe('createProduct', () => {
    test('deve criar um produto a partir de dados', () => {
      const dadosProduto = {
        name: 'Smartphone',
        price: 999.99,
        description: 'Um smartphone incrível',
        image: 'smartphone.jpg',
        category: 'Eletrônicos',
        quantity: 10
      };

      const produto = Product.createProduct(dadosProduto);
      
      expect(produto).toBeInstanceOf(Product);
      expect(produto.name).toBe(dadosProduto.name);
      expect(produto.price).toBe(dadosProduto.price);
      expect(produto.description).toBe(dadosProduto.description);
      expect(produto.image).toBe(dadosProduto.image);
      expect(produto.category).toBe(dadosProduto.category);
      expect(produto.quantity).toBe(dadosProduto.quantity);
      expect(produto.createdAt).toEqual(new Date('2025-01-01'));
      expect(produto.updatedAt).toEqual(new Date('2025-01-01'));
    });

    test('deve criar um produto com campos opcionais nulos', () => {
      const dadosProduto = {
        name: 'Smartphone',
        price: 999.99,
        quantity: 10
      };

      const produto = Product.createProduct(dadosProduto);
      
      expect(produto).toBeInstanceOf(Product);
      expect(produto.description).toBe('');
      expect(produto.image).toBe('');
      expect(produto.category).toBe('');
    });
  });
});