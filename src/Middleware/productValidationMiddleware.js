const { format } = require('date-fns');
const logger = require('../Config/logger');

const validateProductFields = (req, res, next) => {
  const { name, price, quantity } = req.body;
  logger.logWithContext('info', 'Validando campos do produto', {
    requestId: req.id,
    body: req.body
  });

  if (!name || name.trim().length === 0) {
    logger.logWithContext('warn', 'Validação falhou: nome do produto ausente', {
      requestId: req.id
    });
    return res.status(400).json({ message: 'Nome do produto é obrigatório' });
  }

  if (!price || isNaN(price) || price <= 0) {
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

const validateProductId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID do produto inválido' });
  }

  next();
};

const sanitizeProductData = (req, res, next) => {
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
};

const formatDates = (req, res, next) => {
  try {
    logger.logWithContext('info', 'Formatando datas do produto', {
      requestId: req.id
    });

    const now = new Date();
    req.body.updated_at = format(now, 'yyyy-MM-dd HH:mm:ss');

    if (!req.params.id) {
      req.body.created_at = req.body.updated_at;
    }

    logger.logWithContext('info', 'Datas formatadas com sucesso', {
      requestId: req.id,
      dates: {
        updated_at: req.body.updated_at,
        created_at: req.body.created_at
      }
    });
    next();
  } catch (error) {
    logger.logWithContext('error', 'Erro ao processar as datas', {
      requestId: req.id,
      error: error.message
    });
    return res.status(400).json({ message: 'Erro ao processar as datas' });
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
      const createdDate = new Date(product.created_at);
      product.created_at = format(createdDate, 'dd/MM/yyyy HH:mm:ss');
    }
    if (product.updated_at) {
      const updatedDate = new Date(product.updated_at);
      product.updated_at = format(updatedDate, 'dd/MM/yyyy HH:mm:ss');
    }
    return product;
  } catch (error) {
    console.error('Erro ao formatar datas:', error);
    return product;
  }
}

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
  validateProductFields,
  validateProductId,
  sanitizeProductData,
  formatDates,
  formatDateResponse,
  methodNotAllowed,
  handleInvalidRoute
}; 