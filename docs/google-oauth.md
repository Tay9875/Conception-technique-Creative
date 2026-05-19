# Google OAuth

Oncarya garde l'auth existante par email/mot de passe et ajoute Google comme option. Les tokens Google ne sont pas stockes. Apres validation Google, le backend cree ou retrouve l'utilisateur, puis emet les JWT applicatifs Oncarya existants.

## Variables backend

```env
CLIENT_URL=https://votre-frontend.example
APP_BASE_URL=https://votre-frontend.example
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://votre-api.example/api/auth/google/callback
OAUTH_STATE_SECRET=chaine-aleatoire-32-caracteres-minimum
```

`OAUTH_STATE_SECRET` peut etre different de `JWT_SECRET`. En local, il peut reprendre une valeur longue de test.

## Variables frontend

```env
VITE_API_URL=/api
```

En developpement separe :

```env
VITE_API_URL=http://localhost:3000/api
```

## Configuration Google Cloud

1. Creer un projet Google Cloud.
2. Configurer l'ecran de consentement OAuth.
3. Creer un identifiant OAuth "Application Web".
4. Ajouter l'URI de redirection autorisee :

```text
https://votre-api.example/api/auth/google/callback
```

En local :

```text
http://localhost:3000/api/auth/google/callback
```

## Endpoints

```http
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/me
POST /api/auth/logout
```

`GET /api/auth/google` accepte `returnTo=/chemin-interne`. Le backend signe ce chemin dans `state`, refuse les redirections externes et redirige toujours vers `/login` cote frontend apres callback.

## Modele DB

Migration :

```text
server/migrations/20260519150000_google_oauth_accounts.js
```

Elle ajoute :

- `oauth_accounts(user_id, provider, provider_account_id, email, created_at, updated_at)` ;
- `users.avatar_url` ;
- `users.email_verified` ;
- `users.password` nullable pour les comptes Google-only.

Si un email existe deja, le compte Google est associe a cet utilisateur.

## Securite

- `state` OAuth HMAC avec expiration courte ;
- `redirect_uri` unique cote serveur ;
- aucune exposition de `GOOGLE_CLIENT_SECRET` au frontend ;
- pas de persistance des access tokens Google ;
- pas de open redirect ;
- callback final via fragment URL, puis nettoyage par le frontend.

## Tests

```bash
pnpm --filter server test
pnpm --filter client test
```
