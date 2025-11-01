# Plan de Correction - Module Groupes V4

## 📋 Résumé

**Audit** : 5 problèmes CRITIQUES + 3 problèmes HAUTS
**Effort estimé** : 8-10 heures
**Priorité** : Immédiate avant la production

---

## 🔴 PHASE 1 : CORRECTIONS CRITIQUES (Jour 1-2)

### Correction 1 : Charger les vraies classes
**Fichier** : InterfaceV2_GroupsModuleV4_Script.js
**Ligne** : ~509-528
**Temps** : 1h

```javascript
// AVANT
renderClassesSelector() {
  const classes = ['6°1', '6°2', '6°3', '6°4'];
}

// APRÈS
renderClassesSelector() {
  const container = document.getElementById('classes-selector');
  if (!container) return;
  
  // Option 1 : Charger du backend
  if (this.state.loadedClasses.length === 0) {
    google.script.run.withSuccessHandler((classes) => {
      this.state.loadedClasses = classes;
      this.renderClassesSelector();
    }).getAvailableClasses();
    return;
  }
  
  // Option 2 : Utiliser les classes chargées
  container.innerHTML = this.state.loadedClasses.map(cls => `
    <label class="checkbox-label">
      <input type="checkbox" class="class-checkbox" value="${cls}" />
      <span>${cls}</span>
    </label>
  `).join('');
  
  container.querySelectorAll('.class-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      this.updateSelectedClasses();
    });
  });
}
```

---

### Correction 2 : Nettoyer les événements
**Fichier** : InterfaceV2_GroupsModuleV4_Script.js
**Ligne** : ~93-140
**Temps** : 1.5h

```javascript
// AVANT
setupEventListeners() {
  document.getElementById('close-module')?.addEventListener('click', () => {
    this.close();
  });
  // ... autres listeners
}

// APRÈS
constructor() {
  // ... state, scenarios, distributionModes
  this.listeners = []; // Tracker les listeners
}

setupEventListeners() {
  this.removeEventListeners(); // Nettoyer d'abord
  
  // Close button
  const closeBtn = document.getElementById('close-module');
  if (closeBtn) {
    const handler = () => this.close();
    closeBtn.addEventListener('click', handler);
    this.listeners.push({ element: closeBtn, event: 'click', handler });
  }
  
  // Continue button
  const continueBtn = document.getElementById('continue-button');
  if (continueBtn) {
    const handler = () => this.nextPhase();
    continueBtn.addEventListener('click', handler);
    this.listeners.push({ element: continueBtn, event: 'click', handler });
  }
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    const handler = () => this.closeModal();
    btn.addEventListener('click', handler);
    this.listeners.push({ element: btn, event: 'click', handler });
  });
  
  // Scenario cards
  document.querySelectorAll('.scenario-card:not(.disabled)').forEach(card => {
    const handler = () => {
      this.selectScenario(card.dataset.scenario);
    };
    card.addEventListener('click', handler);
    this.listeners.push({ element: card, event: 'click', handler });
  });
  
  // ... autres listeners
}

removeEventListeners() {
  this.listeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  this.listeners = [];
}

render() {
  this.removeEventListeners(); // Nettoyer avant de re-rendre
  // ... rendu HTML
  this.setupEventListeners(); // Ajouter les nouveaux listeners
}
```

---

### Correction 3 : Brancher l'algorithme
**Fichier** : InterfaceV2_GroupsModuleV4_Script.js
**Ligne** : ~478-491
**Temps** : 2h

```javascript
// AVANT
nextPhase() {
  if (this.state.currentPhase < this.state.totalPhases) {
    this.state.currentPhase++;
    this.render();
  }
}

// APRÈS
nextPhase() {
  // Phase 3 → Générer les groupes
  if (this.state.currentPhase === 3 && this.canAdvancePhase()) {
    this.generateGroups();
    return;
  }
  
  // Autres phases → Avancer
  if (this.state.currentPhase < this.state.totalPhases) {
    this.state.currentPhase++;
    this.render();
  }
}

generateGroups() {
  console.log('🚀 Génération des groupes...');
  this.state.isLoading = true;
  this.render();
  
  // Préparer le payload
  const payload = {
    students: this.state.loadedClasses,
    scenario: this.state.scenario,
    distributionMode: this.state.distributionMode,
    associations: this.state.associations
  };
  
  // Appeler l'algorithme
  if (window.GroupsAlgorithmV4) {
    try {
      const algorithm = new window.GroupsAlgorithmV4();
      const result = algorithm.generateGroups(payload);
      
      if (result.success) {
        this.state.generatedGroups = result.passes || result.groups;
        this.state.statistics = result.statistics;
        this.state.alerts = result.alerts;
        this.state.currentPhase = 4; // Phase 4 : Affichage
        console.log('✅ Génération réussie');
      } else {
        this.state.error = result.error || 'Erreur inconnue';
        console.error('❌ Erreur:', this.state.error);
      }
    } catch (error) {
      this.state.error = error.message;
      console.error('❌ Exception:', error);
    }
  } else {
    this.state.error = 'Algorithme non disponible';
    console.error('❌ GroupsAlgorithmV4 non trouvé');
  }
  
  this.state.isLoading = false;
  this.render();
}
```

---

### Correction 4 : Gérer les données manquantes
**Fichier** : GroupsAlgorithmV4_Distribution.js
**Ligne** : ~102-145
**Temps** : 1.5h

```javascript
// AVANT
normalizeScores(students) {
  const fields = ['scoreM', 'scoreF', 'com', 'tra', 'part', 'abs'];
  const stats = {};
  
  fields.forEach(field => {
    const values = students.map(s => s[field]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    stats[field] = { mean, stdDev };
  });
}

// APRÈS
normalizeScores(students) {
  const fields = ['scoreM', 'scoreF', 'com', 'tra', 'part', 'abs'];
  const stats = {};
  
  fields.forEach(field => {
    // Filtrer les valeurs valides
    const values = students
      .map(s => s[field])
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    
    // Guard : si aucune valeur valide
    if (values.length === 0) {
      console.warn(`⚠️ Aucune valeur valide pour ${field}`);
      stats[field] = { mean: 0, stdDev: 1 };
      return;
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance) || 1; // Éviter division par 0
    
    stats[field] = { mean, stdDev };
  });
  
  // Appliquer z-scores avec guards
  const normalized = students.map(student => {
    const normalized = { ...student };
    
    fields.forEach(field => {
      const value = student[field];
      const { mean, stdDev } = stats[field];
      
      if (value === null || value === undefined || isNaN(value)) {
        normalized[`z_${field}`] = 0; // Valeur neutre
      } else {
        normalized[`z_${field}`] = stdDev > 0 ? (value - mean) / stdDev : 0;
      }
    });
    
    return normalized;
  });
  
  return normalized;
}
```

---

### Correction 5 : Traiter les passes successives
**Fichier** : GroupsAlgorithmV4_Distribution.js
**Ligne** : ~364-406
**Temps** : 2h

```javascript
// AVANT
generateGroups(payload) {
  const consolidated = this.consolidateData(payload.students, payload.scenario);
  // ... étapes 1-7
  return { success: true, groups, statistics, alerts };
}

// APRÈS
generateGroups(payload) {
  console.log('🚀 Génération des groupes V4...');
  
  // Cas 1 : Passes multiples
  if (payload.associations && payload.associations.length > 0) {
    return this.generateGroupsWithPasses(payload);
  }
  
  // Cas 2 : Génération simple
  return this.generateGroupsForPass(payload);
}

generateGroupsWithPasses(payload) {
  const results = [];
  
  for (const pass of payload.associations) {
    console.log(`📋 Traitement de la passe: ${pass.name}`);
    
    // Filtrer les élèves de cette passe
    const studentsForPass = payload.students.filter(s => 
      pass.classes.includes(s.classe)
    );
    
    if (studentsForPass.length === 0) {
      console.warn(`⚠️ Aucun élève pour la passe ${pass.name}`);
      continue;
    }
    
    // Générer les groupes pour cette passe
    const passPayload = {
      students: studentsForPass,
      scenario: payload.scenario,
      distributionMode: payload.distributionMode,
      numGroups: pass.groupCount
    };
    
    const passResult = this.generateGroupsForPass(passPayload);
    
    results.push({
      passName: pass.name,
      passId: pass.id,
      groups: passResult.groups,
      statistics: passResult.statistics,
      alerts: passResult.alerts
    });
  }
  
  return {
    success: results.length > 0,
    passes: results,
    totalPasses: results.length,
    timestamp: new Date().toISOString(),
    metadata: payload
  };
}

generateGroupsForPass(payload) {
  try {
    const consolidated = this.consolidateData(payload.students, payload.scenario);
    const normalized = this.normalizeScores(consolidated);
    const indexed = this.calculateCompositeIndex(normalized, payload.scenario);
    
    let groups;
    if (payload.distributionMode === 'heterogeneous') {
      groups = this.distributeHeterogeneous(indexed, payload.numGroups);
    } else {
      groups = this.distributeHomogeneous(indexed, payload.numGroups);
    }
    
    this.balanceParityInGroups(groups);
    const statistics = this.calculateGroupStatistics(groups);
    const alerts = this.validateConstraints(groups, statistics);
    
    return {
      success: true,
      groups,
      statistics,
      alerts
    };
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

## 🟡 PHASE 2 : CORRECTIONS HAUTES (Jour 3)

### Correction 6 : Implémenter les actions
**Fichier** : InterfaceV2_GroupsModuleV4_Script.js
**Temps** : 1.5h

```javascript
handleRenameAssociation(assocId) {
  const newName = prompt('Nouveau nom:');
  if (newName) {
    const assoc = this.state.associations.find(a => a.id === assocId);
    if (assoc) {
      assoc.name = newName;
      this.render();
    }
  }
}

handleDuplicateAssociation(assocId) {
  const original = this.state.associations.find(a => a.id === assocId);
  if (original) {
    const duplicate = {
      ...original,
      id: `assoc-${Date.now()}`,
      name: `${original.name} (copie)`
    };
    this.state.associations.push(duplicate);
    this.render();
  }
}

handleDeleteAssociation(assocId) {
  if (confirm('Supprimer cette association ?')) {
    this.state.associations = this.state.associations.filter(a => a.id !== assocId);
    this.render();
  }
}
```

---

### Correction 7 : Améliorer le feedback d'erreur
**Fichier** : InterfaceV2_GroupsModuleV4_Script.js
**Temps** : 1h

```javascript
// Utiliser des messages inline au lieu d'alert()
showInlineError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `<p style="color: #dc2626; font-size: 0.875rem;">${message}</p>`;
  }
}

validateNewAssociation() {
  const selectedCount = this.state.selectedClassesForModal.length;
  const passName = document.getElementById('pass-name').value;
  const numGroups = parseInt(document.getElementById('num-groups').value);
  
  if (selectedCount < 2) {
    this.showInlineError('pass-validation-info', 
      '❌ Sélectionnez au moins 2 classes');
    return;
  }
  
  if (!passName.trim()) {
    this.showInlineError('pass-validation-info', 
      '❌ Entrez un nom pour la passe');
    return;
  }
  
  if (numGroups < 2 || numGroups > 10) {
    this.showInlineError('pass-validation-info', 
      '❌ Le nombre de groupes doit être entre 2 et 10');
    return;
  }
  
  this.createAssociation(passName, numGroups);
}
```

---

### Correction 8 : Rendre la configuration dynamique
**Fichier** : GroupsAlgorithmV4_Distribution.js
**Temps** : 1h

```javascript
constructor(config = {}) {
  this.config = {
    parityGap: config.parityGap || 1,
    criteriaDeviation: config.criteriaDeviation || 0.10,
    maxSwapAttempts: config.maxSwapAttempts || 5,
    verbose: config.verbose || false
  };
  
  this.scenarioWeights = config.scenarioWeights || {
    needs: { math: 0.30, french: 0.30, com: 0.15, tra: 0.15, part: 0.05, abs: -0.05 },
    lv2: { math: 0.20, french: 0.35, com: 0.10, tra: 0.10, part: 0.20, abs: -0.05 },
    options: { math: 0.25, french: 0.25, com: 0.15, tra: 0.15, part: 0.10, abs: -0.05 }
  };
}

// Utilisation
const algorithm = new GroupsAlgorithmV4({
  parityGap: 0,
  criteriaDeviation: 0.05,
  verbose: true
});
```

---

## ✅ Checklist de correction

### Phase 1 (Jour 1-2)
- [ ] Charger les vraies classes
- [ ] Nettoyer les événements
- [ ] Brancher l'algorithme
- [ ] Gérer les données manquantes
- [ ] Traiter les passes

### Phase 2 (Jour 3)
- [ ] Implémenter les actions
- [ ] Améliorer le feedback
- [ ] Rendre la configuration dynamique

### Phase 3 (Jour 4)
- [ ] Tester avec données réelles
- [ ] Valider les résultats
- [ ] Documenter les changements

---

## 📊 Effort estimé

| Correction | Temps | Priorité |
|-----------|-------|----------|
| Classes réelles | 1h | CRITIQUE |
| Nettoyage événements | 1.5h | CRITIQUE |
| Branchement algorithme | 2h | CRITIQUE |
| Données manquantes | 1.5h | CRITIQUE |
| Passes successives | 2h | CRITIQUE |
| Actions manquantes | 1.5h | HAUTE |
| Feedback erreur | 1h | HAUTE |
| Configuration dynamique | 1h | HAUTE |
| **TOTAL** | **11h** | - |

---

## 🎯 Résultat attendu

Après ces corrections :
- ✅ Module complètement fonctionnel
- ✅ Pas de fuites mémoire
- ✅ Algorithme intégré et testé
- ✅ Données réelles chargées
- ✅ Passes multiples supportées
- ✅ Feedback utilisateur amélioré
- ✅ Configuration flexible
