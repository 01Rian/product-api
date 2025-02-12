const {
  validateProductFields,
  validateProductId,
  sanitizeProductData,
  formatDates,
  formatDateResponse,
  methodNotAllowed,
  handleInvalidRoute
} = require('../productValidationMiddleware');
const logger = require('../../Config/logger');

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
});
