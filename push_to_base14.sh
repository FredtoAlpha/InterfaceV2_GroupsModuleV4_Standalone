#!/bin/bash

# Script pour pousser la branche 10101010 vers BASE-14-REFRESH
# À exécuter manuellement en dehors de Claude Code

echo "═══════════════════════════════════════════════════════"
echo "PUSH VERS BASE-14-REFRESH - BRANCHE 10101010"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Ajouter le remote BASE-14-REFRESH (si pas déjà fait)
echo "1. Configuration du remote BASE-14-REFRESH..."
git remote add base14 https://github.com/FredtoAlpha/BASE-14-REFRESH.git 2>/dev/null || echo "   Remote 'base14' déjà existant"

# 2. Créer/Checkout la branche 10101010
echo "2. Création de la branche 10101010..."
git checkout -b 10101010 2>/dev/null || git checkout 10101010

# 3. Pousser vers BASE-14-REFRESH
echo "3. Push vers BASE-14-REFRESH..."
git push -u base14 10101010

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ TERMINÉ !"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Vérifiez sur : https://github.com/FredtoAlpha/BASE-14-REFRESH/tree/10101010"
