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
- `users.profile_status` via la migration `20260520090000_add_user_profile_status.js`.

`oauth_accounts` garde une contrainte unique sur `(provider, provider_account_id)`.

En production Dokploy, `MIGRATE_ON_START` vaut `true` par defaut dans `docker-compose.prod.yml` pour que les migrations Knex requises par une release soient appliquees avant l'ouverture de l'API. Si cette variable est forcee a `false`, lancez les migrations manuellement avant de deployer une image qui attend de nouvelles colonnes.

## Liaison email existant + Google

Le callback Google applique cette logique :

- si `(provider, provider_account_id)` existe deja dans `oauth_accounts`, l'utilisateur lie est reconnecte ;
- si l'email Google est verifie et correspond a un utilisateur Oncarya existant, le provider Google est lie a cet utilisateur ;
- le mot de passe local, le nom, le statut/profil et le role technique existants ne sont pas ecrases ;
- `users.email_verified` passe a `true` quand Google confirme l'email ;
- `avatar_url` est completee depuis Google seulement si l'utilisateur n'a pas deja un avatar ;
- si l'email Google n'est pas verifie, l'association automatique est refusee.

L'exigence `email_verified === true` evite qu'un compte Google non confirme puisse prendre le controle d'un compte Oncarya existant avec la meme adresse email.

La creation/l'association utilisateur + `oauth_accounts` se fait en transaction. L'upsert utilisateur s'appuie sur l'unicite de `users.email`, et l'upsert OAuth ne reassigne pas silencieusement un provider deja lie a un autre utilisateur.

## Comptes Google-only

Un utilisateur cree via Google a `users.password = NULL`. Aucun faux mot de passe n'est genere.

Il peut se connecter via Google, mais le changement de mot de passe Oncarya est refuse tant qu'aucun mot de passe local n'existe :

```json
{
  "code": "PASSWORD_NOT_AVAILABLE",
  "message": "Votre compte utilise Google pour la connexion. Aucun mot de passe Oncarya n'est configure."
}
```

L'interface profil affiche alors "Connexion via Google" et remplace le formulaire de changement de mot de passe par un message explicatif. Un compte qui possede a la fois un mot de passe local et Google conserve le changement de mot de passe.

La fonctionnalite "definir un mot de passe local" pour un compte Google-only reste hors scope. Elle devrait passer par un flux de verification email/reset password dedie.

## Contrat `/auth/me`

`GET /api/auth/me` et `GET /api/users/me` retournent un utilisateur public sans hash ni token Google :

```json
{
  "id": 1,
  "firstname": "Alice",
  "lastname": "Martin",
  "email": "alice@example.com",
  "role_id": 1,
  "avatar_url": null,
  "email_verified": true,
  "authProviders": ["password", "google"],
  "hasPassword": true,
  "canChangePassword": true,
  "profileStatus": "patient"
}
```

`authProviders` peut contenir `password`, `google`, ou les deux. `canChangePassword` est vrai uniquement quand un mot de passe local existe.

## Statut/profil utilisateur

Le statut public Oncarya est stocke dans `users.profile_status`, separe de `role_id` pour ne pas melanger profil utilisateur et role technique/RBAC.

Valeurs autorisees :

- `patient`
- `former_patient`
- `caregiver`
- `prefer_not_to_say`

La page profil permet de modifier ce statut via `PATCH /api/users/me`. Le champ reste volontairement vague et ne demande pas de donnee medicale sensible.

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
