# 📋 PLAN DE RÉTABLISSEMENT V4 - 3 ÉTAPES PROPRES

**Date** : 2 novembre 2025
**Approche** : Éviter duplication CoreScript, rétablir bundles, reconnecter données
**Durée estimée** : 2-3 heures
**Complexité** : 🟡 Moyen

---

## 🔴 POURQUOI L'ANCIEN PLAN EST CONTRE-PRODUCTIF

### Problème 1 : Regonfler CoreScript reproduit l'erreur originelle

**Situation actuelle** :
```
InterfaceV2_CoreScript.html (9716 lignes)
  ├─ STATE global
  ├─ Architecture App.*
  ├─ Tous les modules inline
  └─ PROBLÈME : Déjà énorme et lourd
```

**Si on ajoute le module V4 inline** :
```
InterfaceV2_CoreScript.html (10600+ lignes) ❌
  ├─ STATE global
  ├─ Architecture App.*
  ├─ Tous les modules inline
  ├─ ModuleGroupsV4 (800 lignes) ← AJOUT
  └─ PROBLÈME : Duplication + mauvaise maintenabilité
```

**Le vrai problème** : CoreScript et groupsModuleComplete.html **dupliquent déjà** l'architecture complète. Ajouter V4 aggrave cette situation.

### Problème 2 : Le loader V4 est vide de logique métier

**État actuel de `InterfaceV2_GroupsModuleV4_Script.js`** (lignes 1-32) :

```javascript
(function() {
  'use strict';

  const windowRef = typeof globalThis !== 'undefined' ? globalThis : window;

  console.log('🚀 Chargement du Module Groupes V4');

  // Récupère les données depuis STATE ou DEFAULT_CLASSES
  const classesData = windowRef.STATE?.classesData || DEFAULT_CLASSES;

  // Instancie simplement le triptyque
  const tripModule = new TriptychGroupsModule(classesData);
  windowRef.ModuleGroupsV4 = tripModule;
})();
```

**Le problème** : Ce loader ne fait qu'instancier `TriptychGroupsModule`. Déplacer du code métier dans CoreScript ne rétablit pas le pipeline manquant, il **détourne le loader** de son vrai rôle.

### Problème 3 : Le triptyque affiche 0 classe car les données ne sont pas alimentées

**Situation** (`InterfaceV4_Triptyque_Logic.js:11-112`) :

```javascript
// DEFAULT_CLASSES : constantes fictives
const DEFAULT_CLASSES = [
  { id: '6°1', label: '6°1', students: 25 },
  // ...
];

// GROUPS_MODULE_V4_DATA : jamais alimenté depuis getClassesData()
let GROUPS_MODULE_V4_DATA = null;

// resolveAvailableClasses() utilise DEFAULT_CLASSES tant que GROUPS_MODULE_V4_DATA est null
const classes = GROUPS_MODULE_V4_DATA?.classes || DEFAULT_CLASSES;
```

**Le problème réel** : Les vraies données (`getClassesData()`) n'arrivent **jamais** jusqu'au triptyque.

Régonfler CoreScript ne résout pas ce pipeline manquant.

---

## ✅ PLAN ALTERNATIF : 3 ÉTAPES PROPRES

### ÉTAPE A : Rétablir les bundles V4 en ligne (Approche Web App)

**Objectif** : Éliminier les `Unexpected token '<'` sans ajouter de code à CoreScript

#### A.1 : Publier les bundles sur Apps Script

**Fichiers à publier** :
- `InterfaceV4_Triptyque_Logic.js` (~650 lignes)
- `InterfaceV2_GroupsModuleV4_Script.js` (~150 lignes)
- `GroupsAlgorithmV4_Distribution.js` (~550 lignes)

**Méthode** : Créer un **endpoint Web App** qui sert les fichiers comme JavaScript brut

**Fichier à ajouter dans Apps Script** : `serve_v4_bundles.gs`

```javascript
/**
 * Web App endpoint pour servir les bundles V4 comme ressources JavaScript
 * Évite les Unexpected token '<' en servant du JS brut au lieu de HTML
 */

function doGet(e) {
  const file = e.parameter.file;

  if (!file) {
    return HtmlService.createHtmlOutput('Missing file parameter');
  }

  try {
    // Charger le fichier demandé depuis le projet Apps Script
    const content = HtmlService.createTemplateFromFile(file).getRawContent();

    // Retourner avec MIME type JavaScript
    return HtmlService.createOutput(content)
      .setMimeType(HtmlService.MimeType.JAVASCRIPT)
      .addHeader('Cache-Control', 'public, max-age=3600')
      .addHeader('Access-Control-Allow-Origin', '*');

  } catch (error) {
    Logger.log('Erreur chargement fichier ' + file + ': ' + error);
    return HtmlService.createOutput('File not found: ' + file)
      .setMimeType(HtmlService.MimeType.TEXT)
      .setHttpHeaders({ 'HTTP_CODE': 404 });
  }
}
```

**Action** :
1. Créer ce fichier dans Google Apps Script
2. Déployer comme Web App (exécuter en tant que votre compte)
3. Copier l'URL publiée (ex: `https://script.google.com/macros/s/[ID]/usercontent`)

#### A.2 : Adapter les balises `<script>` pour charger via l'endpoint

**Fichier** : `InterfaceV2_GroupsModuleV4_Standalone.html` (lignes 545-550)

**AVANT** (charge le fichier directement - cause 404) :
```html
<script src="InterfaceV2_GroupsModuleV4_Script.js"></script>
<script src="InterfaceV4_Triptyque_Logic.js"></script>
```

**APRÈS** (charge via Web App endpoint) :
```html
<!-- ✅ Charger les bundles V4 via endpoint Web App -->
<script src="https://script.google.com/macros/s/[VOTRE_SCRIPT_ID]/usercontent?file=GroupsAlgorithmV4_Distribution.js"></script>
<script src="https://script.google.com/macros/s/[VOTRE_SCRIPT_ID]/usercontent?file=InterfaceV4_Triptyque_Logic.js"></script>
<script src="https://script.google.com/macros/s/[VOTRE_SCRIPT_ID]/usercontent?file=InterfaceV2_GroupsModuleV4_Script.js"></script>
```

**Avantage** : Aucun changement à CoreScript !

#### A.3 : Recompiler les bundles avec globalThis

**Fichier** : `GroupsAlgorithmV4_Distribution.js` (lignes 12-22)

**Problème actuel** : IIFE sans paramètre utilise `globalThis` (correct), mais d'autres exports pourraient supposer `global`

**Action** : Vérifier que **tous les** exports utilisent `globalThis` ou `window`

```javascript
// ✅ CORRECT : Utilise globalThis
const windowRef = typeof globalThis !== 'undefined'
  ? globalThis
  : typeof window !== 'undefined'
    ? window
    : {};

windowRef.GroupsAlgorithmV4 = GroupsAlgorithmV4;
```

**Fichiers à vérifier** :
- ✅ `GroupsAlgorithmV4_Distribution.js` (déjà bon)
- ✅ `InterfaceV4_Triptyque_Logic.js` (déjà bon)
- ✅ `InterfaceV2_GroupsModuleV4_Script.js` (déjà bon)

---

### ÉTAPE B : Reconnecter les données réelles au triptyque

**Objectif** : Alimenter `GROUPS_MODULE_V4_DATA` depuis `getClassesData()` au lieu d'utiliser `DEFAULT_CLASSES`

#### B.1 : Adapter la structure de retour de getClassesData()

**Fichier** : `Code.gs` (fonction backend)

**État actuel** (`getClassesData()`) :
```javascript
return {
  success: true,
  data: {
    '6°1': { classe: '6°1', eleves: [ { nom, prenom, ... } ] },
    '6°2': { classe: '6°2', eleves: [ ... ] },
    // ...
  },
  rules: { ... }
};
```

**Adapter pour V4** : S'assurer que chaque élève a les champs attendus

```javascript
// Dans getClassesData(), lors de la consolidation des élèves
student.id = student.id || `eleve-${uuid}`;
student.classe = rawName;  // Classe actuelle (important !)
student.sexe = (student.sexe || 'M').toUpperCase();
student.scoreM = parseFloat(student.scoreM) || 0;
student.scoreF = parseFloat(student.scoreF) || 0;
student.com = parseFloat(student.com) || 0;
student.tra = parseFloat(student.tra) || 0;
student.part = parseFloat(student.part) || 0;
student.abs = parseFloat(student.abs) || 0;
student.lv2 = student.lv2 || '';
student.opt = student.opt || '';

// Retourner avec structure claire pour V4
return {
  success: true,
  data: {
    [classe.id]: {
      id: classe.id,
      label: classe.nom,
      classe: classe.id,
      eleves: [ students... ]  // ✅ Avec tous les champs
    }
  },
  rules: { ... }
};
```

#### B.2 : Initialiser le triptyque depuis initRepartitionApp()

**Fichier** : `InterfaceV2_CoreScript.html` ou `groupsModuleComplete.html`

**Localiser** : La fonction `initRepartitionApp()` qui appelle `getClassesData()`

**Ajouter APRÈS la réception des données** :

```javascript
// Après google.script.run.getClassesData()
.withSuccessHandler((result) => {
  console.log('✅ getClassesData reçue:', result);

  // ✅ FIX : Alimenter GROUPS_MODULE_V4_DATA pour le triptyque
  if (result.success && result.data) {
    // Transformer le format Apps Script en format V4
    const classesArray = Object.entries(result.data).map(([key, classData]) => ({
      id: classData.id || key,
      label: classData.label || classData.classe || key,
      classe: classData.classe || key,
      eleves: classData.eleves || []
    }));

    // Aplatir tous les élèves avec classe
    const allStudents = [];
    classesArray.forEach(cls => {
      (cls.eleves || []).forEach(student => {
        allStudents.push({
          ...student,
          classe: cls.id,  // ✅ Assurer classe présente
          classLabel: cls.label
        });
      });
    });

    // ✅ Alimenter la variable globale du triptyque
    if (typeof window !== 'undefined') {
      window.GROUPS_MODULE_V4_DATA = {
        classes: classesArray,
        students: allStudents,
        scenarios: ['needs', 'lv2', 'options']  // Scénarios disponibles
      };

      console.log('✅ V4: GROUPS_MODULE_V4_DATA alimenté');
      console.log('   Classes:', classesArray.length);
      console.log('   Élèves:', allStudents.length);
    }
  }

  // ... reste du code initRepartitionApp()
})
```

#### B.3 : Supprimer la fallback automatique vers GroupsModuleComplete

**Fichier** : `InterfaceV2.html` (lignes 1443-1445)

**AVANT** (fallback automatique) :
```javascript
if (!window.GROUPS_MODULE_V4_DATA) {
  console.warn('⚠️ V4 data not found, using GroupsModuleComplete');
  openGroupsModuleComplete();  // ← Fallback implicite
}
```

**APRÈS** (fallback conditionnel) :
```javascript
// Ne basculer vers GroupsModuleComplete que si vraiment nécessaire
if (!window.GROUPS_MODULE_V4_DATA ||
    window.GROUPS_MODULE_V4_DATA.classes?.length === 0) {
  console.warn('⚠️ V4: Pas de données, utilisation de fallback GroupsModuleComplete');
  openGroupsModuleComplete();
} else {
  console.log('✅ V4: Données présentes, triptyque initialisé');
}
```

---

### ÉTAPE C : Validation fonctionnelle et documentation

#### C.1 : Tests de validation

**Test 1 : Données alimentées**
```javascript
// Console après initRepartitionApp()
console.log('✅ GROUPS_MODULE_V4_DATA:', window.GROUPS_MODULE_V4_DATA);
// Résultat attendu : { classes: [...], students: [...], scenarios: [...] }
```

**Test 2 : Triptyque affiche les vraies classes**
```javascript
// Ouvrir l'interface V4
// Vérifier : Classes affichées = vraies classes du backend (6°1, 6°2, etc.)
// NON pas DEFAULT_CLASSES (avec les nombres fictifs 25, 24, etc.)
```

**Test 3 : Générer un regroupement**
1. Sélectionner "Par besoins"
2. Sélectionner 2-3 classes
3. Créer une passe
4. Vérifier :
   - ✅ Pas d'erreur "0 élèves sélectionnés"
   - ✅ Statistiques > 0
   - ✅ Passe créée avec étudiants
   - ✅ Pas de fallback vers GroupsModuleComplete

**Test 4 : Vérifier pas de 404 ou SyntaxError**
```javascript
// F12 → Network
// Chercher : Les appels aux bundles retournent 200 (pas 404)
// Les bundles sont chargés correctement (pas "Unexpected token '<'")
```

#### C.2 : Stabiliser le périmètre CoreScript

**Principe** : CoreScript ne doit être qu'un **bootstrap** (menus, header, init globale)

**Actions** :
1. ✅ Garder dans CoreScript : `STATE`, architecture App.*, `initRepartitionApp()`, alimentation de `GROUPS_MODULE_V4_DATA`
2. ❌ Ne PAS ajouter : Logique métier V4, UI triptyque, gestion regroupements
3. ✅ Laisser dans leurs fichiers respectifs : `InterfaceV4_Triptyque_Logic.js`, `GroupsAlgorithmV4_Distribution.js`

**Vérification** :
```bash
# Chercher du code V4 dans CoreScript
grep -i "triptych\|regroupement\|scenario" InterfaceV2_CoreScript.html
# Résultat attendu : Aucune occurrence de logique V4
```

#### C.3 : Documenter la chaîne de chargement

**Créer** : `DOCUMENTATION_GROUPS_MODULE_V4.md`

```markdown
# Documentation - Module Groupes V4

## Chaîne de chargement

1. **Bootstrap** (`InterfaceV2_CoreScript.html`)
   - Initialise STATE, App.*
   - Appelle initRepartitionApp()
   - Reçoit données getClassesData()
   - Alimente window.GROUPS_MODULE_V4_DATA

2. **Bundles V4** (via Web App endpoint)
   - InterfaceV4_Triptyque_Logic.js → TriptychGroupsModule
   - GroupsAlgorithmV4_Distribution.js → GroupsAlgorithmV4
   - InterfaceV2_GroupsModuleV4_Script.js → Instancie le triptyque

3. **Triptyque utilise les données**
   - Lire GROUPS_MODULE_V4_DATA.classes
   - Lire GROUPS_MODULE_V4_DATA.students
   - Générer regroupements via GroupsAlgorithmV4

## Format GROUPS_MODULE_V4_DATA attendu

```javascript
{
  classes: [
    { id: '6°1', label: '6°1', classe: '6°1', eleves: [...] },
    ...
  ],
  students: [
    { id, nom, prenom, classe: '6°1', scoreM, scoreF, ... },
    ...
  ],
  scenarios: ['needs', 'lv2', 'options']
}
```

## Points critiques

- ⚠️ Chaque élève DOIT avoir `classe` présent
- ⚠️ GROUPS_MODULE_V4_DATA DOIT être alimenté AVANT que le triptyque ne l'utilise
- ⚠️ Ne pas ajouter de logique métier dans CoreScript
- ⚠️ Laisser la logique regroupement dans les fichiers V4

## Si ça ne marche pas

1. Vérifier GROUPS_MODULE_V4_DATA en console
2. Vérifier que les bundles se chargent (Network tab)
3. Vérifier pas de ReferenceError/SyntaxError
4. Vérifier que les vrais élèves sont présents (pas DEFAULT_CLASSES)
```

---

## 📊 COMPARAISON PLANS

| Aspect | Ancien plan (Inline CoreScript) | Nouveau plan (Web App) |
|--------|-------------------------------|-----------------------|
| Régonfle CoreScript | ❌ OUI (9716 → 10600+ lignes) | ✅ NON (bootstrap seulement) |
| Duplication code | ❌ Aggrave le problème | ✅ Supprime duplication |
| Logique métier | ❌ Spread dans CoreScript | ✅ Localisée dans V4 modules |
| Maintenabilité | ❌ Difficile | ✅ Facile |
| SyntaxError résolu | ✅ OUI | ✅ OUI |
| Données réelles alimentées | ⚠️ NON (données fictives) | ✅ OUI (getClassesData) |
| Temps implémentation | 30-45 min | 2-3 heures |
| Scalabilité future | ❌ Difficile | ✅ Facile |

---

## 🚀 ÉTAPES D'EXÉCUTION

### Jour 1 : Étape A (45-60 min)

1. Créer `serve_v4_bundles.gs` (15 min)
2. Déployer comme Web App (10 min)
3. Copier l'URL publiée (5 min)
4. Adapter `InterfaceV2_GroupsModuleV4_Standalone.html` (15 min)
5. Vérifier les bundles chargent (5-10 min)

### Jour 2 : Étape B (60-90 min)

1. Adapter structure `getClassesData()` (20 min)
2. Ajouter alimentation `GROUPS_MODULE_V4_DATA` dans `initRepartitionApp()` (20 min)
3. Supprimer fallback automatique (10 min)
4. Tests manuels (20-30 min)
5. Déboguer si nécessaire (10-20 min)

### Jour 3 : Étape C (30-45 min)

1. Tests complets (15 min)
2. Créer documentation (15 min)
3. Vérifier pas de régression (5-10 min)

**TOTAL : 2-3 heures pour un V4 complètement fonctionnel et propre**

---

## ✅ GAINS ATTENDUS

### Après Étape A
- ✅ Bundles V4 accessibles (pas de 404)
- ✅ Pas de `Unexpected token '<'`
- ✅ Aucune modification à CoreScript
- ⚠️ Données fictives (DEFAULT_CLASSES) affichées

### Après Étape B
- ✅ Vraies données alimentées
- ✅ Vraies classes visibles
- ✅ Regroupements calculés correctement
- ✅ Pas de fallback silencieux

### Après Étape C
- ✅ Chaîne de chargement documentée
- ✅ CoreScript reste bootstrap propre
- ✅ Code V4 localisé dans ses modules
- ✅ Maintenabilité assurée pour l'avenir

---

## 🔐 PRINCIPES RESPECTÉS

✅ **Ne pas regonfler CoreScript**
- Bootstrap seulement
- Logique métier dans les modules respectifs

✅ **Éviter duplication**
- Un seul triptyque (pas de copie dans CoreScript)
- Un seul pipeline de données

✅ **Rendre maintenable**
- Chaîne de chargement claire et documentée
- Séparation des responsabilités

✅ **Supporter l'évolution**
- Web App endpoint extensible pour d'autres bundles
- GROUPS_MODULE_V4_DATA format standard pour l'injection

---

**Plan créé** : 2 novembre 2025
**Version** : 1.0 - Plan alternatif propre
**Complexité** : 🟡 Moyen (2-3h)
**Résultat** : V4 fonctionnel + architecture propre

