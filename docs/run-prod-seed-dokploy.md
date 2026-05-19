# Lancer le seed en production avec Dokploy

Ce guide explique comment lancer le seed Oncarya sur un VPS gere par Dokploy.

Le seed actuel est idempotent pour les donnees de reference : il utilise `INSERT IGNORE` pour ajouter uniquement les roles, pathologies et tags manquants. Il ne doit pas supprimer de donnees existantes.

## Avant de lancer

Verifier que :

- le deploiement Dokploy est sain ;
- `https://votre-domaine/api/health` repond ;
- les migrations ont deja ete appliquees ;
- le service `api` utilise bien l'image du tag de production voulu.

Si la base vient d'etre creee, lancer d'abord les migrations depuis le conteneur `api` :

```bash
node -e "process.env.MIGRATE_ON_START='true'; import('./dist/database/startup.js').then(m => m.runDatabaseStartupTasks())"
```

## Methode recommandee : terminal Dokploy

1. Ouvrir Dokploy.
2. Aller dans le projet Compose Oncarya.
3. Ouvrir le service `api`.
4. Ouvrir un terminal/shell sur le conteneur `api`.
5. Lancer :

```bash
node dist/database/seed.js
```

6. Verifier que la commande termine sans erreur.

Le conteneur `api` a normalement `/app/server` comme repertoire courant. Si ce n'est pas le cas :

```bash
cd /app/server
node dist/database/seed.js
```

## Methode SSH sur le VPS

Si le terminal Dokploy n'est pas disponible, se connecter au VPS :

```bash
ssh user@votre-vps
```

Lister les conteneurs pour retrouver celui de l'API :

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep api
```

Puis lancer le seed dans le conteneur API :

```bash
docker exec -it NOM_DU_CONTENEUR_API sh -lc 'cd /app/server && node dist/database/seed.js'
```

Remplacer `NOM_DU_CONTENEUR_API` par le nom trouve avec `docker ps`.

## Verification rapide

Depuis le conteneur MySQL, verifier que les donnees de reference existent :

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep mysql
docker exec -it NOM_DU_CONTENEUR_MYSQL sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) AS roles FROM roles; SELECT COUNT(*) AS tags FROM tags; SELECT COUNT(*) AS pathologies FROM pathologies;"'
```

Ou plus simplement, verifier dans l'application que les tags/pathologies attendus apparaissent.

## A eviter

- Ne pas laisser `SEED_ON_START=true` en production permanente.
- Ne pas exposer MySQL publiquement pour lancer le seed.
- Ne pas lancer de commande SQL manuelle qui supprime des donnees.
- Ne pas lancer le seed depuis une image/tag different de celui deploye.

