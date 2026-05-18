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

const enabled = process.env.RUN_INTEGRATION_TESTS === '1';
const suite = enabled ? describe : describe.skip;

suite('integration moderation/comments/refresh', () => {
  const email = `it_mod_${Date.now()}@example.com`;
  let token = '';
  let refreshToken = '';
  let postId = 0;
  let app: any;
  let pool: any;

  beforeAll(async () => {
    ({ app } = await import('../src/app'));
    ({ pool } = await import('../src/database/db'));

    await pool.query('DELETE FROM users WHERE email LIKE ?', ['it_mod_%@example.com']);
    await pool.query("INSERT IGNORE INTO roles (id, name) VALUES (1,'Patient'), (2,'Ancien Patient'), (3,'Proche')");
    await pool.query("INSERT IGNORE INTO tags (id, title) VALUES (1,'TagTest')");
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE ?', ['it_mod_%@example.com']);
  });

  it('register/login/create post', async () => {
    await request(app).post('/api/auth/register').send({ firstname: 'Mod', lastname: 'Test', email, password: 'Password1234' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Password1234' });
    expect(login.status).toBe(200);
    token = login.body.data.token;
    refreshToken = login.body.data.refreshToken;

    const post = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({ title: 'P', description: 'D', tag_id: 1 });
    expect(post.status).toBe(201);
    postId = post.body.data.id;
  });

  it('adds comment', async () => {
    const c = await request(app).post('/api/comments').set('Authorization', `Bearer ${token}`).send({ description: 'hello', post_id: postId });
    expect(c.status).toBe(201);
  });

  it('refresh + logout flow', async () => {
    const r = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(r.status).toBe(200);
    const logout = await request(app).post('/api/auth/logout').send({ refreshToken: r.body.data.refreshToken });
    expect(logout.status).toBe(204);
  });
});
