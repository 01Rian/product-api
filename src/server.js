const express = require('express');
const productRoutes = require('./Router/productRouter');
const logger = require('./Config/logger');
const requestLogger = require('./Middleware/requestLoggerMiddleware');
const app = express();
const port = process.env.PORT || 3000;

// Middleware de logging para todas as requisições
app.use(requestLogger);

// Middleware para parsing do corpo da requisição
app.use(express.json());

// Rotas da API
app.use('/api/products', productRoutes);

// Middleware para rotas inválidas
app.use('*', (req, res) => {
  logger.logWithContext('warn', 'Rota inválida acessada', {
    requestId: req.id,
    path: req.path,
    method: req.method
  });
  return res.status(400).json({
    message: 'Rota inválida'
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  logger.logWithContext('error', 'Erro não tratado na aplicação', {
    requestId: req.id,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500
    }
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.logWithContext('error', 'Erro não capturado (uncaughtException)', {
    error: {
      message: error.message,
      stack: error.stack
    }
  });
  
  // Em produção, você pode querer reiniciar o processo
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.logWithContext('error', 'Promessa rejeitada não tratada (unhandledRejection)', {
    error: {
      message: reason.message,
      stack: reason.stack
    }
  });
});

// Tratamento de sinais de encerramento
const gracefulShutdown = () => {
  logger.logWithContext('info', 'Iniciando encerramento gracioso do servidor');
  
  server.close(() => {
    logger.logWithContext('info', 'Servidor encerrado com sucesso');
    process.exit(0);
  });

  // Se o servidor não encerrar em 10 segundos, força o encerramento
  setTimeout(() => {
    logger.logWithContext('error', 'Não foi possível encerrar o servidor graciosamente, forçando encerramento');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Inicialização do servidor apenas quando executado diretamente
if (require.main === module) {
  const server = app.listen(port, () => {
    logger.logWithContext('info', 'Servidor iniciado', {
      port,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
  });
}

module.exports = app;