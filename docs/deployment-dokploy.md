# Deploiement Dokploy Oncarya

Ce guide decrit le deploiement gratuit de Oncarya sur un VPS avec Dokploy, Docker Compose, GHCR et GitHub Actions.

## Architecture cible

```text
Internet
  |
  v
Dokploy / reverse proxy HTTPS
  |
  v
web (Nginx, image GHCR, port interne 8080)
  |-- React SPA
  `-- /api/* -> api:3000/api/*
                  |
                  v
              api (Express, image GHCR, non expose publiquement)
                  |
                  v
              mysql (MySQL 8.4, volume oncarya_mysql_data, non expose publiquement)
```

Le fichier de production est `docker-compose.prod.yml`. Il ne declare aucun mapping `ports:`. Dokploy/Traefik route uniquement le service `web` via son port interne `8080`; `api` et `mysql` restent sur le reseau Docker interne `oncarya_internal`.

## Configuration Dokploy

1. Creer un projet Compose dans Dokploy.
2. Choisir une source Compose de type raw/manual.
3. Coller le contenu de `docker-compose.prod.yml` ou laisser le workflow le synchroniser apres la premiere configuration.
4. Configurer le domaine public sur le service `web`.
5. Dans Dokploy Domains, pointer le domaine vers le service `web` et son port interne `8080`.
6. Ne pas configurer de port host manuel : Traefik utilise deja les ports host `80` et `443`.
7. Ajouter les variables d'environnement listees plus bas.
8. Configurer l'acces GHCR :
   - option gratuite simple : rendre les packages GHCR publics ;
   - option privee : ajouter dans Dokploy un registry credential GHCR avec un token GitHub `read:packages`.
9. Lancer un premier deploiement.
10. Verifier `https://votre-domaine/api/health`.

Dokploy API utilise l'en-tete `x-api-key` et les endpoints `/api/compose.update` et `/api/compose.deploy`.

## GitHub Actions Secrets

A creer dans GitHub > repository > Settings > Secrets and variables > Actions > Secrets.

| Nom | Obligatoire | Exemple fictif | Comment l'obtenir | Utilise par |
| --- | --- | --- | --- | --- |
| `DOKPLOY_URL` | Oui | `https://dokploy.example.com` | URL publique de votre instance Dokploy | `release.yml` |
| `DOKPLOY_API_KEY` | Oui | `dp_********` | Dokploy > Settings/API ou profil API keys | `release.yml` |
| `DOKPLOY_COMPOSE_ID` | Oui | `cmps_xxxxxxxxx` | Page du projet Compose Dokploy ou API `compose.one` | `release.yml` |

`GITHUB_TOKEN` est fourni automatiquement par GitHub Actions et sert a pousser les images dans GHCR.

## GitHub Actions Variables

A creer dans GitHub > repository > Settings > Secrets and variables > Actions > Variables.

| Nom | Obligatoire | Exemple | Notes |
| --- | --- | --- | --- |
| `GHCR_IMAGE_NAME` | Oui | `ghcr.io/mon-org/oncarya/oncarya` | Doit etre en minuscules. Le workflow publie `-web` et `-api`. |
| `NODE_VERSION` | Non | `20` | Defaut workflow : `20`. |
| `PNPM_VERSION` | Non | `10` | Defaut workflow : `10`. |
| `VITE_API_URL` | Non | `/api` | Defaut workflow : `/api`; variable publique incluse dans le bundle frontend. |

## Variables Dokploy

A ajouter dans l'environnement du projet Compose Dokploy.

| Nom | Service | Obligatoire | Exemple | Notes |
| --- | --- | --- | --- | --- |
| `GHCR_IMAGE_NAME` | compose | Oui | `ghcr.io/mon-org/oncarya/oncarya` | Le workflow la met aussi a jour. |
| `APP_IMAGE_TAG` | compose | Oui | `v1.0.0` | Tag immuable utilise en production; mis a jour par le workflow. |
| `APP_VERSION` | api | Non | `v1.0.0` | Mis a jour par le workflow. |
| `APP_COMMIT_SHA` | api | Non | `abc123...` | Mis a jour par le workflow. |
| `MYSQL_DATABASE` | mysql/api | Oui | `oncarya` | Choisi manuellement. |
| `MYSQL_USER` | mysql/api | Oui | `oncarya` | Choisi manuellement. |
| `MYSQL_PASSWORD` | mysql/api | Oui | `valeur-generee` | Generer une valeur forte. |
| `MYSQL_ROOT_PASSWORD` | mysql | Oui | `valeur-generee` | Generer une valeur forte. |
| `JWT_SECRET` | api | Oui | `valeur-generee` | Requis si `NODE_ENV=production`. |
| `JWT_REFRESH_SECRET` | api | Oui | `valeur-generee` | Secret dedie aux refresh tokens. |
| `OAUTH_STATE_SECRET` | api | Oui | `valeur-generee` | Signature du `state` Google OAuth. |
| `CORS_ORIGIN` | api | Oui | `https://oncarya.example.com` | Domaine public autorise par l'API. |
| `CLIENT_URL` | api | Oui | `https://oncarya.example.com` | URL publique du frontend pour OAuth. |
| `APP_BASE_URL` | api | Oui | `https://oncarya.example.com` | URL publique utilisee dans les emails. |
| `GOOGLE_CLIENT_ID` | api | Si Google actif | `...apps.googleusercontent.com` | Identifiant OAuth Google. |
| `GOOGLE_CLIENT_SECRET` | api | Si Google actif | `valeur-google` | Secret OAuth Google, backend uniquement. |
| `GOOGLE_CALLBACK_URL` | api | Si Google actif | `https://api.example.com/api/auth/google/callback` | Doit correspondre a Google Cloud. |
| `EMAIL_MODE` | api | Non | `console` ou `resend` | `console`, `resend` ou `disabled`. |
| `RESEND_API_KEY` | api | Si email prod | `re_...` | Requis avec `EMAIL_MODE=resend`. |
| `EMAIL_FROM` | api | Si email prod | `Oncarya <notifications@example.com>` | Expediteur verifie. |
| `EMAIL_REPLY_TO` | api | Non | `support@example.com` | Adresse de reponse. |
| `MIGRATE_ON_START` | api | Non | `false` | Garder `false` en routine; mettre `true` seulement si vous acceptez la migration au demarrage. |
| `SEED_ON_START` | api | Non | `false` | Garder `false` en production. |

Ne pas ajouter de port public pour `mysql`, `api` ou `web`. Le routage public se fait uniquement par le domaine Dokploy vers le port interne `8080` du service `web`.

## Prevention des conflits VPS

Cette configuration est prevue pour cohabiter avec d'autres projets Dokploy, y compris un autre service utilisant deja le port host `3000`.

- Aucun `container_name` n'est defini : Docker Compose/Dokploy prefixe les conteneurs automatiquement.
- Aucun `ports:` n'est declare dans `docker-compose.prod.yml`.
- MySQL n'est pas expose publiquement et reste seulement sur `oncarya_internal`.
- L'API n'est pas exposee publiquement et reste seulement sur `oncarya_internal`.
- Seul `web` est routable par Dokploy/Traefik via `dokploy-network`.
- Le volume MySQL est namespaced : `oncarya_mysql_data`.
- Le reseau applicatif interne est dedie : `oncarya_internal`.
- Le reseau externe Dokploy attendu est `dokploy-network`, attache uniquement au service `web`.

## Secrets a generer

```bash
openssl rand -base64 32
```

A utiliser pour :

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `OAUTH_STATE_SECRET`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

## GHCR public ou prive

Le workflow publie sur GHCR avec `GITHUB_TOKEN`. Pour que Dokploy puisse tirer les images :

- si le package GHCR est public : aucune credentielle registry n'est necessaire ;
- si le package GHCR reste prive : creer un token GitHub avec `read:packages`, puis l'ajouter dans Dokploy comme credential registry pour `ghcr.io`.

Ne pas utiliser Docker Hub : GHCR suffit.

## Premier deploiement

1. Creer un tag initial et pousser :

```bash
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```

2. Attendre la fin du workflow `Release Dokploy`.
3. Dans Dokploy, verifier que `APP_IMAGE_TAG=v1.0.0`.
4. Si la base est vide, appliquer le schema :
   - soit temporairement `MIGRATE_ON_START=true` puis redeployer, puis remettre `false` ;
   - soit ouvrir un shell dans le conteneur `api` et lancer :

```bash
node -e "process.env.MIGRATE_ON_START='true'; import('./dist/database/startup.js').then(m => m.runDatabaseStartupTasks())"
```

5. Pour inserer les donnees de reference uniquement si souhaite :

```bash
node dist/database/seed.js
```

Le seed utilise `INSERT IGNORE`, mais il reste volontairement desactive par defaut en production.

## Rollback

Option Dokploy :

1. Modifier `APP_IMAGE_TAG` avec un ancien tag, par exemple `v1.0.0`.
2. Redeployer le Compose.
3. Verifier `/api/health`.

Option GitHub Actions :

1. Aller dans Actions > `Release Dokploy`.
2. `Run workflow`.
3. Renseigner `release_tag` avec un tag existant.
4. Lancer.

Le workflow refusera un tag dont le commit n'est pas present dans `main`.

## Troubleshooting

- `pull access denied` sur GHCR : rendre les packages publics ou configurer un registry credential GHCR dans Dokploy.
- `JWT_SECRET is required when NODE_ENV=production` : ajouter `JWT_SECRET` dans les variables Dokploy.
- `GOOGLE_OAUTH_NOT_CONFIGURED` sur `/api/auth/google` : verifier que `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` et `GOOGLE_CALLBACK_URL` sont renseignes dans l'environnement Dokploy, puis redeployer pour que le service `api` les recoive.
- `api unhealthy` : verifier `DB_HOST=mysql`, les mots de passe MySQL et les logs du service `api`.
- `web fonctionne mais /api/health echoue` : verifier que les services `web` et `api` sont dans le meme Compose et que le service s'appelle bien `api`.
- `compose environment could not be read` dans GitHub Actions : configurer une premiere fois l'environnement Compose dans Dokploy avant de laisser le workflow le modifier.

## Checklist de validation

- Le domaine pointe vers Dokploy.
- Le service `web` expose le port interne `8080`.
- `api` et `mysql` ne publient aucun port public.
- Aucun mapping host du type `3000:3000`, `3306:3306` ou `8080:8080` n'existe en production.
- Les variables Dokploy obligatoires sont presentes.
- GHCR est accessible depuis le VPS.
- `APP_IMAGE_TAG` est un tag immuable, pas `latest`.
- `https://votre-domaine/` charge le frontend.
- `https://votre-domaine/api/health` retourne `status: ok`.
