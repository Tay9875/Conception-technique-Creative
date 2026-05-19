# Etapes Hardening Entreprise Backend

1. Secrets stricts (plus de fallback).
2. Metrics officielles `prom-client`.
3. CORS/headers securite stricts en prod.
4. Migrations versionnees Knex + rollback.
5. Tests integration etendus (auth/posts/comments/refresh/logout).
6. CI securite renforcee (integration + audit + CodeQL).
7. Redis local via docker-compose pour cache/rate-limit.
