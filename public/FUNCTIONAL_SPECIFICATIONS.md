# Spécifications Fonctionnelles - CEL U13

Ce document présente les fonctionnalités de l'application CEL U13 à travers des captures d'écran de l'interface.

# 1. Authentification

![Page de Connexion](/images/specs/01_login.png)

**Fonctionnalité :**
Page de connexion sécurisée permettant l'accès à l'application.

**Actions disponibles :**
*   **Champ Email** : Saisie de l'adresse email de l'utilisateur.
*   **Champ Mot de passe** : Saisie du mot de passe sécurisé.
*   **Bouton "Se connecter"** : Lance la procédure d'authentification. Si les identifiants sont corrects, l'utilisateur est redirigé vers la page d'accueil. Sinon, un message d'erreur s'affiche.

---

# 2. Tableau de Bord (Accueil)

![Page d'Accueil](/images/specs/02_accueil.png)

**Fonctionnalité :**
Vue d'ensemble de l'activité de l'équipe.

**Actions disponibles :**
*   **Carte "Prochain Match"** : Affiche le compte à rebours et les détails du prochain match. Un clic redirige vers la fiche du match.
*   **Carte "Dernier Résultat"** : Affiche le score du dernier match joué. Un clic redirige vers la fiche du match.
*   **Navigation** : Le menu latéral (ou burger menu sur mobile) permet d'accéder à toutes les sections du site.

---

# 3. Gestion des Joueuses

## Liste des Joueuses

![Liste des Joueuses](/images/specs/03_joueuses_liste.png)

**Fonctionnalité :**
Liste complète de l'effectif de la saison en cours.

**Actions disponibles :**
*   **Barre de recherche** : Permet de filtrer les joueuses par nom ou prénom en temps réel.
*   **Cartes Joueuses** : Chaque carte affiche la photo, le nom, le numéro et le poste. Un clic sur une carte ouvre la page de détail de la joueuse.

## Détail d'une Joueuse

![Détail Joueuse](/images/specs/04_joueuse_detail.png)

**Fonctionnalité :**
Fiche détaillée présentant les performances individuelles.

**Actions disponibles :**
*   **Onglet "Statistiques"** : Affiche les graphiques de performance (buts, passes, présence).
*   **Onglet "Historique"** : Liste les derniers matchs joués par la joueuse.
*   **Bouton "Retour"** : Permet de revenir à la liste des joueuses.

---

# 4. Gestion des Matchs

## Liste des Matchs

![Liste des Matchs](/images/specs/05_matchs_liste.png)

**Fonctionnalité :**
Calendrier complet des rencontres passées et futures.

**Actions disponibles :**
*   **Filtres** : Boutons pour filtrer par "Tous", "Domicile", "Extérieur" ou par compétition.
*   **Bouton "Nouveau Match"** (Admin/Coach uniquement) : Ouvre la page de création d'un match.
*   **Liste des matchs** : Chaque ligne résume un match (Date, Adversaire, Score/Heure). Un clic sur le bouton "Voir" ouvre le détail.

## Création de Match

![Création de Match](/images/specs/06_match_creation.png)

**Fonctionnalité :**
Formulaire pour programmer une nouvelle rencontre.

**Actions disponibles :**
*   **Champs du formulaire** : Date, Heure, Adversaire (liste déroulante), Lieu (Domicile/Extérieur), Type de compétition (Championnat, Coupe, Amical).
*   **Bouton "Enregistrer"** : Valide la création du match et redirige vers la liste.
*   **Bouton "Annuler"** : Annule la création et retourne à la liste.

## Détail du Match

![Détail Match](/images/specs/07_match_detail.png)

**Fonctionnalité :**
Feuille de match complète.

**Actions disponibles :**
*   **Pour un match à venir** :
    *   **Convocation** : Affichage de l'heure et du lieu de rendez-vous.
    *   **Bouton "Modifier"** (Admin) : Permet de changer les informations du match.
*   **Pour un match terminé** :
    *   **Score** : Affichage du résultat final.
    *   **Buteuses** : Liste des joueuses ayant marqué.
    *   **Composition** : Affichage de l'équipe alignée sur le terrain.

---

# 5. Vie de l'équipe

## Photos

![Photos](/images/specs/08_photos.png)

**Fonctionnalité :**
Galerie photos des événements de l'équipe.

**Actions disponibles :**
*   **Bouton "Ajouter des photos"** (Admin) : Permet d'uploader de nouvelles images.
*   **Galerie** : Affichage des photos en grille. Un clic sur une photo l'affiche en grand (lightbox).

## Statistiques

![Statistiques](/images/specs/09_statistiques.png)

**Fonctionnalité :**
Tableau de bord statistique global de l'équipe.

**Actions disponibles :**
*   **Tableaux** : Consultation des classements des meilleures buteuses et passeuses.
*   **Graphiques** : Visualisation de la répartition des résultats (Victoires, Nuls, Défaites).

## Quiz

![Quiz](/images/specs/10_quiz.png)

**Fonctionnalité :**
Module de quiz interactif pour les joueuses.

**Actions disponibles :**
*   **Réponses** : Sélection d'une réponse parmi les choix proposés (QCM).
*   **Bouton "Valider"** : Soumet la réponse et affiche la correction immédiate avec une explication.
*   **Bouton "Question suivante"** : Passe à la question suivante du quiz.

---

# 6. Administration & Profil

## Profil Utilisateur

![Profil](/images/specs/11_profile.png)

**Fonctionnalité :**
Gestion des informations personnelles.

**Actions disponibles :**
*   **Formulaire** : Modification du nom, prénom, ou photo de profil.
*   **Bouton "Sauvegarder"** : Enregistre les modifications.

## Administration des Clubs

![Admin Clubs](/images/specs/12_admin_clubs.png)

**Fonctionnalité :**
Gestion de la base de données des clubs adverses.

**Actions disponibles :**
*   **Bouton "Ajouter un club"** : Ouvre une modale pour créer un nouveau club.
*   **Liste des clubs** : Affichage des clubs existants avec leur logo.
*   **Actions (Modifier/Supprimer)** : Boutons pour éditer ou retirer un club de la base.

## Administration des Utilisateurs

![Admin Users](/images/specs/13_admin_users.png)

**Fonctionnalité :**
Gestion des accès et des rôles utilisateurs.

**Actions disponibles :**
*   **Tableau des utilisateurs** : Liste tous les inscrits avec leur email et rôle actuel.
*   **Sélecteur de Rôle** : Permet de changer le rôle d'un utilisateur (Admin, Coach, Joueuse, Parent, Visiteur).
*   **Switch "Actif"** : Permet d'activer ou désactiver un compte.

## Documentation

![Admin Docs](/images/specs/14_admin_docs.png)

**Fonctionnalité :**
Accès aux ressources documentaires.

**Actions disponibles :**
*   **Barre de recherche** : Permet de trouver un sujet spécifique dans la documentation.
*   **Bouton "Télécharger"** : Permet de récupérer la documentation au format Markdown.
