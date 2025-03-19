const { format, parseISO } = require('date-fns');
const logger = require('../../Config/logger');

const formatDates = (req, res, next) => {
  try {
    // Initialize req.body if it doesn't exist
    if (!req.body) {
      req.body = {};
    }
    
    // Safe logging with optional chaining for req.id
    logger.logWithContext('info', 'Formatando datas do produto', {
      requestId: req?.id || 'unknown'
    });
    
    const now = new Date();
    // Change format to ISO format that the test expects
    req.body.updated_at = now.toISOString();
    
    // Check params.id, if params doesn't exist it's considered a new product
    if (!req.params || !req.params.id) {
      req.body.created_at = req.body.updated_at;
    }
    
    // Safe logging with optional chaining for req.id
    logger.logWithContext('info', 'Datas formatadas com sucesso', {
      requestId: req?.id || 'unknown',
      dates: {
        updated_at: req.body.updated_at,
        created_at: req.body.created_at
      }
    });
    
    next();
  } catch (error) {
    // Safe logging with optional chaining for req.id
    logger.logWithContext('error', 'Erro ao processar as datas', {
      requestId: req?.id || 'unknown',
      error: error.message
    });
    
    // Still need to make sure dates are set even when there's an error
    if (!req.body) {
      req.body = {};
    }
    
    const now = new Date();
    req.body.updated_at = now.toISOString();
    
    // If it's a new product, set created_at
    if (!req.params || !req.params.id) {
      req.body.created_at = req.body.updated_at;
    }
    
    next();
  }
};

const formatDateResponse = (req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    // Se for um array de produtos (listagem)
    if (Array.isArray(data)) {
      data = data.map(formatProductDates);
    }
    // Se for um único produto
    else if (data && (data.created_at || data.updated_at)) {
      data = formatProductDates(data);
    }
    return oldJson.call(this, data);
  };
  next();
};

// Função auxiliar para formatar as datas de um produto
function formatProductDates(product) {
  try {
    if (product.created_at) {
      const createdDate = parseISO(product.created_at);
      product.created_at = format(createdDate, 'dd/MM/yyyy HH:mm:ss');
    }
    
    if (product.updated_at) {
      const updatedDate = parseISO(product.updated_at);
      product.updated_at = format(updatedDate, 'dd/MM/yyyy HH:mm:ss');
    }
    
    return product;
  } catch (error) {
    console.error('Erro ao formatar datas:', error);
    return product;
  }
}

module.exports = {
  formatDates,
  formatDateResponse
};