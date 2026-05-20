import { describe, expect, it } from 'vitest';
import { applyRankingBonuses, createSearchIndex, toSearchResult, type SearchDocument } from '../src/services/search';

const baseDoc: SearchDocument = {
  id: 'post:1',
  sourceId: 1,
  type: 'post',
  title: 'Fatigue pendant le traitement',
  content: 'Quelques conseils pour mieux recuperer pendant la chimiotherapie.',
  category: 'Effets secondaires',
  tags: 'fatigue',
  authorPseudo: 'Camille',
  createdAt: new Date().toISOString(),
  url: '/article/1',
  usefulCount: 8,
  commentCount: 3
};

describe('search ranking', () => {
  it('boosts post titles above matching comments', () => {
    const postScore = applyRankingBonuses(baseDoc, 5, 'fatigue');
    const commentScore = applyRankingBonuses({ ...baseDoc, id: 'comment:2', sourceId: 2, type: 'comment' }, 5, 'fatigue');

    expect(postScore).toBeGreaterThan(commentScore);
  });

  it('boosts exact and prefix matches', () => {
    const exact = applyRankingBonuses({ ...baseDoc, title: 'Fatigue' }, 3, 'fatigue');
    const distant = applyRankingBonuses({ ...baseDoc, title: 'Recuperation lente', tags: '', content: 'Repos progressif.' }, 3, 'fatigue');

    expect(exact).toBeGreaterThan(distant);
  });

  it('uses configured field boosts in the MiniSearch index', () => {
    const index = createSearchIndex([
      baseDoc,
      { ...baseDoc, id: 'post:2', sourceId: 2, title: 'Autre conseil', content: 'fatigue fatigue fatigue', tags: '' }
    ]);

    const [first] = index.search('fatigue');
    expect(first.id).toBe('post:1');
  });

  it('returns a compact public result shape', () => {
    const result = toSearchResult(baseDoc, 12.3, 'fatigue');

    expect(result).toMatchObject({
      id: '1',
      type: 'post',
      title: baseDoc.title,
      url: '/article/1',
      meta: { author: 'Camille', category: 'Effets secondaires', commentCount: 3, usefulCount: 8 }
    });
  });
});
