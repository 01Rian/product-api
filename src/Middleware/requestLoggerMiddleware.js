const logger = require('../Config/logger');
const { v4: uuidv4 } = require('uuid');

const requestLogger = (req, res, next) => {
  // Gera um ID único para a requisição
  req.id = uuidv4();
  
  // Captura o tempo inicial
  const start = process.hrtime();

  // Log da requisição recebida
  logger.logWithContext('info', 'Requisição recebida', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    query: req.query,
    headers: {
      'user-agent': req.get('user-agent'),
      'content-type': req.get('content-type'),
      'accept': req.get('accept')
    },
    ip: req.ip
  });

  // Intercepta a finalização da resposta
  res.on('finish', () => {
    // Calcula o tempo de resposta
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1000000;

    // Log da resposta enviada
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.logWithContext(logLevel, 'Resposta enviada', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`
    });
  });

  next();
};

module.exports = requestLogger; 