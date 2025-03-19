const logger = require('../../Config/logger');

const validateProductId = (req, res, next) => {
  const { id } = req.params;

  logger.logWithContext('info', 'Validando ID do produto', {
    requestId: req.id,
    productId: id
  });

  if (!id || isNaN(id)) {
    logger.logWithContext('warn', 'ID do produto inválido', {
      requestId: req.id,
      productId: id
    });
    return res.status(400).json({ message: 'ID do produto inválido' });
  }

  next();
};

module.exports = {
  validateProductId
};