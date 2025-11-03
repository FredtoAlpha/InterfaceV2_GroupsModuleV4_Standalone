# 🔄 FLUX DE DONNÉES - MODULE GROUPES V4 (Visuel)

**Diagramme complet du cycle de vie des données et modules**

---

## 🏗️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE APPS SCRIPT                           │
│                         (Serveur)                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Code.gs                                                   │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────┐             │   │
│  │  │ function getGroupsModuleV4Data()        │             │   │
│  │  │ Retourne:                               │             │   │
│  │  │  - classes []                           │             │   │
│  │  │  - eleves {}                            │             │   │
│  │  │  - scenarios {}                         │             │   │
│  │  │  - modes {}                             │             │   │
│  │  │  - metadata {}                          │             │   │
│  │  └─────────────────────────────────────────┘             │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                         │
│         google.script.run.getGroupsModuleV4Data()               │
│                        ↓                                         │
└─────────────────────────────────────────────────────────────────┘
         │
         │ (Asynchrone via google.script.run)
         │
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      NAVIGATEUR CLIENT                           │
│                     (InterfaceV2.html)                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Scripts d'injection (lignes 1477-1518)                  │   │
│  │                                                            │   │
│  │  withSuccessHandler((data) => {                          │   │
│  │    window.GROUPS_MODULE_V4_DATA = data; ← INJECTION      │   │
│  │    dispatchEvent('groups:data-ready');                  │   │
│  │  })                                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ window.GROUPS_MODULE_V4_DATA (GLOBAL)                  │   │
│  │ Accessible à TOUS les scripts                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                         │
│         ├─────────────────────────┬──────────────────┬──────────┤
│         ↓                         ↓                  ↓          │
│    ┌─────────┐         ┌──────────────────┐  ┌────────────────┐│
│    │Triptyque│         │GroupsAlgorithm  │  │ModuleGroupsV4  ││
│    │Module   │         │V4                │  │(Loader)        ││
│    └─────────┘         └──────────────────┘  └────────────────┘│
│         ↓                      ↑                     ↑           │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Événement: groups:generate
         │ {regroupements: [...], scenario, mode}
         │
         ├─────────────────────────────────────────────→
                 (Voir flux Génération ci-dessous)
```

---

## 🔄 FLUX #1 : INITIALISATION AU DÉMARRAGE

```
1. App charge InterfaceV2.html
   │
   ├─→ Script #1: Inclusions serveur (lignes 1461-1475)
   │   ├─→ <?!= include('InterfaceV4_Triptyque_Logic') ?>
   │   ├─→ <?!= include('GroupsAlgorithmV4_Distribution') ?>
   │   └─→ <?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
   │
   ├─→ Script #2: Injection GROUPS_MODULE_V4_DATA (lignes 1477-1518)
   │   │
   │   ├─→ google.script.run.getGroupsModuleV4Data()
   │   │   │
   │   │   ├─→ [Serveur] getElevesData()
   │   │   │           ↓
   │   │   │         Retourne: [
   │   │   │           {classe: '6°1', eleves: [...]},
   │   │   │           {classe: '6°2', eleves: [...]},
   │   │   │           ...
   │   │   │         ]
   │   │   │
   │   │   ├─→ [Serveur] Normaliser + structurer
   │   │   │   ├─→ Créer classes[]
   │   │   │   ├─→ Créer eleves{}
   │   │   │   ├─→ Ajouter scenarios{}
   │   │   │   ├─→ Ajouter modes{}
   │   │   │   └─→ Ajouter metadata{}
   │   │   │
   │   │   └─→ Retourner objet V4
   │   │
   │   ├─→ withSuccessHandler(data) {
   │   │   window.GROUPS_MODULE_V4_DATA = data; // ← INJECTION ✅
   │   │   dispatchEvent(new CustomEvent('groups:data-ready', {detail: data}));
   │   │ }
   │   │
   │   └─→ withFailureHandler(error) {
   │       window.GROUPS_MODULE_V4_DATA = {
   │         classes: [],
   │         eleves: {},
   │         // ... structure vide avec error
   │       }
   │     }
   │
   └─→ window.GROUPS_MODULE_V4_DATA 🔓 MAINTENANT DISPONIBLE
       ├─→ Accessible au TriptychGroupsModule
       ├─→ Accessible au GroupsAlgorithmV4
       └─→ Accessible à ModuleGroupsV4
```

---

## 🎬 FLUX #2 : OUVERTURE DU MODULE V4

```
1. Utilisateur clique "Créer Groupes"
   │
   ├─→ openModuleGroupsV4()
   │   │
   │   └─→ ModuleGroupsV4.open()
   │       │
   │       ├─→ Créer conteneur DOM <div id="groups-module-v4">
   │       │
   │       ├─→ Instancier TriptychGroupsModule(rootElement)
   │       │   │
   │       │   ├─→ Constructor:
   │       │   │   ├─→ this.root = rootElement
   │       │   │   ├─→ this.state = {...}
   │       │   │   ├─→ this.loadClasses() ← Lit window.GROUPS_MODULE_V4_DATA
   │       │   │   │   └─→ Affiche classes dans panneaux
   │       │   │   └─→ this.renderUI()
   │       │   │       ├─→ Panneau 1 (gauche): Scénarios
   │       │   │       ├─→ Panneau 2 (centre): Contenu
   │       │   │       └─→ Panneau 3 (droite): Récapitulatif
   │       │   │
   │       │   └─→ Attacher event listeners:
   │       │       ├─→ groups:generate
   │       │       ├─→ groups:save-draft
   │       │       └─→ groups:save-final
   │       │
   │       └─→ Retourner true
   │
   └─→ Triptyque 📊 AFFICHE AUX UTILISATEURS
```

---

## ⚙️ FLUX #3 : GÉNÉRATION DE GROUPES

```
1. Utilisateur:
   ├─→ Sélectionne un scénario (needs, lv2, options)
   ├─→ Sélectionne un mode (heterogeneous, homogeneous)
   ├─→ Ajoute des regroupements (classes + nb groupes)
   └─→ Clique "Générer"

2. Triptyque émet événement:
   │
   └─→ trRoot.dispatchEvent(new CustomEvent('groups:generate', {
       detail: {
         regroupements: [
           {name: "Regroupement 1", classes: ["6°1"], groupCount: 3},
           {name: "Regroupement 2", classes: ["6°2"], groupCount: 3},
           ...
         ],
         scenario: "needs",
         mode: "heterogeneous"
       }
     }))

3. ModuleGroupsV4 écouteur (InterfaceV2_GroupsModuleV4_Script.js:84-122):
   │
   └─→ trRoot.addEventListener('groups:generate', (event) => {
       │
       ├─→ Récupérer payload = event.detail
       │
       ├─→ Vérifier GroupsAlgorithmV4 disponible
       │   └─→ if (!window.GroupsAlgorithmV4) → ERREUR
       │
       ├─→ Créer instance: algo = new GroupsAlgorithmV4()
       │
       ├─→ Appeler: result = algo.generateGroups(payload)
       │   │
       │   ├─→ [Côté algorithme]
       │   │   ├─→ Récupérer élèves pour chaque classe
       │   │   │   └─→ students = window.GROUPS_MODULE_V4_DATA.eleves[className]
       │   │   │
       │   │   ├─→ Normaliser les élèves
       │   │   │   └─→ Vérifier id, nom, prenom, classe
       │   │   │
       │   │   ├─→ Appliquer logique scénario (needs/lv2/options)
       │   │   │
       │   │   ├─→ Appliquer logique mode (heterogeneous/homogeneous)
       │   │   │
       │   │   ├─→ Générer passes (distributions)
       │   │   │   └─→ Retourner: {success: true, passes: [...], statistics: {...}}
       │   │   │
       │   │   └─→ Retourner result
       │   │
       │   └─→ Retour: {
       │       success: true,
       │       passes: [
       │         {
       │           name: "Passe A",
       │           groups: [
       │             {students: [élève1, élève2, ...]},
       │             ...
       │           ]
       │         },
       │         ...
       │       ],
       │       statistics: {
       │         totalStudents: 96,
       │         groupsPerPass: 3,
       │         avgGroupSize: 32,
       │         ...
       │       }
       │     }
       │
       └─→ Émettre résultat au triptyque:
           trRoot.dispatchEvent(new CustomEvent('groups:generated', {
             detail: result
           }))
   })

4. Triptyque reçoit 'groups:generated':
   │
   └─→ Afficher les résultats:
       ├─→ Lister les passes
       ├─→ Afficher statistiques
       ├─→ Proposer drag & drop (si implémenté)
       └─→ Afficher boutons Sauvegarde
```

---

## 💾 FLUX #4 : SAUVEGARDES

```
1. Utilisateur clique "Enregistrer brouillon" (ou final)
   │
   └─→ Triptyque émet: 'groups:save-draft' (ou 'groups:save-final')
       detail: {regroupements: [...], passes: [...]}

2. Écouteur dans ModuleGroupsV4 (future étape 7):
   │
   └─→ root.addEventListener('groups:save-draft', (event) => {
       google.script.run.saveCacheData(
         'groups_v4_draft',
         JSON.stringify(event.detail)
       );
       // ✅ Sauvegardé dans cache serveur
   })

       root.addEventListener('groups:save-final', (event) => {
       google.script.run.saveWithProgressINT(
         'groups_v4_final',
         event.detail
       );
       // ✅ Sauvegardé dans feuille FIN
   })
```

---

## 📊 STRUCTURE DE DONNÉES COMPLÈTE

```javascript
window.GROUPS_MODULE_V4_DATA = {
  // ========= CLASSES =========
  classes: [
    {
      id: '6°1',
      label: '6°1',
      studentCount: 24,
      isFIN: false  // ← Pour détecter classes suffixées FIN
    },
    {
      id: '6°1FIN',  // ← Classes FIN détectées automatiquement
      label: '6°1FIN',
      studentCount: 2,
      isFIN: true
    },
    // ...
  ],

  // ========= ÉLÈVES (PAR CLASSE) =========
  eleves: {
    '6°1': [
      {
        id: '6-1-001',          // ← ID unique normalisé
        nom: 'Dupont',          // ← Obligatoire
        prenom: 'Anne',         // ← Obligatoire
        classe: '6°1',          // ← Obligatoire
        lv2: 'ESP',             // ← Pour scénario LV2
        option: 'CHAV',         // ← Pour scénario Options
        sexe: 'F',              // ← Meta-info
        besoin: 'PPRE',         // ← Pour scénario Besoins
        profil: 'faible'        // ← Pour mode Homogène
      },
      // ...
    ],
    '6°1FIN': [
      // Élèves FIN (peu nombreux)
    ],
    // ...
  },

  // ========= SCÉNARIOS =========
  scenarios: {
    needs: {
      id: 'needs',
      title: 'Besoins',
      description: 'Équilibrer les besoins spécifiques'
    },
    lv2: {
      id: 'lv2',
      title: 'LV2',
      description: 'Rassembler selon la langue vivante 2'
    },
    options: {
      id: 'options',
      title: 'Options',
      description: 'Créer des regroupements autour des options'
    }
  },

  // ========= MODES =========
  modes: {
    heterogeneous: {
      id: 'heterogeneous',
      title: 'Hétérogène',
      description: 'Groupes équilibrés et mixtes'
    },
    homogeneous: {
      id: 'homogeneous',
      title: 'Homogène',
      description: 'Groupes basés sur des profils similaires'
    }
  },

  // ========= MÉTADONNÉES =========
  metadata: {
    timestamp: '2025-11-03T10:30:00.000Z',
    version: '4.0',
    classCount: 8,              // Classes avec élèves
    studentCount: 193,          // Élèves totaux
    source: 'Apps Script - Code.gs'
  }
}
```

---

## 📦 DÉPENDANCES DE MODULES

```
GroupsAlgorithmV4_Distribution.js
│
├─→ Dépend de: globalThis
├─→ Expose: window.GroupsAlgorithmV4
└─→ Utilise: window.GROUPS_MODULE_V4_DATA (au runtime)

InterfaceV4_Triptyque_Logic.js
│
├─→ Dépend de: globalThis
├─→ Utilise: window.GROUPS_MODULE_V4_DATA (au démarrage)
├─→ Expose: window.TriptychGroupsModule
└─→ Émet événements: groups:generate, groups:save-draft, groups:save-final

InterfaceV2_GroupsModuleV4_Script.js (Loader)
│
├─→ Dépend de: globalThis
├─→ Utilise: window.TriptychGroupsModule
├─→ Utilise: window.GroupsAlgorithmV4
├─→ Expose: window.ModuleGroupsV4, window.getModuleGroupsV4(), window.openModuleGroupsV4()
└─→ Écoute: groups:generate → appelle algorithme → émet groups:generated
```

---

## ⏱️ TIMELINE D'EXÉCUTION (DÉMARRAGE)

```
T=0ms    : App charge InterfaceV2.html
T=50ms   : Scripts serveur inclus et évalués
T=100ms  : google.script.run.getGroupsModuleV4Data() appelé (asynchrone)
T=150ms  : Scripts client (Triptyque, Algo, Loader) chargés
T=200ms  : DOMContentLoaded déclenché
T=1000ms : Serveur retourne données ← google.script.run async
T=1050ms : window.GROUPS_MODULE_V4_DATA injecté ✅
T=1100ms : Événement 'groups:data-ready' déclenché
T=1150ms : Triptyque réactif et prêt ✅

Note: Les délais exacts dépendent de la charge serveur
```

---

## 🎯 ÉTAT ACTUEL (APRÈS ÉTAPE 1)

```
✅ Scripts serveur inclus      → Pas de dépendances HTTP
✅ Données exposées            → window.GROUPS_MODULE_V4_DATA
✅ globalThis utilisé          → Compatible Apps Script
✅ Événements disponibles      → groups:data-ready, groups:generate
✅ Normalisation élèves        → Champs obligatoires vérifiés

⏳ À faire (Étapes 2-14):
├─→ Étape 2  : Supprimer anciennes modales
├─→ Étape 3  : Écouteur groups:generate
├─→ Étapes 4-5: Initialisation triptyque
├─→ Étapes 6-8: Validation et détection FIN
├─→ Étapes 9-11: Tests et documentation
└─→ Étape 12: Production
```

---

## 🔗 RÉFÉRENCES CROISÉES

- **Flux complet** : Voir ce document
- **Étape 1** : `ETAPE_1_VALIDATION.md`
- **Étapes 2-14** : `PLAN_EXECUTION_ETAPES_2_A_14.md`
- **Code** :
  - `Code.js:1302-1407` → getGroupsModuleV4Data()
  - `InterfaceV2.html:1461-1518` → Inclusions + injection
  - `InterfaceV2_GroupsModuleV4_Script.js:84-122` → Écouteur groups:generate

---

**Généré pour :** Clarifier l'architecture et le flux de données du module V4
**Status :** ✅ Documentation pour Étape 1 COMPLÉTÉE
