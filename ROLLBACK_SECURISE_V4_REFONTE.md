# 🛡️ PLAN DE ROLLBACK SÉCURISÉ - MODULE GROUPES V4

**Date :** 2025-11-03
**Urgence :** Immédiate si nécessaire
**Durée Rollback :** 5-10 minutes
**Risque :** Très faible (retour à code stable précédent)

---

## 🎯 QUAND UTILISER CE PLAN

Activer le rollback **SEULEMENT SI** :

- [ ] V4 affiche message d'erreur bloquant ("Module verrouillé")
- [ ] Génération ne produit aucun résultat
- [ ] Console navigateur pleine d'erreurs rouges (même après reload)
- [ ] Utilisateurs ne peuvent pas créer de groupes
- [ ] Plus de 30 minutes de dysfonctionnement après déploiement

**NE PAS utiliser pour :**
- Simples warnings console
- Temps de chargement lent
- Fonctionnalités mineures cassées
- Tests en développement

---

## ⚙️ PROCÉDURE ROLLBACK ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Diagnostiquer l'Erreur (2 min)

```javascript
// Dans console navigateur (F12)
console.log('Diagnostic rollback:');
console.log('1. GROUPS_MODULE_V4_DATA:', typeof window.GROUPS_MODULE_V4_DATA);
console.log('2. TriptychGroupsModule:', typeof window.TriptychGroupsModule);
console.log('3. GroupsAlgorithmV4:', typeof window.GroupsAlgorithmV4);
console.log('4. openModuleGroupsV4:', typeof window.openModuleGroupsV4);

// Noter les résultats pour rapport support
```

**Résultat attendu avant rollback :**
```
❌ Erreur visible
❌ Console messages d'erreur
❌ Module V4 non fonctionnel
```

### ÉTAPE 2 : Préparer le Rollback (1 min)

1. **Ouvrir le projet Apps Script**
2. **Localiser fichier :** InterfaceV2.html
3. **Chercher section :** "BUNDLES SERVEUR POUR MODULE GROUPES V4" (ligne ~1461)

### ÉTAPE 3 : Désactiver les Bundles V4 (2 min)

**Avant (COURANT):**
```html
<!-- ========== BUNDLES SERVEUR POUR MODULE GROUPES V4 ========== -->
<!-- Inclusion de la logique triptyque V4 -->
<script>
<?!= include('InterfaceV4_Triptyque_Logic'); ?>
</script>

<!-- Inclusion de l'algorithme de distribution V4 -->
<script>
<?!= include('GroupsAlgorithmV4_Distribution'); ?>
</script>

<!-- Inclusion du loader du module V4 -->
<script>
<?!= include('InterfaceV2_GroupsModuleV4_Script'); ?>
</script>

<!-- Exposition globale de GROUPS_MODULE_V4_DATA -->
<script>
// ... injection code ...
</script>
```

**Après (ROLLBACK):**
```html
<!-- ========== BUNDLES SERVEUR POUR MODULE GROUPES V4 - DÉSACTIVÉ (ROLLBACK) ========== -->
<!--
❌ V4 DÉSACTIVÉ - Retour à GroupsModuleComplete

Raison: [Indiquer la raison du rollback]
Date: [Date du rollback]
Status: [Temporary/Permanent]

À réactiver après fix: [Décrire ce qui doit être corrigé]
-->
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

<script>
// ... injection code ...
</script>
-->
```

**Comment faire :**

```
1. Chercher ligne contenant: <!-- ========== BUNDLES SERVEUR POUR MODULE GROUPES V4 ========== -->

2. Ajouter avant cette ligne:
   <!-- ========== BUNDLES SERVEUR POUR MODULE GROUPES V4 - DÉSACTIVÉ (ROLLBACK) ========== -->
   <!--
   ❌ V4 DÉSACTIVÉ
   Raison: [Écrire raison ici]
   Date: [Date rollback]
   -->

3. Mettre en commentaire TOUTES les lignes entre <!-- BUNDLES SERVEUR... --> et avant <!-- ========== EXPOSITION GLOBALE ========== -->

   Syntaxe: Remplacer <script> par <!-- <script> et </script> par </script> -->

4. Vérifier que la section d'exposition GROUPS_MODULE_V4_DATA est aussi commentée
```

### ÉTAPE 4 : Redéployer (3 min)

```bash
# Terminal/Console

# 1. Sauvegarder le changement
# (Ctrl+S dans Apps Script Editor)

# 2. Pousser le changement vers repos
clasp push

# 3. Déployer nouvelle version
clasp deploy --description "Rollback V4 - Retour à GroupsModuleComplete"

# 4. Copier l'URL de déploiement affichée
```

### ÉTAPE 5 : Nettoyer le Cache (2 min)

```javascript
// Dans console navigateur
// Forcer le vidage du cache
const cacheKey = 'groups_v4_cache';
localStorage.removeItem(cacheKey);
sessionStorage.removeItem(cacheKey);

// Rechargement complet
location.href = location.href;
```

**Ou manuellement :**
- F12 → Network → Vider le cache ☑️
- Ctrl+Shift+R (hard refresh)
- Attendre 10-15 secondes

### ÉTAPE 6 : Vérifier le Rollback (1 min)

```javascript
// Dans console navigateur, après rechargement

// DOIT afficher
console.log('V4 status:', typeof window.openModuleGroupsV4); // ❌ undefined (V4 disabled)
console.log('Fallback status:', typeof window.GroupsModuleComplete); // ✅ function

// Essayer ouvrir l'interface
// DOIT afficher GroupsModuleComplete au lieu de V4 Triptyque
```

**Résultat attendu :**
- ✅ Interface "Groupes" cliquable
- ✅ Interface GroupsModuleComplete s'ouvre (design ancien)
- ✅ Aucune erreur console
- ✅ Les groupes peuvent être créés normalement

### ÉTAPE 7 : Confirmer le Succès (1 min)

```javascript
// Créer un test rapide
// 1. Cliquer sur "Créer Groupes"
// 2. Vérifier que l'interface ANCIENNE s'ouvre
// 3. Créer au moins 1 regroupement
// 4. Générer les groupes
// 5. Vérifier que ça fonctionne
```

---

## 🔄 SI ROLLBACK ÉCHOUE

### Problème : Interface toujours en erreur après rollback

**Causes possibles :**
1. Cache navigateur pas vidé
2. Les commentaires HTML mal fermés
3. Erreur de syntaxe en supprimant les bundles

**Solutions :**

```bash
# Solution 1 : Vider le cache côté serveur
# Dans Apps Script, exécuter:
PropertiesService.getUserProperties().deleteAllProperties();

# Solution 2 : Hard refresh sur tous les clients
# Redéployer avec version string différente:
clasp deploy --description "Rollback V4 - Cache buster $(date)"

# Solution 3 : Vérifier les commentaires HTML
# Chercher dans InterfaceV2.html:
# - Chaque <!-- DOIT avoir un -->
# - Pas de </script> orphelines
# - Pas de <script> non fermée
```

### Problème : GroupsModuleComplete affiche erreur

**Cause :** GroupsModuleComplete aussi affecté par les changements

**Solution :**
```bash
# Vérifier que les autres inclusions ne sont pas affectées:
# Dans InterfaceV2.html ligne ~1457:
<?!= include('groupsModuleComplete'); ?>
<?!= include('InterfaceV2_GroupsScript'); ?>

# Ces deux DOIVENT NOT être commentées

# Si c'est le cas, les dé-commenter et redéployer
```

---

## 📊 STATUTS DE ROLLBACK

### ROLLBACK RÉUSSI ✅

**Signes à vérifier :**
- [ ] Interface "Groupes" charge sans erreur
- [ ] GroupsModuleComplete s'ouvre (ancien design)
- [ ] Bouton "Créer Groupes" fonctionnel
- [ ] Au moins 1 génération de groupes réussie
- [ ] Aucune erreur rouge en console

**Prochaines étapes :**
1. Documenter ce qui a échoué avec V4
2. Contacter support technique avec logs
3. Planner une amélioration du fix
4. Ne pas redéployer V4 sans nouvelle validation

### ROLLBACK PARTIELLEMENT RÉUSSI ⚠️

**Symptômes :**
- Interface s'ouvre mais avec bugs mineurs
- Génération lente mais fonctionnelle
- Quelques warnings (pas d'erreurs)

**Actions :**
1. Utiliser quand même (solution provisoire)
2. Augmenter les efforts de test
3. Contacter support avec détails des bugs
4. Planner une amélioration rapide

### ROLLBACK ÉCHOUÉ ❌

**Symptômes :**
- Interface toujours en erreur
- Même avec GroupsModuleComplete
- Pas de création de groupes possible

**Actions d'URGENCE :**

```bash
# 1. Restaurer version précédente connue fonctionnelle
clasp versions

# 2. Voir historique des déploiements
# Si possible: clasp deploy --description "Emergency restore"

# 3. Contacter admin d'urgence
# Problème sérieux au niveau Apps Script

# 4. En attendant: Diriger utilisateurs vers
#    backup alternative si existe
```

---

## 📋 CHECKLIST ROLLBACK

### Avant rollback
- [ ] Diagnostic effectué (ÉTAPE 1)
- [ ] Raison du rollback documentée
- [ ] Personne responsable désignée
- [ ] Backup des logs d'erreur sauvegardé

### Pendant rollback
- [ ] InterfaceV2.html modifié correctement
- [ ] `clasp push` réussi
- [ ] `clasp deploy` réussi
- [ ] Cache navigateur vidé
- [ ] Attendre 2-3 min

### Après rollback
- [ ] Interface Groupes accessible
- [ ] GroupsModuleComplete charge
- [ ] Au moins 1 test génération fait
- [ ] Console vérifiée (pas d'erreur rouge)
- [ ] Utilisateurs notifiés

---

## 🔐 SÉCURITÉ ROLLBACK

### Données conservées ✅
- Toutes les données utilisateur dans spreadsheet
- Cache brouillons GROUPS_MODULE_V4
- Sauvegardes précédentes
- Historique des générations

### Données perdues ❌
- Aucune donnée sensible
- Rollback n'affecte que le frontend
- Backend (Code.gs) non modifié

### À documenter
- Raison du rollback
- Heure exacte du rollback
- Qui a approuvé
- Logs d'erreur reproduits

---

## 📞 ESCALADE SUPPORT

**Si rollback n'élimine pas l'erreur :**

Contacter avec :

```markdown
## Rapport Rollback Échoué

**Date:** [Date/heure rollback]
**Raison initiale:** [Décrire erreur V4]
**Status rollback:** [✅/⚠️/❌]

**Détails:**
- Console logs: [Coller logs d'erreur]
- Étapes reproduisées: [1, 2, 3...]
- Navigateur: [Chrome/Firefox/Safari]
- URL déploiement: [URL affectée]

**Impact utilisateurs:** [Nombre utilisateurs touchés]

**Actions déjà tentées:**
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Vider cache localStorage
- [ ] Redéployer
- [ ] Attendre 5 min
```

---

## 🎯 TIMELINE DE RÉFÉRENCE

| Étape | Durée | Cumulatif |
|-------|-------|-----------|
| 1. Diagnostic | 2 min | 2 min |
| 2. Préparation | 1 min | 3 min |
| 3. Désactivation bundles | 2 min | 5 min |
| 4. Redéploiement | 3 min | 8 min |
| 5. Nettoyage cache | 2 min | 10 min |
| 6. Vérification | 1 min | 11 min |
| 7. Test complet | 5 min | 16 min |
| **TOTAL** | | **~15 min** |

---

## 💾 RÉACTIVATION FUTURE

**Si V4 doit être réactivé après un rollback :**

1. **Identifier la cause** du rollback original
2. **Corriger** le code V4 concerné
3. **Tester en développement** avant redéploiement
4. **Documenter** les changements apportés
5. **Redéployer** en étapes (dev → test → prod)
6. **Valider** selon VALIDATION_ET_TEST_CORRECTIONS_V4.md

---

## 📝 NOTES IMPORTANTES

1. **Ce plan n'affecte PAS les données** - Juste rollback le frontend V4
2. **GroupsModuleComplete est stable** - Retour à code éprouvé
3. **Pas besoin de redémarrage** - Simple push + deploy
4. **Support disponible 24h** si problème persiste

---

**Créé par :** Claude Code
**Date :** 2025-11-03
**Statut :** 🛡️ Prêt pour activation
**Version :** 1.0
