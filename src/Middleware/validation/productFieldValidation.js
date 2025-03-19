const logger = require('../../Config/logger');

const validateProductName = (name) => {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 255) return false;
  if (/<[^>]*>/g.test(name)) return false;
  return true;
};

const validateProductFields = (req, res, next) => {
  const { name, price, quantity } = req.body;
  logger.logWithContext('info', 'Validando campos do produto', {
    requestId: req.id,
    body: req.body
  });

  if (!validateProductName(name)) {
   logger.logWithContext('warn', 'Validação falhou: nome do produto inválido', {
     requestId: req.id
   });
   return res.status(400).json({ message: 'Nome do produto é obrigatório' });
  }

  // Added check for extremely large price values (greater than MAX_SAFE_INTEGER)
  if (!price || isNaN(price) || price <= 0 || price > Number.MAX_SAFE_INTEGER) {
    logger.logWithContext('warn', 'Validação falhou: preço inválido', {
      requestId: req.id,
      price
    });
    return res.status(400).json({ message: 'Preço deve ser um número maior que zero' });
  }

  if (!quantity || isNaN(quantity) || quantity < 0) {
    logger.logWithContext('warn', 'Validação falhou: quantidade inválida', {
      requestId: req.id,
      quantity
    });
    return res.status(400).json({ message: 'Quantidade deve ser um número não negativo' });
  }

  logger.logWithContext('info', 'Validação dos campos do produto bem-sucedida', {
    requestId: req.id
  });
  next();
};

const validateUpdateFields = (req, res, next) => {
  // Validar payload vazio
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
  }

  // Validar campos protegidos
  const protectedFields = ['id', 'created_at'];
  const hasProtectedFields = protectedFields.some(field => field in req.body);
  if (hasProtectedFields) {
    return res.status(400).json({ message: 'Não é permitido atualizar campos protegidos' });
  }

  // Validar nome se estiver presente
  if (req.body.name && !validateProductName(req.body.name)) {
    return res.status(400).json({ message: 'Nome do produto inválido' });
  }

  next();
};

module.exports = {
  validateProductFields,
  validateUpdateFields,
  validateProductName
};