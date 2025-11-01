# Guide d'Intégration - Module Groupes V4

## Fichiers créés

### 1. **InterfaceV2_GroupsModuleV4_Script.js**
Classe `ModuleGroupsV4` contenant toute la logique du module.
- État centralisé
- Gestion des 3 phases
- Persistance localStorage
- Validation progressive

### 2. **InterfaceV2_GroupsModuleV4_Standalone.html**
Version complète et testable du module (HTML + CSS inline).
- Structure en 3 colonnes
- Modal "Nouvelle association"
- Responsive design
- Prêt à tester en standalone

### 3. **InterfaceV2_GroupsModuleV4_Part1.html**
Structure HTML/CSS avec Tailwind (optionnel, pour référence).

### 4. **DOCUMENTATION_GROUPS_MODULE_V4.md**
Documentation complète du module.

## Étapes d'intégration dans InterfaceV2

### Étape 1 : Tester le module en standalone

Ouvrez `InterfaceV2_GroupsModuleV4_Standalone.html` dans un navigateur pour vérifier :
- ✅ Les 3 phases s'affichent correctement
- ✅ La navigation entre phases fonctionne
- ✅ Le modal "Nouvelle association" s'ouvre/ferme
- ✅ Les sélections sont persistées

### Étape 2 : Intégrer le script dans InterfaceV2

**Dans InterfaceV2.html**, ajouter avant la fermeture `</body>` :

```html
<!-- Module Groupes V4 -->
<script src="InterfaceV2_GroupsModuleV4_Script.js"></script>
```

### Étape 3 : Ajouter le conteneur du module

**Dans InterfaceV2.html**, ajouter un conteneur pour le module (ex: dans une section cachée) :

```html
<!-- Conteneur Module Groupes V4 -->
<div id="groups-module-v4-container" style="display: none;">
  <!-- Le module sera injecté ici -->
</div>
```

### Étape 4 : Créer un bouton pour ouvrir le module

**Dans le header ou menu Admin** :

```html
<button id="open-groups-module" class="btn btn-primary">
  <i class="fas fa-object-group"></i> Module Groupes
</button>
```

**Ajouter l'event listener** :

```javascript
document.getElementById('open-groups-module')?.addEventListener('click', () => {
  // Afficher le module
  const container = document.getElementById('groups-module-v4-container');
  if (container) {
    container.style.display = 'block';
    // Initialiser si pas déjà fait
    if (!window.ModuleGroupsV4Instance) {
      window.ModuleGroupsV4Instance = new ModuleGroupsV4();
    }
  }
});
```

### Étape 5 : Adapter le HTML du module

**Option A : Injection dynamique** (recommandée)

Créer une fonction pour injecter le HTML du module :

```javascript
function initGroupsModuleV4() {
  const container = document.getElementById('groups-module-v4-container');
  if (!container) return;

  container.innerHTML = `
    <div id="groups-module-v4" style="...">
      <!-- Copier le HTML de InterfaceV2_GroupsModuleV4_Standalone.html -->
      <!-- Entre <div id="groups-module-v4"> et </div> -->
    </div>
  `;

  // Initialiser le module
  window.ModuleGroupsV4Instance = new ModuleGroupsV4();
}
```

**Option B : Inclure directement** (plus simple)

Copier le HTML du module directement dans InterfaceV2.html.

### Étape 6 : Adapter les styles

Le module utilise des styles CSS purs (pas de dépendances externes sauf Font Awesome).

Si vous utilisez Tailwind dans InterfaceV2, les styles du module fonctionneront quand même car ils sont en CSS pur.

## Connexion au backend

### Charger les classes

Modifier la méthode `renderClassesSelector()` pour charger les vraies classes :

```javascript
renderClassesSelector() {
  const container = document.getElementById('classes-selector');
  if (!container) return;

  // Appeler le backend pour récupérer les classes
  google.script.run.withSuccessHandler((classes) => {
    this.state.loadedClasses = classes;
    
    container.innerHTML = classes.map(cls => `
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
  }).getAvailableClasses();
}
```

### Générer les groupes

Ajouter une méthode pour appeler `generateGroupsV4` :

```javascript
generateGroups() {
  if (this.state.currentPhase !== 3) return;

  this.state.isLoading = true;
  this.render();

  const payload = {
    scenario: this.state.scenario,
    distributionMode: this.state.distributionMode,
    associations: this.state.associations
  };

  google.script.run
    .withSuccessHandler((result) => {
      this.state.generatedGroups = result.groups;
      this.state.isLoading = false;
      this.state.currentPhase = 4; // Aller à la phase 4 (affichage des groupes)
      this.render();
    })
    .withFailureHandler((error) => {
      this.state.error = error;
      this.state.isLoading = false;
      this.render();
    })
    .generateGroupsV4(payload);
}
```

Appeler cette méthode quand on clique "Continuer" à la phase 3 :

```javascript
nextPhase() {
  if (this.state.currentPhase === 3 && this.canAdvancePhase()) {
    this.generateGroups();
    return;
  }
  
  if (this.state.currentPhase < this.state.totalPhases) {
    this.state.currentPhase++;
    this.render();
    document.getElementById('current-phase').textContent = this.state.currentPhase;
  }
}
```

## Modifications minimales à InterfaceV2

✅ **À faire** :
- Ajouter le script du module
- Ajouter un bouton pour ouvrir le module
- Ajouter le conteneur du module

❌ **À NE PAS FAIRE** :
- Modifier le header existant
- Modifier les autres boutons
- Modifier interfaceV2 core
- Modifier les autres modules

## Vérification de l'intégration

Checklist :

- [ ] Le script `InterfaceV2_GroupsModuleV4_Script.js` est chargé
- [ ] Le conteneur du module est présent dans le DOM
- [ ] Le bouton "Module Groupes" ouvre le module
- [ ] Les 3 phases s'affichent correctement
- [ ] La navigation entre phases fonctionne
- [ ] Le modal "Nouvelle association" s'ouvre/ferme
- [ ] Les sélections sont persistées (localStorage)
- [ ] Le bouton "Continuer" se désactive/active correctement
- [ ] Les autres modules d'InterfaceV2 fonctionnent toujours
- [ ] Le header n'a pas changé

## Dépannage

### Le module ne s'affiche pas

1. Vérifier que le script est chargé : `console.log(window.ModuleGroupsV4)`
2. Vérifier que le conteneur existe : `document.getElementById('groups-module-v4-container')`
3. Vérifier la console pour les erreurs JavaScript

### Les styles ne s'appliquent pas

1. Le module utilise du CSS pur, pas de dépendances externes
2. Vérifier que Font Awesome est chargé (pour les icônes)
3. Vérifier les conflits CSS avec InterfaceV2

### Le localStorage ne persiste pas

1. Vérifier que localStorage est activé
2. Vérifier la clé : `localStorage.getItem('moduleGroupsV4State')`
3. Vérifier les limites de stockage

## Prochaines phases

### Phase 4 : Affichage des groupes générés
- Tableau des regroupements activables
- Cartes de groupes
- Barre d'actions (sauvegarde TEMP, finalisation, retour)

### Phase 5 : Swaps et statistiques
- Moteur de swaps côté client (drag & drop)
- Panneau latéral de statistiques
- Menu "Comparer"

### Phase 6 : Sauvegardes et finalisation
- saveTempGroupsV4
- finalizeTempGroupsV4
- Métadonnées de suivi

## Support

Pour toute question ou problème :
1. Consulter `DOCUMENTATION_GROUPS_MODULE_V4.md`
2. Vérifier les fichiers créés
3. Tester en standalone d'abord
4. Vérifier la console pour les erreurs
