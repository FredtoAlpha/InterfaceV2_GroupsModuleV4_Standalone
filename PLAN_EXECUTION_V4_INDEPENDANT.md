# 📋 PLAN D'EXÉCUTION - Module V4 100% Indépendant

**Date** : 2 novembre 2025
**Objectif** : Rétablir Module V4 de manière totalement indépendante
**Principe** : V4 = nouveau système | GroupsModuleComplete = laissé intouché
**Durée estimée** : 3-4 heures
**Complexité** : 🟡 Moyen

---

## 🎯 PRINCIPES NON-NÉGOCIABLES

✅ **V4 doit fonctionner indépendamment**
- Aucune dépendance au vieux module GroupsModuleComplete
- Aucune duplication de code
- Aucune logique métier dans CoreScript

✅ **CoreScript reste BOOTSTRAP seulement**
- Menu, header, init globale
- Alimentation de `GROUPS_MODULE_V4_DATA`
- Pas de code V4 supplémentaire

✅ **Le vieux module GroupsModuleComplete reste inchangé**
- Pas de refactoring
- Pas de suppression
- Pas d'intégration forcée

✅ **V4 utilise VRAIES DONNÉES du backend**
- Pas de DEFAULT_CLASSES fictives
- Alimenté depuis `getClassesData()`
- Injecté via `GROUPS_MODULE_V4_DATA`

---

## 📋 12 ORDRES - PLAN D'EXÉCUTION

### ORDRE 1 : Écarter métier de CoreScript

**Fichier** : `InterfaceV2_CoreScript.html`

**Action** :
```javascript
// ❌ NE PAS ajouter :
// - Classe ModuleGroupsV4
// - Logique triptyque
// - Gestion regroupements
// - Handlers événements V4

// ✅ Garder SEULEMENT :
// - STATE
// - Menus (Régler, Éditer, Groupes)
// - initRepartitionApp()
// - loadClassesFromBackend()
// - Alimentation GROUPS_MODULE_V4_DATA
```

**Vérification** :
```bash
grep -c "class ModuleGroupsV4\|TriptychGroupsModule\|renderGroups\|generateRegroupement" InterfaceV2_CoreScript.html
# Résultat attendu : 0
```

**Checklist** :
- [ ] Aucune ligne V4 spécifique dans CoreScript
- [ ] CoreScript = bootstrap seulement
- [ ] Logique métier = dans InterfaceV4_Triptyque_Logic.js

---

### ORDRE 2 : Garder V4_Script comme loader minimal

**Fichier** : `InterfaceV2_GroupsModuleV4_Script.js`

**État actuel** (lignes 1-32) :
```javascript
(function() {
  'use strict';

  const windowRef = typeof globalThis !== 'undefined' ? globalThis : window;

  console.log('🚀 Chargement du Module Groupes V4');

  // Instancie simplement le triptyque
  const tripModule = new TriptychGroupsModule(classesData);
  windowRef.ModuleGroupsV4 = tripModule;
})();
```

**Action** : ✅ C'est déjà correct !

**Refuse absolument** :
```javascript
// ❌ NE PAS ajouter
class ModuleGroupsV4 { ... }  // Déjà défini ailleurs
function generateRegroupement() { ... }  // Ailleurs
function saveGroups() { ... }  // Ailleurs
```

**Vérification** :
```bash
wc -l InterfaceV2_GroupsModuleV4_Script.js
# Résultat : < 200 lignes (loader, pas logique)
```

**Checklist** :
- [ ] InterfaceV2_GroupsModuleV4_Script.js = loader minimal
- [ ] Aucune duplication avec groupsModuleComplete.html
- [ ] Une seule responsabilité : instancier le triptyque

---

### ORDRE 3 : Éliminer données fictives

**Fichier** : `InterfaceV4_Triptyque_Logic.js`

**État actuel** (lignes 11-95) :
```javascript
// ❌ DEFAULT_CLASSES : données fictives
const DEFAULT_CLASSES = [
  { id: '6°1', label: '6°1', students: 25 },
  { id: '6°2', label: '6°2', students: 24 },
  // ...
];

// ❌ GROUPS_MODULE_V4_DATA : jamais alimenté
let GROUPS_MODULE_V4_DATA = null;

const classes = GROUPS_MODULE_V4_DATA?.classes || DEFAULT_CLASSES;
```

**Action** : Modifier la logique de lecture

```javascript
// ✅ Refuser DEFAULT_CLASSES si données réelles manquent
const resolveAvailableClasses = () => {
  // Source 1 : Données réelles du backend (priorité)
  if (window.GROUPS_MODULE_V4_DATA?.classes &&
      window.GROUPS_MODULE_V4_DATA.classes.length > 0) {
    return window.GROUPS_MODULE_V4_DATA.classes;
  }

  // Source 2 : Cache local
  if (window.STATE?.classesData) {
    return Object.entries(window.STATE.classesData).map(([key, cls]) => ({
      id: cls.id || key,
      label: cls.label || cls.classe || key,
      classe: cls.classe || key,
      eleves: cls.eleves || []
    }));
  }

  // ❌ Source 3 : REFUSÉE
  // console.error('❌ Aucune donnée réelle trouvée !');
  // return DEFAULT_CLASSES;  ← NE PAS UTILISER

  console.error('❌ ERREUR : GROUPS_MODULE_V4_DATA non alimenté');
  return [];  // Tableau vide = signal d'erreur clair
};
```

**Vérification** :
```bash
grep -n "DEFAULT_CLASSES\|fictive\|25.*24" InterfaceV4_Triptyque_Logic.js | head -10
# Résultat : Références marquées avec ❌ REFUSÉE
```

**Checklist** :
- [ ] DEFAULT_CLASSES marquées comme REFUSÉES
- [ ] Logique préfère GROUPS_MODULE_V4_DATA > STATE > Erreur
- [ ] Jamais de fallback silencieux à données fictives

---

### ORDRE 4 : Publier bundles sans erreur 404

**Fichiers à publier** :
- `InterfaceV4_Triptyque_Logic.js`
- `InterfaceV2_GroupsModuleV4_Script.js`
- `GroupsAlgorithmV4_Distribution.js`

**Méthode A : Apps Script Web App endpoint** (Recommandée)

**Créer** : `serve_v4_bundles.gs`

```javascript
/**
 * Endpoint Web App pour servir les bundles V4
 * Élimine les erreurs 404 et "Unexpected token '<'"
 */
function doGet(e) {
  const file = e.parameter.file;

  if (!file) {
    return HtmlService.createHtmlOutput('Missing file parameter');
  }

  try {
    // Charger depuis le projet Apps Script
    const content = HtmlService.createTemplateFromFile(file).getRawContent();

    // Servir comme JavaScript brut
    return HtmlService.createOutput(content)
      .setMimeType(HtmlService.MimeType.JAVASCRIPT)
      .addHeader('Cache-Control', 'public, max-age=3600')
      .addHeader('Access-Control-Allow-Origin', '*');

  } catch (error) {
    Logger.log('Erreur : ' + file + ' → ' + error);
    return HtmlService.createOutput('404: ' + file)
      .setMimeType(HtmlService.MimeType.TEXT)
      .setHttpHeaders({ 'HTTP_CODE': 404 });
  }
}
```

**Déployer** :
1. Ajouter `serve_v4_bundles.gs` dans Apps Script
2. Déployer comme Web App
3. Exécuter en tant que : [Votre compte]
4. Accès : Utilisateurs de [org]
5. Copier l'URL publiée

**Méthode B : CDN interne ou Drive**

Si Apps Script ne convient pas, héberger sur serveur interne avec headers CORS.

**Vérification** :
```bash
# Tester l'endpoint
curl "https://script.google.com/macros/s/[ID]/usercontent?file=InterfaceV4_Triptyque_Logic.js"
# Résultat : Code JavaScript brut, pas HTML
```

**Checklist** :
- [ ] Web App endpoint créé
- [ ] URL publiée copiée
- [ ] Test : Endpoint retourne JS (pas HTML)
- [ ] Test : Status 200 (pas 404)

---

### ORDRE 5 : Recompiler avec globalThis

**Fichiers** : `GroupsAlgorithmV4_Distribution.js`, `InterfaceV4_Triptyque_Logic.js`

**Vérifier** : Tous les exports utilisent `globalThis`

```javascript
// ✅ CORRECT
const windowRef = typeof globalThis !== 'undefined'
  ? globalThis
  : typeof window !== 'undefined'
    ? window
    : {};

windowRef.GroupsAlgorithmV4 = GroupsAlgorithmV4;
windowRef.TriptychGroupsModule = TriptychGroupsModule;
```

**Chercher et remplacer** :

```bash
# Chercher d'éventuels "global" restants
grep -n "function(global)\|global\\..*=\|export.*global" *.js
# Résultat attendu : 0 occurrences dangereuses
```

**Vérification**  :
```javascript
// Dans la console après chargement
console.log('TriptychGroupsModule:', typeof TriptychGroupsModule);
console.log('GroupsAlgorithmV4:', typeof GroupsAlgorithmV4);
// Résultat attendu : "function" pour les deux
```

**Checklist** :
- [ ] Aucune dépendance à `global`
- [ ] Tous les exports utilisent `globalThis` ou `window`
- [ ] Pas de ReferenceError au chargement

---

### ORDRE 6 : Adapter getClassesData pour V4

**Fichier** : `Code.gs` (backend)

**Assurer** que chaque élève a les champs requis par V4 :

```javascript
function getClassesData(spreadsheetId) {
  // ... chargement données ...

  // Pour chaque élève consolidé
  const students = [];
  classRows.forEach((row, idx) => {
    const student = createStudent(row, columns);
    if (student) {
      // ✅ Champs V4 requis
      student.id = student.id || `eleve-${uuid()}`;
      student.classe = rawClassName;  // ← CRUCIAL
      student.sexe = (student.sexe || 'M').toUpperCase();
      student.scoreM = parseFloat(student.scoreM) || 0;
      student.scoreF = parseFloat(student.scoreF) || 0;
      student.com = parseFloat(student.com) || 0;
      student.tra = parseFloat(student.tra) || 0;
      student.part = parseFloat(student.part) || 0;
      student.abs = parseFloat(student.abs) || 0;
      student.lv2 = student.lv2 || '';
      student.opt = student.opt || '';

      students.push(student);
    }
  });

  // Retourner dans format V4
  return {
    success: true,
    data: {
      [classId]: {
        id: classId,
        label: className,
        classe: classId,
        eleves: students
      }
    },
    rules: { /* ... */ }
  };
}
```

**Vérification** :
```javascript
// En Apps Script console
const result = getClassesData('TEST');
Logger.log(JSON.stringify(result.data['6°1'].eleves[0], null, 2));
// Résultat : Élève avec { id, classe, scoreM, scoreF, com, tra, part, abs, lv2, opt }
```

**Checklist** :
- [ ] Chaque élève a `id`
- [ ] Chaque élève a `classe` (classe actuelle)
- [ ] Chaque élève a scores (scoreM, scoreF, com, tra, part, abs)
- [ ] Chaque élève a `sexe` (F ou M)
- [ ] Chaque élève a `lv2` et `opt` (options)

---

### ORDRE 7 : Injecter GROUPS_MODULE_V4_DATA

**Fichier** : `InterfaceV2_CoreScript.html` ou `groupsModuleComplete.html`

**Dans `initRepartitionApp()`** après réception de `getClassesData()` :

```javascript
function initRepartitionApp() {
  // ... code existant ...

  google.script.run
    .withSuccessHandler((result) => {
      console.log('✅ getClassesData reçue');

      if (result.success && result.data) {
        // ✅ INJECTION V4 : Créer la structure attendue
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

        // ✅ INJECTION GLOBALE
        window.GROUPS_MODULE_V4_DATA = {
          classes: classesArray,
          students: allStudents,
          scenarios: ['needs', 'lv2', 'options']
        };

        console.log('✅ V4: GROUPS_MODULE_V4_DATA injecté');
        console.log('   Classes:', classesArray.length);
        console.log('   Élèves:', allStudents.length);
        console.log('   Classes:', classesArray.map(c => c.id).join(', '));
      }

      // ... reste du code (charger DOM, init autres modules) ...
    })
    .getClassesData(spreadsheetId);
}
```

**Vérification en console** :
```javascript
// Après chargement
console.log('GROUPS_MODULE_V4_DATA:', window.GROUPS_MODULE_V4_DATA);
// Résultat :
// {
//   classes: [ { id: '6°1', label: '6°1', ... }, ... ],
//   students: [ { nom, prenom, classe: '6°1', ... }, ... ],
//   scenarios: ['needs', 'lv2', 'options']
// }
```

**Checklist** :
- [ ] GROUPS_MODULE_V4_DATA créé avec classes, students, scenarios
- [ ] Chaque élève a `classe` rempli
- [ ] Aucune donnée fictive
- [ ] Logging montre le nombre réel de classes/élèves

---

### ORDRE 8 : Laisser InterfaceV2_GroupsModuleV4_Script.js instancier le triptyque

**Fichier** : `InterfaceV2_GroupsModuleV4_Script.js`

**État final** (minimal loader) :

```javascript
(function() {
  'use strict';

  const windowRef = typeof globalThis !== 'undefined' ? globalThis : window;

  if (!windowRef || typeof windowRef.GROUPS_MODULE_V4_DATA === 'undefined') {
    console.warn('⚠️ V4: GROUPS_MODULE_V4_DATA non disponible');
    return;
  }

  console.log('🚀 Chargement du Module Groupes V4');

  // Instancier le triptyque avec les vraies données
  const tripModule = new TriptychGroupsModule(windowRef.GROUPS_MODULE_V4_DATA);

  // Exposer globalement
  windowRef.ModuleGroupsV4 = tripModule;

  console.log('✅ ModuleGroupsV4 instancié avec succès');
})();
```

**Refuse absolument** :
```javascript
// ❌ NE PAS ajouter
class ModuleGroupsV4 { }  // Déjà ailleurs
function generateRegroupement() { }  // Déjà ailleurs
function saveState() { }  // Déjà ailleurs
```

**Checklist** :
- [ ] Loader minimal (< 150 lignes)
- [ ] Une seule responsabilité : instanciation
- [ ] Aucune logique métier
- [ ] Aucune duplication

---

### ORDRE 9 : Retirer fallback automatique vers GroupsModuleComplete

**Fichier** : `InterfaceV2.html` (lignes 1443-1445)

**AVANT** (fallback automatique) :
```javascript
if (!window.GROUPS_MODULE_V4_DATA) {
  console.warn('⚠️ V4 data not found');
  openGroupsModuleComplete();  // ← Fallback silencieux
}
```

**APRÈS** (fallback conditionnel avec logging) :
```javascript
// V4 : Vérifier si triptyque reçoit un regroupement non vide
if (window.ModuleGroupsV4 &&
    window.ModuleGroupsV4.state?.associations?.length > 0) {
  console.log('✅ V4: Regroupement créé, triptyque opérationnel');
  // Garder le triptyque
} else if (!window.GROUPS_MODULE_V4_DATA ||
           window.GROUPS_MODULE_V4_DATA.classes?.length === 0) {
  console.warn('⚠️ V4: Pas de données, fallback vers GroupsModuleComplete');
  openGroupsModuleComplete();
} else {
  console.log('✅ V4: Triptyque initialisé avec données');
}
```

**Checklist** :
- [ ] Fallback seulement si GROUPS_MODULE_V4_DATA vide
- [ ] Logging clair pour chaque branche
- [ ] Pas de fallback silencieux
- [ ] Trace visible en console

---

### ORDRE 10 : Test manuel complet (Mode CACHE)

**Procédure** :

1. **Ouvrir l'application** (Mode CACHE)
   ```
   F12 → Console doit montrer :
   ✅ V4: GROUPS_MODULE_V4_DATA injecté
   ✅ ModuleGroupsV4 instancié avec succès
   ✅ Classes : 6°1, 6°2, 6°3, 6°4, 6°5
   ✅ Élèves : 121
   ```

2. **Cliquer "Groupes"**
   - Interface V4 (triptyque) doit s'ouvrir
   - Pas d'erreur SyntaxError

3. **Test 1 : Sélectionner "Par besoins"**
   - [ ] Scénario "Par besoins" apparaît
   - [ ] Aucune erreur

4. **Test 2 : Sélectionner "Hétérogène"**
   - [ ] Mode hétérogène sélectionnable
   - [ ] Aucune erreur

5. **Test 3 : Sélectionner 2 classes (ex: 6°1, 6°2)**
   - [ ] Classes sélectionnables (vrais noms, pas fictifs)
   - [ ] Statistiques affichent > 0 élèves

6. **Test 4 : Créer une passe**
   - [ ] Boutton "Créer passe" fonctionne
   - [ ] Passe créée avec regroupements
   - [ ] **PAS** d'erreur "0 élèves sélectionnés"
   - [ ] Statistiques : F/M, COM/TRA/PART/ABS > 0

7. **Test 5 : Vérifier logs**
   ```
   F12 → Console :
   ✅ Aucun SyntaxError
   ✅ Aucun ReferenceError: global
   ✅ Aucun "Unexpected token '<'"
   ✅ "0 élèves sélectionnés" NON affiché
   ```

8. **Test 6 : Deuxième regroupement**
   - [ ] Créer une deuxième passe (autre scénario ou classes)
   - [ ] Vérifie que V4 fonctionne complètement

**Résultat attendu** :
```
✅ Deux regroupements créés
✅ Statistiques non nulles pour chacun
✅ Aucune erreur
✅ Aucun fallback vers GroupsModuleComplete
✅ Triptyque = système principal
```

**Checklist** :
- [ ] Test 1-6 réussis
- [ ] Pas d'erreur en console
- [ ] Vraies données visibles (classes et élèves)
- [ ] Au moins 2 regroupements créés avec succès

---

### ORDRE 11 : Geler CoreScript

**Action** : Verrouiller CoreScript après les vérifications

**Statut** :
```
✅ CoreScript validé en production
❌ Aucun changement supplémentaire sans approbation
❌ Aucun code V4 supplémentaire à ajouter
```

**Documenter le gel** :
```javascript
// ═══════════════════════════════════════════════════════════════
//  ⚠️ GELÉ - Ne pas modifier sans approbation Tech Lead
// ═══════════════════════════════════════════════════════════════
// Ce fichier est le bootstrap uniquement
// Voir DOCUMENTATION_GROUPS_MODULE_V4.md pour ajouter du code V4
// ═══════════════════════════════════════════════════════════════
```

**Checklist** :
- [ ] CoreScript marqué comme GELÉ
- [ ] Aucune nouvelle logique V4 ajoutable
- [ ] Tout changement requiert approbation explicite

---

### ORDRE 12 : Documenter chaîne de chargement

**Créer** : `DOCUMENTATION_GROUPS_MODULE_V4.md`

```markdown
# Module Groupes V4 - Documentation Architecture

## Chaîne de chargement

### 1. Bootstrap (InterfaceV2_CoreScript.html)
- Initialise STATE
- Appelle initRepartitionApp()
- Reçoit getClassesData() du backend
- ✅ Injecte window.GROUPS_MODULE_V4_DATA
- Charge les bundles V4 via Web App endpoint

### 2. Bundles V4 (via endpoint)
- InterfaceV4_Triptyque_Logic.js → TriptychGroupsModule
- GroupsAlgorithmV4_Distribution.js → GroupsAlgorithmV4
- InterfaceV2_GroupsModuleV4_Script.js → Instancie le triptyque

### 3. Triptyque utilise données
- Lit GROUPS_MODULE_V4_DATA.classes
- Lit GROUPS_MODULE_V4_DATA.students
- Génère regroupements

## Format GROUPS_MODULE_V4_DATA requis

```javascript
{
  classes: [
    { id: '6°1', label: '6°1', classe: '6°1', eleves: [...] },
    ...
  ],
  students: [
    { id, nom, prenom, classe: '6°1', scoreM, scoreF, com, tra, part, abs, lv2, opt },
    ...
  ],
  scenarios: ['needs', 'lv2', 'options']
}
```

## Points critiques

⚠️ Chaque élève DOIT avoir `classe` rempli
⚠️ GROUPS_MODULE_V4_DATA DOIT être alimenté AVANT le triptyque
⚠️ CoreScript = bootstrap seulement (GELÉ)
⚠️ Logique métier = dans InterfaceV4_Triptyque_Logic.js
⚠️ Ne jamais ajouter de code V4 à CoreScript

## Si ça casse

1. Vérifier GROUPS_MODULE_V4_DATA en console
2. Vérifier bundles se chargent (Network tab)
3. Vérifier pas de 404 / SyntaxError
4. Vérifier vraies données (pas DEFAULT_CLASSES)
```

**Checklist** :
- [ ] Documentation créée et complète
- [ ] Ordre de chargement explicite
- [ ] Périmètre CoreScript verrouillé
- [ ] Points critiques documentés

---

## ✅ CHECKLIST D'EXÉCUTION FINALE

### Avant de commencer

- [ ] CoreScript approuvé comme bootstrap-seulement
- [ ] GroupsModuleComplete à laisser intouché
- [ ] V4 = système indépendant

### Exécution ordres 1-5

- [ ] Ordre 1 : CoreScript ne contient aucune logique V4
- [ ] Ordre 2 : InterfaceV2_GroupsModuleV4_Script.js = loader minimal
- [ ] Ordre 3 : DEFAULT_CLASSES marquées comme REFUSÉES
- [ ] Ordre 4 : Bundles publiés (pas de 404)
- [ ] Ordre 5 : globalThis partout (pas de `global`)

### Exécution ordres 6-10

- [ ] Ordre 6 : getClassesData adapté pour V4
- [ ] Ordre 7 : GROUPS_MODULE_V4_DATA injecté depuis initRepartitionApp()
- [ ] Ordre 8 : Loader instancie le triptyque
- [ ] Ordre 9 : Fallback conditionnel (pas automatique)
- [ ] Ordre 10 : Test complet mode CACHE (2 regroupements, pas d'erreur)

### Exécution ordres 11-12

- [ ] Ordre 11 : CoreScript GELÉ (aucun changement supplémentaire)
- [ ] Ordre 12 : Documentation créée et verrouille le périmètre

### Validation finale

- [ ] ✅ V4 opérationnel
- [ ] ✅ GroupsModuleComplete inchangé
- [ ] ✅ Aucune duplication
- [ ] ✅ Données réelles alimentées
- [ ] ✅ Architecture propre et maintenable

---

## 🎯 RÉSULTAT ATTENDU

**Module V4 100% indépendant**

```
✅ Fonctionne sans GroupsModuleComplete
✅ Aucune régression du vieux module
✅ Données réelles alimentées
✅ Architecture propre
✅ Gelé et documenté
✅ Prêt pour l'évolution future
```

**Timeline** : 3-4 heures pour tous les ordres

**Prochaine étape** : Exécuter les 12 ordres dans l'ordre exact

---

**Plan créé** : 2 novembre 2025
**12 ordres** : Non-négociables
**V4 indépendant** : ✅ Objectif
**GroupsModuleComplete** : ✅ Intouché
**Status** : 🟢 Prêt pour exécution

