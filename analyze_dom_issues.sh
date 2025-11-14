#!/bin/bash

# Script d'analyse des références DOM dangereuses dans le code
# Identifie les usages de document/window qui pourraient s'exécuter côté serveur

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║     ANALYSE DES RÉFÉRENCES DOM DANGEREUSES                        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

TOTAL_ISSUES=0

# Fonction pour compter et afficher les occurrences
check_pattern() {
    local pattern="$1"
    local description="$2"
    local files="$3"

    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Recherche: $description${NC}"
    echo ""

    local count=0
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            local file_count=$(grep -c "$pattern" "$file" 2>/dev/null || echo "0")
            if [ "$file_count" -gt 0 ]; then
                echo -e "${RED}  ❌ $file: $file_count occurrence(s)${NC}"
                grep -n "$pattern" "$file" 2>/dev/null | head -5 | while read -r line; do
                    echo "     $line"
                done
                count=$((count + file_count))
            fi
        fi
    done <<< "$files"

    if [ $count -eq 0 ]; then
        echo -e "${GREEN}  ✅ Aucun problème détecté${NC}"
    else
        echo -e "${RED}  Total: $count occurrence(s)${NC}"
        TOTAL_ISSUES=$((TOTAL_ISSUES + count))
    fi
    echo ""
}

# Obtenir la liste des fichiers .html et .js
HTML_FILES=$(find . -name "*.html" -type f | grep -v node_modules | grep -v ".git")
JS_FILES=$(find . -name "*.js" -type f | grep -v node_modules | grep -v ".git")
ALL_FILES="$HTML_FILES
$JS_FILES"

# 1. Rechercher les références directes à document
check_pattern "^\s*document\." "Références directes à document.*" "$ALL_FILES"

# 2. Rechercher les références directes à window
check_pattern "^\s*window\." "Références directes à window.*" "$ALL_FILES"

# 3. Rechercher document.getElementById sans guard
check_pattern "document\.getElementById" "document.getElementById (non protégé)" "$ALL_FILES"

# 4. Rechercher document.querySelector sans guard
check_pattern "document\.querySelector" "document.querySelector (non protégé)" "$ALL_FILES"

# 5. Rechercher document.body
check_pattern "document\.body" "document.body (non protégé)" "$ALL_FILES"

# 6. Rechercher addEventListener au top-level
check_pattern "addEventListener\(" "addEventListener (peut être problématique)" "$ALL_FILES"

# 7. Rechercher window.location
check_pattern "window\.location" "window.location (non protégé)" "$ALL_FILES"

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                      RÉSUMÉ DE L'ANALYSE                          ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  Total de problèmes potentiels détectés: ${RED}$TOTAL_ISSUES${NC}"
echo ""

if [ $TOTAL_ISSUES -gt 0 ]; then
    echo "  ⚠️  RECOMMANDATIONS:"
    echo "  1. Encapsuler le code DOM dans des guards d'environnement"
    echo "  2. Utiliser typeof document !== 'undefined' avant d'accéder au DOM"
    echo "  3. Isoler le code client dans des fonctions DOMContentLoaded"
    echo ""
    exit 1
else
    echo -e "  ${GREEN}✅ Aucun problème détecté !${NC}"
    echo ""
    exit 0
fi
