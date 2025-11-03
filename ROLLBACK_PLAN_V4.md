# 🔄 PLAN DE ROLLBACK - MODULE GROUPES V4

**Date :** 2025-11-03
**Version :** 1.0
**Status :** Documenté et prêt

---

## 📋 OBJECTIF

Ce document décrit la procédure pour restaurer le **GroupsModuleComplete (ancien)** en cas de problème critique avec la **V4 (triptyque)**.

---

## ⚠️ SCENARIOS DE ROLLBACK

### Scénario 1 : Erreur JavaScript en production
- Module V4 ne s'ouvre pas
- Erreur "GROUPS_MODULE_V4_DATA not found"
- Génération échoue silencieusement

### Scénario 2 : Performance dégradée
- Application lente avec V4
- Sauvegardes bloquées
- Timeouts serveur

### Scénario 3 : Données corrompues
- Regroupements mal sauvegardés
- Élèves dupliqués ou manquants
- FIN mal traitées

### Scénario 4 : Incompatibilité utilisateurs
- Utilisateurs ne trouvent pas la V4
- Interface non intuitive
- Besoin de revenir à l'ancienne UI

---

## 🚀 PROCÉDURE DE ROLLBACK (5 MIN)

### Étape 1 : Désactiver les bundles V4

**Fichier :** `InterfaceV2.html` (lignes 1461-1475)

**Avant :**
```html
<!-- ========== BUNDLES SERVEUR POUR MODULE GROUPES V4 ========== -->
<script>
<?!= include('InterfaceV4_Triptyque_Logic'); ?>
</script>
<script>
<?!= include('GroupsAlgorithmV4_Distribution'); ?>
</script>
<script>
<?!= include('InterfaceV2_GroupsModuleV4_Script'); ?>
</script>
```

**Après (commenté) :**
```html
<!-- ========== BUNDLES SERVEUR POUR MODULE GROUPES V4 (DÉSACTIVÉ) ========== -->
<!--
<script>
<?!= include('InterfaceV4_Triptyque_Logic'); ?>
</script>
<script>
<?!= include('GroupsAlgorithmV4_Distribution'); ?>
</script>
<script>
<?!= include('InterfaceV2_GroupsModuleV4_Script'); ?>
</script>
-->
```

### Étape 2 : Désactiver l'injection GROUPS_MODULE_V4_DATA

**Fichier :** `InterfaceV2.html` (lignes 1477-1571)

**Option A :** Commenter le bloc entier
```html
<!--
<!-- ========== EXPOSITION GLOBALE DE GROUPS_MODULE_V4_DATA ========== -->
<!-- Récupère et expose les données V4 depuis le serveur -->
<script>
... [tout le bloc de 94 lignes] ...
</script>

<!-- ========== INITIALISATION DU TRIPTYQUE AU DÉMARRAGE ========== -->
...
-->
```

**Option B :** Garder pour l'avenir (recommended)
```javascript
// Pas de modification - les données V4 ne seront simplement pas utilisées
```

### Étape 3 : Vérifier le fallback dans openGroupsInterface()

**Fichier :** `InterfaceV2_CoreScript.html` (lignes 7410-7437)

Le code fallback est **déjà en place** :
```javascript
function openGroupsInterface(tab = 'creator') {
  // ✅ Priorité 1 - Utiliser V4 (maintenant désactivée)
  if (typeof window.openModuleGroupsV4 === 'function') { ... }

  // Priorité 2 - Fallback vers GroupsModuleComplete (ancien)
  if (typeof window !== 'undefined' && window.GroupsModuleComplete && ...) {
    window.GroupsModuleComplete.open();
    return;
  }

  // Priorité 3 - Fallback popup
  google.script.run.getGroupsModuleUI(...);
}
```

**Quand vous désactivez la V4 :**
- `window.openModuleGroupsV4` sera undefined
- Le code saute automatiquement à `GroupsModuleComplete.open()`
- ✅ Rollback automatique !

### Étape 4 : Vider le cache V4

**Console Apps Script :**
```javascript
// Supprimer les données V4 du cache
PropertiesService.getUserProperties().deleteProperty('groups_v4_draft');
PropertiesService.getUserProperties().deleteProperty('groups_v4_final');
PropertiesService.getDocumentProperties().deleteProperty('groups_v4_draft');
PropertiesService.getDocumentProperties().deleteProperty('groups_v4_final');

console.log('✅ Cache V4 vidé');
```

**Ou via UI :**
```javascript
// Dans la console du navigateur après actualisation
google.script.run.deleteCacheData('groups_v4_draft');
google.script.run.deleteCacheData('groups_v4_final');
```

### Étape 5 : Vider cache navigateur et redéployer

```bash
# Dans l'éditeur Apps Script
clasp push

# Puis dans le navigateur
# Vider le cache (Ctrl+Maj+Suppr ou Cmd+Maj+Delete)
# Actualiser la page (Ctrl+F5 ou Cmd+Shift+R)
```

### Étape 6 : Valider le rollback

**Tests rapides :**
1. Ouvrir l'app
2. Cliquer "Créer Groupes"
3. Vérifier que `GroupsModuleComplete` s'ouvre (l'ancienne interface)
4. Tester une génération simple
5. Vérifier que les données sont sauvegardées

---

## ✅ ROLLBACK COMPLET VALIDÉ

Une fois les étapes terminées :
- ✅ Interface V4 désactivée
- ✅ GroupsModuleComplete restauré automatiquement
- ✅ Cache V4 vidé
- ✅ Données anciennes intactes
- ✅ Utilisateurs peuvent continuer normalement

---

## 🔄 ROLLBACK PARTIEL (Si vous voulez garder V4 mais corriger)

Si la V4 a des bugs et que vous voulez **la corriger sans rollback complet** :

### Option 1 : Désactiver juste le triptyque
```javascript
// Dans InterfaceV2_GroupsModuleV4_Script.js, ligne 78
// Commenter :
// this.triptyque = new windowRef.TriptychGroupsModule(trRoot);
// Fallback automatique vers GroupsModuleComplete
```

### Option 2 : Désactiver juste la génération
```javascript
// Dans InterfaceV2_GroupsModuleV4_Script.js, ligne 84-152
// Commenter l'écouteur groups:generate
// Les utilisateurs peuvent gérer les regroupements mais pas générer
```

### Option 3 : Mode debug
```javascript
// Ajouter en console :
window.V4_DEBUG_MODE = true;
// Cela va afficher tous les logs détaillés
```

---

## 📊 CHECKLIST ROLLBACK

- [ ] Commenter bundles V4 dans InterfaceV2.html
- [ ] Vider cache V4
- [ ] Vider cache navigateur
- [ ] Redéployer (clasp push)
- [ ] Tester ouverture "Créer Groupes"
- [ ] Vérifier GroupsModuleComplete visible
- [ ] Tester génération dans ancienne interface
- [ ] Valider sauvegardes fonctionnent
- [ ] Informer utilisateurs du retour à l'ancienne version

---

## ⏱️ DURÉE ESTIMÉE

- Désactiver bundles : 2 min
- Vider cache : 2 min
- Redéployer : 1 min
- Tests : 3 min
- **Total : ~8 minutes**

---

## 📞 ESCALADE

Si le rollback ne fonctionne pas :

1. **Vérifier les logs en console** :
   ```javascript
   // Erreur JavaScript ?
   console.error(error);

   // Module V4 deja chargé ?
   console.log('openModuleGroupsV4:', typeof window.openModuleGroupsV4);

   // GroupsModuleComplete disponible ?
   console.log('GroupsModuleComplete:', typeof window.GroupsModuleComplete);
   ```

2. **Force reset** :
   ```javascript
   // Supprimer COMPLÈTEMENT les données
   PropertiesService.getUserProperties().deleteAllProperties();
   PropertiesService.getDocumentProperties().deleteAllProperties();
   ```

3. **Restaurer depuis backup** :
   - Utiliser version précédente de `InterfaceV2.html` depuis contrôle source

---

## 🛡️ PRÉVENTION

**Pour éviter besoin de rollback :**

1. **Tester sur staging d'abord**
   - Environnement de test avec données réelles
   - Tests utilisateur avant production

2. **Déploiement progressif**
   - Activer V4 que pour 10% des utilisateurs
   - Monitorer erreurs
   - Augmenter progressivement

3. **Feature flags**
   - Permettre aux admins d'activer/désactiver V4
   - Sans modification de code

---

## 📝 DOCUMENTATION

**Avant de déployer en prod :** Communiquez ce plan aux utilisateurs
**Message suggéré :**
```
ℹ️ Nouvelle version du module Groupes

La V4 est déployée. Si vous trouvez des bugs, utilisateurs peuvent:
1. Reporter le bug à [support]
2. Nous reviendrons automatiquement à l'ancienne version si nécessaire

Pas d'action requise de votre part.
```

---

**Responsable :** Équipe support V4
**Dernière mise à jour :** 2025-11-03
**Status :** ✅ Prêt pour production
