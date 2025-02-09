# API de Produtos

Uma API RESTful robusta para gerenciamento de produtos, construída com Node.js, Express e PostgreSQL.

## 🚀 Características

- CRUD completo de produtos
- Validação de dados
- Logging avançado com rastreabilidade
- Tratamento de erros robusto
- Sanitização de dados
- Formatação automática de datas
- Encerramento gracioso do servidor
- Métricas de performance

## 📋 Requisitos

- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/01Rian/product-api.git
cd product-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
npm start
```

## 🛠️ Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=products_db
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

## 📚 Endpoints da API

### Produtos

- `GET /api/products` - Lista todos os produtos
- `GET /api/products/:id` - Obtém um produto específico
- `POST /api/products` - Cria um novo produto
- `PUT /api/products/:id` - Atualiza um produto
- `DELETE /api/products/:id` - Remove um produto

### Exemplo de Payload (Produto)

```json
{
  "name": "Produto Exemplo",
  "price": 99.99,
  "description": "Descrição do produto",
  "category": "Categoria",
  "quantity": 10,
  "image": "url-da-imagem"
}
```

## 📊 Sistema de Logging

A aplicação possui um sistema de logging abrangente que inclui:

- Logs de requisições HTTP com IDs únicos
- Métricas de tempo de resposta
- Logs de operações no banco de dados
- Logs de validação e sanitização
- Rastreamento de erros
- Rotação automática de logs

### Níveis de Log

- `info`: Operações normais
- `warn`: Alertas e validações falhas
- `error`: Erros e exceções

## 🔒 Validações

- Nome do produto obrigatório
- Preço deve ser um número positivo
- Quantidade não pode ser negativa
- Sanitização automática de strings
- Formatação automática de datas

## 🐳 Docker

A aplicação pode ser executada em containers Docker:

```bash
# Executar o container
docker compose up -d
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.