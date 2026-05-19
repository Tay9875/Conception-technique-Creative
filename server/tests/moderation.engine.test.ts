import { describe, expect, it } from 'vitest';
import { analyzeContentForModeration } from '../src/moderation/moderationEngine';

describe('analyzeContentForModeration', () => {
  it('allows practical non-medical support content', () => {
    const analysis = analyzeContentForModeration({
      content: 'Retour d experience: preparer les repas le dimanche m aide avec la fatigue. Parlez-en a votre medecin si besoin.',
      targetType: 'post',
      authorId: 1
    });

    expect(analysis.status).toBe('allowed');
    expect(analysis.score).toBe(0);
    expect(analysis.reasons).toEqual([]);
  });

  it('shadow bans dangerous treatment substitution advice', () => {
    const analysis = analyzeContentForModeration({
      content: 'Arrete la chimio et remplace ton traitement par ce produit naturel, ca guerit le cancer.',
      targetType: 'comment',
      authorId: 2
    });

    expect(analysis.status).toBe('shadow_banned');
    expect(analysis.shouldShadowBan).toBe(true);
    expect(analysis.category).toBe('dangerous_medical_advice');
    expect(analysis.reasons.some((reason) => reason.code === 'STOP_MEDICAL_TREATMENT')).toBe(true);
  });

  it('flags personal self-harm distress for review without exposing content excerpts', () => {
    const analysis = analyzeContentForModeration({
      content: 'Je veux mourir, je ne sais plus quoi faire.',
      targetType: 'post',
      authorId: 3
    });

    expect(analysis.status).toBe('needs_review');
    expect(analysis.priority).toBe('high');
    expect(analysis.category).toBe('self_harm_suicide');
    expect(JSON.stringify(analysis.reasons)).not.toContain('Je veux mourir');
  });

  it('shadow bans self-harm method or encouragement content', () => {
    const analysis = analyzeContentForModeration({
      content: 'Comment se suicider rapidement avec une methode simple ?',
      targetType: 'comment',
      authorId: 4
    });

    expect(analysis.status).toBe('shadow_banned');
    expect(analysis.priority).toBe('urgent');
    expect(analysis.category).toBe('self_harm_suicide');
  });

  it('detects disguised miracle product promotion', () => {
    const analysis = analyzeContentForModeration({
      content: 'Contacte-moi sur WhatsApp pour commander mon complement anticancer avec code promo.',
      targetType: 'post',
      authorId: 5
    });

    expect(analysis.status).toBe('shadow_banned');
    expect(analysis.category).toBe('disguised_promotion');
  });
});

