# 📱 Oncarya

## 📌 Présentation du projet
Ce projet est une application web d’entraide destinée aux patients atteints de cancer.  
Elle vise à proposer un espace non médicalisé, accessible et bienveillant, permettant le partage d’expériences et de conseils du quotidien entre patients.

L’application est librement accessible sur le web, sans obligation de création de compte pour consulter les contenus.

---

## 🏗️ Architecture générale
Le projet repose sur une architecture **Web App + API REST**, permettant de séparer l’interface utilisateur de la logique métier.

- Front-end : Application web React  
- Back-end : API REST Node.js / Express  
- Base de données : MySQL  

Cette architecture favorise la maintenabilité, l’évolutivité et la clarté du code.

---

## 🎨 Front-end
- **React** pour la création d’interfaces utilisateur dynamiques et modulaires  
- Composants réutilisables pour une meilleure maintenabilité  
- Utilisation de balises HTML sémantiques et bonnes pratiques ARIA pour l’accessibilité  

---

## ⚙️ Back-end
- **Node.js / Express** pour la création de l’API REST  
- Gestion des requêtes, des données et des règles métier  
- Communication avec la base de données MySQL  

---

## 🗄️ Base de données
- **MySQL** (bdd relationnelle)
- Stockage des données liées aux contenus, interactions et utilisateurs 
- Structure adaptée à un projet simple et évolutif  

---

## 🧩 Organisation du projet
- **Mono-repo GitHub** regroupant le front-end et le back-end  
- Gestion du versioning via Git  
- Collaboration facilitée et cohérence du projet  

---

## ☁️ Hébergement
- **Render** pour l’hébergement du front-end et du back-end
- Déploiement simple et rapide

---

## ♿ Accessibilité
Une attention particulière est portée à l’accessibilité :
- Utilisation de balises HTML sémantiques
- Interface simple et lisible
- Navigation claire et intuitive

---

## 🎯 Objectifs techniques
Les choix techniques ont été réalisés afin de :
- garantir une application simple et maintenable
- assurer une bonne expérience utilisateur
- faciliter les évolutions futures


## 🚀 CI/CD Pipeline

Ce projet utilise GitHub Actions pour l'intégration continue et le déploiement automatique.

### 📋 Workflows

#### CI (Pull Requests & Pushes sur main/dev)
- **`ci.yml`** - Lint du code client et server
- **`lint.yml`** - Vérifie les messages de commit (Conventional Commits)
- **`deploy-render.yml`** - Déploie sur Render lors d'un tag `vX.X.X`

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

## Déploiement (Render)

Le déploiement est déclenché automatiquement **uniquement** quand un tag de version est poussé (format `vX.Y.Z`, ex: `v1.2.3`) et que le commit taggé est bien présent sur la branche `main`.

### Secrets GitHub Actions requis

À configurer dans GitHub → Settings → Secrets and variables → Actions :

- `RENDER_API_KEY` : clé API Render
- `RENDER_BACKEND_SERVICE_ID` : Service ID Render du back
- `RENDER_FRONTEND_SERVICE_ID` : Service ID Render du front

Le workflow est dans `.github/workflows/deploy-render.yml`.

### Créer et pousser un tag

```bash
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
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


---

## 🧪 Tests front-end (React)

Des tests automatisés sont présents pour le front-end React dans le dossier `client/src/App.test.js`.

### Lancer les tests

Placez-vous dans le dossier `client` puis exécutez :

```bash
cd client
npm test
```

Les tests couvrent :
- L'affichage du composant principal et du formulaire de connexion
- L'accessibilité de l'application (audit via jest-axe)
- Le comportement selon la connexion/déconnexion d'un utilisateur (localStorage)

**Outils utilisés :**
- @testing-library/react
- @testing-library/jest-dom
- jest-axe (accessibilité)

---

### 📚 Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Render Deployment](https://render.com/docs/deploy-hooks)
- [Vitest Documentation](https://vitest.dev/)
