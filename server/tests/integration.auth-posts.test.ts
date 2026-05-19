import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || '12345678901234567890123456789012';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '12345678901234567890123456789012';
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'root';
process.env.DB_NAME = process.env.DB_NAME || 'app_test';

const isIntegrationEnabled = process.env.RUN_INTEGRATION_TESTS === '1';
const suite = isIntegrationEnabled ? describe : describe.skip;

suite('integration auth + posts', () => {
  const email = `it_auth_${Date.now()}@example.com`;
  let token = '';
  let app: any;
  let pool: any;

  beforeAll(async () => {
    ({ app } = await import('../src/app'));
    ({ pool } = await import('../src/database/db'));

    await pool.query('DELETE FROM users WHERE email LIKE ?', ['it_auth_%@example.com']);
    await pool.query("INSERT IGNORE INTO roles (id, name) VALUES (1, 'Patient')");
    await pool.query("INSERT IGNORE INTO tags (id, title) VALUES (1, 'TagTest')");
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE ?', ['it_auth_%@example.com']);
  });

  it('registers and logs in', async () => {
    const reg = await request(app).post('/api/auth/register').send({ firstname: 'Int', lastname: 'Test', email, password: 'Password1234' });
    expect([201, 409]).toContain(reg.status);

    const login = await request(app).post('/api/auth/login').send({ email, password: 'Password1234' });
    expect(login.status).toBe(200);
    expect(login.body?.data?.token).toBeTruthy();
    token = login.body.data.token;
  });

  it('creates a post when authenticated', async () => {
    const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({ title: 'Titre IT', description: 'Description IT', tag_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBeTruthy();
  });
});
