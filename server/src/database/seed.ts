import { pool } from './db';
import bcrypt from 'bcrypt';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase() {
  await pool.query(`
    INSERT IGNORE INTO roles (id, name) VALUES
    (1, 'Patient'),
    (2, 'Ancien Patient'),
    (3, 'Proche'),
    (4, 'Admin');
  `);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const [existingAdmin]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        await pool.query(
          `INSERT INTO users 
          (firstname, lastname, email, password, role_id, pathology_id)
          VALUES (?, ?, ?, ?, ?, ?)`,
          ['Super', 'Admin', adminEmail, hashedPassword, 4, null]
        );
      }
    }

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

async function seedUsersPostsCommentsLikes() {
  

  const firstNames = ['Alice', 'Bob', 'Claire', 'David', 'Emma', 'Franck', 'Gisele', 'Hugo', 'Isabelle', 'Julien', 'Karim', 'Lea', 'Marine', 'Nicolas', 'Olivia', 'Paul', 'Quentin', 'Romain', 'Sophie', 'Thomas', 'Ursula', 'Valentin', 'William', 'Xavier', 'Yasmine', 'Zoe'];
  const lastNames = ['Durand', 'Martin', 'Lefevre', 'Moreau', 'Petit', 'Roux', 'Bernard', 'Dubois', 'Leroy', 'Garnier', 'Faure', 'Mercier', 'Noel', 'Benoit', 'Blanc'];

  const makeEmail = (fn: string, ln: string, idx: number) => `${fn.toLowerCase()}.${ln.toLowerCase()}${idx}@example.com`;

  const userCount = 15;
  for (let i = 0; i < userCount; i++) {
    const fn = firstNames[randInt(0, firstNames.length - 1)];
    const ln = lastNames[randInt(0, lastNames.length - 1)];
    const email = makeEmail(fn, ln, i + 1);
    const hash = await bcrypt.hash('password123', 12);
    const pathologyId = Math.random() < 0.6 ? randInt(1, 4) : null;
    await pool.query(
      `INSERT IGNORE INTO users (firstname, lastname, email, password, role_id, pathology_id, profile_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fn, ln, email.toLowerCase(), hash, 1, pathologyId, 'patient']
    );
  }

  
  const [userRows] = await pool.query('SELECT id, firstname, lastname FROM users');
  const usersAll = (userRows as any[]).map((r) => ({ id: r.id, name: `${r.firstname} ${r.lastname}` }));
  const userIds = usersAll.map((u) => u.id);
  if (!userIds.length) return;

  
  const formatDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

  
  const postCount = 40;
  const postTopics = ['Traitement', 'Effets secondaires', 'Alimentation', 'Soutien', 'Expérience personnelle', 'Question pratique', 'Conseil médical', 'Bien-être'];
  const postBodies = [
    'J’ai commencé un nouveau traitement la semaine dernière et je voulais partager mon expérience.',
    'Quels aliments m’ont aidé pendant la chimiothérapie ?',
    'Comment gérez‑vous la fatigue au quotidien ?',
    'Je cherche des ressources pour le soutien psychologique.',
    'Des conseils pour préparer une consultation avec un oncologue ?',
    'Mon médecin m’a conseillé ceci — est‑ce que quelqu’un a essayé ?',
    'Je souhaite partager une victoire personnelle aujourd’hui.'
  ];

  const postsInserted: { id: number; created_at: string }[] = [];
  for (let i = 0; i < postCount; i++) {
    const title = `${postTopics[randInt(0, postTopics.length - 1)]} — ${postBodies[randInt(0, postBodies.length - 1)].slice(0, 40)}`;
    const desc = `${postBodies[randInt(0, postBodies.length - 1)]} ${postBodies[randInt(0, postBodies.length - 1)]}`;
    const userId = userIds[randInt(0, userIds.length - 1)];
    const tagId = randInt(1, 13);
    const daysAgo = randInt(0, 180);
    const createdAt = formatDate(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
    const [r] = await pool.query('INSERT INTO posts (title, description, user_id, tag_id, created_at) VALUES (?, ?, ?, ?, ?)', [title, desc, userId, tagId, createdAt]);
    const insertId = (r as any).insertId;
    postsInserted.push({ id: insertId, created_at: createdAt });
  }

  
  const commentSamples = [
    "Merci pour le partage, ça m'aide beaucoup.",
    'Courage, tu n’es pas seul(e).',
    'As‑tu essayé la kiné ?',
    'Ton message me parle, merci.',
    'Je recommande d’en parler à ton médecin.'
  ];

  for (const p of postsInserted) {
    const commentsForPost = randInt(0, 8);
    const postDate = new Date(p.created_at.replace(' ', 'T'));
    for (let c = 0; c < commentsForPost; c++) {
      const author = usersAll[randInt(0, usersAll.length - 1)];
      const text = commentSamples[randInt(0, commentSamples.length - 1)];
      
      const since = postDate.getTime();
      const until = Date.now();
      const created = formatDate(new Date(randInt(since, until)));
      await pool.query('INSERT INTO comments (description, user_id, post_id, created_at) VALUES (?, ?, ?, ?)', [text, author.id, p.id, created]);
    }
  }

  
  for (const p of postsInserted) {
    const possibleLikers = [...userIds];
    
    for (let i = possibleLikers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleLikers[i], possibleLikers[j]] = [possibleLikers[j], possibleLikers[i]];
    }
    const likesCount = randInt(0, Math.min(10, possibleLikers.length));
    const likers = possibleLikers.slice(0, likesCount);
    const postDate = new Date(p.created_at.replace(' ', 'T')).getTime();
    for (const uid of likers) {
      const created = formatDate(new Date(randInt(postDate, Date.now())));
      await pool.query('INSERT IGNORE INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)', [uid, p.id, created]);
    }
  }

  console.log('Users, posts, comments et likes seedés avec réalisme.');
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      // additional seeds
      try {
        await seedUsersPostsCommentsLikes();
      } catch (e) {
        console.error('Erreur supplementaire seed:', e);
      }
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Erreur seed:', err);
      await pool.end();
      process.exit(1);
    });
}
