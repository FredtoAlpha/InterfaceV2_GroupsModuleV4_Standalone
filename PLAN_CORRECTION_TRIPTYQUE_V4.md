# 🔧 PLAN DE CORRECTION - 3 Blocages Triptyque V4

**Date** : 2 novembre 2025
**Urgence** : 🔴 CRITIQUE (V4 complètement non-fonctionnel)

---

## 📋 RÉSUMÉ DES 3 BLOCAGES

### 🔴 BLOCAGE 1 : Scripts chargés par `<script src>` (404 ERROR)
**Problème** : Les vues HTML chargent les scripts par des balises `<script src="...">` qui retournent du HTML au lieu du JavaScript

**Symptôme** : `❌ Erreur: Paramètre "file" manquant` + `SyntaxError: Unexpected token '<'`

**Fichiers affectés** :
- InterfaceV2_GroupsModuleV4_Part1.html (ligne 314-315)
- InterfaceV2_GroupsModuleV4_Standalone.html (ligne 539-540)

**FIX** : Remplacer les `<script src>` par les inclusions server-side Apps Script

```html
❌ AVANT:
<script src="InterfaceV4_Triptyque_Logic.js"></script>
<script src="InterfaceV2_GroupsModuleV4_Script.js"></script>

✅ APRÈS:
<?!= include('InterfaceV4_Triptyque_Logic') ?>
<?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
```

**Durée fix** : 2 minutes
**Impact** : CRITIQUE - Sans cela, le script ne charge jamais

---

### 🔴 BLOCAGE 2 : DEFAULT_CLASSES utilisée au lieu des vraies données
**Problème** : TriptychGroupsModule affiche 6°1-6°5 (fake) au lieu des vraies classes

**Symptôme** : Triptyque affiche "0 classe" ou seulement les 5 classes de démo

**Fichiers affectés** :
- InterfaceV4_Triptyque_Logic.js (ligne 26-33, 107-140)

**FIX** : Forcer injection de GROUPS_MODULE_V4_DATA et rejeter DEFAULT_CLASSES

```javascript
❌ AVANT (ligne 138-140):
console.warn('⚠️ Aucune donnée trouvée, utilisation classes par défaut');
return DEFAULT_CLASSES;

✅ APRÈS:
if (!Array.isArray(injected) || injected.length === 0) {
  console.error('❌ CRITIQUE: GROUPS_MODULE_V4_DATA vide ou manquant');
  console.error('   window.GROUPS_MODULE_V4_DATA =', windowRef.GROUPS_MODULE_V4_DATA);
  console.error('   ➜ Vérifier injection dans loadDataForMode() CoreScript.html');
  this.state.error = 'Données classes manquantes';
  return [];  // Refuser DEFAULT_CLASSES
}
```

**Durée fix** : 5 minutes
**Impact** : CRITIQUE - Sans cela, V4 affiche de fausses données

---

### 🔴 BLOCAGE 3 : Event `groups:generate` pas écouté
**Problème** : Triptyque déclenche `CustomEvent('groups:generate')` mais RIEN ne l'écoute

**Symptôme** : Cliquer "Générer" ne fait rien - pas d'appel au moteur, pas de résultats

**Fichiers affectés** :
- InterfaceV4_Triptyque_Logic.js (ligne 199-215 déclenche l'event)
- InterfaceV2_GroupsModuleV4_Script.js (MANQUE l'écouteur)

**FIX** : Ajouter listener dans le loader et connecter au moteur

```javascript
// Dans InterfaceV2_GroupsModuleV4_Script.js après new TriptychGroupsModule():

// ✅ AJOUTER:
const moduleRoot = documentRef.querySelector('#groups-module-v4');
if (moduleRoot) {
  moduleRoot.addEventListener('groups:generate', (event) => {
    console.log('🚀 Event groups:generate reçu:', event.detail);

    if (typeof windowRef.GroupsAlgorithmV4 === 'undefined') {
      console.error('❌ GroupsAlgorithmV4 non disponible');
      return;
    }

    try {
      const algorithm = new windowRef.GroupsAlgorithmV4();
      const result = algorithm.generateGroups(event.detail);

      // Retourner les résultats au triptyque
      moduleRoot.dispatchEvent(new CustomEvent('groups:generated', {
        detail: result
      }));

      console.log('✅ Génération complète:', result);
    } catch (error) {
      console.error('❌ Erreur génération:', error);
      moduleRoot.dispatchEvent(new CustomEvent('groups:error', {
        detail: { message: error.message }
      }));
    }
  });
}
```

**Durée fix** : 10 minutes
**Impact** : CRITIQUE - Sans cela, V4 ne peut pas générer

---

## 🎯 PLAN D'EXÉCUTION

### Phase 1: Fix Blocage 1 (2 min)
Remplacer `<script src>` par `<?!= include() ?>` dans les vues HTML

**Vues à modifier** :
1. InterfaceV2_GroupsModuleV4_Part1.html
2. InterfaceV2_GroupsModuleV4_Standalone.html

**Vérification** : Console sans erreur 404

---

### Phase 2: Fix Blocage 2 (5 min)
Refuser DEFAULT_CLASSES si GROUPS_MODULE_V4_DATA vide

**Fichier à modifier** : InterfaceV4_Triptyque_Logic.js (ligne 133-140)

**Vérification** : Triptyque affiche vraies classes (pas 6°1-6°5)

---

### Phase 3: Fix Blocage 3 (10 min)
Ajouter listener et connecter au moteur

**Fichier à modifier** : InterfaceV2_GroupsModuleV4_Script.js (après instanciation)

**Vérification** : Cliquer "Générer" → pas d'erreur → résultats affichés

---

### Phase 4: Test complet (5 min)
1. Charger mode TEST/FINAL
2. Cliquer "Groupes"
3. Vérifier classes affichées (pas de 6°1-6°5)
4. Créer 2 regroupements
5. Cliquer "Générer"
6. Vérifier résultats (stats > 0)

---

## ⏱️ TIMELINE TOTALE

| Phase | Durée | Blocage |
|-------|-------|---------|
| 1 | 2 min | Fix 404 error |
| 2 | 5 min | Refuser fake data |
| 3 | 10 min | Wire event listener |
| 4 | 5 min | Test complet |
| **TOTAL** | **22 min** | **V4 OPÉRATIONNEL** |

---

## ✅ CHECKLIST AVANT DÉPLOIEMENT

### Phase 1 - Inclusions
- [ ] InterfaceV2_GroupsModuleV4_Part1.html modifiée
- [ ] InterfaceV2_GroupsModuleV4_Standalone.html modifiée
- [ ] Console: pas d'erreur 404
- [ ] Triptyque affiche en console

### Phase 2 - Données
- [ ] GROUPS_MODULE_V4_DATA injectée dans CoreScript.html (ligne 1436)
- [ ] DEFAULT_CLASSES refusée si vide
- [ ] Triptyque affiche vraies classes

### Phase 3 - Event
- [ ] Listener `groups:generate` ajouté
- [ ] Moteur appelé avec payload correct
- [ ] Résultats retournés au triptyque

### Phase 4 - Validation
- [ ] 2 regroupements créables
- [ ] Génération sans erreur
- [ ] Stats > 0
- [ ] Console propre

---

## 🚨 RISQUES SI NON CORRIGÉ

| Risque | Conséquence |
|--------|------------|
| Blocage 1 non fixé | V4 ne charge jamais → 404 éternel |
| Blocage 2 non fixé | V4 affiche fake data → résultats incohérents |
| Blocage 3 non fixé | Génération ne fonctionne pas → no-op |

**Tous les 3 doivent être fixés pour V4 fonctionnel.**

---

## 📞 QUESTIONS COURANTES

**Q: Pourquoi `<?!= include() ?>` et pas `<script src>`?**
A: Apps Script n'expose pas les fichiers .js en HTTP. L'inclusion server-side les compile côté serveur.

**Q: GROUPS_MODULE_V4_DATA est déjà injectée, pourquoi vide?**
A: Elle est injectée mais le paramètre `?file=` manquant empêche le script de charger (Blocage 1).

**Q: Faut-il tester le Web App endpoint?**
A: Non, l'endpoint est correct. Le problème est que personne ne l'appelle (cause du `?file=` manquant).

---

**Plan créé** : 2 novembre 2025
**Urgence** : 🔴 CRITIQUE
**Durée totale** : 22 minutes
**Résultat** : V4 opérationnel
