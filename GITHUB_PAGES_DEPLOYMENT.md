# Guide de Déploiement GitHub Pages

## ✅ Configuration Terminée

Les fichiers suivants ont été configurés et pushés :
- ✅ `vite.config.js` - Base path configuré pour `/CEL-U13/`
- ✅ `.github/workflows/deploy.yml` - Workflow de déploiement automatique

## 🔧 Étape Finale : Activer GitHub Pages

Vous devez maintenant activer GitHub Pages dans les settings de votre repository :

### Instructions

1. **Allez sur GitHub** : https://github.com/lopezdav-code/CEL-U13/settings/pages

2. **Configurez la source** :
   - Dans la section **"Build and deployment"**
   - Sous **"Source"**, sélectionnez **"GitHub Actions"**
   
   ![Configuration GitHub Pages](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/publishing-source-drop-down.webp)

3. **Sauvegardez** (si nécessaire)

4. **Attendez le déploiement** :
   - Le workflow GitHub Actions va se lancer automatiquement
   - Allez sur https://github.com/lopezdav-code/CEL-U13/actions pour voir le progrès
   - Le déploiement prend environ 2-3 minutes

5. **Vérifiez votre site** :
   - Une fois le workflow terminé, visitez : **https://lopezdav-code.github.io/CEL-U13/**
   - Le site devrait maintenant charger sans erreur 404 !

## 📊 Vérifier le Workflow

Pour voir si le déploiement fonctionne :

1. Allez sur https://github.com/lopezdav-code/CEL-U13/actions
2. Vous devriez voir un workflow "Deploy to GitHub Pages" en cours ou terminé
3. Cliquez dessus pour voir les détails

## 🔄 Déploiements Futurs

À partir de maintenant, **chaque push sur la branche `main`** déclenchera automatiquement :
1. Build du projet avec Vite
2. Déploiement sur GitHub Pages
3. Mise à jour du site en ligne

## 🐛 Dépannage

### Le site affiche toujours 404
- Vérifiez que GitHub Pages est configuré sur "GitHub Actions" dans les settings
- Attendez que le workflow se termine (vérifiez dans Actions)
- Videz le cache de votre navigateur (Ctrl+F5)

### Le workflow échoue
- Vérifiez les logs dans https://github.com/lopezdav-code/CEL-U13/actions
- Assurez-vous que les permissions sont correctes dans Settings → Actions → General

### Les assets ne chargent pas
- Le `base: '/CEL-U13/'` dans `vite.config.js` est crucial
- Vérifiez qu'il correspond exactement au nom de votre repository

## 🎉 C'est Tout !

Une fois GitHub Pages activé, votre site sera accessible à :
**https://lopezdav-code.github.io/CEL-U13/**
