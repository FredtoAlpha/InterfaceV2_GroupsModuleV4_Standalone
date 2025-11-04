#!/bin/bash

# Script de vérification des corrections - Branche Propre
# Branche : claude/groups-module-v4-clean-011CUoSa1Lo8CaN7dR1mWDnK

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   VÉRIFICATION DES CORRECTIONS - MODULE GROUPES V4         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Fonction de test
test_feature() {
    local description="$1"
    local command="$2"
    local expected="$3"

    echo -n "  🔍 $description... "

    if eval "$command" > /dev/null 2>&1; then
        if [ -n "$expected" ]; then
            local result=$(eval "$command" 2>/dev/null)
            if echo "$result" | grep -q "$expected"; then
                echo -e "${GREEN}✅ PRÉSENT${NC}"
                ((PASSED++))
                return 0
            fi
        else
            echo -e "${GREEN}✅ PRÉSENT${NC}"
            ((PASSED++))
            return 0
        fi
    fi

    echo -e "${RED}❌ MANQUANT${NC}"
    ((FAILED++))
    return 1
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  HANDLER GROUPS:GENERATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_feature "Fonction handleGroupsGenerate" \
    "grep -c 'function handleGroupsGenerate' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Validation du payload" \
    "grep -c 'if (!payload || !payload.regroupements' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Vérification GroupsAlgorithmV4" \
    "grep -c 'if (!windowRef.GroupsAlgorithmV4)' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Itération sur payload.regroupements" \
    "grep -c 'payload.regroupements.forEach' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Appel à generateGroups avec numGroups" \
    "grep -c 'numGroups: regroupement.groupCount' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Enregistrement du handler" \
    "grep -c \"addEventListener('groups:generate', handleGroupsGenerate)\" InterfaceV4_Triptyque_Logic.js" \
    "[12]"  # Au moins 1 ou 2 occurrences

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  RENDU DES RÉSULTATS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_feature "Méthode renderGenerationPreview" \
    "grep -c 'renderGenerationPreview()' InterfaceV4_Triptyque_Logic.js" \
    "[1-9]"

test_feature "Méthode renderGenerationStats" \
    "grep -c 'renderGenerationStats(result)' InterfaceV4_Triptyque_Logic.js" \
    "[1-9]"

test_feature "Gestion du carrousel (prev)" \
    "grep -c 'carousel-prev' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Gestion du carrousel (next)" \
    "grep -c 'carousel-next' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Stockage lastGenerationResults" \
    "grep -c 'state.lastGenerationResults' InterfaceV4_Triptyque_Logic.js" \
    "[1-9]"

test_feature "Listener groups:generated" \
    "grep -c \"addEventListener('groups:generated'\" InterfaceV4_Triptyque_Logic.js" \
    "1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  FICHIERS ET STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_feature "Fichier de test standalone" \
    "test -f TEST_Module_Groupes_V4_Standalone.html"

test_feature "Script algorithme" \
    "test -f GroupsAlgorithmV4_Distribution.js"

test_feature "Script triptyque" \
    "test -f InterfaceV4_Triptyque_Logic.js"

test_feature "Script loader" \
    "test -f InterfaceV2_GroupsModuleV4_Script.js"

test_feature "Template restored" \
    "test -f InterfaceV2_GroupsModuleV4_Part1_RESTORED.html"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_feature "README principal" \
    "test -f README.md"

test_feature "Rapport de restauration" \
    "test -f RAPPORT_RESTAURATION_GROUPES_V4.md"

test_feature "Corrections session finale" \
    "test -f CORRECTIONS_SESSION_FINALE_04NOV2025.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  CORRECTIONS SPÉCIFIQUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_feature "DEFAULT_CLASSES = null" \
    "grep -c 'const DEFAULT_CLASSES = null' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Détection windowRef/globalThis" \
    "grep -c 'typeof globalThis' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Réinitialisation log DOM" \
    "grep -c 'generationLog.innerHTML = \"\"' InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Événement groups:generate émis" \
    "grep -c \"CustomEvent('groups:generate'\" InterfaceV4_Triptyque_Logic.js" \
    "1"

test_feature "Événement groups:generated émis" \
    "grep -c \"CustomEvent('groups:generated'\" InterfaceV4_Triptyque_Logic.js" \
    "1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  CONTENU DU FICHIER DE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f TEST_Module_Groupes_V4_Standalone.html ]; then
    test_feature "Données simulées window.STATE" \
        "grep -c 'window.STATE = {' TEST_Module_Groupes_V4_Standalone.html" \
        "1"

    test_feature "Classe 4A avec élèves" \
        "grep -c \"'4A':\" TEST_Module_Groupes_V4_Standalone.html" \
        "1"

    test_feature "Classe 4B avec élèves" \
        "grep -c \"'4B':\" TEST_Module_Groupes_V4_Standalone.html" \
        "1"

    test_feature "Classe 4C avec élèves" \
        "grep -c \"'4C':\" TEST_Module_Groupes_V4_Standalone.html" \
        "1"

    test_feature "Inclusion script algorithme" \
        "grep -c 'GroupsAlgorithmV4_Distribution.js' TEST_Module_Groupes_V4_Standalone.html" \
        "1"

    test_feature "Inclusion script triptyque" \
        "grep -c 'InterfaceV4_Triptyque_Logic.js' TEST_Module_Groupes_V4_Standalone.html" \
        "1"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      RÉSULTATS FINAUX                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "  Tests réussis : ${GREEN}$PASSED${NC} / $TOTAL"
echo "  Tests échoués : ${RED}$FAILED${NC} / $TOTAL"
echo "  Taux de réussite : ${GREEN}${PERCENTAGE}%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TOUTES LES CORRECTIONS SONT PRÉSENTES !${NC}"
    echo ""
    echo "  La branche claude/groups-module-v4-clean-011CUoSa1Lo8CaN7dR1mWDnK"
    echo "  contient bien toutes les corrections annoncées."
    echo ""
    exit 0
else
    echo -e "${RED}❌ CERTAINES CORRECTIONS SONT MANQUANTES${NC}"
    echo ""
    echo "  Veuillez vérifier les éléments marqués comme MANQUANT ci-dessus."
    echo ""
    exit 1
fi
