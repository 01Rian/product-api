const winston = require('winston');
require('winston-daily-rotate-file');
const { format } = winston;
const path = require('path');

const logFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  format.errors({ stack: true }),
  format.metadata(),
  format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'product-api' },
  transports: [
    // Logs de erro serão salvos em arquivo separado
    new winston.transports.DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || 'logs', 'error-%DATE%.log'),
      datePattern: 'DD-MM-YYYY',
      level: 'error',
      maxFiles: process.env.LOG_MAX_FILES || '14d'
    }),
    // Todos os logs serão salvos neste arquivo
    new winston.transports.DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || 'logs', 'combined-%DATE%.log'),
      datePattern: 'DD-MM-YYYY',
      maxFiles: process.env.LOG_MAX_FILES || '14d'
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