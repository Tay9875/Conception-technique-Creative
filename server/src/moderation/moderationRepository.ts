import { ModerationAnalysis } from './moderationEngine';

type Queryable = {
  query: (sql: string, values?: unknown[]) => Promise<unknown>;
};

type SaveReviewInput = {
  targetId: number;
  analysis: ModerationAnalysis;
};

export const saveModerationReview = async (db: Queryable, { targetId, analysis }: SaveReviewInput) => {
  if (analysis.status === 'allowed') return;

  await db.query(
    `INSERT INTO moderation_reviews
      (target_type, target_id, author_id, status, category, categories, risk_score, priority, severity, reasons, matched_rules)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      author_id = VALUES(author_id),
      status = VALUES(status),
      category = VALUES(category),
      categories = VALUES(categories),
      risk_score = VALUES(risk_score),
      priority = VALUES(priority),
      severity = VALUES(severity),
      reasons = VALUES(reasons),
      matched_rules = VALUES(matched_rules),
      updated_at = CURRENT_TIMESTAMP`,
    [
      analysis.targetType,
      targetId,
      analysis.authorId || null,
      analysis.status,
      analysis.category,
      JSON.stringify(analysis.categories),
      analysis.score,
      analysis.priority,
      analysis.severity,
      JSON.stringify(analysis.reasons),
      JSON.stringify(analysis.matchedRules)
    ]
  );
};
