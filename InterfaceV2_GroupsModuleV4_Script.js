/**
 * MODULE GROUPES V4 - LOADER MINIMAL
 *
 * ✅ ORDRE 2 : Loader minimal < 200 lignes
 * ✅ Responsabilité unique : instancier TriptychGroupsModule
 * ✅ Aucune duplication de logique métier
 *
 * La logique complète réside dans InterfaceV4_Triptyque_Logic.js
 */

(function() {
  'use strict';

  // Détection robuste de l'environnement
  const windowRef = typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : typeof self !== 'undefined'
        ? self
        : {};

  const documentRef = windowRef.document;

  if (!windowRef || !documentRef) {
    console.warn('❌ ModuleGroupsV4Loader: environnement navigateur non détecté');
    return;
  }

  console.log('🚀 Chargement du Module Groupes V4 (loader minimal)');

  /**
   * Wrapper minimal autour de TriptychGroupsModule
   * Gère uniquement :
   * - Instanciation du module
   * - Exposition globale
   * - Callbacks simples (open/close)
   */
  class ModuleGroupsV4 {
    constructor() {
      this.triptyque = null;
      this.container = null;
    }

    /**
     * Ouvrir l'interface V4
     */
    open() {
      console.log('🔓 Ouverture du Module V4');

      if (!this.container) {
        // Créer le conteneur principal
        this.container = documentRef.createElement('div');
        this.container.id = 'groups-module-v4';
        this.container.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 px-4';
        this.container.innerHTML = `
          <div class="w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <!-- Conteneur du module triptyque -->
            <div id="triptyque-root"></div>
          </div>
        `;
        documentRef.body.appendChild(this.container);
      }

      // Afficher le conteneur
      this.container.style.display = 'flex';

      // Instancier TriptychGroupsModule si nécessaire
      if (!this.triptyque) {
        const trRoot = documentRef.querySelector('#triptyque-root');
        if (trRoot && windowRef.TriptychGroupsModule) {
          // Injecter les données V4 si disponibles
          if (windowRef.GROUPS_MODULE_V4_DATA) {
            console.log('✅ Données V4 injectées:', windowRef.GROUPS_MODULE_V4_DATA.classes?.length || 0, 'classes');
          }

          // Créer l'instance du triptyque
          this.triptyque = new windowRef.TriptychGroupsModule(trRoot);
          console.log('✅ TriptychGroupsModule instancié');

          // ✅ ORDRE 3 FIX : Écouter l'événement groups:generate
          // et connecter au moteur GroupsAlgorithmV4
          if (trRoot) {
            trRoot.addEventListener('groups:generate', (event) => {
              console.log('🚀 Event groups:generate reçu avec payload:', event.detail);

              if (typeof windowRef.GroupsAlgorithmV4 === 'undefined') {
                console.error('❌ GroupsAlgorithmV4 non disponible');
                console.error('   ➜ Vérifier inclusion GroupsAlgorithmV4_Distribution.js');
                trRoot.dispatchEvent(new CustomEvent('groups:error', {
                  detail: { message: 'Algorithme non disponible' }
                }));
                return;
              }

              try {
                // Instancier l'algorithme et générer
                const algorithm = new windowRef.GroupsAlgorithmV4();
                const result = algorithm.generateGroups(event.detail);

                if (result.success) {
                  console.log('✅ Génération réussie');
                  console.log('   Passes:', result.passes?.length || 0);
                  console.log('   Stats:', result.statistics);

                  // Retourner les résultats au triptyque
                  trRoot.dispatchEvent(new CustomEvent('groups:generated', {
                    detail: result
                  }));
                } else {
                  console.error('❌ Génération échouée:', result.error);
                  trRoot.dispatchEvent(new CustomEvent('groups:error', {
                    detail: { message: result.error }
                  }));
                }
              } catch (error) {
                console.error('❌ Exception génération:', error);
                trRoot.dispatchEvent(new CustomEvent('groups:error', {
                  detail: { message: error.message }
                }));
              }
            });

            console.log('✅ Event listener groups:generate attaché');
          }
        } else {
          console.error('❌ TriptychGroupsModule non disponible');
          if (!windowRef.TriptychGroupsModule) {
            console.error('   ➜ InterfaceV4_Triptyque_Logic.js n\'a pas chargé');
          }
          if (!trRoot) {
            console.error('   ➜ Élément #triptyque-root non trouvé');
          }
          return false;
        }
      }

      return true;
    }

    /**
     * Fermer l'interface V4
     */
    close() {
      console.log('🔒 Fermeture du Module V4');
      if (this.container) {
        this.container.style.display = 'none';
      }
    }

    /**
     * Détruire et nettoyer
     */
    destroy() {
      console.log('♻️ Destruction du Module V4');
      if (this.container && this.container.parentNode) {
        this.container.remove();
      }
      this.triptyque = null;
      this.container = null;
    }
  }

  // ✅ Exposer la classe (pas une instance)
  windowRef.ModuleGroupsV4 = ModuleGroupsV4;

  // Créer une instance globale unique
  windowRef._moduleGroupsV4Instance = null;

  // Helper : obtenir/créer l'instance unique
  windowRef.getModuleGroupsV4 = function() {
    if (!windowRef._moduleGroupsV4Instance) {
      windowRef._moduleGroupsV4Instance = new ModuleGroupsV4();
    }
    return windowRef._moduleGroupsV4Instance;
  };

  // Helper : ouvrir directement
  windowRef.openModuleGroupsV4 = function() {
    const module = windowRef.getModuleGroupsV4();
    return module.open();
  };

  // Helper : fermer directement
  windowRef.closeModuleGroupsV4 = function() {
    const module = windowRef.getModuleGroupsV4();
    return module.close();
  };

  console.log('✅ ModuleGroupsV4 loader chargé (', documentRef.querySelectorAll('*').length, 'éléments DOM)');

})(); // Pas de paramètre global - ORDRE 5 compatible
