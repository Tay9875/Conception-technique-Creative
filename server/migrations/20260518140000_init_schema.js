/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable('roles', (t) => {
    t.increments('id').primary();
    t.string('name', 50).notNullable().unique();
  }).catch(() => {});

  await knex.schema.createTable('pathologies', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable().unique();
  }).catch(() => {});

  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('firstname', 100).notNullable();
    t.string('lastname', 100).notNullable();
    t.string('email', 255).notNullable().unique();
    t.string('password', 255).notNullable();
    t.date('birthdate');
    t.integer('role_id').unsigned().notNullable();
    t.integer('pathology_id').unsigned().nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('role_id').references('roles.id');
    t.foreign('pathology_id').references('pathologies.id');
  }).catch(() => {});

  await knex.schema.createTable('tags', (t) => {
    t.increments('id').primary();
    t.string('title', 50).notNullable().unique();
  }).catch(() => {});

  await knex.schema.createTable('posts', (t) => {
    t.increments('id').primary();
    t.string('title', 255).notNullable();
    t.text('description').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.integer('user_id').unsigned().notNullable();
    t.integer('tag_id').unsigned().nullable();
    t.boolean('is_banned').defaultTo(false);
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('tag_id').references('tags.id').onDelete('SET NULL');
    t.index(['created_at'], 'idx_posts_created_at');
    t.index(['is_banned', 'created_at'], 'idx_posts_is_banned_created_at');
    t.index(['user_id'], 'idx_posts_user_id');
    t.index(['tag_id'], 'idx_posts_tag_id');
  }).catch(() => {});

  await knex.schema.createTable('comments', (t) => {
    t.increments('id').primary();
    t.text('description').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.integer('user_id').unsigned().notNullable();
    t.integer('post_id').unsigned().notNullable();
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('post_id').references('posts.id').onDelete('CASCADE');
    t.index(['post_id', 'created_at'], 'idx_comments_post_id_created_at');
  }).catch(() => {});

  await knex.schema.createTable('likes', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable();
    t.integer('post_id').unsigned().notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'post_id']);
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('post_id').references('posts.id').onDelete('CASCADE');
    t.index(['post_id'], 'idx_likes_post_id');
  }).catch(() => {});

  await knex.schema.createTable('reports', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable();
    t.integer('post_id').unsigned().notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'post_id']);
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.foreign('post_id').references('posts.id').onDelete('CASCADE');
    t.index(['post_id'], 'idx_reports_post_id');
  }).catch(() => {});

  await knex.schema.createTable('refresh_tokens', (t) => {
    t.bigIncrements('id').primary();
    t.integer('user_id').unsigned().notNullable();
    t.text('token').notNullable();
    t.dateTime('expires_at').notNullable();
    t.dateTime('revoked_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['user_id'], 'idx_refresh_user');
    t.index(['expires_at'], 'idx_refresh_exp');
    t.foreign('user_id').references('users.id').onDelete('CASCADE');
  }).catch(() => {});

  await knex.schema.createTable('moderation_logs', (t) => {
    t.bigIncrements('id').primary();
    t.integer('moderator_id').unsigned().notNullable();
    t.integer('post_id').unsigned().notNullable();
    t.enu('action', ['ban', 'unban']).notNullable();
    t.string('reason', 255).nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['post_id', 'created_at'], 'idx_mod_post');
    t.index(['moderator_id', 'created_at'], 'idx_mod_mod');
    t.foreign('moderator_id').references('users.id').onDelete('CASCADE');
    t.foreign('post_id').references('posts.id').onDelete('CASCADE');
  }).catch(() => {});
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('moderation_logs');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('likes');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('posts');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('pathologies');
  await knex.schema.dropTableIfExists('roles');
};
