const winston = require('winston');
const { format } = winston;
const path = require('path');

const logFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.errors({ stack: true }),
  format.metadata(),
  format.json()
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'product-api' },
  transports: [
    // Logs de erro serão salvos em arquivo separado
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'DD-MM-YYYY',
      level: 'error',
      maxFiles: '14d'
    }),
    // Todos os logs serão salvos neste arquivo
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'DD-MM-YYYY',
      maxFiles: '14d'
    })
  ]
});

logger.add(new winston.transports.Console({
  format: format.combine(
    format.colorize(),
    format.simple()
  )
}));

// Função auxiliar para adicionar contexto ao log
logger.logWithContext = (level, message, context = {}) => {
  logger[level](message, { metadata: { ...context } });
};

module.exports = logger;