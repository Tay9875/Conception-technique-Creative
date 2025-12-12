# Conception-technique-Creative

Projet Conception technique & Créative

## 🚀 CI/CD Pipeline

Ce projet utilise GitHub Actions pour l'intégration continue et le déploiement automatique.

### 📋 Workflows

#### CI (Pull Requests & Pushes sur main/dev)
- **`ci.yml`** - Lint du code client et server
- **`lint.yml`** - Vérifie les messages de commit (Conventional Commits)

### 🌿 Conventions de branches

| Type | Format | Exemple |
|------|--------|---------|
| Production | `main` | `main` |
| Développement | `dev` | `dev` |
| Fonctionnalité | `feat/<slug>` | `feat/user-auth` |
| Correction | `fix/<slug>` | `fix/api-timeout` |
| Documentation | `docs/<slug>` | `docs/readme-update` |
| Autre | `<type>/<slug>` | `chore/deps-upgrade` |

**Types autorisés** : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`

### 📝 Conventions de commits (Conventional Commits)

Configuration dans `.commitlintrc.js`.

**Format** : `<type>(<scope>): <subject>`

**Exemples** :
```bash
feat(auth): add OAuth callback
fix: handle null payload in API
docs: update deployment guide
ci: configure deploy workflow
```

**Types obligatoires** : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Important** : Le sujet ne doit pas commencer par une majuscule (sauf noms propres).

### 🏷️ Tags de version

Format recommandé : **`v*.*.*`** (semantic versioning)

**Exemples** :
```bash
v1.0.0
v1.2.3
```

### 🛠️ Installation locale

#### Prérequis
- Node.js 18+
- npm

#### Structure du projet

```
.
├── client/          # Frontend React (port 3000)
├── server/          # Backend Express (port 8080)
├── .github/         # Workflows GitHub Actions
└── .commitlintrc.js # Configuration commitlint
```

#### Installation

```bash
# À la racine (pour commitlint)
npm install

# Client React
cd client
npm install
npm start  # Démarre sur http://localhost:3000

# Server Express
cd server
npm install
node src/index.js  # Démarre sur http://localhost:8080
```

#### Scripts disponibles

**Client** :
```bash
npm start   # Mode développement
npm build   # Build production
npm test    # Tests React
```

**Server** :
```bash
node src/index.js  # Démarre le serveur Express
```

### 📚 Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Render Deployment](https://render.com/docs/deploy-hooks)
- [Vitest Documentation](https://vitest.dev/)
