import {
  hasProfessionalCareContext,
  hasMedicalSubstanceContext,
  moderationRules,
  ModerationCategory,
  ModerationReason,
  normalizeModerationText,
  RuleMatch
} from './moderationRules';

export type ModerationTargetType = 'post' | 'comment';
export type ModerationStatus = 'allowed' | 'needs_review' | 'shadow_banned';
export type ModerationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ModerationAction = 'allow' | 'needs_review' | 'shadow_ban';
export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ModerationAnalysis = {
  targetType: ModerationTargetType;
  authorId?: number;
  status: ModerationStatus;
  action: ModerationAction;
  category: ModerationCategory;
  categories: ModerationCategory[];
  score: number;
  priority: ModerationPriority;
  severity: ModerationSeverity;
  reasons: ModerationReason[];
  matchedRules: string[];
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
  return matches.map((match) => {
    if (match.directShadowBan) return match;

    if (match.category === 'dangerous_medical_advice' && hasProfessionalCareContext(normalized)) {
      return {
        ...match,
        weight: Math.max(0, match.weight - 20),
        message: `${match.message} Le contenu mentionne aussi le recours a un professionnel de sante.`
      };
    }

    if (match.category === 'drug_or_substance' && hasMedicalSubstanceContext(normalized)) {
      return {
        ...match,
        weight: Math.max(0, match.weight - 35),
        message: `${match.message} Le contenu mentionne un contexte medical ou une prescription.`
      };
    }

    return match;
  });
};

const uniqueCategories = (matches: RuleMatch[]) =>
  [...new Set(matches.map((match) => match.category))];

const severityFrom = (status: ModerationStatus, priority: ModerationPriority): ModerationSeverity => {
  if (status === 'allowed') return 'low';
  if (status === 'shadow_banned' || priority === 'urgent') return 'critical';
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
};

const actionFrom = (status: ModerationStatus): ModerationAction => {
  if (status === 'allowed') return 'allow';
  if (status === 'shadow_banned') return 'shadow_ban';
  return 'needs_review';
};

const shouldProtectFromShadowOnly = (matches: RuleMatch[]) => {
  const categories = uniqueCategories(matches);
  return (
    categories.length > 0 &&
    categories.every((category) => category === 'self_harm_suicide' || category === 'personal_sensitive_data') &&
    !matches.some((match) => match.directShadowBan)
  );
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
      action: 'allow',
      category: 'none',
      categories: [],
      score: 0,
      priority: 'low',
      severity: 'low',
      reasons: [],
      matchedRules: [],
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
  const protectedFromShadow = shouldProtectFromShadowOnly(matches);
  const status: ModerationStatus =
    hasDirectShadowBan || (score >= 70 && !protectedFromShadow)
      ? 'shadow_banned'
      : score >= 40
        ? 'needs_review'
        : 'allowed';
  const priority = matches.length ? maxPriority(matches) : 'low';

  return {
    targetType,
    authorId,
    status,
    action: actionFrom(status),
    category: dominantCategory(matches),
    categories: uniqueCategories(matches),
    score,
    priority,
    severity: severityFrom(status, priority),
    reasons: matches.map(({ code, category, message, weight }) => ({ code, category, message, weight })),
    matchedRules: matches.map((match) => match.code),
    shouldShadowBan: status === 'shadow_banned'
  };
};
