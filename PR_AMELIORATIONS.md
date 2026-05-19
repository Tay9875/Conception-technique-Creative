# PR - Ameliorations

Cette PR améliore principalement le backend et aligne le frontend avec ces changements.

## Backend
- Migration JS -> TypeScript.
- Sécurité renforcée: JWT access/refresh, rotation/revocation, validation Zod.
- Format d’erreurs API unifié.
- RBAC pour la modération.
- Rate limiting + headers de sécurité (helmet) + compression.
- Migrations versionnées (Knex) + rollback.
- Ajout Redis local (cache/rate-limit distribué).
- Tests unitaires + tests d’intégration API.
- CI renforcée (tests, intégration, audit) + CodeQL.

## Frontend
- Alignement complet avec le nouveau contrat API backend.
- Centralisation des appels API + gestion d’erreurs cohérente.
- Auth adaptée (token/refreshToken).
- Routes et payloads corrigés (users/me, comments, like/report).

## Dev Experience
- Documentation mise à jour.
- Variables `.env.example`.
- Commandes simples pour lancer infra (MySQL + Redis) et projet.
