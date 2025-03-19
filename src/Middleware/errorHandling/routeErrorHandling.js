const logger = require('../../Config/logger');

const methodNotAllowed = (req, res) => {
  logger.logWithContext('warn', 'Método HTTP não permitido', {
    requestId: req.id,
    method: req.method,
    path: req.path
  });
  return res.status(405).json({ 
    message: 'Método não permitido'
  });
};

const handleInvalidRoute = (req, res) => {
  logger.logWithContext('warn', 'Rota inválida acessada', {
    requestId: req.id,
    path: req.path,
    method: req.method
  });
  return res.status(400).json({
    message: 'Rota inválida'
  });
};

module.exports = {
  methodNotAllowed,
  handleInvalidRoute
};