/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasProfileStatus = await knex.schema.hasColumn('users', 'profile_status');

  if (!hasProfileStatus) {
    await knex.schema.alterTable('users', (t) => {
      t.string('profile_status', 50).notNullable().defaultTo('prefer_not_to_say');
      t.index(['profile_status'], 'idx_users_profile_status');
    });

    await knex.raw(`
      UPDATE users
      SET profile_status = CASE role_id
        WHEN 1 THEN 'patient'
        WHEN 2 THEN 'former_patient'
        WHEN 3 THEN 'caregiver'
        ELSE 'prefer_not_to_say'
      END
    `);
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const hasProfileStatus = await knex.schema.hasColumn('users', 'profile_status');
  if (!hasProfileStatus) return;

  await knex.schema.alterTable('users', (t) => {
    t.dropIndex(['profile_status'], 'idx_users_profile_status');
    t.dropColumn('profile_status');
  });
};
