# 📋 PLAN D'EXÉCUTION COMPLET - ÉTAPES 2 À 14
**Module Groupes V4 - Remise en État Complète**

---

## ✅ ÉTAPE 1 COMPLÉTÉE
**Status :** ✅ FAIT - Voir `ETAPE_1_VALIDATION.md`

Résumé :
- Bundles serveurs inclus dans `InterfaceV2.html`
- `getGroupsModuleV4Data()` créée et exposée globalement
- `GROUPS_MODULE_V4_DATA` disponible au chargement

---

## 📌 ÉTAPE 2 : SUPPRIMER LES ANCIENNES MODALES PHASE 3

### Objectif
Retirer les modales successives (`Nouvelle association`, `panneaux successifs`) et afficher uniquement le triptyque

### Actions
1. **Localiser les modales** dans `InterfaceV2_GroupsScript.html` ou `groupsModuleComplete.html`
   - Chercher : `.modal-overlay`, `.phases-column`, anciennes classes CSS Phase 3

2. **Identifier les boutons de déclenchement**
   - Chercher : `openNewAssociationModal()`, `openPhaseModal()`, etc.
   - Remplacer par `openModuleGroupsV4()`

3. **Masquer les anciens contrôles**
   ```javascript
   // Dans InterfaceV2_GroupsScript ou équivalent
   const oldButtons = document.querySelectorAll('[data-old-groups-ui]');
   oldButtons.forEach(btn => btn.style.display = 'none');
   ```

4. **Brancher le bouton "Créer Groupes" sur V4**
   ```javascript
   document.getElementById('btnCreateGroups')?.addEventListener('click', function() {
     openModuleGroupsV4(); // ou getModuleGroupsV4().open()
   });
   ```

### Validation
- [ ] Les anciennes modales ne s'ouvrent plus
- [ ] Le bouton "Créer Groupes" ouvre le triptyque V4
- [ ] Pas de console errors

---

## 📌 ÉTAPE 3 : RECONNECTER LA GÉNÉRATION

### Objectif
Ajouter un écouteur sur `groups:generate` qui invoque `GroupsAlgorithmV4_Distribution.generate()`

### Actions dans `InterfaceV2_GroupsModuleV4_Script.js` (lignes 81-125)

**Code existant à vérifier :**
```javascript
trRoot.addEventListener('groups:generate', (event) => {
  console.log('🚀 Event groups:generate reçu avec payload:', event.detail);

  if (typeof windowRef.GroupsAlgorithmV4 === 'undefined') {
    console.error('❌ GroupsAlgorithmV4 non disponible');
    return;
  }

  try {
    const algorithm = new windowRef.GroupsAlgorithmV4();
    const result = algorithm.generateGroups(event.detail);

    if (result.success) {
      windowRef.dispatchEvent(new CustomEvent('groups:generated', { detail: result }));
    }
  } catch (error) {
    console.error('❌ Exception génération:', error);
  }
});
```

### Tests
- [ ] Ouvrir le triptyque
- [ ] Cliquer "Générer"
- [ ] Vérifier console : `groups:generate` déclenché
- [ ] Vérifier : `groups:generated` retourné avec resultats

---

## 📌 ÉTAPE 4 : NORMALISER LES ÉLÈVES

### Objectif
Assurer que chaque élève possède `id`, `nom`, `prenom`, `classe` avant d'entrer dans l'algorithme

### Actions dans `Code.js` → `getGroupsModuleV4Data()`

**Normalisation actuellement à la ligne 1332-1344 :**
```javascript
elevesByClass[className] = (classGroup.eleves || []).map(function(eleve) {
  return {
    id: eleve.id || `${className}-${eleve.prenom}-${eleve.nom}`.replace(/\s+/g, '-'),
    nom: eleve.nom || '',
    prenom: eleve.prenom || '',
    classe: className,
    lv2: eleve.lv2 || '',
    option: eleve.option || '',
    sexe: eleve.sexe || '',
    besoin: eleve.besoin || '',
    profil: eleve.profil || ''
  };
});
```

### Validation supplémentaire (à ajouter si nécessaire)
```javascript
// Valider après normalisation
const validateStudent = (student) => {
  if (!student.id) throw new Error('Élève sans ID');
  if (!student.nom) throw new Error('Élève sans NOM');
  if (!student.prenom) throw new Error('Élève sans PRÉNOM');
  if (!student.classe) throw new Error('Élève sans CLASSE');
  return true;
};
```

### Tests
- [ ] Appeler `getGroupsModuleV4Data()`
- [ ] Vérifier chaque élève a les 4 champs obligatoires
- [ ] Aucun `undefined` dans les données

---

## 📌 ÉTAPE 5 : INITIALISER LE TRIPTYQUE

### Objectif
Lors du `DOMContentLoaded`, appeler `TriptychGroupsModule.init(GROUPS_MODULE_V4_DATA)` et synchroniser les panneaux

### Actions

1. **Dans `InterfaceV2.html`, ajouter après exposition GROUPS_MODULE_V4_DATA :**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOMContentLoaded: Initialiser le triptyque');

  // Attendre que GROUPS_MODULE_V4_DATA soit prête
  const checkData = setInterval(function() {
    if (window.GROUPS_MODULE_V4_DATA && window.GROUPS_MODULE_V4_DATA.classes?.length > 0) {
      clearInterval(checkData);

      console.log('✅ GROUPS_MODULE_V4_DATA disponible, classes:', window.GROUPS_MODULE_V4_DATA.classes.length);

      // Le triptyque s'auto-initialise dans son constructeur
      // mais on peut déclencher un événement pour être sûr
      document.dispatchEvent(new CustomEvent('app:ready', { detail: window.GROUPS_MODULE_V4_DATA }));
    }
  }, 100);

  // Timeout: si données pas là après 5s, erreur
  setTimeout(function() {
    clearInterval(checkData);
    if (!window.GROUPS_MODULE_V4_DATA) {
      console.error('❌ GROUPS_MODULE_V4_DATA toujours pas disponible après 5s');
    }
  }, 5000);
});
```

2. **Vérifier que TriptychGroupsModule s'initialise tout seul :**
```javascript
// Dans InterfaceV4_Triptyque_Logic.js, le constructeur doit appeler:
class TriptychGroupsModule {
  constructor(rootElement) {
    this.root = rootElement;
    // ✅ Charger les classes au démarrage
    this.state.availableClasses = this.loadClasses();
  }

  loadClasses() {
    // Voir ÉTAPE 5 de la spec
  }
}
```

### Tests
- [ ] Ouvrir l'interface V4
- [ ] Triptyque visible et chargé
- [ ] Console : pas d'erreur "Données manquantes"
- [ ] Les trois panneaux sont visibles et synchronisés

---

## 📌 ÉTAPE 6 : CORRIGER LA DÉPENDANCE GLOBALE

### Objectif
Remplacer la IIFE basée sur `global` par `globalThis` pour compatibilité Apps Script

### Status
✅ DÉJÀ FAIT dans les bundles V4 :
- `GroupsAlgorithmV4_Distribution.js` (ligne 16-20)
- `InterfaceV4_Triptyque_Logic.js` (ligne 11-17)
- `InterfaceV2_GroupsModuleV4_Script.js` (ligne 15-21)

### Vérification
```bash
grep -n "typeof globalThis" GroupsAlgorithmV4_Distribution.js InterfaceV4_Triptyque_Logic.js InterfaceV2_GroupsModuleV4_Script.js
```

Résultat attendu : Tous les fichiers doivent utiliser `globalThis`

---

## 📌 ÉTAPE 7 : BRANCHER LES SAUVEGARDES

### Objectif
Connecter `saveCacheData`, `saveWithProgressINT` et `saveProgressManager` aux événements triptyque

### Actions dans le triptyque ou loader V4

1. **Écouter l'événement `groups:save-draft` :**
```javascript
document.addEventListener('groups:save-draft', function(event) {
  const regroupements = event.detail;
  google.script.run.saveCacheData('groups_v4_draft', JSON.stringify(regroupements));
});
```

2. **Écouter l'événement `groups:save-final` :**
```javascript
document.addEventListener('groups:save-final', function(event) {
  const regroupements = event.detail;
  google.script.run.saveWithProgressINT('groups_v4_final', regroupements);
});
```

3. **Ajouter dans `InterfaceV2_GroupsModuleV4_Script.js` après création du triptyque :**
```javascript
if (this.triptyque && trRoot) {
  // Événement sauvegarde brouillon
  trRoot.addEventListener('groups:save-draft', (event) => {
    if (typeof google !== 'undefined' && google.script?.run?.saveCacheData) {
      google.script.run.saveCacheData('groups_v4_draft', JSON.stringify(event.detail));
      console.log('✅ Brouillon sauvegardé');
    }
  });

  // Événement sauvegarde finale
  trRoot.addEventListener('groups:save-final', (event) => {
    if (typeof google !== 'undefined' && google.script?.run?.saveWithProgressINT) {
      google.script.run.saveWithProgressINT('groups_v4_final', event.detail);
      console.log('✅ Données finales sauvegardées');
    }
  });
}
```

### Tests
- [ ] Cliquer "Enregistrer brouillon" dans triptyque
- [ ] Vérifier appel serveur en console (`google.script.run`)
- [ ] Vérifier données stockées dans cache

---

## 📌 ÉTAPE 8 : VALIDER LA DÉTECTION FIN

### Objectif
Confirmer que les classes suffixées FIN apparaissent dans la liste des regroupements et que leurs élèves sont pris en compte

### Actions

1. **Mettre à jour `getGroupsModuleV4Data()` pour détecter FIN :**
```javascript
// Dans Code.js, ligne 1322+
elevesData.forEach(function(classGroup) {
  const className = classGroup.classe || '';
  const isFIN = className.endsWith('FIN');

  if (className && className.trim()) {
    classes.push({
      id: className,
      label: className,
      studentCount: classGroup.eleves.length || 0,
      isFIN: isFIN // ← Ajouter cet indicateur
    });
    // ...
  }
});
```

2. **Dans le triptyque, afficher les classes FIN avec un badge visuel :**
```html
<!-- Dans la liste des classes disponibles -->
<div class="class-item" data-fin="true">
  6°1 <span class="badge badge-fin">FIN</span>
</div>
```

3. **S'assurer que les élèves FIN sont correctement assignés :**
```javascript
// Lors de la génération, inclure les élèves FIN
const students = regroupement.classes.map(className => {
  return window.GROUPS_MODULE_V4_DATA.eleves[className] || [];
}).flat();
// Les élèves FIN seront automatiquement inclus
```

### Tests
- [ ] Lister `getGroupsModuleV4Data()` et chercher classes suffixées FIN
- [ ] Ouvrir triptyque et vérifier FIN visible
- [ ] Sélectionner une classe FIN et générer
- [ ] Vérifier ses élèves dans le résultat

---

## 📌 ÉTAPE 9 : TESTER TOUS LES MODES

### Objectif
Exécuter des scénarios `needs`, `lv2`, `options` en modes `heterogeneous` et `homogeneous`

### Matrix de tests

| Scénario | Mode | Résultat attendu |
|----------|------|------------------|
| needs | heterogeneous | Groupes équilibrés selon besoins |
| needs | homogeneous | Groupes par profil identique |
| lv2 | heterogeneous | Groupes LV2 équilibrés |
| lv2 | homogeneous | Groupes LV2 homogènes |
| options | heterogeneous | Groupes options équilibrés |
| options | homogeneous | Groupes options homogènes |

### Procédure
1. Ouvrir le triptyque V4
2. Sélectionner un scénario
3. Sélectionner un mode
4. Ajouter des regroupements
5. Cliquer "Générer"
6. Vérifier statistiques et équilibre
7. Tester drag & drop si implémenté
8. Sauvegarder et vérifier cache

### Validation
- [ ] Aucune erreur JavaScript en console
- [ ] Statistiques affichées correctement
- [ ] Drag & drop fonctionnel (si implémenté)
- [ ] Sauvegardes fonctionnent

---

## 📌 ÉTAPE 10 : VÉRIFIER EXPORTS

### Objectif
Assurer que les exports Excel/PDF fonctionnent avec les données V4

### Actions
1. Générer des groupes avec le triptyque V4
2. Cliquer "Exporter en Excel"
3. Cliquer "Exporter en PDF"
4. Vérifier fichiers :
   - Noms de classe corrects
   - Noms d'élèves complets
   - Scénario et mode affichés
   - Statistiques présentes

### Tests
- [ ] Export Excel génère fichier valide
- [ ] Export PDF lisible et formaté
- [ ] Données correspondent à la génération

---

## 📌 ÉTAPE 11 : DOCUMENTER LE ROLLBACK

### Objectif
Ajouter une note décrivant comment restaurer `GroupsModuleComplete` en cas d'échec de la V4

### Actions
1. Créer `ROLLBACK_PLAN.md` avec :
   ```markdown
   # Plan de Rollback - Module Groupes V4

   ## Si la V4 échoue en production :

   1. **Masquer les bundles V4 dans InterfaceV2.html**
      - Commenter les inclusions V4 (lignes 1461-1475)
      - Dé-commenter groupsModuleComplete (ligne 1457)

   2. **Restaurer les boutons anciens**
      - Rétablir openNewAssociationModal()
      - Masquer openModuleGroupsV4()

   3. **Nettoyer les données**
      - Supprimer GROUPS_MODULE_V4_DATA du cache
      - Conserver les anciens regroupements

   4. **Redéployer et tester**
      - Vider cache navigateur
      - Vérifier groupsModuleComplete fonctionne
   ```

2. Créer backup de `InterfaceV2.html` avant déploiement

### Tests
- [ ] Rollback plan documenté
- [ ] Backup créé

---

## 📌 ÉTAPE 12 : DÉPLOIEMENT EN PRODUCTION

### Objectif
Une fois tous les tests validés, déployer la nouvelle version

### Checklist pré-déploiement
- [ ] Étape 1 : Bundles serveurs ✅
- [ ] Étape 2 : Anciennes modales supprimées ✅
- [ ] Étape 3 : Génération branchée ✅
- [ ] Étape 4 : Élèves normalisés ✅
- [ ] Étape 5 : Triptyque initialisé ✅
- [ ] Étape 6 : globalThis validé ✅
- [ ] Étape 7 : Sauvegardes branchées ✅
- [ ] Étape 8 : Détection FIN validée ✅
- [ ] Étape 9 : Tests tous modes ✅
- [ ] Étape 10 : Exports OK ✅
- [ ] Étape 11 : Rollback documenté ✅

### Actions
1. Éditer `appsscript.json` si nécessaire (versionning)
2. Déployer via `clasp push`
3. Vider les caches navigateur
4. Notifier les utilisateurs du changement

---

## 📌 ÉTAPE 13 : COMMUNICATION AUX UTILISATEURS

### Message type
```
🚀 NOUVEAU : Module Groupes Version 4

Le module de création de groupes a été entièrement repensé.
Nouvelle interface en 3 panneaux (triptyque) pour une meilleure expérience.

✨ Améliorations :
- Interface plus claire et intuitive
- Meilleure gestion des regroupements
- Scénarios : Besoins, LV2, Options
- Modes : Hétérogène, Homogène
- Exports Excel et PDF

⚠️ Ancienne interface : Toujours disponible en cas de problème

Questions ? Contactez-nous.
```

---

## 📊 TIMELINE ESTIMÉE

| Étape | Tâches | Durée estimée |
|-------|--------|---------------|
| 1 | Bundles serveurs | ✅ 30 min |
| 2 | Sup. modales | 15 min |
| 3 | Génération branchée | 20 min |
| 4 | Normalisation élèves | 15 min |
| 5 | Initialisation triptyque | 20 min |
| 6 | globalThis | ✅ 5 min |
| 7 | Sauvegardes | 30 min |
| 8 | Détection FIN | 20 min |
| 9 | Tests modes | 45 min |
| 10 | Exports | 30 min |
| 11 | Rollback | 15 min |
| 12 | Production | 30 min |
| 13 | Communication | 10 min |
| **TOTAL** | | **~4.5 heures** |

---

## 🔄 STATUS GLOBAL

- **Étape 1** : ✅ COMPLÉTÉE
- **Étapes 2-13** : 📋 EN ATTENTE

**Prochaine action :** Continuer avec Étape 2 ou spécifier une autre priorité ?

