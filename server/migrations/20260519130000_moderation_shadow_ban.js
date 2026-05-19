/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasCommentBan = await knex.schema.hasColumn('comments', 'is_banned');
  if (!hasCommentBan) {
    await knex.schema.alterTable('comments', (t) => {
      t.boolean('is_banned').notNullable().defaultTo(false);
      t.index(['is_banned', 'post_id', 'created_at'], 'idx_comments_banned_post_created');
    });
  }

  const hasModerationReviews = await knex.schema.hasTable('moderation_reviews');
  if (!hasModerationReviews) {
    await knex.schema.createTable('moderation_reviews', (t) => {
      t.bigIncrements('id').primary();
      t.enu('target_type', ['post', 'comment']).notNullable();
      t.integer('target_id').unsigned().notNullable();
      t.integer('author_id').unsigned().nullable();
      t.enu('status', ['needs_review', 'shadow_banned']).notNullable();
      t.enu('category', [
        'self_harm_suicide',
        'dangerous_medical_advice',
        'disguised_promotion',
        'spam_or_low_quality',
        'harassment_or_abuse'
      ]).notNullable();
      t.integer('risk_score').unsigned().notNullable();
      t.enu('priority', ['low', 'medium', 'high', 'urgent']).notNullable().defaultTo('medium');
      t.json('reasons').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      t.unique(['target_type', 'target_id'], 'uq_moderation_reviews_target');
      t.index(['status', 'priority', 'created_at'], 'idx_moderation_reviews_queue');
      t.index(['category', 'created_at'], 'idx_moderation_reviews_category');
      t.index(['author_id', 'created_at'], 'idx_moderation_reviews_author');
      t.foreign('author_id').references('users.id').onDelete('SET NULL');
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('moderation_reviews');

  const hasCommentBan = await knex.schema.hasColumn('comments', 'is_banned');
  if (hasCommentBan) {
    await knex.schema.alterTable('comments', (t) => {
      t.dropIndex(['is_banned', 'post_id', 'created_at'], 'idx_comments_banned_post_created');
      t.dropColumn('is_banned');
    });
  }
};

