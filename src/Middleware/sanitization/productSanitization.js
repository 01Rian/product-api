const logger = require('../../Config/logger');

const sanitizeProductData = (req, res, next) => {
  try {
    logger.logWithContext('info', 'Iniciando sanitização dos dados do produto', {
      requestId: req.id,
      originalData: { ...req.body }
    });
    
    const { name, description, category, image, price, quantity } = req.body;
    
    // Sanitiza campos de texto
    if (name) req.body.name = name.trim();
    if (description) req.body.description = description.trim();
    if (category) req.body.category = category.trim();
    if (image) req.body.image = image.trim();
    
    // Converte campos numéricos
    if (price) req.body.price = Number(price);
    if (quantity) req.body.quantity = Number(quantity);
    
    logger.logWithContext('info', 'Dados do produto sanitizados com sucesso', {
      requestId: req.id,
      sanitizedData: req.body
    });
    
    next();
  } catch (error) {
    logger.logWithContext('error', `Error sanitizing product data: ${error.message}`, {
      requestId: req.id,
      error: error.toString()
    });
    next(error);
  }
};

module.exports = {
  sanitizeProductData
};