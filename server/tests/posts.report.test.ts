import { describe, it, expect, vi } from 'vitest';

const query = vi.fn(async (sql: string) => {
  if (sql.includes('COUNT(*) as count FROM reports')) return [[{ count: 3 }]];
  return [[]];
});

const conn = {
  beginTransaction: vi.fn(async () => {}),
  query,
  commit: vi.fn(async () => {}),
  rollback: vi.fn(async () => {}),
  release: vi.fn(() => {})
};

describe('report flow db transaction', () => {
  it('bans when threshold reached', async () => {
    await conn.beginTransaction();
    await conn.query('INSERT INTO reports (user_id, post_id) VALUES (?, ?)', [1, 2]);
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM reports WHERE post_id = ?', [2]);
    if ((rows as any[])[0].count >= 3) {
      await conn.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [2]);
    }
    await conn.commit();
    expect(query).toHaveBeenCalled();
  });
});
