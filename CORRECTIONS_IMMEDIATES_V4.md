# 🔧 CORRECTIONS IMMÉDIATES - Code exact à appliquer

**Durée totale** : 22 minutes
**Urgence** : 🔴 CRITIQUE

---

## CORRECTION 1: Inclusions Server-Side (2 min)

### Fichier: InterfaceV2_GroupsModuleV4_Part1.html

**LOCALISER** (ligne ~314-315):
```html
<script src="InterfaceV4_Triptyque_Logic.js"></script>
<script src="InterfaceV2_GroupsModuleV4_Script.js"></script>
```

**REMPLACER PAR**:
```html
<?!= include('InterfaceV4_Triptyque_Logic') ?>
<?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
```

---

### Fichier: InterfaceV2_GroupsModuleV4_Standalone.html

**LOCALISER** (ligne ~539-540):
```html
<script src="InterfaceV4_Triptyque_Logic.js"></script>
<script src="InterfaceV2_GroupsModuleV4_Script.js"></script>
```

**REMPLACER PAR**:
```html
<?!= include('InterfaceV4_Triptyque_Logic') ?>
<?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
```

---

## CORRECTION 2: Refuser DEFAULT_CLASSES (5 min)

### Fichier: InterfaceV4_Triptyque_Logic.js

**LOCALISER** (ligne ~26-33):
```javascript
const DEFAULT_CLASSES = [
  { id: '6-1', label: '6°1' },
  { id: '6-2', label: '6°2' },
  { id: '6-3', label: '6°3' },
  { id: '6-4', label: '6°4' },
  { id: '6-5', label: '6°5' }
];
```

**REMPLACER PAR**:
```javascript
// ❌ REFUSÉ - Données réelles obligatoires (ORDRE 3)
const DEFAULT_CLASSES = null;
```

---

**LOCALISER** (ligne ~138-140):
```javascript
// 3. Fallback sur DEFAULT_CLASSES (développement uniquement)
console.warn('⚠️ Aucune donnée de classe trouvée, utilisation des classes par défaut');
return DEFAULT_CLASSES;
```

**REMPLACER PAR**:
```javascript
// 3. ❌ REFUSER DEFAULT_CLASSES - exiger injection réelle
console.error('❌ CRITIQUE : Aucune donnée de classe disponible !');
console.error('   window.STATE.classesData = ', windowRef.STATE?.classesData);
console.error('   GROUPS_MODULE_V4_DATA = ', windowRef.GROUPS_MODULE_V4_DATA);
console.error('   ➜ Phase 1 Fix: Utiliser <?!= include() ?> au lieu de <script src>');
console.error('   ➜ Phase 2 Fix: Vérifier injection GROUPS_MODULE_V4_DATA ligne 1436 CoreScript.html');
this.state.error = '❌ Données classes manquantes - Module V4 non disponible';
return [];
```

---

## CORRECTION 3: Connecter Event Listener (10 min)

### Fichier: InterfaceV2_GroupsModuleV4_Script.js

**LOCALISER** (fin du fichier, après instanciation):
```javascript
// Créer l'instance du triptyque
this.triptyque = new windowRef.TriptychGroupsModule(trRoot);
console.log('✅ TriptychGroupsModule instancié');
```

**AJOUTER APRÈS**:
```javascript
// ✅ ORDRE 3 FIX : Écouter l'événement groups:generate
// et connecter au moteur GroupsAlgorithmV4
if (trRoot) {
  trRoot.addEventListener('groups:generate', (event) => {
    console.log('🚀 Event groups:generate reçu avec payload:', event.detail);

    if (typeof windowRef.GroupsAlgorithmV4 === 'undefined') {
      console.error('❌ GroupsAlgorithmV4 non disponible');
      console.error('   ➜ Vérifier inclusion GroupsAlgorithmV4_Distribution.js');
      trRoot.dispatchEvent(new CustomEvent('groups:error', {
        detail: { message: 'Algorithme non disponible' }
      }));
      return;
    }

    try {
      // Instancier l'algorithme et générer
      const algorithm = new windowRef.GroupsAlgorithmV4();
      const result = algorithm.generateGroups(event.detail);

      if (result.success) {
        console.log('✅ Génération réussie');
        console.log('   Passes:', result.passes?.length || 0);
        console.log('   Stats:', result.statistics);

        // Retourner les résultats au triptyque
        trRoot.dispatchEvent(new CustomEvent('groups:generated', {
          detail: result
        }));
      } else {
        console.error('❌ Génération échouée:', result.error);
        trRoot.dispatchEvent(new CustomEvent('groups:error', {
          detail: { message: result.error }
        }));
      }
    } catch (error) {
      console.error('❌ Exception génération:', error);
      trRoot.dispatchEvent(new CustomEvent('groups:error', {
        detail: { message: error.message }
      }));
    }
  });

  console.log('✅ Event listener groups:generate attaché');
}
```

---

## CORRECTION 4: Vérifier injection GROUPS_MODULE_V4_DATA

### Fichier: InterfaceV2_CoreScript.html

**VÉRIFIER** (ligne ~1436 dans loadDataForMode):
```javascript
window.GROUPS_MODULE_V4_DATA = {
  classes: v4Classes,
  students: v4Students,
  scenarios: v4Scenarios
};

console.log('✅ GROUPS_MODULE_V4_DATA injecté:', {
  classes: window.GROUPS_MODULE_V4_DATA.classes.length,
  students: window.GROUPS_MODULE_V4_DATA.students.length,
  scenarios: window.GROUPS_MODULE_V4_DATA.scenarios.length
});
```

**SI MANQUANT**, ajouter cette injection dans loadDataForMode() après getClassesData()

---

## TEST CHAQUE CORRECTION

### ✅ Test Correction 1 (Inclusions)
```
1. Ouvrir InterfaceV2_GroupsModuleV4_Part1.html
2. Console: vérifier pas d'erreur 404
3. Vérifier: "TriptychGroupsModule initialisé" en console
```

### ✅ Test Correction 2 (DEFAULT_CLASSES)
```
1. Charger mode TEST
2. Cliquer "Groupes"
3. Vérifier: Triptyque affiche vraies classes (pas 6°1-6°5)
4. Si 0 classe: vérifier GROUPS_MODULE_V4_DATA injectée
```

### ✅ Test Correction 3 (Event Listener)
```
1. Créer 2 regroupements dans triptyque
2. Cliquer "Générer les groupes"
3. Vérifier console: "Event groups:generate reçu"
4. Vérifier: "Génération réussie" + résultats affichés
```

### ✅ Test Correction 4 (Injection données)
```
1. Dans console: console.log(window.GROUPS_MODULE_V4_DATA)
2. Vérifier: classes > 0, students > 0
3. Si vide: vérifier loadDataForMode() injection
```

---

## APRÈS LES 4 CORRECTIONS

**Console ne doit afficher AUCUNE erreur:**
- ❌ 404 (Correction 1)
- ❌ "Aucune donnée classe" (Correction 2)
- ❌ "Event non écouté" (Correction 3)
- ❌ GROUPS_MODULE_V4_DATA vide (Correction 4)

**Triptyque doit:**
- ✅ Charger sans erreur
- ✅ Afficher vraies classes
- ✅ Accepter regroupements
- ✅ Générer sans erreur

---

**Corrections créées** : 2 novembre 2025
**Durée application** : 22 minutes
**Résultat** : V4 100% fonctionnel
