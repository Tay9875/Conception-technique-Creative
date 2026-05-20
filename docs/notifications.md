# Notifications

Le systeme de notifications couvre d'abord la pastille in-app dans le navigateur et l'email. Le Web Push natif n'est pas active pour eviter une complexite prematuree, mais `browser_push_enabled` prepare le schema pour VAPID plus tard.

## Tables

Migration :

```text
server/migrations/20260519153000_notifications.js
```

Tables :

- `notifications`
- `notification_preferences`
- `notification_deliveries`

Indexes utiles :

- `notifications(user_id, read_at, created_at)`
- `notifications(user_id, created_at)`
- `notification_deliveries(notification_id, channel)`

## Preferences

Chaque utilisateur peut choisir :

- navigateur + email ;
- navigateur uniquement ;
- email uniquement ;
- desactive.

Il peut aussi filtrer par type :

- commentaires ;
- reactions ;
- soutien ;
- moderation ;
- systeme.

## Endpoints

```http
GET /api/notifications
GET /api/notifications/unread-count
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
GET /api/notifications/preferences
PATCH /api/notifications/preferences
```

Toutes les routes demandent un JWT applicatif Oncarya.

## Evenements branches

- nouveau commentaire sur mon post ;
- reaction utile sur mon post ;
- contenu en `needs_review` pour l'auteur ;
- pas de notification pour ses propres actions.

Les contenus `shadow_banned` ne declenchent pas de notification auteur pour conserver le comportement discret actuel et eviter une experience anxiogene.

## Email

Mode developpement par defaut :

```env
EMAIL_MODE=console
```

Production avec Resend :

```env
EMAIL_MODE=resend
RESEND_API_KEY=...
EMAIL_FROM="Oncarya <notifications@votre-domaine.example>"
EMAIL_REPLY_TO=support@votre-domaine.example
APP_BASE_URL=https://votre-frontend.example
```

Les emails restent volontairement sobres :

- objet generique ;
- pas de contenu medical sensible ;
- lien vers Oncarya si disponible ;
- rappel que les preferences sont modifiables depuis le profil.

Pour couper l'email :

```env
EMAIL_MODE=disabled
```

## Frontend

Composants :

- `NotificationBell`
- `NotificationPreferencesPanel`

La cloche affiche le compteur non lu, la liste, l'etat vide, le chargement, l'erreur, le marquage lu et "tout lire". La section preferences vit dans le profil.

## Tests

```bash
pnpm --filter server test
pnpm --filter client test
```

Tests principaux :

- `server/tests/notifications.service.test.ts`
- `server/tests/routes/notifications.unit.test.ts`
- `client/src/__tests__/components/NotificationBell.test.tsx`
- `client/src/__tests__/components/NotificationPreferencesPanel.test.tsx`
