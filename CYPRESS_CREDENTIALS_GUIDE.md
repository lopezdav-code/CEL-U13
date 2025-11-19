# Guide de Configuration des Identifiants Cypress

Ce document explique comment configurer vos identifiants de test pour Cypress en local et sur GitHub Actions.

## 📋 Configuration Locale

### 1. Modifier le fichier `cypress.env.json`

Le fichier `cypress.env.json` a été créé avec des valeurs par défaut. **Vous devez le modifier avec vos vrais identifiants de test** :

```json
{
  "TEST_EMAIL": "votre-email-de-test@example.com",
  "TEST_PASSWORD": "votre-mot-de-passe-de-test"
}
```

> ⚠️ **Important** : Ce fichier est dans `.gitignore` et ne sera jamais commité. Vos credentials restent sur votre machine.

### 2. Tester localement

Lancez Cypress pour vérifier que tout fonctionne :

```bash
# Mode interactif
npm run cypress

# Mode headless
npm run cypress:headless

# Avec serveur de dev
npm run test:e2e
```

---

## 🔐 Configuration GitHub Actions

### 1. Ajouter les Secrets dans GitHub

1. Allez sur votre repository GitHub : https://github.com/lopezdav-code/CEL-U13
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**
5. Ajoutez le premier secret :
   - **Name** : `CYPRESS_TEST_EMAIL`
   - **Secret** : votre email de test
   - Cliquez sur **Add secret**
6. Ajoutez le deuxième secret :
   - **Name** : `CYPRESS_TEST_PASSWORD`
   - **Secret** : votre mot de passe de test
   - Cliquez sur **Add secret**

### 2. Vérification

Une fois les secrets ajoutés, le workflow GitHub Actions utilisera automatiquement ces credentials lors des tests.

Le prochain push vers `main` déclenchera les tests avec authentification.

---

## 📝 Fichiers Modifiés

### Fichiers de Configuration

- ✅ **cypress.env.json** : Credentials locaux (non versionné)
- ✅ **cypress.env.json.example** : Template pour documenter les variables
- ✅ **.gitignore** : Exclut cypress.env.json et autres fichiers sensibles

### Fichiers de Test

- ✅ **cypress/support/commands.js** : Commande `cy.login()` utilise les env vars
- ✅ **cypress/e2e/app.cy.js** : Tests avec authentification
- ✅ **.github/workflows/cypress.yml** : Workflow injecte les secrets GitHub

---

## 🧪 Tests Disponibles

Les tests suivants sont maintenant disponibles :

1. **Homepage load** : Vérifie que la page charge
2. **Login page display** : Vérifie les éléments du formulaire
3. **Empty form validation** : Teste la validation du formulaire
4. **Login with credentials** ⭐ : Teste la connexion avec vos credentials
5. **Navigation after login** ⭐ : Teste la navigation après connexion

> Les tests marqués ⭐ utilisent les credentials configurés et seront skippés si les credentials ne sont pas définis.

---

## ⚡ Prochaines Étapes

1. **Modifier `cypress.env.json`** avec vos vrais credentials de test
2. **Tester localement** avec `npm run cypress`
3. **Ajouter les secrets GitHub** comme décrit ci-dessus
4. **Faire un push** pour déclencher les tests sur GitHub Actions

---

## 🔍 Dépannage

### Les tests sont skippés localement
→ Vérifiez que `cypress.env.json` contient les bonnes valeurs

### Les tests échouent sur GitHub Actions
→ Vérifiez que les secrets `CYPRESS_TEST_EMAIL` et `CYPRESS_TEST_PASSWORD` sont bien configurés dans GitHub

### Erreur "credentials not configured"
→ Les credentials ne sont pas définis ou mal nommés. Vérifiez les noms des variables.
