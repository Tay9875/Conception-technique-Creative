import {
  hasProfessionalCareContext,
  moderationRules,
  ModerationCategory,
  ModerationReason,
  normalizeModerationText,
  RuleMatch
} from './moderationRules';

export type ModerationTargetType = 'post' | 'comment';
export type ModerationStatus = 'allowed' | 'needs_review' | 'shadow_banned';
export type ModerationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ModerationAnalysis = {
  targetType: ModerationTargetType;
  authorId?: number;
  status: ModerationStatus;
  category: ModerationCategory;
  score: number;
  priority: ModerationPriority;
  reasons: ModerationReason[];
  shouldShadowBan: boolean;
};

type AnalyzeInput = {
  content: string;
  targetType: ModerationTargetType;
  authorId?: number;
};

const priorityRank: Record<ModerationPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4
};

const maxPriority = (matches: RuleMatch[]): ModerationPriority => {
  let selected: ModerationPriority = 'low';
  for (const match of matches) {
    const priority = match.priority || 'low';
    if (priorityRank[priority] > priorityRank[selected]) selected = priority;
  }
  return selected;
};

const categoryScores = (matches: RuleMatch[]) => {
  const scores = new Map<ModerationCategory, number>();
  for (const match of matches) {
    scores.set(match.category, (scores.get(match.category) || 0) + match.weight);
  }
  return scores;
};

const dominantCategory = (matches: RuleMatch[]): ModerationCategory => {
  if (!matches.length) return 'none';
  let category: ModerationCategory = matches[0].category;
  let bestScore = 0;
  for (const [candidate, score] of categoryScores(matches)) {
    if (score > bestScore) {
      bestScore = score;
      category = candidate;
    }
  }
  return category;
};

const applyProtectiveContext = (matches: RuleMatch[], normalized: string) => {
  if (!hasProfessionalCareContext(normalized)) return matches;

  return matches.map((match) => {
    if (match.category !== 'dangerous_medical_advice') return match;
    if (match.directShadowBan) return match;

    return {
      ...match,
      weight: Math.max(0, match.weight - 20),
      message: `${match.message} Le contenu mentionne aussi le recours a un professionnel de sante.`
    };
  });
};

export const analyzeContentForModeration = ({
  content,
  targetType,
  authorId
}: AnalyzeInput): ModerationAnalysis => {
  const normalized = normalizeModerationText(content || '');
  if (!normalized) {
    return {
      targetType,
      authorId,
      status: 'allowed',
      category: 'none',
      score: 0,
      priority: 'low',
      reasons: [],
      shouldShadowBan: false
    };
  }

  const rawMatches = moderationRules.flatMap((rule): RuleMatch[] => {
    const patternMatched = rule.patterns?.some((pattern) => pattern.test(normalized)) || false;
    const customMatched = rule.test?.(normalized, content) || false;
    if (!patternMatched && !customMatched) return [];

    return [{
      code: rule.code,
      category: rule.category,
      message: rule.message,
      weight: rule.weight,
      directShadowBan: rule.directShadowBan,
      priority: rule.priority
    }];
  });

  const matches = applyProtectiveContext(rawMatches, normalized).filter((match) => match.weight > 0);
  const score = Math.min(100, matches.reduce((sum, match) => sum + match.weight, 0));
  const hasDirectShadowBan = matches.some((match) => match.directShadowBan);
  const status: ModerationStatus = hasDirectShadowBan || score >= 70 ? 'shadow_banned' : score >= 40 ? 'needs_review' : 'allowed';

  return {
    targetType,
    authorId,
    status,
    category: dominantCategory(matches),
    score,
    priority: matches.length ? maxPriority(matches) : 'low',
    reasons: matches.map(({ code, category, message, weight }) => ({ code, category, message, weight })),
    shouldShadowBan: status === 'shadow_banned'
  };
};

