# Audit Critique - Module Groupes V4

## 🔴 Problèmes CRITIQUES

### 1. Données fictives dans le sélecteur
**Sévérité** : CRITIQUE | **Score** : 2/10

```javascript
// ❌ CODÉ EN DUR - NE REFLÈTE PAS LES VRAIES CLASSES
renderClassesSelector() {
  const classes = ['6°1', '6°2', '6°3', '6°4'];
}
```

**Impact** : Impossible de tester en conditions réelles

**Solution** :
```javascript
// ✅ À IMPLÉMENTER
renderClassesSelector() {
  const classes = this.state.loadedClasses;
  // Ou charger du backend
  google.script.run.withSuccessHandler((classes) => {
    this.state.loadedClasses = classes;
    this.render();
  }).getAvailableClasses();
}
```

---

### 2. Fuites mémoire - Événements non nettoyés
**Sévérité** : CRITIQUE | **Score** : 2/10

```javascript
// ❌ LISTENERS RECRÉÉS À CHAQUE RENDER
setupEventListeners() {
  document.getElementById('close-module')?.addEventListener('click', () => {
    this.close();
  });
  // Chaque render() → doublons d'événements
}
```

**Solution** :
```javascript
// ✅ À IMPLÉMENTER
setupEventListeners() {
  this.removeEventListeners();
  this.listeners = [];
  
  const closeBtn = document.getElementById('close-module');
  if (closeBtn) {
    const handler = () => this.close();
    closeBtn.addEventListener('click', handler);
    this.listeners.push({ element: closeBtn, event: 'click', handler });
  }
}

removeEventListeners() {
  if (this.listeners) {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
}
```

---

### 3. Algorithme non branché à l'UI
**Sévérité** : CRITIQUE | **Score** : 1/10

```javascript
// ❌ AUCUNE INTÉGRATION AVEC L'ALGORITHME
nextPhase() {
  if (this.state.currentPhase < this.state.totalPhases) {
    this.state.currentPhase++;
    this.render();
  }
  // Pas d'appel à l'algorithme
}
```

**Solution** :
```javascript
// ✅ À IMPLÉMENTER
generateGroups() {
  const payload = {
    students: this.state.loadedClasses,
    scenario: this.state.scenario,
    distributionMode: this.state.distributionMode,
    associations: this.state.associations
  };
  
  if (window.GroupsAlgorithmV4) {
    const algorithm = new window.GroupsAlgorithmV4();
    const result = algorithm.generateGroups(payload);
    
    if (result.success) {
      this.state.generatedGroups = result.groups;
      this.state.statistics = result.statistics;
      this.state.alerts = result.alerts;
      this.state.currentPhase = 4;
    }
  }
  this.render();
}
```

---

### 4. Gestion incomplète des données manquantes
**Sévérité** : CRITIQUE | **Score** : 2/10

```javascript
// ❌ SI TOUS LES SCORES SONT VIDES → NaN
calculateMean(group, field) {
  const values = group.map(s => s[field]);
  // Si values = [undefined, undefined, ...] → NaN
}
```

**Solution** :
```javascript
// ✅ À IMPLÉMENTER
normalizeScores(students) {
  const fields = ['scoreM', 'scoreF', 'com', 'tra', 'part', 'abs'];
  const stats = {};
  
  fields.forEach(field => {
    const values = students
      .map(s => s[field])
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (values.length === 0) {
      stats[field] = { mean: 0, stdDev: 1 }; // Valeur par défaut
      return;
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance) || 1;
    
    stats[field] = { mean, stdDev };
  });
  
  return normalized;
}
```

---

### 5. Passes non traitées par l'algorithme
**Sévérité** : CRITIQUE | **Score** : 1/10

```javascript
// ❌ L'ALGORITHME IGNORE LES PASSES
generateGroups(payload) {
  // payload.associations = [{ name: "Passe A", classes: [...] }]
  // Mais on utilise payload.numGroups directement
}
```

**Solution** :
```javascript
// ✅ À IMPLÉMENTER
generateGroups(payload) {
  const results = [];
  
  for (const pass of payload.associations) {
    const studentsForPass = payload.students.filter(s => 
      pass.classes.includes(s.classe)
    );
    
    const passResult = this.generateGroupsForPass({
      students: studentsForPass,
      scenario: payload.scenario,
      distributionMode: payload.distributionMode,
      numGroups: pass.groupCount
    });
    
    results.push({
      passName: pass.name,
      groups: passResult.groups,
      statistics: passResult.statistics
    });
  }
  
  return { success: true, passes: results };
}
```

---

## 🟡 Problèmes HAUTS

### 6. Actions non implémentées
**Sévérité** : HAUTE | **Score** : 3/10

Boutons sans handlers : Renommer, Dupliquer, Supprimer

**Solution** : Implémenter les handlers

---

### 7. Seuils statiques
**Sévérité** : HAUTE | **Score** : 3/10

```javascript
// ❌ CODÉS EN DUR
this.thresholds = {
  parityGap: 1,
  criteriaDeviation: 0.10
};
```

**Solution** : Paramétrer via config

---

### 8. Swap de parité limité
**Sévérité** : HAUTE | **Score** : 4/10

Un seul swap → équilibrage incomplet

**Solution** : Boucle avec maxAttempts

---

## 📋 Checklist de correction

- [ ] Charger les vraies classes du backend
- [ ] Nettoyer les événements (removeEventListeners)
- [ ] Brancher l'algorithme à l'UI
- [ ] Traiter les passes successives
- [ ] Gérer les données manquantes
- [ ] Implémenter les actions (Renommer, Dupliquer, Supprimer)
- [ ] Améliorer le feedback d'erreur
- [ ] Rendre la configuration dynamique
- [ ] Améliorer la validation des contraintes
- [ ] Tester avec données réelles

---

## 🎯 Prochaines étapes

1. **Immédiat** : Corriger les 5 problèmes CRITIQUES
2. **Court terme** : Corriger les 3 problèmes HAUTS
3. **Avant production** : Tester avec données réelles
