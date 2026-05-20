/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasNotifications = await knex.schema.hasTable('notifications');
  if (!hasNotifications) {
    await knex.schema.createTable('notifications', (t) => {
      t.bigIncrements('id').primary();
      t.integer('user_id').unsigned().notNullable();
      t.integer('actor_user_id').unsigned().nullable();
      t.enu('type', ['new_comment', 'reaction', 'support', 'moderation', 'system']).notNullable();
      t.string('title', 120).notNullable();
      t.string('body', 500).notNullable();
      t.string('href', 500).nullable();
      t.enu('channel', ['in_app', 'email']).notNullable().defaultTo('in_app');
      t.json('metadata').nullable();
      t.timestamp('read_at').nullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.index(['user_id', 'read_at', 'created_at'], 'idx_notifications_user_read_created');
      t.index(['user_id', 'created_at'], 'idx_notifications_user_created');
    });
  }

  const hasPreferences = await knex.schema.hasTable('notification_preferences');
  if (!hasPreferences) {
    await knex.schema.createTable('notification_preferences', (t) => {
      t.integer('user_id').unsigned().primary();
      t.boolean('in_app_enabled').notNullable().defaultTo(true);
      t.boolean('email_enabled').notNullable().defaultTo(false);
      t.boolean('browser_push_enabled').notNullable().defaultTo(false);
      t.boolean('comments_enabled').notNullable().defaultTo(true);
      t.boolean('reactions_enabled').notNullable().defaultTo(true);
      t.boolean('support_enabled').notNullable().defaultTo(true);
      t.boolean('moderation_enabled').notNullable().defaultTo(true);
      t.boolean('system_enabled').notNullable().defaultTo(true);
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }

  const hasDeliveries = await knex.schema.hasTable('notification_deliveries');
  if (!hasDeliveries) {
    await knex.schema.createTable('notification_deliveries', (t) => {
      t.bigIncrements('id').primary();
      t.bigInteger('notification_id').unsigned().notNullable();
      t.enu('channel', ['email']).notNullable();
      t.enu('status', ['sent', 'skipped', 'failed']).notNullable();
      t.string('error', 500).nullable();
      t.timestamp('sent_at').nullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.index(['notification_id', 'channel'], 'idx_notification_deliveries_notification_channel');
      t.foreign('notification_id').references('notifications.id').onDelete('CASCADE');
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('notification_deliveries');
  await knex.schema.dropTableIfExists('notification_preferences');
  await knex.schema.dropTableIfExists('notifications');
};
