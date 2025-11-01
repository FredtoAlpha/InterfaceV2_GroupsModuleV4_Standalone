# Module Groupes V4 - Refonte Ergonomique

## Vue d'ensemble

Le Module Groupes V4 est une refonte complète de l'ergonomie du workflow de gestion des groupes. Il utilise une structure en **3 colonnes** avec un pipeline guidé en **3 phases**.

### Fichiers créés

1. **InterfaceV2_GroupsModuleV4_Part1.html** - Structure HTML et CSS
2. **InterfaceV2_GroupsModuleV4_Script.js** - Logique JavaScript (classe ModuleGroupsV4)
3. **InterfaceV2_GroupsModuleV4_Complete.html** - Version complète intégrée (à finaliser)

## Architecture

### État centralisé (ModuleGroupsV4.state)

```javascript
{
  // Navigation
  currentPhase: 1,           // Phase actuelle (1, 2 ou 3)
  totalPhases: 3,            // Nombre total de phases
  
  // Phase 1: Scénario
  scenario: null,            // 'needs' | 'lv2' | 'options'
  
  // Phase 2: Mode distribution
  distributionMode: null,    // 'heterogeneous' | 'homogeneous'
  
  // Phase 3: Associations
  associations: [],          // [{ id, name, classes, groupCount, createdAt }]
  activeAssociationId: null,
  
  // Données
  classesData: {},           // Données brutes du backend
  classKeyMap: {},           // Mapping affichage -> backend
  loadedClasses: [],         // Classes chargées
  selectedClassesForModal: [], // Sélection temporaire du modal
  
  // UI
  isLoading: false,
  error: null
}
```

## Structure en 3 colonnes

### Colonne 1 : Phases (Gauche - 320px)
- Liste des 3 phases avec badges d'état
- Navigation entre phases
- Survol affiche résumé

### Colonne 2 : Contenu (Centre - Flexible)
- Affiche le contenu de la phase active
- Animations slide-in
- Cartes interactives

### Colonne 3 : Récapitulatif (Droite - 320px)
- Résumé des choix courants
- Alertes contextuelles
- Bouton "Continuer" (activé selon les prérequis)

## Les 3 Phases

### Phase 1 : Sélection du scénario pédagogique
- 3 cartes verticales : Besoins, LV2, Options
- Chaque carte affiche :
  - Icône dédiée
  - Titre et description
  - Critères utilisés (lien "Voir les critères")
- Interaction : clic sélectionne la carte
- Validation : au moins 1 scénario sélectionné

### Phase 2 : Choix du mode de distribution
- 2 boutons segmentés : Hétérogène, Homogène
- Description synthétique sous chaque bouton
- Lien "Comparer les modes" (optionnel)
- Passage automatique à Phase 3 après sélection
- Validation : au moins 1 mode sélectionné

### Phase 3 : Gestion des associations de classes
- Sous-titre "Regroupements successifs" avec compteur
- Liste des passes créées avec actions (Renommer, Dupliquer, Supprimer)
- Bouton "Nouvelle association" ouvrant le modal
- Validation : au moins 1 association créée

## Modal "Nouvelle association"

### Structure (2 colonnes)

**Colonne gauche : Sélecteur de classes**
- Champ de recherche instantanée
- Liste des classes avec checkboxes
- Filtrage dynamique

**Colonne droite : Construction de la passe**
- Champ "Nom de la passe" (auto-généré ex: "Passe A")
- Champ "Nombre de groupes" (2-10, défaut 3)
- Affichage des classes sélectionnées
- Info validation (nombre d'élèves, colonnes FIN/INT)

### Boutons
- "Annuler" - Ferme le modal
- "Valider" - Activé si ≥2 classes sélectionnées

## Intégration dans InterfaceV2

### Étapes d'intégration

1. **Inclure le HTML** dans InterfaceV2.html
   ```html
   <!-- Charger le module Groupes V4 -->
   <script src="InterfaceV2_GroupsModuleV4_Script.js"></script>
   ```

2. **Ajouter le conteneur** dans le DOM
   ```html
   <div id="groups-module-v4-container"></div>
   ```

3. **Initialiser le module** au démarrage
   ```javascript
   // Dans le code d'initialisation d'InterfaceV2
   const groupsModule = new ModuleGroupsV4();
   ```

### Pas de modifications à :
- InterfaceV2.html (structure générale)
- Header et boutons existants
- Autres modules
- interfaceV2 core

## Fonctionnalités clés

### Persistance d'état
- Sauvegarde automatique dans localStorage
- Restauration au rechargement
- Clé : `moduleGroupsV4State`

### Validation progressive
- Phase 1 : Scénario requis
- Phase 2 : Mode requis
- Phase 3 : ≥1 association requise
- Bouton "Continuer" désactivé jusqu'aux prérequis

### Feedback utilisateur
- Badges d'état (À faire, En cours, Validé)
- Animations slide-in
- Toasts informatifs (optionnel)
- Messages d'aide contextuels

### Responsive
- Desktop : 3 colonnes visibles
- Tablette (< 1200px) : colonnes réduites
- Mobile (< 768px) : colonnes latérales masquées

## Connexion avec le backend

### Données à charger
1. **loadClassesDataForGroups** - Récupère les classes et élèves
2. **loadFINSheetsWithScores** - Parse les feuilles FIN
3. **generateGroupsV4** - Lance la génération

### Mapping des colonnes FIN
```
ID_ELEVE → id
NOM → nom
PRENOM → prenom
SEXE → sexe
LV2 → lv2
OPT → option
SCORE_F → scoreF
SCORE_M → scoreM
COM → com
TRA → tra
PART → part
ABS → abs
```

## Détection des classes (suffixes FIN/INT)

- Cherche d'abord les feuilles suffixées **FIN** (prioritaires)
- Sinon, utilise les feuilles suffixées **INT**
- Exemple : "6°1" → cherche "6°1FIN" ou "6°1INT"

## Algorithme de génération (V4)

### Normalisation
- Z-scores pour les notes
- Pondérations spécifiques au scénario

### Distribution
- **Hétérogène** : round-robin (tous niveaux mélangés)
- **Homogène** : quantiles (par niveau)

### Ajustements
- Équilibre filles/garçons
- Recalcul des statistiques (moyennes, COM, TRA, PART, ABS)

## Swaps et statistiques (Phase 4+)

### Moteur de swaps côté client
- Drag & drop avec contraintes
- Vérification du bloc d'association
- Équilibre F/M
- Historique (Undo/Redo)

### Panneau latéral de statistiques
- Détails COM, TRA, PART, ABS
- Menu "Comparer" pour tableau de bord analytique
- Temps réel après swaps

## Sauvegardes et finalisation

### saveTempGroupsV4
- Supprime les feuilles TEMP existantes
- Crée des onglets grBe/grLv/grOp suffixés (A, B, C...)
- Masque les feuilles
- Enregistre métadonnées

### finalizeTempGroupsV4
- Renomme TEMP → version finale
- Actualise métadonnées
- Assure traçabilité

## Nomenclature des feuilles

- **grBesoinsA** - Groupes Besoins, Passe A
- **grLV2B** - Groupes LV2, Passe B
- **grOptionsC** - Groupes Options, Passe C

Les lettres (A, B, C) permettent d'identifier immédiatement le regroupement.

## Prochaines étapes

1. ✅ Créer la structure HTML/CSS (3 colonnes)
2. ✅ Implémenter la logique JavaScript (phases, état)
3. ⏳ Intégrer dans InterfaceV2 (sans toucher aux autres éléments)
4. ⏳ Connecter au backend (loadClassesDataForGroups, generateGroupsV4)
5. ⏳ Implémenter Phase 4 (affichage des groupes générés)
6. ⏳ Implémenter le moteur de swaps
7. ⏳ Tester et valider

## Notes importantes

- **Pas de modification** à interfaceV2, header, ou autres boutons
- **Isolation complète** du module groupe
- **État centralisé** pour faciliter les tests
- **localStorage** pour persistance entre sessions
- **Responsive** pour tous les écrans
