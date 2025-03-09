/** @type {import('jest').Config} */
const config = {
  // Configurações específicas para testes de integração
  testMatch: ['**/Integration/__tests__/**/*.test.js'],
  testTimeout: 30000, // Timeout maior para testes de integração
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/integration',
  coverageProvider: 'v8',
  // Não mockamos dependências em testes de integração
  automock: false,
  // Força finalização após testes (útil para conexões de banco)
  forceExit: true,
  // Executa testes em série para evitar conflitos de banco
  maxWorkers: 1
};

module.exports = config;