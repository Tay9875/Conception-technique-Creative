const moderationCategories = [
  'self_harm_suicide',
  'drug_or_substance',
  'dangerous_medical_advice',
  'disguised_promotion',
  'sexual_content',
  'personal_sensitive_data',
  'spam_or_low_quality',
  'harassment_or_abuse'
];

const enumList = (values) => values.map((value) => `'${value}'`).join(',');

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasModerationReviews = await knex.schema.hasTable('moderation_reviews');
  if (!hasModerationReviews) return;

  await knex.raw(`ALTER TABLE moderation_reviews MODIFY category ENUM(${enumList(moderationCategories)}) NOT NULL`);

  const hasCategories = await knex.schema.hasColumn('moderation_reviews', 'categories');
  const hasSeverity = await knex.schema.hasColumn('moderation_reviews', 'severity');
  const hasMatchedRules = await knex.schema.hasColumn('moderation_reviews', 'matched_rules');

  await knex.schema.alterTable('moderation_reviews', (t) => {
    if (!hasCategories) t.json('categories').nullable().after('category');
    if (!hasSeverity) t.enu('severity', ['low', 'medium', 'high', 'critical']).notNullable().defaultTo('medium').after('priority');
    if (!hasMatchedRules) t.json('matched_rules').nullable().after('reasons');
  });

  if (!hasCategories) {
    await knex.raw('UPDATE moderation_reviews SET categories = JSON_ARRAY(category) WHERE categories IS NULL');
  }
  if (!hasMatchedRules) {
    await knex.raw('UPDATE moderation_reviews SET matched_rules = JSON_ARRAY() WHERE matched_rules IS NULL');
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const hasModerationReviews = await knex.schema.hasTable('moderation_reviews');
  if (!hasModerationReviews) return;

  const hasCategories = await knex.schema.hasColumn('moderation_reviews', 'categories');
  const hasSeverity = await knex.schema.hasColumn('moderation_reviews', 'severity');
  const hasMatchedRules = await knex.schema.hasColumn('moderation_reviews', 'matched_rules');

  await knex.schema.alterTable('moderation_reviews', (t) => {
    if (hasMatchedRules) t.dropColumn('matched_rules');
    if (hasSeverity) t.dropColumn('severity');
    if (hasCategories) t.dropColumn('categories');
  });
};
