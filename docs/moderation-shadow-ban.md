# Moderation automatique et shadow ban

Le moteur local `server/src/moderation/moderationEngine.ts` analyse les posts et commentaires a la creation. Il est deterministe, sans API externe, et produit toujours une decision explicable :

- `status` : `allowed`, `needs_review` ou `shadow_banned`
- `category` : `self_harm_suicide`, `dangerous_medical_advice`, `disguised_promotion`, `spam_or_low_quality`, `harassment_or_abuse`
- `score` : score de risque de 0 a 100
- `priority` : `low`, `medium`, `high`, `urgent`
- `reasons` : raisons lisibles, sans recopier le contenu utilisateur

Les contenus `shadow_banned` ne sont pas supprimes. Ils sont enregistres normalement, mais masques des listings publics via `posts.is_banned` ou `comments.is_banned`.

## Donnees pour une future admin

La table `moderation_reviews` contient la file de revue :

```sql
SELECT
  id,
  target_type,
  target_id,
  author_id,
  status,
  category,
  risk_score,
  priority,
  reasons,
  created_at,
  updated_at
FROM moderation_reviews
WHERE status IN ('needs_review', 'shadow_banned')
ORDER BY
  FIELD(priority, 'urgent', 'high', 'medium', 'low'),
  risk_score DESC,
  created_at ASC;
```

Pour afficher le contenu a reviser, la future interface admin devra joindre selon `target_type` :

```sql
-- Posts
SELECT mr.*, p.title, p.description, p.is_banned
FROM moderation_reviews mr
JOIN posts p ON mr.target_type = 'post' AND mr.target_id = p.id
WHERE mr.status IN ('needs_review', 'shadow_banned');

-- Commentaires
SELECT mr.*, c.description, c.post_id, c.is_banned
FROM moderation_reviews mr
JOIN comments c ON mr.target_type = 'comment' AND mr.target_id = c.id
WHERE mr.status IN ('needs_review', 'shadow_banned');
```

Les cas `self_harm_suicide` en priorite `urgent` ou `high` doivent remonter en premier. L'interface admin ne doit pas afficher les details graphiques dans les notifications, logs techniques ou erreurs.

## Comportement attendu

- Un contenu autorise n'est pas ajoute a `moderation_reviews`.
- Un contenu `needs_review` reste public, mais apparait dans la file de revue.
- Un contenu `shadow_banned` est masque publiquement et apparait dans la file de revue.
- Une future route de modification devra rappeler `analyzeContentForModeration({ content, targetType, authorId })`, mettre a jour `is_banned` selon `shouldShadowBan`, puis appeler `saveModerationReview` si le statut n'est pas `allowed`.

