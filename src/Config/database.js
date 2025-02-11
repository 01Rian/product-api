const pgp = require('pg-promise')();
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const db = pgp(config);

async function init() {
  try {
    const connection = await db.connect();
    logger.logWithContext('info', 'Conexão com o banco de dados estabelecida com sucesso', {
      host: config.host,
      database: config.database
    });
    connection.done(); // Libera a conexão
  } catch (error) {
    logger.logWithContext('error', 'Erro ao conectar ao banco de dados', {
      error: error.message,
      stack: error.stack,
      host: config.host,
      database: config.database
    });
    throw error;
  }
}

async function initializeDatabase() {
  try {
    logger.logWithContext('info', 'Iniciando inicialização do banco de dados');
    
    const sqlPath = path.join(__dirname, '../../init.sql');
    const initSQL = await fs.readFile(sqlPath, 'utf8');
    
    await db.none(initSQL);
    
    logger.logWithContext('info', 'Banco de dados inicializado com sucesso', {
      sqlPath
    });
  } catch (error) {
    logger.logWithContext('error', 'Erro ao inicializar o banco de dados', {
      error: error.message,
      stack: error.stack,
      sqlPath: path.join(__dirname, '../../init.sql')
    });
  }
}

(async function main() {
  await init();
  await initializeDatabase();
})();

module.exports = db;