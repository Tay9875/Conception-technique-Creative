/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasAvatarUrl = await knex.schema.hasColumn('users', 'avatar_url');
  const hasEmailVerified = await knex.schema.hasColumn('users', 'email_verified');
  const hasUpdatedAt = await knex.schema.hasColumn('users', 'updated_at');

  await knex.raw('ALTER TABLE users MODIFY password VARCHAR(255) NULL');

  await knex.schema.alterTable('users', (t) => {
    if (!hasAvatarUrl) t.string('avatar_url', 512).nullable();
    if (!hasEmailVerified) t.boolean('email_verified').notNullable().defaultTo(false);
    if (!hasUpdatedAt) t.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });

  const hasOauthAccounts = await knex.schema.hasTable('oauth_accounts');
  if (!hasOauthAccounts) {
    await knex.schema.createTable('oauth_accounts', (t) => {
      t.bigIncrements('id').primary();
      t.integer('user_id').unsigned().notNullable();
      t.string('provider', 50).notNullable();
      t.string('provider_account_id', 255).notNullable();
      t.string('email', 255).notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      t.unique(['provider', 'provider_account_id'], 'uq_oauth_provider_account');
      t.index(['user_id'], 'idx_oauth_user_id');
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('oauth_accounts');

  const hasAvatarUrl = await knex.schema.hasColumn('users', 'avatar_url');
  const hasEmailVerified = await knex.schema.hasColumn('users', 'email_verified');
  const hasUpdatedAt = await knex.schema.hasColumn('users', 'updated_at');

  await knex('users').whereNull('password').update({ password: knex.raw("CONCAT('oauth-disabled-', UUID())") });
  await knex.raw('ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL');

  await knex.schema.alterTable('users', (t) => {
    if (hasUpdatedAt) t.dropColumn('updated_at');
    if (hasEmailVerified) t.dropColumn('email_verified');
    if (hasAvatarUrl) t.dropColumn('avatar_url');
  });
};
