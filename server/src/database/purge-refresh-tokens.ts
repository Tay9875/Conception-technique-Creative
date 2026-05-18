import { pool } from './db';

async function purge() {
  const [result] = await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL');
  const count = (result as any).affectedRows || 0;
  console.log(`Purged refresh tokens: ${count}`);
}

purge()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
