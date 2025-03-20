const {
validateProductFields,
  validateProductId,
  sanitizeProductData,
  formatDates,
  formatDateResponse,
  methodNotAllowed,
  handleInvalidRoute
} = require('../index');
const logger = require('../../Config/logger');

// Mocking logger
jest.mock('../../Config/logger');

describe('Product Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test Product',
        price: 100,
        quantity: 10
      },
      params: {},
      id: 'test-request-id'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateProductFields', () => {
    test('deve passar validação com dados válidos', () => {
      validateProductFields(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('deve rejeitar quando nome estiver vazio', () => {
      req.body.name = '';
      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome do produto é obrigatório' });
    });

    test('deve rejeitar quando nome for apenas espaços', () => {
      req.body.name = '   ';
      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome do produto é obrigatório' });
    });

    test('deve rejeitar preço zero', () => {
      req.body.price = 0;
      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Preço deve ser um número maior que zero' });
    });

    test('deve rejeitar preço negativo', () => {
      req.body.price = -10;
      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Preço deve ser um número maior que zero' });
    });

    test('deve rejeitar quantidade negativa', () => {
      req.body.quantity = -1;
      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Quantidade deve ser um número não negativo' });
    });

    test('deve rejeitar preço não numérico', () => {
      req.body.price = 'abc';
      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Preço deve ser um número maior que zero' });
    });

    test('should reject when name field is missing entirely', () => {
      const req = { body: { price: 100, quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome do produto é obrigatório' });
    });

    test('should handle extremely large price values', () => {
      const req = { body: { name: 'Product', price: Number.MAX_SAFE_INTEGER + 1, quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      validateProductFields(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Preço deve ser um número maior que zero' });
    });
  });

  describe('validateProductId', () => {
    test('deve passar com ID válido', () => {
      req.params.id = '123';
      validateProductId(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('deve rejeitar ID não numérico', () => {
      req.params.id = 'abc';
      validateProductId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do produto inválido' });
    });

    test('deve rejeitar ID vazio', () => {
      req.params.id = '';
      validateProductId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do produto inválido' });
    });
  });

  describe('sanitizeProductData', () => {
    test('deve remover espaços em branco dos campos de texto', () => {
      req.body = {
        name: '  Test Product  ',
        description: '  Test Description  ',
        category: '  Test Category  ',
        image: '  test.jpg  ',
        price: '100.50',
        quantity: '5'
      };

      sanitizeProductData(req, res, next);

      expect(req.body).toEqual({
        name: 'Test Product',
        description: 'Test Description',
        category: 'Test Category',
        image: 'test.jpg',
        price: 100.50,
        quantity: 5
      });
      expect(next).toHaveBeenCalled();
    });

    test('deve converter campos numéricos para números', () => {
      req.body = {
        price: '99.99',
        quantity: '10'
      };

      sanitizeProductData(req, res, next);

      expect(req.body.price).toBe(99.99);
      expect(req.body.quantity).toBe(10);
      expect(next).toHaveBeenCalled();
    });

    test('should handle errors in sanitizeProductData', () => {
      const req = { body: Object.create(null) };
      Object.defineProperty(req.body, 'name', { 
        get: () => { throw new Error('Simulated error'); }
      });
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      sanitizeProductData(req, res, next);
      expect(logger.logWithContext).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Error'),
        expect.any(Object)
      );
    });
  });

  describe('formatDates', () => {
    test('deve adicionar data de atualização para todos os produtos', () => {
      formatDates(req, res, next);
      
      expect(req.body.updated_at).toBeDefined();
      expect(typeof req.body.updated_at).toBe('string');
      expect(next).toHaveBeenCalled();
    });

    test('deve adicionar data de criação apenas para novos produtos', () => {
      formatDates(req, res, next);
      
      expect(req.body.created_at).toBeDefined();
      expect(req.body.created_at).toBe(req.body.updated_at);
      expect(next).toHaveBeenCalled();
    });

    test('não deve adicionar data de criação para atualizações', () => {
      req.params.id = '123';
      formatDates(req, res, next);
      
      expect(req.body.created_at).toBeUndefined();
      expect(req.body.updated_at).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    test('deve adicionar data de criação apenas para novos produtos', () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();

      formatDates(req, res, next);

      expect(req.body.created_at).toBeDefined();
      expect(req.body.created_at).toBe(req.body.updated_at);
      expect(req.body.created_at).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('methodNotAllowed', () => {
    test('deve retornar 405 com mensagem apropriada', () => {
      req.method = 'POST';
      req.path = '/test';
      
      methodNotAllowed(req, res);
      
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Método não permitido' });
      expect(logger.logWithContext).toHaveBeenCalledWith(
        'warn',
        'Método HTTP não permitido',
        expect.any(Object)
      );
    });

    test('deve retornar 405 com mensagem apropriada', () => {
      const req = { method: 'POST', path: '/test', id: 'test-request-id' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      methodNotAllowed(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Método não permitido' });
      expect(logger.logWithContext).toHaveBeenCalledWith(
        'warn',
        'Método HTTP não permitido',
        { method: 'POST', path: '/test', requestId: 'test-request-id' }
      );
    });
  });

  describe('handleInvalidRoute', () => {
    test('deve retornar 400 com mensagem apropriada', () => {
      req.path = '/invalid/route';
      req.method = 'GET';
      
      handleInvalidRoute(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Rota inválida' });
      expect(logger.logWithContext).toHaveBeenCalledWith(
        'warn',
        'Rota inválida acessada',
        expect.any(Object)
      );
    });
  });

  describe('formatDateResponse', () => {
    test('should format dates in response object', () => {
      // Mock date-fns to ensure consistent behavior in tests
      jest.mock('date-fns', () => {
        const actual = jest.requireActual('date-fns');
        return {
          ...actual,
          // Force specific formatted outputs for test consistency
          format: (date, formatStr) => {
            if (date.toISOString() === '2025-03-06T10:00:00.000Z') {
              return '06/03/2025 10:00:00';
            } else if (date.toISOString() === '2025-03-06T11:00:00.000Z') {
              return '06/03/2025 11:00:00';
            }
            return actual.format(date, formatStr);
          }
        };
      });

      const product = {
        id: 1,
        name: 'Test Product',
        created_at: '2025-03-06T10:00:00.000Z',
        updated_at: '2025-03-06T11:00:00.000Z'
      };
      
      // Create a mock function with a proper spy
      const jsonMock = jest.fn();
      const res = { 
        json: jsonMock
      };
      const req = {};
      const next = jest.fn();
      
      // Apply the middleware
      formatDateResponse(req, res, next);
      
      // Call the new json function
      res.json(product);
      
      // Check that the original jsonMock was called with formatted dates
      expect(jsonMock).toHaveBeenCalled();
      
      // Get the actual argument passed to jsonMock
      const formattedProduct = jsonMock.mock.calls[0][0];
      
      // Adjust expected values based on how date-fns formats the date with local timezone
      expect(formattedProduct).toHaveProperty('created_at', expect.stringMatching(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/));
      expect(formattedProduct).toHaveProperty('updated_at', expect.stringMatching(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/));
    });
  });
});
