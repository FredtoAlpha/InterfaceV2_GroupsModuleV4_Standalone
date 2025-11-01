# Quick Start - Module Groupes V4

## ⚡ Démarrage en 5 minutes

### Étape 1 : Tester le module (2 min)

1. Ouvrir le fichier : **InterfaceV2_GroupsModuleV4_Standalone.html**
2. Observer les 3 colonnes et les 3 phases
3. Tester la navigation entre les phases

✅ Le module fonctionne !

### Étape 2 : Comprendre l'architecture (2 min)

Lire le début de : **RESUME_IMPLEMENTATION_GROUPS_V4.md**

Points clés :
- 3 colonnes : Phases | Contenu | Récapitulatif
- 3 phases : Scénario | Mode | Associations
- État centralisé et persistant

### Étape 3 : Préparer l'intégration (1 min)

Vous avez besoin de :
- ✅ **InterfaceV2_GroupsModuleV4_Script.js** (le script)
- ✅ **InterfaceV2_GroupsModuleV4_Standalone.html** (référence)
- ✅ **GUIDE_INTEGRATION_GROUPS_V4.md** (instructions)

---

## 📋 Fichiers essentiels

| Fichier | Taille | Utilité |
|---------|--------|---------|
| InterfaceV2_GroupsModuleV4_Script.js | 400 lignes | À importer |
| InterfaceV2_GroupsModuleV4_Standalone.html | 600 lignes | À tester |
| GUIDE_INTEGRATION_GROUPS_V4.md | 300 lignes | À suivre |

---

## 🎯 Cas d'usage

### Je veux tester le module

```
1. Ouvrir InterfaceV2_GroupsModuleV4_Standalone.html
2. Naviguer dans les 3 phases
3. Créer une passe
4. Rafraîchir la page (vérifier la persistance)
```

### Je veux l'intégrer dans InterfaceV2

```
1. Lire GUIDE_INTEGRATION_GROUPS_V4.md
2. Copier InterfaceV2_GroupsModuleV4_Script.js
3. Ajouter <script src="..."> dans InterfaceV2.html
4. Ajouter le conteneur <div id="groups-module-v4-container">
5. Initialiser new ModuleGroupsV4()
```

### Je veux comprendre l'architecture

```
1. Lire DOCUMENTATION_GROUPS_MODULE_V4.md
2. Consulter les sections "Architecture" et "État centralisé"
3. Examiner le code dans InterfaceV2_GroupsModuleV4_Script.js
```

### Je veux tester complètement

```
1. Lire TEST_GROUPS_MODULE_V4.md
2. Exécuter les 22 tests
3. Valider la checklist
```

---

## 🔧 Configuration minimale

### Pour tester en standalone

```html
<!-- Rien à faire, ouvrir le fichier HTML directement -->
```

### Pour intégrer dans InterfaceV2

```html
<!-- Ajouter dans InterfaceV2.html -->
<script src="InterfaceV2_GroupsModuleV4_Script.js"></script>

<!-- Ajouter le conteneur -->
<div id="groups-module-v4-container"></div>

<!-- Initialiser -->
<script>
  new ModuleGroupsV4();
</script>
```

---

## 📊 Les 3 phases en 30 secondes

### Phase 1 : Scénario
- Sélectionner le type de regroupement
- Options : Besoins, LV2, Options
- Validation : 1 scénario requis

### Phase 2 : Mode
- Choisir le mode de distribution
- Options : Hétérogène, Homogène
- Validation : 1 mode requis

### Phase 3 : Associations
- Créer des regroupements (passes)
- Chaque passe = classes + nombre de groupes
- Validation : ≥1 passe requise

---

## ✅ Checklist rapide

- [ ] Tester le module en standalone
- [ ] Lire RESUME_IMPLEMENTATION_GROUPS_V4.md
- [ ] Lire GUIDE_INTEGRATION_GROUPS_V4.md
- [ ] Intégrer dans InterfaceV2
- [ ] Exécuter les tests
- [ ] Valider l'intégration

---

## 🆘 Problèmes courants

### Le module ne s'affiche pas

**Solution** :
1. Vérifier que le fichier HTML est bien ouvert
2. Vérifier la console (F12) pour les erreurs
3. Vérifier que Font Awesome est chargé

### Les données ne persistent pas

**Solution** :
1. Vérifier que localStorage est activé
2. Ouvrir la console : `localStorage.getItem('moduleGroupsV4State')`
3. Vérifier qu'il y a des données

### L'intégration ne fonctionne pas

**Solution** :
1. Vérifier que le script est chargé : `console.log(window.ModuleGroupsV4)`
2. Vérifier que le conteneur existe dans le DOM
3. Consulter GUIDE_INTEGRATION_GROUPS_V4.md - Section "Dépannage"

---

## 📞 Ressources

| Ressource | Contenu |
|-----------|---------|
| RESUME_IMPLEMENTATION_GROUPS_V4.md | Vue d'ensemble |
| DOCUMENTATION_GROUPS_MODULE_V4.md | Architecture complète |
| GUIDE_INTEGRATION_GROUPS_V4.md | Intégration étape par étape |
| TEST_GROUPS_MODULE_V4.md | 22 tests à exécuter |
| INDEX_GROUPS_MODULE_V4.md | Index et navigation |

---

## 🚀 Prochaines étapes

Après l'intégration :

1. **Phase 4** : Affichage des groupes générés
2. **Phase 5** : Swaps et statistiques
3. **Phase 6** : Sauvegardes et finalisation

---

## 💡 Conseils

✅ **À faire** :
- Tester en standalone d'abord
- Lire la documentation avant d'intégrer
- Exécuter les tests avant de valider
- Consulter le guide d'intégration

❌ **À NE PAS faire** :
- Modifier le code du module sans comprendre
- Intégrer sans tester
- Modifier InterfaceV2 core
- Ignorer les erreurs de la console

---

## 📝 Résumé

Le Module Groupes V4 est une refonte ergonomique complète du workflow de gestion des groupes.

**Fichiers** : 8 (3 code + 5 documentation)
**Lignes** : 2,700+
**Tests** : 22
**Phases** : 3
**Colonnes** : 3

**Statut** : ✅ Prêt à tester et intégrer

---

## 🎓 Conclusion

Vous avez tout ce qu'il faut pour :
1. ✅ Tester le module
2. ✅ Comprendre l'architecture
3. ✅ L'intégrer dans InterfaceV2
4. ✅ Valider le fonctionnement
5. ✅ Continuer avec les phases futures

**Commencez par tester le module en standalone, puis lisez le guide d'intégration.**

Bonne chance ! 🚀
