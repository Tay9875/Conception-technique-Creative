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
      (target_type, target_id, author_id, status, category, risk_score, priority, reasons)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      author_id = VALUES(author_id),
      status = VALUES(status),
      category = VALUES(category),
      risk_score = VALUES(risk_score),
      priority = VALUES(priority),
      reasons = VALUES(reasons),
      updated_at = CURRENT_TIMESTAMP`,
    [
      analysis.targetType,
      targetId,
      analysis.authorId || null,
      analysis.status,
      analysis.category,
      analysis.score,
      analysis.priority,
      JSON.stringify(analysis.reasons)
    ]
  );
};

