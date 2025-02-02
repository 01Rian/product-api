const pgp = require('pg-promise')();
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const db = pgp(config);

async function initializeDatabase() {
  try {
    const sqlPath = path.join(__dirname, '../../init.sql');
    const initSQL = await fs.readFile(sqlPath, 'utf8');
    
    await db.none(initSQL);
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

// Inicializa o banco de dados quando o arquivo é carregado
initializeDatabase();

module.exports = db;