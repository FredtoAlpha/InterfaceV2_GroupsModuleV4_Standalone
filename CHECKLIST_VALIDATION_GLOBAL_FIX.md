# Checklist de validation - Correction ReferenceError: global is not defined

## ✅ Statut : CORRECTION APPLIQUÉE ET À VALIDER

---

## 📋 Checklist de déploiement

### Phase 1 : Vérification du code ✅

- [x] **Ligne 15-22** : Détection robuste dans `windowRef`
  ```javascript
  const windowRef = typeof window !== 'undefined' 
    ? window 
    : typeof global !== 'undefined' 
      ? global 
      : typeof globalThis !== 'undefined'
        ? globalThis
        : {};
  ```

- [x] **Ligne 505-511** : Détection robuste dans l'IIFE
  ```javascript
  })(typeof window !== 'undefined' 
    ? window 
    : typeof global !== 'undefined' 
      ? global 
      : typeof globalThis !== 'undefined'
        ? globalThis
        : {});
  ```

- [x] **Fichier modifié** : `GroupsAlgorithmV4_Distribution.js`
- [x] **Documentation créée** : `CORRECTION_GLOBAL_REFERENCE_ERROR.md`

---

### Phase 2 : Tests en environnement cible 🔄

#### Test 1 : Navigateur standard
- [ ] Ouvrir `InterfaceV2_GroupsModuleV4_Standalone.html`
- [ ] Ouvrir la console (F12)
- [ ] Vérifier : `console.log(window.GroupsAlgorithmV4)`
- [ ] Résultat attendu : `[Function: GroupsAlgorithmV4]`
- [ ] Statut : ⏳ À TESTER

#### Test 2 : Google Apps Script
- [ ] Déployer le fichier dans Apps Script
- [ ] Charger dans InterfaceV2.html
- [ ] Vérifier : Pas d'erreur `ReferenceError: global is not defined`
- [ ] Vérifier : `window.GroupsAlgorithmV4` existe
- [ ] Statut : ⏳ À TESTER

#### Test 3 : Génération de groupes
- [ ] Configurer les 3 phases
- [ ] Cliquer sur "Générer les groupes"
- [ ] Vérifier : Pas d'erreur console
- [ ] Vérifier : Résultats affichés
- [ ] Statut : ⏳ À TESTER

---

### Phase 3 : Validation fonctionnelle 🔄

- [ ] **Chargement du module** : Pas d'erreur ReferenceError
- [ ] **Disponibilité de la classe** : `window.GroupsAlgorithmV4` défini
- [ ] **Instanciation** : `new GroupsAlgorithmV4()` fonctionne
- [ ] **Génération** : `algorithm.generateGroups(payload)` retourne des résultats
- [ ] **Passes multiples** : Plusieurs passes traitées correctement

---

## 🎯 Plan d'action court terme

### Immédiat (Jour 1) ✅
- [x] Appliquer la correction dans le code
- [x] Créer la documentation détaillée
- [x] Créer cette checklist

### Court terme (Jour 2) 🔄
- [ ] Tester en navigateur standard
- [ ] Tester en Google Apps Script
- [ ] Valider la génération de groupes
- [ ] Vérifier pas d'erreurs console

### Moyen terme (Jour 3-4) 🔄
- [ ] Déployer en production
- [ ] Monitorer les erreurs
- [ ] Valider avec utilisateurs
- [ ] Mettre à jour la documentation principale

---

## 🔍 Points de vérification détaillés

### Vérification 1 : Pas d'erreur au chargement

**Avant la correction** :
```
Console:
❌ ReferenceError: global is not defined
   at GroupsAlgorithmV4_Distribution.js:498
```

**Après la correction** :
```
Console:
✅ (Aucune erreur)
```

**Test** :
```javascript
// Dans la console du navigateur
console.log(window.GroupsAlgorithmV4);
// Résultat attendu: [Function: GroupsAlgorithmV4]
```

---

### Vérification 2 : Instanciation possible

**Test** :
```javascript
const algo = new window.GroupsAlgorithmV4();
console.log(algo);
// Résultat attendu: GroupsAlgorithmV4 { scenarioWeights: {...}, thresholds: {...} }
```

---

### Vérification 3 : Génération fonctionne

**Test** :
```javascript
const payload = {
  students: [
    { id: "E1", scoreM: 15, scoreF: 14, sexe: "F", classe: "6°1" },
    { id: "E2", scoreM: 12, scoreF: 13, sexe: "M", classe: "6°1" }
  ],
  scenario: 'needs',
  distributionMode: 'heterogeneous',
  associations: [
    { name: "Passe A", classes: ["6°1"], groupCount: 2 }
  ]
};

const result = algo.generateGroups(payload);
console.log(result);
// Résultat attendu: { success: true, passes: [...] }
```

---

## 📊 Environnements à tester

| Environnement | `window` | `global` | `globalThis` | Attendu | Statut |
|---------------|----------|----------|--------------|---------|--------|
| Chrome/Firefox | ✅ | ❌ | ✅ | ✅ Fonctionne | ⏳ À tester |
| Safari | ✅ | ❌ | ✅ | ✅ Fonctionne | ⏳ À tester |
| Edge | ✅ | ❌ | ✅ | ✅ Fonctionne | ⏳ À tester |
| Google Apps Script | ❌ | ❌ | ✅ | ✅ Fonctionne | ⏳ À tester |
| Node.js (si applicable) | ❌ | ✅ | ✅ | ✅ Fonctionne | ⏳ À tester |

---

## 🚨 Critères de validation

### Critère 1 : Pas d'erreur ReferenceError ✅
- [x] Code corrigé
- [ ] Testé en navigateur
- [ ] Testé en Google Apps Script

### Critère 2 : Module chargé ✅
- [x] `window.GroupsAlgorithmV4` existe
- [ ] Instanciation possible
- [ ] Pas d'erreur console

### Critère 3 : Génération fonctionne ✅
- [x] Algorithme branché à l'UI
- [ ] Résultats générés
- [ ] Passes multiples supportées

---

## 📝 Snippet de test pour Google Apps Script

### Test rapide dans la console Apps Script

```javascript
// 1. Vérifier que la classe est disponible
if (typeof GroupsAlgorithmV4 !== 'undefined') {
  Logger.log('✅ GroupsAlgorithmV4 disponible');
} else {
  Logger.log('❌ GroupsAlgorithmV4 non disponible');
}

// 2. Tester l'instanciation
try {
  const algo = new GroupsAlgorithmV4();
  Logger.log('✅ Instanciation réussie');
  Logger.log(algo);
} catch (error) {
  Logger.log('❌ Erreur d\'instanciation: ' + error.message);
}

// 3. Tester la génération
try {
  const payload = {
    students: [
      { id: "E1", scoreM: 15, scoreF: 14, sexe: "F", classe: "6°1" }
    ],
    scenario: 'needs',
    distributionMode: 'heterogeneous',
    associations: [
      { name: "Test", classes: ["6°1"], groupCount: 1 }
    ]
  };
  
  const result = algo.generateGroups(payload);
  Logger.log('✅ Génération réussie');
  Logger.log(result);
} catch (error) {
  Logger.log('❌ Erreur de génération: ' + error.message);
}
```

---

## 🔧 Configuration pour Google Apps Script

### Option 1 : Utiliser globalThis (RECOMMANDÉ)

Le code corrigé utilise déjà `globalThis` qui est supporté nativement par Google Apps Script.

**Aucune configuration supplémentaire nécessaire** ✅

### Option 2 : Polyfill (si globalThis non disponible)

Si vous utilisez une ancienne version de Google Apps Script :

```javascript
// À ajouter AVANT le chargement de GroupsAlgorithmV4_Distribution.js
if (typeof globalThis === 'undefined') {
  var globalThis = this;
}
```

---

## 📈 Métriques de succès

### Avant la correction
- ❌ Taux d'erreur : 100% (ReferenceError systématique)
- ❌ Génération de groupes : 0%
- ❌ Utilisateurs bloqués : 100%

### Après la correction (attendu)
- ✅ Taux d'erreur : 0%
- ✅ Génération de groupes : 100%
- ✅ Utilisateurs bloqués : 0%

---

## 🎓 Conclusion

La correction a été **appliquée dans le code** et est **prête à être testée**.

### Prochaines étapes immédiates :

1. ✅ **Code corrigé** (FAIT)
2. ⏳ **Tester en navigateur** (À FAIRE)
3. ⏳ **Tester en Google Apps Script** (À FAIRE)
4. ⏳ **Valider la génération** (À FAIRE)
5. ⏳ **Déployer en production** (À FAIRE)

### Responsabilités :

- **Développeur** : Tester les 3 environnements
- **Testeur** : Valider le workflow complet
- **Déployeur** : Mettre en production après validation

**Statut global** : ✅ **CORRECTION APPLIQUÉE - EN ATTENTE DE VALIDATION**
