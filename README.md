# Portail Institutionnel MERRIVE

Portail web pour les organismes de régulation et de suivi des œuvres d'art et droits d'auteur dans l'écosystème MERRIVE.

## 🎯 Objectif

Ce portail permet aux organismes institutionnels (agences de régulation, organismes de suivi) de :

- **Visualiser** les métriques et données précises sur les services de la plateforme
- **Rechercher** et filtrer les prestations par catégorie, prestataire, année, etc.
- **Consulter** les médias attachés aux services (images, PDF, créations, etc.)
- **Analyser** les statistiques et tendances de l'écosystème MERRIVE

## 🚀 Technologies

- **Framework** : Next.js 15 avec App Router
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : Headless UI + Lucide React
- **Charts** : Recharts
- **Forms** : React Hook Form + Zod
- **HTTP Client** : Axios
- **State Management** : React Context API

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js
│   ├── (protected)/       # Pages protégées par authentification
│   │   ├── dashboard/     # Tableau de bord
│   │   ├── search/        # Recherche avancée
│   │   └── layout.tsx     # Layout pour pages protégées
│   ├── login/             # Page de connexion
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── layout/           # Composants de layout
│       └── Navigation.tsx
├── contexts/             # Contextes React
│   └── AuthContext.tsx   # Gestion de l'authentification
├── services/             # Services API
│   └── api.ts           # Service principal pour l'API
├── types/               # Types TypeScript
│   └── index.ts         # Interfaces et types
└── lib/                 # Utilitaires
    └── utils.ts         # Fonctions utilitaires
```

## 🔐 Authentification

Le portail utilise un système d'authentification JWT pour les utilisateurs institutionnels :

- **Endpoint de connexion** : `/auth/institutional/login`
- **Gestion des tokens** : Stockage local avec refresh automatique
- **Protection des routes** : Layout protégé pour les pages sensibles
- **Déconnexion automatique** : En cas d'expiration du token

## 📊 Fonctionnalités Principales

### 1. Tableau de Bord
- **Statistiques globales** : Total services, revenus, prestataires
- **Graphiques interactifs** : Évolution mensuelle, répartition par catégorie
- **Métriques en temps réel** : Données actualisées depuis l'API

### 2. Recherche Avancée
- **Recherche par mot-clé** : Titre, description des services
- **Filtres multiples** :
  - Catégorie de service
  - Prestataire
  - Statut (actif, terminé, annulé)
  - Année de création
  - Fourchette de prix
- **Résultats paginés** avec actions rapides

### 3. Consultation des Médias
- **Visualisation** des fichiers attachés aux services
- **Support multi-format** : Images, PDF, vidéos, documents
- **Téléchargement** des médias pour analyse

## 🔌 API Integration

Le portail communique avec l'API MERRIVE v2 via les endpoints suivants :

### Authentification
- `POST /auth/institutional/login` - Connexion utilisateur institutionnel
- `GET /auth/me` - Récupération du profil utilisateur
- `POST /auth/logout` - Déconnexion

### Services
- `GET /services` - Liste des services avec filtres
- `GET /services/{id}` - Détails d'un service
- `GET /services/search` - Recherche de services
- `GET /services/provider/{id}` - Services par prestataire
- `GET /services/year/{year}` - Services par année
- `GET /services/category/{category}` - Services par catégorie

### Prestataires
- `GET /providers` - Liste des prestataires
- `GET /providers/{id}` - Détails d'un prestataire

### Dashboard
- `GET /dashboard/stats` - Statistiques du tableau de bord

### Médias
- `GET /services/{id}/media` - Médias d'un service

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le projet
cd merrive/v2/front/institutional-portal

# Installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env.local
# Configurer NEXT_PUBLIC_API_URL dans .env.local
```

### Démarrage
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env.local` :

```env
# URL de l'API MERRIVE
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Configuration Next.js
NEXT_PUBLIC_APP_NAME=Portail Institutionnel MERRIVE
```

### Configuration API

L'API doit être configurée pour supporter :

1. **Authentification institutionnelle** :
   - Endpoint `/auth/institutional/login`
   - Gestion des rôles `institutional`

2. **Gestion des médias** :
   - Association des services avec 0+ médias
   - Endpoints de consultation et téléchargement

3. **Statistiques avancées** :
   - Endpoint `/dashboard/stats` avec métriques complètes
   - Filtrage par période et catégorie

## 🎨 Design System

Le portail utilise un design system cohérent :

- **Couleurs** : Palette bleue professionnelle
- **Typographie** : Inter pour une lisibilité optimale
- **Composants** : Design moderne avec animations subtiles
- **Responsive** : Adaptation mobile et desktop

## 🔒 Sécurité

- **Authentification JWT** avec refresh automatique
- **Protection CSRF** via headers appropriés
- **Validation des données** côté client et serveur
- **Gestion des erreurs** sécurisée
- **Logs d'audit** pour les actions sensibles

## 📈 Évolutions Futures

### Phase 2
- [ ] Export des données en CSV/Excel
- [ ] Notifications en temps réel
- [ ] Rapports personnalisés
- [ ] API GraphQL pour plus de flexibilité

### Phase 3
- [ ] Tableau de bord personnalisable
- [ ] Alertes et seuils configurables
- [ ] Intégration avec d'autres systèmes
- [ ] Analytics avancées

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet fait partie de l'écosystème MERRIVE et est soumis aux mêmes conditions de licence.

---

**Développé pour les organismes de régulation et de suivi des œuvres d'art et droits d'auteur**
