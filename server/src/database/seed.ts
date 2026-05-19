import { pool } from './db';

export async function seedDatabase() {
  await pool.query(`
    INSERT IGNORE INTO roles (id, name) VALUES
    (1, 'Patient'),
    (2, 'Ancien Patient'),
    (3, 'Proche');
  `);

  await pool.query(`
    INSERT IGNORE INTO pathologies (id, name) VALUES
    (1, 'Cancer du sein'),
    (2, 'Leucémie'),
    (3, 'Cancer du poumon'),
    (4, 'Cancer de la prostate');
  `);

  await pool.query(`
    INSERT IGNORE INTO tags (id, title) VALUES
    (1, 'Cancer du sein'),
    (2, 'Cancer de la prostate'),
    (3, 'Cancer du poumon'),
    (4, 'Cancer colorectal'),
    (5, 'Mélanome'),
    (6, 'Cancer de la vessie'),
    (7, 'Lymphome'),
    (8, 'Cancer du rein'),
    (9, 'Cancer de la thyroïde'),
    (10, 'Cancer du pancréas'),
    (11, 'Nutrition'),
    (12, 'Bien-être'),
    (13, 'Soutien moral');
  `);

  console.log('Seed termine avec succes.');
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Erreur seed:', err);
      await pool.end();
      process.exit(1);
    });
}
