const request = require('supertest');
const { createTestApp } = require('./testServer');
const { signup, login } = require('./utils');

describe('Auth Routes', () => {
  let app;
  let cleanup;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    cleanup = testApp.cleanup;
  });

  afterAll(async () => {
    if (cleanup) await cleanup();
  });

  test('Health check works', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  const baseEmail = `testuser_signup_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

  test('Signup - happy path (201)', async () => {
    const res = await signup(app, {
      name: 'Test User',
      email: baseEmail,
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', baseEmail);
  });

  test('Signup - duplicate email (409)', async () => {
    const res = await signup(app, {
      name: 'Test User 2',
      email: baseEmail,
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });

  test('Login - happy path (200)', async () => {
    const res = await login(app, {
      email: baseEmail,
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login - wrong password (401 or 409)', async () => {
    const res = await login(app, {
      email: baseEmail,
      password: 'wrongpassword',
    });

    // depending on your controller implementation: 401 or 409
    expect([401, 409]).toContain(res.status);
  });

  test('Login - missing password (400)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: baseEmail,
    });

    expect(res.status).toBe(400);
  });
});
