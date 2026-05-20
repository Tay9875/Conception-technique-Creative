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

Le fichier de production est `docker-compose.prod.yml`. Il ne declare aucun mapping `ports:`. Dokploy/Traefik route uniquement le service `web` via son port interne `8080`. `mysql` reste uniquement sur le reseau Docker interne `oncarya_internal`; `api` reste non exposee publiquement et utilise aussi un reseau bridge dedie `oncarya_egress` pour ses appels sortants Google OAuth et Resend.

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
| `MIGRATE_ON_START` | api | Non | `true` | Par defaut, l'API applique les migrations Knex au demarrage. Mettre `false` seulement si vous gerez les migrations manuellement avant chaque release. |
| `SEED_ON_START` | api | Non | `false` | Garder `false` en production. |

Ne pas ajouter de port public pour `mysql`, `api` ou `web`. Le routage public se fait uniquement par le domaine Dokploy vers le port interne `8080` du service `web`.

## Prevention des conflits VPS

Cette configuration est prevue pour cohabiter avec d'autres projets Dokploy, y compris un autre service utilisant deja le port host `3000`.

- Aucun `container_name` n'est defini : Docker Compose/Dokploy prefixe les conteneurs automatiquement.
- Aucun `ports:` n'est declare dans `docker-compose.prod.yml`.
- MySQL n'est pas expose publiquement et reste seulement sur `oncarya_internal`.
- L'API n'est pas exposee publiquement : elle partage `oncarya_internal` avec `web` et `mysql`, et utilise `oncarya_egress` uniquement pour l'acces sortant Internet.
- Seul `web` est routable par Dokploy/Traefik via `dokploy-network`.
- Le volume MySQL est namespaced : `oncarya_mysql_data`.
- Le reseau applicatif interne est dedie : `oncarya_internal`.
- Le reseau sortant de l'API est dedie : `oncarya_egress`.
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
4. Si `MIGRATE_ON_START=true` est conserve, le schema est applique automatiquement au demarrage de l'API. Si vous avez force `MIGRATE_ON_START=false`, appliquer le schema manuellement avant le redeploiement :

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

### API sans acces Internet depuis un reseau Docker internal

Un reseau Docker declare avec `internal: true` isole volontairement les conteneurs du routage Internet sortant. C'est utile pour `mysql`, mais insuffisant pour `api` car elle doit appeler Google OAuth et Resend.

Symptomes typiques depuis le conteneur `api` :

- `EAI_AGAIN`, `ESERVFAIL` ou `ECONNREFUSED` indiquent souvent un probleme DNS ou d'acces au resolver.
- `ENETUNREACH` vers `1.1.1.1` ou `8.8.8.8` indique plutot une absence de route Internet sortante.

Tester d'abord la route Internet brute :

```bash
docker exec -it <api-container> node -e "fetch('https://1.1.1.1').then(r=>console.log('status', r.status)).catch(e=>console.error(e))"
```

Tester ensuite la resolution DNS externe :

```bash
docker exec -it <api-container> node -e "require('dns').lookup('oauth2.googleapis.com', (e,a,f)=>console.log(e || { address:a, family:f }))"
```

Verifier enfin l'appel HTTPS Google. Un `status 400` sur `/token` peut etre normal sans payload OAuth ; ce qui est bloquant est `EAI_AGAIN`, `ESERVFAIL`, `ECONNREFUSED` ou `ENETUNREACH`.

```bash
docker exec -it <api-container> node -e "fetch('https://oauth2.googleapis.com/token').then(r=>console.log('status', r.status)).catch(e=>console.error(e))"
```

La solution Compose est de garder `oncarya_internal` pour la communication `web -> api -> mysql`, et d'attacher seulement `api` a un second reseau bridge non-internal pour l'egress :

```yaml
services:
  mysql:
    networks:
      - oncarya_internal

  api:
    networks:
      - oncarya_internal
      - oncarya_egress

  web:
    networks:
      - dokploy-network
      - oncarya_internal

networks:
  dokploy-network:
    external: true
  oncarya_internal:
    driver: bridge
    internal: true
  oncarya_egress:
    driver: bridge
```

Ne jamais attacher `mysql` a `oncarya_egress`. Ne jamais ajouter de `ports:` a `api` ou `mysql`.

Inspecter la configuration DNS injectee dans le conteneur si la route Internet fonctionne mais la resolution echoue encore :

```bash
docker exec -it <api-container> cat /etc/resolv.conf
```

Le service `api` declare aussi des DNS IPv4 Hetzner explicites dans `docker-compose.prod.yml` :

```yaml
dns:
  - 185.12.64.1
  - 185.12.64.2
```

Si le reseau egress fonctionne mais que le DNS reste instable, envisager une configuration DNS globale Docker sur le VPS via `/etc/docker/daemon.json`, puis redemarrer Docker et redeployer. Ne pas automatiser cette modification systeme dans le repository.

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
