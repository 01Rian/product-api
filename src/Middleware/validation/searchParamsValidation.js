const logger = require('../../Config/logger');

const validateSearchParam = (search) => {
  if (!search) return true;
  
  // Verifica o tamanho máximo
  if (search.length > 100) return false;
  
  // Verifica tentativas de XSS
  if (/<[^>]*>/g.test(search)) return false;
  
  // Remove caracteres especiais e SQL injection patterns
  const invalidPatterns = /['";\\%_*$#@!&]/g;
  return !invalidPatterns.test(search);
};

const validatePriceParam = (price) => {
  if (price === undefined) return true;
  
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 999999999;
};

const searchParamsValidation = (req, res, next) => {
  const { search, minPrice, maxPrice, page, limit } = req.query;

  logger.logWithContext('info', 'Validando parâmetros de busca', {
    requestId: req.id,
    params: { search, minPrice, maxPrice, page, limit }
  });

  // Validação do parâmetro search
  if (search && !validateSearchParam(search)) {
    logger.logWithContext('warn', 'Parâmetro de busca inválido', {
      requestId: req.id,
      invalidParam: 'search',
      value: search
    });
    return res.status(400).json({ 
      message: 'Parâmetro de busca contém caracteres inválidos' 
    });
  }

  // Validação dos parâmetros de preço
  if (!validatePriceParam(minPrice)) {
    return res.status(400).json({ 
      message: 'Preço mínimo inválido' 
    });
  }

  if (!validatePriceParam(maxPrice)) {
    return res.status(400).json({ 
      message: 'Preço máximo inválido' 
    });
  }

  // Sanitização do parâmetro search
  if (search) {
    req.query.search = search.trim().replace(/\s+/g, ' ');
  }

  next();
};

module.exports = {
  searchParamsValidation,
  validateSearchParam,
  validatePriceParam
};