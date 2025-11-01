# Plan de Test - Module Groupes V4

## 🧪 Tests fonctionnels

### Test 1 : Initialisation du module
**Objectif** : Vérifier que le module s'initialise correctement

**Étapes** :
1. Ouvrir `InterfaceV2_GroupsModuleV4_Standalone.html`
2. Vérifier que le header s'affiche
3. Vérifier que les 3 colonnes sont visibles
4. Vérifier que la Phase 1 est affichée par défaut

**Résultat attendu** :
- ✅ Header visible avec titre "Module Groupes"
- ✅ 3 colonnes : Phases (gauche), Contenu (centre), Récapitulatif (droite)
- ✅ Phase 1 affichée avec 3 cartes (Besoins, LV2, Options)
- ✅ Bouton "Continuer" désactivé

### Test 2 : Phase 1 - Sélection du scénario
**Objectif** : Tester la sélection du scénario

**Étapes** :
1. Cliquer sur la carte "Besoins"
2. Vérifier que la carte est surlignée
3. Vérifier que le récapitulatif se met à jour
4. Vérifier que le bouton "Continuer" s'active

**Résultat attendu** :
- ✅ Carte "Besoins" surlignée (border indigo, fond bleu clair)
- ✅ Récapitulatif affiche "Scénario: Besoins"
- ✅ Bouton "Continuer" activé
- ✅ Badge "En cours" sur Phase 1

**Tester aussi** :
- Cliquer sur "LV2" → change la sélection
- Cliquer sur "Options" → désactivé (opacity 0.5)

### Test 3 : Navigation entre phases
**Objectif** : Tester la navigation entre les phases

**Étapes** :
1. Sélectionner "Besoins"
2. Cliquer "Continuer" → doit aller à Phase 2
3. Vérifier que Phase 1 affiche badge "Validé"
4. Vérifier que Phase 2 est affichée

**Résultat attendu** :
- ✅ Phase 1 passe à "Validé" (badge vert)
- ✅ Phase 2 passe à "En cours"
- ✅ Contenu affiche Phase 2 (2 boutons : Hétérogène, Homogène)
- ✅ Indicateur de progression : "Phase 2 sur 3"

### Test 4 : Phase 2 - Choix du mode
**Objectif** : Tester la sélection du mode de distribution

**Étapes** :
1. Cliquer sur "Hétérogène"
2. Vérifier que la carte est surlignée
3. Vérifier que le récapitulatif se met à jour
4. Vérifier que le bouton "Continuer" s'active
5. Cliquer "Continuer" → doit aller à Phase 3

**Résultat attendu** :
- ✅ Carte "Hétérogène" surlignée
- ✅ Récapitulatif affiche "Mode: Hétérogène"
- ✅ Bouton "Continuer" activé
- ✅ Passage automatique à Phase 3 après sélection

### Test 5 : Phase 3 - Gestion des associations
**Objectif** : Tester la création d'associations

**Étapes** :
1. Vérifier que Phase 3 affiche "0/3 passes configurées"
2. Vérifier que le message "Aucune passe configurée" s'affiche
3. Cliquer "Nouvelle association"
4. Vérifier que le modal s'ouvre

**Résultat attendu** :
- ✅ Phase 3 affichée avec compteur "0/3"
- ✅ Message vide visible
- ✅ Modal s'ouvre avec 2 colonnes
- ✅ Bouton "Continuer" désactivé

### Test 6 : Modal - Sélection de classes
**Objectif** : Tester la sélection de classes dans le modal

**Étapes** :
1. Modal ouvert
2. Taper "6°1" dans la recherche
3. Vérifier que les classes sont filtrées
4. Cocher "6°1"
5. Vérifier que la classe apparaît à droite

**Résultat attendu** :
- ✅ Recherche filtre les classes en temps réel
- ✅ Classe cochée apparaît dans "Classes sélectionnées"
- ✅ Bouton "Valider" reste désactivé (< 2 classes)

### Test 7 : Modal - Création d'une passe
**Objectif** : Tester la création complète d'une passe

**Étapes** :
1. Cocher "6°1" et "6°2"
2. Entrer "Passe A" comme nom
3. Laisser "3" comme nombre de groupes
4. Cliquer "Valider"
5. Vérifier que le modal se ferme
6. Vérifier que la passe apparaît dans Phase 3

**Résultat attendu** :
- ✅ Bouton "Valider" s'active (≥2 classes)
- ✅ Modal se ferme après validation
- ✅ Passe "Passe A" apparaît dans la liste
- ✅ Compteur passe à "1/3"
- ✅ Bouton "Continuer" s'active

### Test 8 : Persistance localStorage
**Objectif** : Tester la sauvegarde et restauration d'état

**Étapes** :
1. Créer une passe "Passe A" avec 6°1 et 6°2
2. Ouvrir la console : `localStorage.getItem('moduleGroupsV4State')`
3. Vérifier que l'état est sauvegardé
4. Rafraîchir la page (F5)
5. Vérifier que l'état est restauré

**Résultat attendu** :
- ✅ localStorage contient `moduleGroupsV4State`
- ✅ État JSON valide
- ✅ Après rafraîchissement : Phase 3, scénario, mode, passe restaurés
- ✅ Pas de perte de données

### Test 9 : Fermeture du module
**Objectif** : Tester la fermeture du module

**Étapes** :
1. Cliquer le bouton X en haut à droite
2. Vérifier que le module se ferme

**Résultat attendu** :
- ✅ Module disparaît (display: none)
- ✅ État persiste dans localStorage

### Test 10 : Retour en arrière
**Objectif** : Tester la navigation en arrière

**Étapes** :
1. Être en Phase 3
2. Cliquer sur "Phase 1" dans la colonne des phases
3. Vérifier que le contenu change
4. Vérifier que les choix précédents sont conservés

**Résultat attendu** :
- ✅ Contenu passe à Phase 1
- ✅ Scénario "Besoins" reste sélectionné
- ✅ Pas de perte de données

## 📱 Tests de responsivité

### Test 11 : Desktop (> 1200px)
**Étapes** :
1. Ouvrir le module sur desktop
2. Vérifier que les 3 colonnes sont visibles

**Résultat attendu** :
- ✅ 3 colonnes visibles et bien espacées
- ✅ Largeur phases : 320px
- ✅ Largeur récapitulatif : 320px
- ✅ Contenu flexible

### Test 12 : Tablette (768px - 1200px)
**Étapes** :
1. Redimensionner à 1000px
2. Vérifier l'affichage

**Résultat attendu** :
- ✅ Colonnes réduites mais visibles
- ✅ Contenu lisible
- ✅ Pas de débordement

### Test 13 : Mobile (< 768px)
**Étapes** :
1. Redimensionner à 500px
2. Vérifier l'affichage

**Résultat attendu** :
- ✅ Colonnes latérales masquées
- ✅ Contenu occupe toute la largeur
- ✅ Récapitulatif en bas (si visible)
- ✅ Pas de débordement

## 🎨 Tests visuels

### Test 14 : Animations
**Étapes** :
1. Naviguer entre les phases
2. Ouvrir/fermer le modal
3. Observer les animations

**Résultat attendu** :
- ✅ Animations slide-in fluides
- ✅ Transitions smooth
- ✅ Pas de saccades

### Test 15 : Couleurs et contraste
**Étapes** :
1. Vérifier la lisibilité du texte
2. Vérifier le contraste des badges
3. Vérifier les couleurs des cartes

**Résultat attendu** :
- ✅ Texte lisible sur tous les fonds
- ✅ Badges bien visibles
- ✅ Cartes sélectionnées clairement identifiées

### Test 16 : Icônes
**Étapes** :
1. Vérifier que toutes les icônes s'affichent
2. Vérifier que Font Awesome est chargé

**Résultat attendu** :
- ✅ Icônes visibles (📊, 🗣️, 🎨, etc.)
- ✅ Pas d'erreurs dans la console

## 🔍 Tests de validation

### Test 17 : Validation Phase 1
**Étapes** :
1. Essayer de continuer sans sélectionner de scénario
2. Vérifier que le bouton reste désactivé

**Résultat attendu** :
- ✅ Bouton "Continuer" désactivé
- ✅ Message d'alerte visible

### Test 18 : Validation Phase 2
**Étapes** :
1. Aller à Phase 2
2. Essayer de continuer sans sélectionner de mode
3. Vérifier que le bouton reste désactivé

**Résultat attendu** :
- ✅ Bouton "Continuer" désactivé
- ✅ Message d'alerte visible

### Test 19 : Validation Phase 3
**Étapes** :
1. Aller à Phase 3
2. Essayer de continuer sans créer de passe
3. Vérifier que le bouton reste désactivé
4. Créer une passe
5. Vérifier que le bouton s'active

**Résultat attendu** :
- ✅ Bouton désactivé sans passe
- ✅ Bouton activé avec ≥1 passe
- ✅ Message d'alerte visible

### Test 20 : Validation Modal
**Étapes** :
1. Ouvrir le modal
2. Essayer de valider sans sélectionner de classe
3. Vérifier que le bouton reste désactivé
4. Sélectionner 1 classe
5. Vérifier que le bouton reste désactivé
6. Sélectionner 2 classes
7. Vérifier que le bouton s'active

**Résultat attendu** :
- ✅ Bouton désactivé avec < 2 classes
- ✅ Bouton activé avec ≥ 2 classes

## 🐛 Tests de débogage

### Test 21 : Console
**Étapes** :
1. Ouvrir la console (F12)
2. Vérifier qu'il n'y a pas d'erreurs
3. Vérifier que `window.ModuleGroupsV4` existe

**Résultat attendu** :
- ✅ Pas d'erreurs JavaScript
- ✅ Pas d'avertissements critiques
- ✅ `window.ModuleGroupsV4` est une classe

### Test 22 : localStorage
**Étapes** :
1. Ouvrir la console
2. Exécuter : `localStorage.getItem('moduleGroupsV4State')`
3. Vérifier que l'état est valide

**Résultat attendu** :
- ✅ État JSON valide
- ✅ Contient scenario, distributionMode, associations

## 📋 Checklist de validation

- [ ] Test 1 : Initialisation
- [ ] Test 2 : Phase 1 - Sélection
- [ ] Test 3 : Navigation
- [ ] Test 4 : Phase 2 - Mode
- [ ] Test 5 : Phase 3 - Associations
- [ ] Test 6 : Modal - Sélection
- [ ] Test 7 : Modal - Création
- [ ] Test 8 : Persistance
- [ ] Test 9 : Fermeture
- [ ] Test 10 : Retour en arrière
- [ ] Test 11 : Desktop
- [ ] Test 12 : Tablette
- [ ] Test 13 : Mobile
- [ ] Test 14 : Animations
- [ ] Test 15 : Couleurs
- [ ] Test 16 : Icônes
- [ ] Test 17 : Validation Phase 1
- [ ] Test 18 : Validation Phase 2
- [ ] Test 19 : Validation Phase 3
- [ ] Test 20 : Validation Modal
- [ ] Test 21 : Console
- [ ] Test 22 : localStorage

## ✅ Résultat final

Tous les tests passent ✅ → Module prêt pour l'intégration dans InterfaceV2
