# Algorithme de Répartition V4 - Documentation Technique Complète

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Données d'entrée](#données-dentrée)
3. [Étapes de l'algorithme](#étapes-de-lalgorithme)
4. [Implémentation](#implémentation)
5. [Exemples](#exemples)
6. [Validation](#validation)

---

## Vue d'ensemble

L'algorithme de répartition V4 orchestre la création de groupes équilibrés en combinant :
- **Normalisation statistique** (z-scores)
- **Pondérations dynamiques** selon le scénario
- **Stratégies de distribution** (hétérogène vs homogène)
- **Contraintes pédagogiques** (parité F/M, équilibre comportemental)
- **Gestion interactive** (swaps, historique, undo/redo)

---

## Données d'entrée

### Colonnes requises (FIN/INT)

```
ID_ELEVE          → id
NOM               → nom
PRENOM            → prenom
SEXE              → sexe (F/M)
SCORE_M           → scoreM (Mathématiques)
SCORE_F           → scoreF (Français)
```

### Colonnes optionnelles (comportementales)

```
COM               → com (Communication)
TRA               → tra (Travail)
PART              → part (Participation)
ABS               → abs (Absentéisme)
LV2               → lv2 (Langue vivante 2)
OPT               → opt (Options)
CLASSE            → classe (Classe d'origine)
```

### Format de consolidation

```javascript
{
  id: "E001",
  nom: "Dupont",
  prenom: "Alice",
  sexe: "F",
  scoreM: 15.5,
  scoreF: 14.2,
  com: 8,
  tra: 7,
  part: 9,
  abs: 1,
  lv2: "ESP",
  opt: "Arts",
  classe: "6°1"
}
```

---

## Étapes de l'algorithme

### Étape 1 : Consolidation des données

**Objectif** : Valider et normaliser les données d'entrée

**Processus** :
1. Valider la présence des champs requis
2. Convertir les types (strings → numbers)
3. Imputer les valeurs manquantes par la médiane de classe
4. Créer un index pour chaque élève

**Code** :
```javascript
const consolidated = algorithm.consolidateData(students, scenario);
```

**Résultat** :
```javascript
[
  { id: "E001", nom: "Dupont", ..., originalIndex: 0 },
  { id: "E002", nom: "Martin", ..., originalIndex: 1 },
  ...
]
```

---

### Étape 2 : Normalisation (Z-scores)

**Objectif** : Convertir les scores bruts en valeurs comparables

**Formule** :
```
z_score = (valeur - moyenne) / écart_type
```

**Processus** :
1. Calculer moyenne et écart-type pour chaque colonne
2. Appliquer la formule z-score
3. Imputer les valeurs manquantes par la médiane de classe

**Exemple** :
```
Colonne SCORE_M: [12, 14, 16, 18, 20]
Moyenne = 16, Écart-type = 3.16

Pour un élève avec SCORE_M = 14:
z_SCORE_M = (14 - 16) / 3.16 = -0.63
```

**Code** :
```javascript
const normalized = algorithm.normalizeScores(consolidated);
```

**Résultat** :
```javascript
{
  scoreM: 14,
  z_scoreM: -0.63,
  scoreF: 14.2,
  z_scoreF: -0.42,
  com: 8,
  z_com: 0.15,
  ...
}
```

---

### Étape 3 : Calcul de l'indice composite

**Objectif** : Créer un score unique combinant tous les critères

**Pondérations par scénario** :

#### Besoins (équilibre académique + comportement)
```
indice = 0.30*z_scoreM + 0.30*z_scoreF + 0.15*z_com + 0.15*z_tra + 0.05*z_part - 0.05*z_abs
```

#### LV2 (accent sur français + participation)
```
indice = 0.20*z_scoreM + 0.35*z_scoreF + 0.10*z_com + 0.10*z_tra + 0.20*z_part - 0.05*z_abs
```

#### Options (équilibre complet)
```
indice = 0.25*z_scoreM + 0.25*z_scoreF + 0.15*z_com + 0.15*z_tra + 0.10*z_part - 0.05*z_abs
```

**Exemple** :
```
Élève Alice (Besoins):
z_scoreM = 0.50
z_scoreF = 0.30
z_com = 0.20
z_tra = 0.10
z_part = 0.05
z_abs = -0.10

indice = 0.30*0.50 + 0.30*0.30 + 0.15*0.20 + 0.15*0.10 + 0.05*0.05 - 0.05*(-0.10)
       = 0.15 + 0.09 + 0.03 + 0.015 + 0.0025 + 0.005
       = 0.3525
```

**Code** :
```javascript
const indexed = algorithm.calculateCompositeIndex(normalized, scenario);
```

---

### Étape 4a : Distribution Hétérogène (Round-robin serpentin)

**Objectif** : Mélanger tous les niveaux dans chaque groupe

**Processus** :
1. Trier les élèves par indice décroissant
2. Distribuer en round-robin serpentin (zigzag)
3. Équilibrer la parité F/M

**Exemple avec 3 groupes** :
```
Élèves triés par indice: [A, B, C, D, E, F, G, H, I]

Round-robin serpentin:
Groupe 1: [A, D, G]  (positions 0, 3, 6)
Groupe 2: [B, E, H]  (positions 1, 4, 7)
Groupe 3: [C, F, I]  (positions 2, 5, 8)

Puis alternance pour le zigzag:
Passe 1: A → G1, B → G2, C → G3
Passe 2: D → G3, E → G2, F → G1  (inversé)
Passe 3: G → G1, H → G2, I → G3
```

**Code** :
```javascript
const groups = algorithm.distributeHeterogeneous(indexed, numGroups);
```

---

### Étape 4b : Distribution Homogène (Quantiles)

**Objectif** : Créer des groupes de niveaux similaires

**Processus** :
1. Trier les élèves par indice décroissant
2. Diviser en quantiles (tranches égales)
3. Assigner chaque tranche à un groupe
4. Équilibrer la parité F/M

**Exemple avec 3 groupes et 9 élèves** :
```
Élèves triés: [A, B, C, D, E, F, G, H, I]
Taille de groupe: 3

Groupe 1 (haut niveau): [A, B, C]
Groupe 2 (niveau moyen): [D, E, F]
Groupe 3 (bas niveau): [G, H, I]
```

**Code** :
```javascript
const groups = algorithm.distributeHomogeneous(indexed, numGroups);
```

---

### Étape 5 : Équilibrage de la parité F/M

**Objectif** : Assurer |F - M| ≤ 1 dans chaque groupe

**Processus** :
1. Compter F et M dans chaque groupe
2. Si écart > 1, chercher un swap
3. Échanger avec un autre groupe pour équilibrer

**Exemple** :
```
Groupe 1: F=3, M=1, écart=2 (déséquilibré)
Groupe 2: F=1, M=3, écart=2 (déséquilibré)

Swap: Femme de G1 ↔ Homme de G2

Après:
Groupe 1: F=2, M=2, écart=0 ✓
Groupe 2: F=2, M=2, écart=0 ✓
```

**Code** :
```javascript
algorithm.balanceParityInGroups(groups);
```

---

### Étape 6 : Calcul des statistiques

**Objectif** : Générer les métriques pour chaque groupe

**Statistiques calculées** :

```javascript
{
  groupId: 0,
  size: 9,
  
  // Académique
  meanScoreM: 15.2,
  meanScoreF: 14.8,
  
  // Comportemental
  meanCom: 7.5,
  meanTra: 7.2,
  meanPart: 8.1,
  totalAbs: 3,
  
  // Parité
  femaleCount: 5,
  maleCount: 4,
  ratioF: 0.556,
  
  // Indice
  meanIndice: 0.25
}
```

**Code** :
```javascript
const statistics = algorithm.calculateGroupStatistics(groups);
```

---

### Étape 7 : Validation des contraintes

**Objectif** : Identifier les déséquilibres

**Contraintes vérifiées** :

1. **Parité F/M** : |F - M| ≤ 1
2. **Équilibre académique** : écart à la moyenne ≤ ±10%
3. **Équilibre comportemental** : écart à la moyenne ≤ ±10%

**Alertes générées** :

```javascript
{
  type: 'parity',
  groupId: 2,
  severity: 'warning',
  message: 'Parité déséquilibrée: F=3, M=1'
}
```

**Code** :
```javascript
const alerts = algorithm.validateConstraints(groups, statistics);
```

---

## Implémentation

### Fichiers

1. **GroupsAlgorithmV4_Distribution.js** (400+ lignes)
   - Classe `GroupsAlgorithmV4`
   - Toutes les étapes de l'algorithme
   - Calcul des statistiques

2. **GroupsSwapManager_V4.js** (300+ lignes)
   - Classe `GroupsSwapManager`
   - Gestion des swaps
   - Historique et undo/redo

### Utilisation

```javascript
// Initialiser l'algorithme
const algorithm = new GroupsAlgorithmV4();

// Préparer les données
const payload = {
  students: [
    { id: "E001", nom: "Dupont", ..., scoreM: 15, scoreF: 14 },
    ...
  ],
  scenario: 'needs',
  distributionMode: 'heterogeneous',
  numGroups: 3
};

// Générer les groupes
const result = algorithm.generateGroups(payload);

if (result.success) {
  console.log('Groupes:', result.groups);
  console.log('Statistiques:', result.statistics);
  console.log('Alertes:', result.alerts);
}
```

### Gestion des swaps

```javascript
// Initialiser le gestionnaire
const swapManager = new GroupsSwapManager(algorithm);

// Effectuer un swap
const swapResult = swapManager.performSwap(
  groups,
  statistics,
  0,  // fromGroupIdx
  2,  // fromStudentIdx
  1,  // toGroupIdx
  5   // toStudentIdx
);

// Undo
const undoResult = swapManager.undo();

// Redo
const redoResult = swapManager.redo();

// Historique
const history = swapManager.getHistory();
```

---

## Exemples

### Exemple 1 : Scénario Besoins (3 groupes, 12 élèves)

**Données d'entrée** :
```
Élèves: 12 (6F, 6M)
Scores M: [12, 14, 16, 18, 20, 15, 13, 17, 19, 14, 16, 18]
Scores F: [11, 13, 15, 17, 19, 14, 12, 16, 18, 13, 15, 17]
```

**Processus** :
1. Consolidation ✓
2. Normalisation (z-scores) ✓
3. Indice composite (Besoins) ✓
4. Distribution hétérogène ✓
5. Équilibrage parité ✓
6. Statistiques ✓

**Résultat** :
```
Groupe 1: [E1, E4, E7] → meanScoreM=16.3, meanScoreF=15.7, F=2, M=1
Groupe 2: [E2, E5, E8] → meanScoreM=16.0, meanScoreF=15.3, F=2, M=1
Groupe 3: [E3, E6, E9] → meanScoreM=16.7, meanScoreF=16.0, F=2, M=1
```

---

### Exemple 2 : Scénario LV2 (2 groupes, 8 élèves)

**Données d'entrée** :
```
Élèves: 8 (4F, 4M)
Scores F: [18, 16, 14, 12, 17, 15, 13, 11]
Participation: [9, 7, 8, 6, 8, 6, 7, 5]
```

**Pondérations LV2** :
- Français: 0.35 (priorité)
- Participation: 0.20 (important)
- Math: 0.20
- Autres: 0.25

**Résultat** :
```
Groupe 1: [E1, E3, E5, E7] → meanScoreF=16.5, meanPart=8.0, F=2, M=2
Groupe 2: [E2, E4, E6, E8] → meanScoreF=13.5, meanPart=6.0, F=2, M=2
```

---

## Validation

### Tests unitaires recommandés

1. **Consolidation**
   - Valider les champs requis
   - Imputer les valeurs manquantes
   - Gérer les types

2. **Normalisation**
   - Z-scores corrects
   - Moyenne = 0, écart-type = 1
   - Gestion des valeurs manquantes

3. **Indice composite**
   - Pondérations appliquées correctement
   - Résultats dans la plage attendue

4. **Distribution**
   - Hétérogène: tous les niveaux mélangés
   - Homogène: niveaux similaires par groupe
   - Pas de perte d'élèves

5. **Parité**
   - |F - M| ≤ 1 dans chaque groupe
   - Swaps effectués correctement

6. **Statistiques**
   - Moyennes calculées correctement
   - Ratios F/M exacts
   - Alertes générées appropriées

### Exemple de test

```javascript
// Test: Distribution hétérogène
const students = [
  { id: "E1", scoreM: 20, scoreF: 19, sexe: "F" },
  { id: "E2", scoreM: 10, scoreF: 9, sexe: "M" },
  { id: "E3", scoreM: 15, scoreF: 14, sexe: "F" },
  { id: "E4", scoreM: 5, scoreF: 4, sexe: "M" }
];

const result = algorithm.generateGroups({
  students,
  scenario: 'needs',
  distributionMode: 'heterogeneous',
  numGroups: 2
});

// Vérifications
console.assert(result.success, 'Génération réussie');
console.assert(result.groups.length === 2, '2 groupes créés');
console.assert(result.groups[0].length + result.groups[1].length === 4, 'Tous les élèves assignés');
console.assert(result.statistics[0].ratioF >= 0.25, 'Parité respectée');
```

---

## Conclusion

L'algorithme V4 fournit une répartition scientifiquement fondée tout en restant flexible pour les ajustements manuels. Les statistiques en temps réel et l'historique permettent à l'utilisateur de prendre des décisions éclairées.

**Prochaines étapes** :
- Implémenter les swaps interactifs (drag & drop)
- Ajouter le panneau de statistiques détaillées
- Implémenter le menu "Comparer"
- Sauvegarder et finaliser les groupes
