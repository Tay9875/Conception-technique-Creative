# Moderation automatique Oncarya

Le moteur est cote backend dans `server/src/moderation/`.

## Objectif

Oncarya doit proteger les patients et proches sans sanctionner une personne vulnerable qui demande de l'aide. Le moteur distingue donc :

- `allow` : contenu visible normalement.
- `needs_review` : contenu conserve et signale pour revue humaine.
- `shadow_ban` : contenu sauvegarde mais masque du public via `is_banned`.

## Fonctionnement

`analyzeContentForModeration()` normalise le texte :

- minuscules ;
- suppression des accents ;
- espaces multiples compactes ;
- ponctuation excessive nettoyee ;
- detection de liens sur le texte original.

Chaque regle ajoute un score et une categorie. Les regles critiques peuvent declencher un shadow ban direct.

La reponse contient :

```json
{
  "action": "allow | needs_review | shadow_ban",
  "status": "allowed | needs_review | shadow_banned",
  "score": 0,
  "reasons": [],
  "categories": [],
  "matchedRules": [],
  "severity": "low | medium | high | critical"
}
```

## Categories couvertes

- risque suicidaire et auto-harm ;
- drogues/substances et melanges dangereux ;
- faux remedes cancer et arret de traitement ;
- promotion deguisee, spam, arnaques ;
- haine, harcelement, menaces ;
- contenu sexuel deplace ;
- donnees personnelles sensibles.

Les discussions legitimes sur fatigue, traitement, douleur, morphine prescrite, effets secondaires ou avis medical sont protegees par des signaux de contexte medical.

## Stockage

Les contenus moderes sont traces dans `moderation_reviews` :

- `target_type`, `target_id`, `author_id` ;
- `status`, `category`, `categories` ;
- `risk_score`, `priority`, `severity` ;
- `reasons`, `matched_rules` ;
- `created_at`, `updated_at`.

Les posts et commentaires publics filtrent `is_banned = 0`.

## File future admin

Une base admin existe deja via RBAC. La file est disponible pour les roles autorises :

```http
GET /api/moderation/queue
```

Elle liste `needs_review` et `shadow_banned`, tries par priorite puis anciennete. Une future interface admin peut consommer cette route et ajouter des actions de revue explicites (`reviewed_at`, decision, notes) si besoin.

## Tests locaux

```bash
pnpm --filter server test
```

Les tests principaux sont dans :

- `server/tests/moderation.engine.test.ts`
- `server/tests/routes/posts.unit.test.ts`
- `server/tests/routes/comments.unit.test.ts`
