const { format } = require('date-fns');

const validateProductFields = (req, res, next) => {
  const { name, price, quantity } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Nome do produto é obrigatório' });
  }

  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Preço deve ser um número maior que zero' });
  }

  if (!quantity || isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Quantidade deve ser um número não negativo' });
  }

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
  const { name, description, category, image } = req.body;

  if (name) req.body.name = name.trim();
  if (description) req.body.description = description.trim();
  if (category) req.body.category = category.trim();
  if (image) req.body.image = image.trim();

  next();
};

const formatDates = (req, res, next) => {
  try {
    const now = new Date();
    
    // Formata as datas para o formato do PostgreSQL
    req.body.updated_at = format(now, 'yyyy-MM-dd HH:mm:ss');

    // Se for uma criação nova, define também o created_at
    if (!req.params.id) {
      req.body.created_at = req.body.updated_at;
    }

    next();
  } catch (error) {
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

module.exports = {
  validateProductFields,
  validateProductId,
  sanitizeProductData,
  formatDates,
  formatDateResponse
}; 