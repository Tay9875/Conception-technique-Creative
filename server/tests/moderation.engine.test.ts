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
    expect(analysis.action).toBe('allow');
    expect(analysis.score).toBe(0);
    expect(analysis.reasons).toEqual([]);
  });

  it('allows treatment and fatigue discussion in a care context', () => {
    const analysis = analyzeContentForModeration({
      content: 'La fatigue apres mon traitement est difficile. Mon oncologue ajuste les rendez-vous et je cherche des astuces pour mieux dormir.',
      targetType: 'post',
      authorId: 1
    });

    expect(analysis.status).toBe('allowed');
    expect(analysis.categories).toEqual([]);
  });

  it('allows prescribed pain medication discussion in a medical context', () => {
    const analysis = analyzeContentForModeration({
      content: 'La morphine prescrite par mon medecin calme la douleur mais me donne des nausees. Avez-vous eu ce type d effets secondaires ?',
      targetType: 'comment',
      authorId: 1
    });

    expect(analysis.status).toBe('allowed');
    expect(analysis.matchedRules).toEqual([]);
  });

  it('shadow bans dangerous treatment substitution advice', () => {
    const analysis = analyzeContentForModeration({
      content: 'Arrete la chimio et remplace ton traitement par ce produit naturel, ca guerit le cancer.',
      targetType: 'comment',
      authorId: 2
    });

    expect(analysis.status).toBe('shadow_banned');
    expect(analysis.action).toBe('shadow_ban');
    expect(analysis.shouldShadowBan).toBe(true);
    expect(analysis.category).toBe('dangerous_medical_advice');
    expect(analysis.severity).toBe('critical');
    expect(analysis.reasons.some((reason) => reason.code === 'STOP_MEDICAL_TREATMENT')).toBe(true);
  });

  it('flags personal self-harm distress for review without exposing content excerpts', () => {
    const analysis = analyzeContentForModeration({
      content: 'Je veux mourir, je ne sais plus quoi faire.',
      targetType: 'post',
      authorId: 3
    });

    expect(analysis.status).toBe('needs_review');
    expect(analysis.action).toBe('needs_review');
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

  it('flags immediate personal self-harm risk for urgent review instead of brutal shadow ban', () => {
    const analysis = analyzeContentForModeration({
      content: 'Ce soir je pense me suicider, j ai besoin d aide.',
      targetType: 'post',
      authorId: 4
    });

    expect(['needs_review', 'shadow_banned']).toContain(analysis.status);
    expect(analysis.priority).toBe('urgent');
    expect(analysis.shouldShadowBan).toBe(false);
  });

  it('shadow bans recreational drug promotion', () => {
    const analysis = analyzeContentForModeration({
      content: 'Je vends cocaine et mdma, livraison rapide, contactez moi sur Telegram pour les prix.',
      targetType: 'comment',
      authorId: 5
    });

    expect(analysis.status).toBe('shadow_banned');
    expect(analysis.categories).toContain('drug_or_substance');
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

  it('flags spam with many links for review', () => {
    const analysis = analyzeContentForModeration({
      content: 'Regarde https://a.com https://b.fr https://c.net https://d.org pour cette offre.',
      targetType: 'post',
      authorId: 6
    });

    expect(['needs_review', 'shadow_banned']).toContain(analysis.status);
    expect(analysis.categories).toContain('spam_or_low_quality');
  });

  it('flags personal contact information for review', () => {
    const analysis = analyzeContentForModeration({
      content: 'Voici mon telephone 06 12 34 56 78 et mon email perso alice@example.com.',
      targetType: 'comment',
      authorId: 7
    });

    expect(analysis.status).toBe('needs_review');
    expect(analysis.categories).toContain('personal_sensitive_data');
    expect(analysis.shouldShadowBan).toBe(false);
  });
});
