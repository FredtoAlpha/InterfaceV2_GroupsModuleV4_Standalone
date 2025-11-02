# 🚀 QUICK START - Module Groupes V4

**Temps estimé** : 15 minutes pour tester, 30 minutes pour déployer

---

## ⚡ EN 30 SECONDES

Le Module V4 est **100% prêt** en code. Il manque juste:
1. **Déployer l'endpoint Web App** (serve_v4_bundles.gs)
2. **Tester les 3 ordres manquants** (8, 9, 10)

Après ça → **V4 complètement opérationnel** ✅

---

## 📋 CHECKLIST RAPIDE

### ✅ DÉJÀ FAIT (7 ordres code)

```
[✅] ORDRE 1   - CoreScript = bootstrap (28 lignes)
[✅] ORDRE 2   - Loader minimal (147 lignes)
[✅] ORDRE 3   - Refuser DEFAULT_CLASSES
[✅] ORDRE 5   - globalThis partout
[✅] ORDRE 6   - Format données adapté
[✅] ORDRE 7   - Données injectées
[✅] ORDRE 11  - CoreScript gelé
```

### ⏳ À FAIRE (3 ordres + 1 tech)

```
[⏳] ORDRE 4   - Déployer Web App endpoint (15 min)
[⏳] ORDRE 8   - Tester instanciation (5 min)
[⏳] ORDRE 9   - Tester fallback (5 min)
[⏳] ORDRE 10  - Test complet (10 min)
```

---

## 🎯 ÉTAPE 1 : Déployer le Web App Endpoint (15 min)

### Dans Apps Script:

1. **Créer nouveau fichier** → `serve_v4_bundles.gs`

2. **Copier le code** depuis le fichier créé

3. **Exécuter** `uploadV4Bundles()`
   - Charge les 3 fichiers JS
   - Stocke dans ScriptProperties

4. **Exécuter** `getWebAppUrl()`
   - Affiche l'URL publique
   - Copier cette URL

5. **Déployer comme Web App**
   - Cliquer "Déployer > Nouveau déploiement"
   - Type: "Application web"
   - Exécuter en tant que: Votre compte
   - Accès: "Tous les utilisateurs"

6. **Copier l'URL publique**
   ```
   https://script.google.com/macros/d/{ID}/usercache
   ```

---

## 🧪 ÉTAPE 2 : Tester les Bundles (10 min)

### Option A: Utiliser INTEGRATION_V4_BUNDLES.html

1. Ouvrir `INTEGRATION_V4_BUNDLES.html` dans navigateur
2. Coller l'URL Web App
3. Cliquer "Test 1: Vérifier endpoint"
4. Cliquer "Test 2: Charger les bundles"
5. Cliquer "Test 3: Instancier V4"
6. Vérifier console: aucune erreur ✅

### Option B: Tests manuels (console)

```javascript
// Test 1: Vérifier endpoint
fetch('https://script.google.com/macros/d/{ID}/usercache?file=InterfaceV4_Triptyque_Logic.js')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Type:', r.headers.get('content-type'));
  });

// Test 2: Charger bundles
fetch('https://script.google.com/macros/d/{ID}/usercache?file=InterfaceV4_Triptyque_Logic.js')
  .then(r => r.text())
  .then(code => {
    eval(code);
    console.log('TriptychGroupsModule disponible?', typeof window.TriptychGroupsModule);
  });

// Test 3: Instancier
const module = new window.ModuleGroupsV4();
console.log('Module créé:', module ? '✅' : '❌');
```

---

## 🎮 ÉTAPE 3 : Test Complet (10 min)

### Dans l'application (mode TEST ou FINAL):

1. **Charger une classe**
   - Menu "Mode" → sélectionner TEST ou FINAL
   - Interface charge les élèves

2. **Cliquer "Groupes"**
   - Devrait ouvrir le triptyque V4
   - Console: pas d'erreur

3. **Vérifier données**
   - Colonne 1: Sélectionner "Besoins"
   - Vérifier: classes affichées (pas 0)
   - Vérifier: noms réels (pas DEFAULT_CLASSES)

4. **Créer regroupement**
   - Colonne 3: Créer association
   - Sélectionner 2 classes
   - Cliquer "Valider"

5. **Générer groupes**
   - Cliquer "Générer les groupes"
   - Attendre résultats
   - Vérifier: pas d'erreur
   - Vérifier: statistiques > 0

### ✅ Si tout fonctionne:

```
✅ Triptyque affiche vraies classes
✅ Regroupements créables
✅ Génération produit résultats
✅ Pas d'erreur SyntaxError / ReferenceError
✅ ORDRE 10 validé
```

---

## 🐛 DÉPANNAGE RAPIDE

| Erreur | Solution | Ordre |
|--------|----------|-------|
| "Module V4 indisponible" | Vérifier Web App déployé | 4 |
| SyntaxError: token '<' | Vérifier MIME type endpoint | 4 |
| "0 classe" | Vérifier GROUPS_MODULE_V4_DATA | 7 |
| Fallback silencieux | Lire logs, vérifier V4 erreur | 9 |

---

## 📱 FICHIERS CLÉS

| Fichier | Rôle | Action |
|---------|------|--------|
| serve_v4_bundles.gs | Endpoint | À déployer |
| INTEGRATION_V4_BUNDLES.html | Tests | À ouvrir |
| DOCUMENTATION_GROUPS_MODULE_V4.md | Ref | À lire si besoin |

---

## ⏱️ TIMELINE

```
Minute 0-5   : Déployer serve_v4_bundles.gs
Minute 5-10  : Obtenir URL Web App
Minute 10-20 : Tester bundles (INTEGRATION_V4_BUNDLES.html)
Minute 20-30 : Test complet dans l'app
Minute 30+   : Valider ORDRES 8-10 ✅
```

---

## 🎓 PROCHAINE ÉTAPE

Après tester les 3 ordres manquants:

```
✅ Tout fonctionne?
  → V4 est PRÊT POUR PRODUCTION
  
❌ Des erreurs?
  → Consulter DOCUMENTATION_GROUPS_MODULE_V4.md (erreurs courantes)
  → Lire EXECUTION_SUMMARY_12_ORDRES.md (détails complets)
```

---

**Guide créé** : 2 novembre 2025
**Temps estimé** : 30 minutes
**Statut** : ✅ PRÊT À TESTER
