const request = require('supertest');
const db = require('../../Config/database');
const app = require('../../server');

describe('API de Produtos - Testes de Integração', () => {
  let createdProductId;

  beforeAll(async () => {
    // Garante que o banco está conectado
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Limpa dados e fecha conexões
    await db.query('DELETE FROM products');
    await db.$pool.end();
  });

  describe('Fluxo CRUD Completo', () => {
    const productData = {
      name: 'Smartphone Test',
      price: '999.99',
      description: 'Smartphone para testes de integração',
      quantity: 10
    };

    test('deve completar o ciclo CRUD com sucesso', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/products')
        .send(productData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(productData.name);
      createdProductId = createResponse.body.id;

      // READ
      const readResponse = await request(app)
        .get(`/api/products/${createdProductId}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body).toMatchObject(productData);

      // UPDATE
      const updateData = {
        name: 'Smartphone Updated',
        price: '899.99',
        description: 'Smartphone Updated',
        quantity: 5
      };

      const updateResponse = await request(app)
        .put(`/api/products/${createdProductId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe(updateData.name);
      expect(updateResponse.body.price).toBe(updateData.price);

      // DELETE
      const deleteResponse = await request(app)
        .delete(`/api/products/${createdProductId}`);

      expect(deleteResponse.status).toBe(204);

      // Verifica se foi realmente deletado
      const getDeletedResponse = await request(app)
        .get(`/api/products/${createdProductId}`);

      expect(getDeletedResponse.status).toBe(404);
    });
  });

  describe('Validações da API', () => {
    test('deve retornar 400 ao tentar criar produto sem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('deve retornar 400 ao tentar atualizar com preço negativo', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Produto Test',
          price: -10,
          quantity: 1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Listagem e Filtros', () => {
    test('deve retornar lista paginada de produtos', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
    });

    test('deve filtrar produtos por preço', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ minPrice: 100, maxPrice: 1000 });

      expect(response.status).toBe(200);
      expect(response.body.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            price: expect.any(Number)
          })
        ])
      );

      // Verifica se todos os preços estão dentro do range
      response.body.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(1000);
      });
    });
  });
});