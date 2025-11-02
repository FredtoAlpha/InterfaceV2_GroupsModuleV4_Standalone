# 📚 DOCUMENTATION - Module Groupes V4

**Version** : 1.0 Final
**Date** : 2 novembre 2025
**Statut** : ✅ GELÉ (Aucune modification acceptée)

---

## 🎯 OBJECTIF

Module Groupes V4 est un système **100% indépendant** pour créer et gérer des regroupements d'élèves selon 3 scénarios pédagogiques :
- **Besoins** : Équilibrer les profils académiques
- **LV2** : Organiser par langue choisie
- **Options** : Grouper par enseignements électifs

---

## 🏗️ ARCHITECTURE COMPLÈTE

```
BOOTSTRAP (CoreScript.html) → LOADER (GroupsModuleV4_Script.js) → LOGIQUE (Triptyque_Logic.js)
                ↓                          ↓                              ↓
        Injecter données          Créer conteneur             Afficher interface
        GROUPS_MODULE_V4_DATA     + instancier triptyque      + gérer interactions
```

### Fichiers clés

| Fichier | Lignes | Rôle | Gelé? |
|---------|--------|------|-------|
| InterfaceV2_CoreScript.html | 9750+ | Bootstrap + injection données | ✅ OUI |
| InterfaceV2_GroupsModuleV4_Script.js | 147 | Loader minimal | ✅ OUI |
| InterfaceV4_Triptyque_Logic.js | 650 | Logique triptyque complète | ❌ MODIFIABLE |
| GroupsAlgorithmV4_Distribution.js | 550 | Algorithme répartition | ❌ MODIFIABLE |
| serve_v4_bundles.gs | - | Endpoint Web App (backend) | ✅ OUI |

---

## 📦 FORMAT DONNÉES - GROUPS_MODULE_V4_DATA

**Injection point** : `loadDataForMode()` CoreScript.html (ligne 1436)

```javascript
window.GROUPS_MODULE_V4_DATA = {
  classes: [
    {
      id: "6-1",
      label: "6°1",
      classe: "6°1",
      students: 25
    }
  ],

  students: [
    {
      id: "E001",
      name: "Dupont",
      classe: "6°1",        // OBLIGATOIRE
      sexe: "M",            // M ou F
      scoreM: 15,
      scoreF: 14,
      com: 8,
      tra: 9,
      part: 7,
      abs: 1,
      lv2: "ESP",
      opt: "LATIN"
    }
  ],

  scenarios: ["needs", "lv2", "options"]
};
```

**Validation** : Si données manquantes → `resolveAvailableClasses()` retourne `[]` + erreur console

---

## 🚀 FLUX COMPLET

```
1. Backend: getClassesData(mode)
   ↓
2. CoreScript: loadDataForMode() reçoit les données
   ↓
3. Transformation: result.data → GROUPS_MODULE_V4_DATA
   ↓
4. Injection: window.GROUPS_MODULE_V4_DATA = {...}
   ↓
5. Frontend: new ModuleGroupsV4() → new TriptychGroupsModule()
   ↓
6. Triptyque: resolveAvailableClasses() lit GROUPS_MODULE_V4_DATA ✅
   ↓
7. Affichage: Interface triptyque avec vraies classes
```

---

## 🔒 RÈGLES DE GEL (ORDRE 11)

### ✅ PERMIS
- Modifier InterfaceV4_Triptyque_Logic.js
- Modifier GroupsAlgorithmV4_Distribution.js
- Ajouter données à GROUPS_MODULE_V4_DATA

### ❌ INTERDIT
- Ajouter logique V4 à CoreScript.html
- Créer instances TriptychGroupsModule dans CoreScript
- Dupliquer code depuis groupsModuleComplete.html

---

## 🚨 ERREURS COURANTES

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Module V4 indisponible" | ModuleGroupsV4 pas défini | Charger InterfaceV2_GroupsModuleV4_Script.js |
| "Aucune donnée classe" | GROUPS_MODULE_V4_DATA vide | Vérifier loadDataForMode() ligne 1436 |
| SyntaxError: token '<' | 404 HTML response | Vérifier Web App endpoint (ORDRE 4) |
| Triptyque: 0 classe | DEFAULT_CLASSES fallback | Vérifier injection GROUPS_MODULE_V4_DATA |

---

## ✅ CHECKLIST DÉPLOIEMENT

- [ ] Bundles V4 chargés dans serve_v4_bundles.gs
- [ ] Web App endpoint déployé
- [ ] GROUPS_MODULE_V4_DATA injecté dans loadDataForMode()
- [ ] Triptyque affiche vraies classes
- [ ] Regroupements créables
- [ ] Algorithme produit résultats valides
- [ ] Fallback GroupsModuleComplete fonctionne

---

**Document gelé** : ✅ Aucune modification sans approbation
**Version** : 1.0 Final
**Créé** : 2 novembre 2025
