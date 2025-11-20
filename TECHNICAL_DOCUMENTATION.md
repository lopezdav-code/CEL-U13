# Documentation Technique - Application CEL U13

## 📋 Vue d'ensemble

Application de gestion d'équipe de football féminin U13 pour le CEL Pôle Féminin Côtière Est Lyonnais. Cette application permet de gérer les joueuses, les matchs, les statistiques et les photos de l'équipe.

**Stack technique** :
- **Frontend** : React + Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : Supabase (PostgreSQL)
- **Stockage** : Supabase Storage
- **Authentification** : Supabase Auth
- **Tests** : Cypress

---

## 🗄️ Structure de la base de données

### Tables principales

#### `joueuse`
Stocke les informations des joueuses de l'équipe.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `nom` | TEXT | Nom de famille |
| `prenom` | TEXT | Prénom |
| `date_de_naissance` | DATE | Date de naissance |
| `nom_parents` | TEXT | Nom des parents |
| `classe` | TEXT | Classe scolaire (CM1, CM2, 6eme, 5eme, 4eme) |
| `photo_principale` | TEXT | Chemin vers la photo dans le bucket `avatars` |
| `date_creation` | TIMESTAMP | Date de création du profil |

#### `matchs`
Stocke les informations des matchs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `date_match` | DATE | Date du match |
| `heure` | TIME | Heure du match |
| `ville` | TEXT | Ville du match |
| `stade` | TEXT | Nom du stade |
| `adversaire_id` | UUID | FK vers `foot_club` (null pour tournois/coupes) |
| `type_match` | TEXT | Type : 'championnat', 'amical', 'tournoi', 'coupe' |
| `titre` | TEXT | Titre pour tournois/coupes |
| `is_away` | BOOLEAN | Match à l'extérieur |
| `is_multi_partie` | BOOLEAN | Match avec plusieurs parties |
| `initial_partie_id` | UUID | FK vers `match_partie` |
| `commentaire` | TEXT | Commentaires sur le match |
| `photos` | TEXT[] | Tableau de chemins vers les photos |

#### `match_partie`
Stocke les parties d'un match (pour les tournois avec plusieurs matchs).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `match_id` | UUID | FK vers `matchs` |
| `adversaire_id` | UUID | FK vers `foot_club` |
| `score_equipe` | INTEGER | Score de notre équipe |
| `score_adversaire` | INTEGER | Score de l'adversaire |

#### `composition`
Stocke la composition de l'équipe pour chaque match.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `match_id` | UUID | FK vers `matchs` |
| `joueuse_id` | UUID | FK vers `joueuse` |
| `titulaire` | BOOLEAN | Joueuse titulaire |
| `gardienne` | BOOLEAN | Joueuse gardienne |

#### `buts`
Stocke les buts marqués par les joueuses.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `match_id` | UUID | FK vers `matchs` |
| `joueuse_id` | UUID | FK vers `joueuse` |
| `nombre_de_buts` | INTEGER | Nombre de buts marqués |
| `temps_creation` | TIMESTAMP | Date d'enregistrement |

#### `foot_club`
Stocke les informations des clubs adverses.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `nom` | TEXT | Nom du club |
| `stade` | TEXT | Stade principal |
| `logo` | TEXT | Chemin vers le logo dans le bucket `club_logos` |

#### `coachs`
Stocke les informations des entraîneurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `prenom` | TEXT | Prénom |
| `nom` | TEXT | Nom |
| `photo_path` | TEXT | Chemin vers la photo dans le bucket `coach_avatars` |

#### `profiles`
Stocke les profils utilisateurs (lié à Supabase Auth).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (même que auth.users) |
| `name` | TEXT | Nom complet |
| `role` | TEXT | Rôle : 'admin', 'coach', 'parent', 'player' |
| `avatar_url` | TEXT | URL de l'avatar |

### Buckets de stockage

- **`avatars`** : Photos des joueuses
- **`Match_Photo`** : Photos des matchs
- **`club_logos`** : Logos des clubs adverses
- **`coach_avatars`** : Photos des entraîneurs

---

## 📄 Pages de l'application

### Pages publiques

#### `/login` - Page de connexion
**Fichier** : `src/pages/Login.jsx`

**Fonctionnalités** :
- Formulaire de connexion (login/email + mot de passe)
- Authentification via Supabase Auth
- Redirection vers la page d'accueil après connexion

**Tables utilisées** : `profiles` (via Supabase Auth)

---

### Pages protégées (authentification requise)

#### `/` - Page d'accueil
**Fichier** : `src/pages/Accueil.jsx`

**Fonctionnalités** :
- Affichage des statistiques de l'équipe (nombre de matchs, buts)
- Liste des prochains matchs
- Affichage des entraîneurs avec leurs photos
- Carrousel de photos récentes

**Tables utilisées** :
- `matchs` - Récupération des prochains matchs
- `match_partie` - Calcul des scores
- `coachs` - Affichage des entraîneurs
- `Match_Photo` (bucket) - Photos récentes

---

#### `/joueuses` - Liste des joueuses
**Fichier** : `src/pages/ListeJoueuses.jsx`

**Fonctionnalités** :
- Affichage de toutes les joueuses avec leurs photos
- Recherche par nom
- Filtrage par classe
- Ajout/modification/suppression de joueuses
- Upload de photos de profil

**Tables utilisées** :
- `joueuse` - Liste complète des joueuses
- `avatars` (bucket) - Photos de profil

---

#### `/joueuses/:id` - Détail d'une joueuse
**Fichier** : `src/pages/DetailJoueuse.jsx`

**Fonctionnalités** :
- Affichage des informations détaillées
- Statistiques personnelles (matchs joués, buts, fois gardienne)
- Historique des matchs joués
- Modification des informations

**Tables utilisées** :
- `joueuse` - Informations de la joueuse
- `composition` - Matchs joués
- `buts` - Buts marqués
- `matchs` - Détails des matchs

---

#### `/matchs` - Liste des matchs
**Fichier** : `src/pages/ListeMatchs.jsx`

**Fonctionnalités** :
- Affichage de tous les matchs (passés et futurs)
- Filtrage par type (championnat, amical, tournoi, coupe)
- Affichage des scores et résultats
- Création de nouveaux matchs

**Tables utilisées** :
- `matchs` - Liste des matchs
- `match_partie` - Scores des parties
- `foot_club` - Informations des adversaires
- `composition` - Nombre de joueuses par match

---

#### `/matchs/creer` - Créer un match
**Fichier** : `src/pages/CreerMatch.jsx`

**Fonctionnalités** :
- Formulaire de création de match
- Sélection du type de match
- Sélection de l'adversaire (ou saisie du titre pour tournoi/coupe)
- Configuration match simple ou multi-parties

**Tables utilisées** :
- `matchs` - Création du match
- `match_partie` - Création de la partie initiale
- `foot_club` - Liste des adversaires disponibles

---

#### `/matchs/:id` - Détail d'un match
**Fichier** : `src/pages/DetailMatch.jsx`

**Fonctionnalités** :
- Affichage des informations du match
- Gestion de la composition (ajout/retrait de joueuses)
- Gestion des buts (attribution aux joueuses)
- Gestion des parties (pour matchs multi-parties)
- Upload et gestion des photos du match
- Modification des informations du match

**Tables utilisées** :
- `matchs` - Informations du match
- `match_partie` - Parties et scores
- `composition` - Composition de l'équipe
- `buts` - Buts marqués
- `joueuse` - Informations des joueuses
- `foot_club` - Informations de l'adversaire
- `Match_Photo` (bucket) - Photos du match

---

#### `/photos` - Galerie de photos
**Fichier** : `src/pages/Photos.jsx`

**Fonctionnalités** :
- Affichage de toutes les photos des matchs
- Filtrage par match
- Visualisation en plein écran
- Suppression de photos

**Tables utilisées** :
- `matchs` - Liste des matchs avec photos
- `foot_club` - Noms des adversaires
- `Match_Photo` (bucket) - Photos

---

#### `/statistiques` - Statistiques
**Fichier** : `src/pages/Statistiques.jsx`

**Fonctionnalités** :
- Statistiques globales de l'équipe
- Statistiques par joueuse (matchs, buts, moyenne)
- Filtrage par type de match
- Statistiques contre les adversaires
- Classement des buteuses

**Tables utilisées** :
- `joueuse` - Liste des joueuses
- `matchs` - Liste des matchs
- `composition` - Participation aux matchs
- `buts` - Buts marqués
- `match_partie` - Résultats des matchs
- `foot_club` - Adversaires

---

#### `/quiz` - Quiz
**Fichier** : `src/pages/Quiz.jsx`

**Fonctionnalités** :
- Quiz interactif sur les joueuses
- Questions aléatoires
- Score et résultats

**Tables utilisées** :
- `joueuse` - Données pour les questions
- `avatars` (bucket) - Photos pour les questions

---

#### `/profile` - Mon profil
**Fichier** : `src/pages/Profile.jsx`

**Fonctionnalités** :
- Affichage des informations utilisateur
- Changement de mot de passe
- Affichage du rôle

**Tables utilisées** :
- `profiles` - Informations du profil
- Supabase Auth - Gestion du mot de passe

---

### Pages d'administration (rôle admin requis)

#### `/admin-clubs` - Gestion des clubs
**Fichier** : `src/pages/AdminClubs.jsx`

**Fonctionnalités** :
- Liste de tous les clubs adverses
- Ajout/modification/suppression de clubs
- Upload de logos

**Tables utilisées** :
- `foot_club` - CRUD des clubs
- `club_logos` (bucket) - Logos

---

#### `/admin-users` - Gestion des utilisateurs
**Fichier** : `src/pages/AdminUsers.jsx`

**Fonctionnalités** :
- Liste de tous les utilisateurs
- Modification des rôles
- (Suppression non implémentée)

**Tables utilisées** :
- `profiles` - Profils utilisateurs
- Supabase Auth - Emails des utilisateurs

---

## 🔐 Authentification et autorisation

### Rôles utilisateurs

- **`admin`** : Accès complet à toutes les fonctionnalités
- **`coach`** : Accès aux fonctionnalités de gestion (joueuses, matchs, etc.)
- **`parent`** : Accès en lecture seule
- **`player`** : Accès en lecture seule

### Protection des routes

Le composant `ProtectedRoute` (`src/components/ProtectedRoute.jsx`) vérifie l'authentification avant d'afficher les pages protégées.

Les pages d'administration vérifient le rôle `admin` dans le profil utilisateur.

---

## 🛠️ Fonctions utilitaires principales

### `src/lib/storage.js`

Contient toutes les fonctions d'interaction avec Supabase :

**Joueuses** :
- `getJoueuses()` - Récupère toutes les joueuses
- `getJoueuse(id)` - Récupère une joueuse
- `createJoueuse(data, avatarFile)` - Crée une joueuse
- `updateJoueuse(id, data, avatarFile)` - Met à jour une joueuse
- `deleteJoueuse(id)` - Supprime une joueuse

**Matchs** :
- `getMatchs(filter)` - Récupère les matchs (avec filtres)
- `getMatch(id)` - Récupère un match
- `createMatch(data)` - Crée un match
- `updateMatch(id, data)` - Met à jour un match
- `deleteMatch(id)` - Supprime un match

**Composition** :
- `getCompositionForMatch(matchId)` - Récupère la composition
- `addComposition(matchId, joueuseId, titulaire, gardienne)` - Ajoute une joueuse
- `updateComposition(id, data)` - Met à jour la composition
- `removeComposition(id)` - Retire une joueuse

**Buts** :
- `getButsForMatch(matchId)` - Récupère les buts d'un match
- `addBut(matchId, joueuseId, nombreDeButs)` - Ajoute des buts
- `removeBut(id)` - Supprime des buts

**Clubs** :
- `getClubs()` - Récupère tous les clubs
- `createClub(data, logoFile)` - Crée un club
- `updateClub(id, data, logoFile)` - Met à jour un club
- `deleteClub(id)` - Supprime un club

**Statistiques** :
- `getJoueusesStats(matchType)` - Statistiques des joueuses
- `getStatsJoueuse(joueuseId)` - Statistiques d'une joueuse
- `getTeamStats()` - Statistiques de l'équipe
- `getOpponentStats()` - Statistiques contre les adversaires

**Photos** :
- `uploadMatchPhotos(matchId, files)` - Upload plusieurs photos
- `deleteMatchPhotoFromMatch(matchId, photoPath)` - Supprime une photo
- `getAllMatchPhotos()` - Récupère toutes les photos

**Utilisateurs** :
- `getUsers()` - Récupère tous les utilisateurs
- `updateUserRole(id, role)` - Met à jour le rôle

---

## 🎨 Composants UI

L'application utilise **shadcn/ui** pour les composants d'interface :

- `Button` - Boutons
- `Input` - Champs de saisie
- `Dialog` - Modales
- `Card` - Cartes
- `Table` - Tableaux
- `Select` - Sélecteurs
- `Toast` - Notifications
- `Avatar` - Avatars
- Et bien d'autres...

Tous les composants sont dans `src/components/ui/`.

---

## 🧪 Tests

### Tests Cypress

Les tests E2E sont dans `cypress/e2e/` :

- `auth.cy.js` - Tests d'authentification
- `players.cy.js` - Tests de gestion des joueuses
- `matches.cy.js` - Tests de gestion des matchs
- `features.cy.js` - Tests des fonctionnalités annexes
- `admin.cy.js` - Tests d'administration
- `profile.cy.js` - Tests de profil et changement de mot de passe

**Commandes** :
```bash
# Lancer les tests en mode headless
npm run cypress:run

# Lancer les tests en mode interactif
npm run cypress:open
```

---

## 🚀 Déploiement

L'application est déployée sur **GitHub Pages**.

**Configuration** :
- Base URL : `/CEL-U13/` (configuré dans `vite.config.js`)
- Gestion du routing SPA avec script dans `index.html`
- Workflow GitHub Actions pour le déploiement automatique

**Variables d'environnement** :
- `VITE_SUPABASE_URL` - URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY` - Clé anonyme Supabase

---

## 📝 Notes techniques

### Calcul automatique de la classe

La classe scolaire est calculée automatiquement en fonction de l'âge :
- 9 ans → CM1
- 10 ans → CM2
- 11 ans → 6ème
- 12 ans → 5ème
- 13 ans → 4ème

### Gestion des matchs multi-parties

Les matchs peuvent être :
- **Simples** : Un seul score (championnat, amical)
- **Multi-parties** : Plusieurs parties avec différents adversaires (tournois, plateaux)

### Stockage des photos

Les photos sont stockées dans Supabase Storage avec des URLs signées (valides 1 heure) pour la sécurité.

### Sanitization des noms de fichiers

Tous les noms de fichiers uploadés sont sanitizés pour éviter les problèmes :
- Suppression des accents
- Remplacement des caractères spéciaux par `_`
- Ajout d'un timestamp pour l'unicité

---

## 🔄 Flux de données typiques

### Création d'un match

1. Utilisateur remplit le formulaire (`CreerMatch.jsx`)
2. Appel à `createMatch(data)` dans `storage.js`
3. Insertion dans `matchs`
4. Création automatique d'une `match_partie` initiale
5. Redirection vers `/matchs/:id`

### Ajout d'une joueuse à la composition

1. Utilisateur sélectionne une joueuse (`DetailMatch.jsx`)
2. Appel à `addComposition(matchId, joueuseId, titulaire, gardienne)`
3. Insertion dans `composition`
4. Rafraîchissement de l'affichage

### Calcul des statistiques

1. Appel à `getJoueusesStats(matchType)`
2. Récupération de toutes les joueuses
3. Récupération des matchs (filtrés par type)
4. Jointure avec `composition` et `buts`
5. Calcul des totaux et moyennes
6. Tri par nombre de buts

---

## 📞 Support

Pour toute question technique, consulter le code source ou contacter l'équipe de développement.

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-11-20
