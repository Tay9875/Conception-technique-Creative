# Oncarya

Oncarya est une application web d'entraide non medicalisee pour patients atteints de cancer. Le projet est un monorepo simple :

- `client/` : frontend React, build CRA
- `server/` : API Node.js / Express
- MySQL : base relationnelle
- `pnpm` : gestion du workspace

## Architecture

En local comme en production Docker :

```text
Navigateur
  |
  v
web (Nginx + build React, port 8080)
  |-- sert le SPA
  `-- /api/* -> api:3000/api/*
                  |
                  v
              api (Express)
                  |
                  v
              mysql (MySQL, volume persistant, non expose en production)
```

Les routes backend sont prefixees en `/api`. Le frontend utilise `REACT_APP_API_URL`, avec `/api` pour l'image de production.

## Prerequis

- Node.js 20 recommande, 18 minimum
- pnpm 10
- Docker et Docker Compose

## Lancement local sans Docker complet

```bash
pnpm install
pnpm db:up
pnpm db:prepare
pnpm dev
```

Services :

- Frontend CRA : http://localhost:3001
- API Express : http://localhost:3000
- MySQL local Docker : `127.0.0.1:3306`

## Lancement local avec Docker

```bash
docker compose up --build
```

Services :

- Web Docker : http://localhost:8080
- API Docker : http://localhost:3000
- Health public API via Nginx : http://localhost:8080/api/health

Le volume `oncarya_mysql_data` conserve les donnees MySQL. En local, `MIGRATE_ON_START=true` et `SEED_ON_START=true` par defaut dans `docker-compose.yml`.

## Scripts utiles

```bash
pnpm dev           # Lance server + client hors Docker complet
pnpm db:up         # Lance uniquement MySQL
pnpm db:down       # Stoppe le compose local
pnpm db:prepare    # Migration + seed local
pnpm lint          # Lint client + server
pnpm test          # Tests frontend
pnpm build         # Build frontend
pnpm smoke:prod    # Smoke test, requiert SMOKE_BASE_URL ou une URL en argument
```

## CI/CD

Strategie retenue :

- PR / push sur `main` ou `dev` : CI seulement (`ci.yml`)
- tag `vX.Y.Z` : build images Docker, push GHCR, deploy Dokploy (`release.yml`)
- plus de workflow Render
- pas de tag `latest` en production

Images publiees :

- `${GHCR_IMAGE_NAME}-web:vX.Y.Z`
- `${GHCR_IMAGE_NAME}-web:sha-<commit>`
- `${GHCR_IMAGE_NAME}-api:vX.Y.Z`
- `${GHCR_IMAGE_NAME}-api:sha-<commit>`

## Creer une release

```bash
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```

Rollback :

```bash
# Option 1: dans Dokploy, remettre APP_IMAGE_TAG a un ancien tag puis redeployer.

# Option 2: relancer le workflow Release Dokploy en workflow_dispatch
# avec release_tag=vX.Y.Z sur un tag existant.
```

## Deploiement Dokploy

La documentation complete est dans [docs/deployment-dokploy.md](docs/deployment-dokploy.md).

Elle contient :

- configuration Dokploy pas a pas
- variables Dokploy
- GitHub Secrets et Variables
- configuration GHCR public/prive
- smoke tests
- rollback
- troubleshooting

## Variables principales

Voir les modeles :

- `.env.example` : Compose local et valeurs attendues
- `client/.env.example` : variables CRA locales
- `server/.env.example` : API locale

En production, les secrets ne doivent pas etre commites. Generez au minimum :

```bash
openssl rand -base64 32
```

pour `JWT_SECRET`, `MYSQL_PASSWORD` et `MYSQL_ROOT_PASSWORD`.

## Healthcheck

L'API expose :

- `GET /health`
- `GET /api/health`

Le web expose publiquement `GET /api/health` via Nginx.

## Conventions de branches

Branches autorisees par la CI :

- `main`
- `dev`
- `<type>/<slug>`

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`.

## Tests frontend

```bash
pnpm test
```

Les tests React se trouvent notamment dans `client/src/App.test.js`.
