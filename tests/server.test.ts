const request = require('supertest');
const { startTest } = require('../src/server');

const app = startTest();

describe('GET HealthCheck', () => {
    test('should respond with a 200 status code', async () => {
        const response = await request(app).get('/health-check');
        expect(response.statusCode).toBe(200);
    });
});
