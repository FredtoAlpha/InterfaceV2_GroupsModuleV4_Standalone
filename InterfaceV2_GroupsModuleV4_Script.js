/**
 * MODULE GROUPES V4 - REFONTE ERGONOMIQUE
 * Structure en 3 colonnes avec pipeline guidé en 3 phases
 * 
 * État centralisé : scénario, mode de répartition, regroupements, caches
 * Phases : 1) Scénario 2) Mode distribution 3) Associations classes
 */

(function(global) {
  'use strict';

  // Détection robuste de l'objet global
  const windowRef = typeof window !== 'undefined' 
    ? window 
    : typeof global !== 'undefined' 
      ? global 
      : typeof globalThis !== 'undefined'
        ? globalThis
        : {};
  const documentRef = windowRef?.document;

  if (!windowRef || !documentRef) {
    console.log('❌ ModuleGroupsV4: environnement navigateur non détecté');
    return;
  }

  console.log('🚀 Chargement du Module Groupes V4 - Refonte Ergonomique');

  class ModuleGroupsV4 {
    constructor() {
      this.state = {
        // Navigation
        currentPhase: 1,
        totalPhases: 3,

        // Phase 1: Scénario
        scenario: null, // 'needs' | 'lv2' | 'options'

        // Phase 2: Mode distribution
        distributionMode: null, // 'heterogeneous' | 'homogeneous'

        // Phase 3: Associations
        associations: [], // [{ id, name, classes, groupCount, createdAt }]
        activeAssociationId: null,

        // Données
        classesData: {},
        classKeyMap: {},
        loadedClasses: [],
        selectedClassesForModal: [],

        // Résultats de génération
        generatedGroups: [],
        statistics: [],
        alerts: [],

        // UI
        isLoading: false,
        error: null
      };

      // Tracker les listeners pour éviter les fuites mémoire
      this.listeners = [];

      this.scenarios = {
        needs: {
          id: 'needs',
          title: 'Besoins',
          description: 'Équilibrer les besoins spécifiques',
          icon: '📊',
          criteria: ['Scores Math/Français', 'Indicateurs COM/TRA/PART/ABS', 'Équilibre F/M']
        },
        lv2: {
          id: 'lv2',
          title: 'LV2',
          description: 'Groupes de langues (ESP/ITA)',
          icon: '🗣️',
          criteria: ['Langue choisie', 'Participation', 'Équilibre niveaux']
        },
        options: {
          id: 'options',
          title: 'Options',
          description: 'Groupes basés sur les options',
          icon: '🎨',
          criteria: ['Options choisies', 'Équilibre pédagogique'],
          disabled: true
        }
      };

      this.distributionModes = {
        heterogeneous: {
          id: 'heterogeneous',
          label: 'Hétérogène',
          description: 'Tous niveaux mélangés (round-robin)',
          icon: '🔀'
        },
        homogeneous: {
          id: 'homogeneous',
          label: 'Homogène',
          description: 'Par niveau (quantiles)',
          icon: '📊'
        }
      };

      this.init();
    }

    init() {
      this.loadStateFromStorage();
      this.loadClassesFromBackend();
      this.render();
    }

    setupEventListeners() {
      // Nettoyer les anciens listeners
      this.removeEventListeners();

      // Fermer le module
      const closeBtn = documentRef.getElementById('close-module');
      if (closeBtn) {
        const handler = () => this.close();
        closeBtn.addEventListener('click', handler);
        this.listeners.push({ element: closeBtn, event: 'click', handler });
      }

      // Continuer
      const continueBtn = documentRef.getElementById('continue-button');
      if (continueBtn) {
        const handler = () => this.nextPhase();
        continueBtn.addEventListener('click', handler);
        this.listeners.push({ element: continueBtn, event: 'click', handler });
      }

      // Modal close buttons
      documentRef.querySelectorAll('.modal-close').forEach(btn => {
        const handler = () => this.closeModal();
        btn.addEventListener('click', handler);
        this.listeners.push({ element: btn, event: 'click', handler });
      });

      // Modal overlay click
      const modal = documentRef.getElementById('modal-new-association');
      if (modal) {
        const handler = (e) => {
          if (e.target.id === 'modal-new-association') {
            this.closeModal();
          }
        };
        modal.addEventListener('click', handler);
        this.listeners.push({ element: modal, event: 'click', handler });
      }

      // Validation passe
      const validateBtn = documentRef.getElementById('validate-pass-button');
      if (validateBtn) {
        const handler = () => this.validateNewAssociation();
        validateBtn.addEventListener('click', handler);
        this.listeners.push({ element: validateBtn, event: 'click', handler });
      }

      // Recherche classes dans modal
      const searchInput = documentRef.getElementById('class-search');
      if (searchInput) {
        const handler = (e) => this.filterClasses(e.target.value);
        searchInput.addEventListener('input', handler);
        this.listeners.push({ element: searchInput, event: 'input', handler });
      }
    }

    removeEventListeners() {
      this.listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.listeners = [];
    }

    render() {
      this.removeEventListeners();
      this.renderPhases();
      this.renderContent();
      this.renderSummary();
      this.updateContinueButton();
      this.setupEventListeners();
      this.saveStateToStorage();
    }

    renderPhases() {
      const container = documentRef.getElementById('phases-list');
      if (!container) return;

      container.innerHTML = '';

      const phases = [
        { number: 1, title: 'Scénario', description: 'Sélectionner le type' },
        { number: 2, title: 'Mode', description: 'Choisir la distribution' },
        { number: 3, title: 'Associations', description: 'Gérer les regroupements' }
      ];

      phases.forEach(phase => {
        const status = this.getPhaseStatus(phase.number);
        const isActive = this.state.currentPhase === phase.number;

        const phaseEl = documentRef.createElement('div');
        phaseEl.className = `phase-item ${isActive ? 'active' : ''} ${status === 'completed' ? 'completed' : ''}`;
        
        const statusBadgeClass = status === 'completed' ? 'badge-validated' : status === 'in-progress' ? 'badge-in-progress' : 'badge-todo';
        const statusText = status === 'completed' ? 'Validé' : status === 'in-progress' ? 'En cours' : 'À faire';
        const statusIcon = status === 'completed' ? '<i class="fas fa-check"></i>' : phase.number;

        phaseEl.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
              ${statusIcon}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 text-sm">${phase.title}</p>
              <p class="text-xs text-gray-600 mt-1">${phase.description}</p>
              <div class="mt-2">
                <span class="${statusBadgeClass}">
                  ${statusText}
                </span>
              </div>
            </div>
          </div>
        `;

        phaseEl.addEventListener('click', () => {
          if (status === 'completed' || isActive) {
            this.goToPhase(phase.number);
          }
        });

        container.appendChild(phaseEl);
      });
    }

    renderContent() {
      const container = documentRef.getElementById('content-container');
      if (!container) return;

      container.innerHTML = '';

      switch (this.state.currentPhase) {
        case 1:
          this.renderPhase1(container);
          break;
        case 2:
          this.renderPhase2(container);
          break;
        case 3:
          this.renderPhase3(container);
          break;
      }
    }

    renderPhase1(container) {
      const html = `
        <div class="animate-slide-in">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Sélectionner le scénario pédagogique</h2>
          <p class="text-gray-600 mb-8">Choisissez le type de regroupement que vous souhaitez créer</p>

          <div class="grid grid-cols-1 gap-6">
            ${Object.values(this.scenarios).map(scenario => `
              <div class="scenario-card ${scenario.disabled ? 'disabled' : ''} ${this.state.scenario === scenario.id ? 'selected' : ''}" data-scenario="${scenario.id}">
                <div class="flex items-start gap-4">
                  <div class="text-4xl">${scenario.icon}</div>
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900">${scenario.title}</h3>
                    <p class="text-gray-600 mt-1">${scenario.description}</p>
                    
                    <div class="mt-4">
                      <p class="text-sm font-semibold text-gray-700 mb-2">Critères utilisés :</p>
                      <ul class="text-sm text-gray-600 space-y-1">
                        ${scenario.criteria.map(c => `<li class="flex items-center gap-2"><i class="fas fa-check text-green-600"></i>${c}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Event listeners
      container.querySelectorAll('.scenario-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', () => {
          const scenario = card.dataset.scenario;
          this.selectScenario(scenario);
        });
      });
    }

    renderPhase2(container) {
      const html = `
        <div class="animate-slide-in">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Choisir le mode de distribution</h2>
          <p class="text-gray-600 mb-8">Sélectionnez comment les élèves seront répartis dans les groupes</p>

          <div class="grid grid-cols-2 gap-6 mb-8">
            ${Object.values(this.distributionModes).map(mode => `
              <div class="scenario-card ${this.state.distributionMode === mode.id ? 'selected' : ''}" data-mode="${mode.id}">
                <div class="text-4xl mb-4">${mode.icon}</div>
                <h3 class="text-xl font-bold text-gray-900">${mode.label}</h3>
                <p class="text-gray-600 mt-2">${mode.description}</p>
              </div>
            `).join('')}
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="font-semibold text-blue-900 mb-3">Comparaison des modes</h3>
            <div class="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p class="font-semibold text-blue-900 mb-2">Hétérogène (round-robin)</p>
                <ul class="text-blue-800 space-y-1">
                  <li>✓ Tous niveaux mélangés</li>
                  <li>✓ Équilibre pédagogique</li>
                  <li>✓ Recommandé</li>
                </ul>
              </div>
              <div>
                <p class="font-semibold text-blue-900 mb-2">Homogène (quantiles)</p>
                <ul class="text-blue-800 space-y-1">
                  <li>✓ Groupes par niveau</li>
                  <li>✓ Progression adaptée</li>
                  <li>✓ Spécialisé</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Event listeners
      container.querySelectorAll('[data-mode]').forEach(card => {
        card.addEventListener('click', () => {
          const mode = card.dataset.mode;
          this.selectDistributionMode(mode);
        });
      });
    }

    renderPhase3(container) {
      const html = `
        <div class="animate-slide-in">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Gérer les associations de classes</h2>
          <p class="text-gray-600 mb-8">Créez des regroupements successifs avant de lancer la génération</p>

          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">Regroupements successifs</h3>
              <span class="text-sm text-gray-600">${this.state.associations.length}/3 passes configurées</span>
            </div>

            ${this.state.associations.length > 0 ? `
              <div class="space-y-3 mb-6">
                ${this.state.associations.map((assoc, idx) => `
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p class="font-semibold text-gray-900">${assoc.name}</p>
                      <p class="text-sm text-gray-600 mt-1">${assoc.classes.length} classe(s) • ${assoc.groupCount} groupe(s)</p>
                    </div>
                    <div class="flex gap-2">
                      <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Renommer">
                        <i class="fas fa-pen text-gray-600"></i>
                      </button>
                      <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Dupliquer">
                        <i class="fas fa-copy text-gray-600"></i>
                      </button>
                      <button class="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Supprimer">
                        <i class="fas fa-trash text-red-600"></i>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <i class="fas fa-inbox text-4xl text-gray-400 mb-3"></i>
                <p class="text-gray-600">Aucune passe configurée</p>
                <p class="text-sm text-gray-500 mt-1">Créez au moins une passe pour continuer</p>
              </div>
            `}
          </div>

          <button id="new-association-button" class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <i class="fas fa-plus"></i>
            Nouvelle association
          </button>

          ${this.state.associations.length > 0 ? `
            <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-800">
                <i class="fas fa-check-circle mr-2"></i>
                Vous pouvez créer jusqu'à 3 passes avant de lancer la génération
              </p>
            </div>
          ` : ''}
        </div>
      `;

      container.innerHTML = html;

      // Event listeners
      documentRef.getElementById('new-association-button')?.addEventListener('click', () => {
        this.openNewAssociationModal();
      });
    }

    renderSummary() {
      const container = documentRef.getElementById('summary-content');
      if (!container) return;

      let html = '<div class="space-y-6">';

      // Scénario
      html += `
        <div>
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Scénario</p>
          <div class="p-3 bg-gray-50 rounded-lg">
            ${this.state.scenario ? `
              <p class="font-semibold text-gray-900">${this.scenarios[this.state.scenario].title}</p>
              <p class="text-xs text-gray-600 mt-1">${this.scenarios[this.state.scenario].description}</p>
            ` : `
              <p class="text-gray-600 text-sm">À sélectionner</p>
            `}
          </div>
        </div>
      `;

      // Mode distribution
      html += `
        <div>
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Mode</p>
          <div class="p-3 bg-gray-50 rounded-lg">
            ${this.state.distributionMode ? `
              <p class="font-semibold text-gray-900">${this.distributionModes[this.state.distributionMode].label}</p>
            ` : `
              <p class="text-gray-600 text-sm">À sélectionner</p>
            `}
          </div>
        </div>
      `;

      // Associations
      html += `
        <div>
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Associations</p>
          <div class="p-3 bg-gray-50 rounded-lg">
            ${this.state.associations.length > 0 ? `
              <p class="font-semibold text-gray-900">${this.state.associations.length} passe(s)</p>
              <ul class="text-xs text-gray-600 mt-2 space-y-1">
                ${this.state.associations.map(a => `<li>• ${a.name}</li>`).join('')}
              </ul>
            ` : `
              <p class="text-gray-600 text-sm">À configurer</p>
            `}
          </div>
        </div>
      `;

      // Alertes
      if (this.state.currentPhase === 3 && this.state.associations.length === 0) {
        html += `
          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-xs text-yellow-800 font-semibold mb-1">⚠️ Attention</p>
            <p class="text-xs text-yellow-700">Créez au moins une passe avant de continuer</p>
          </div>
        `;
      }

      html += '</div>';
      container.innerHTML = html;
    }

    selectScenario(scenario) {
      this.state.scenario = scenario;
      this.render();
    }

    selectDistributionMode(mode) {
      this.state.distributionMode = mode;
      this.render();
    }

    nextPhase() {
      if (this.canAdvancePhase()) {
        this.state.currentPhase++;
        this.render();
        documentRef.getElementById('current-phase').textContent = this.state.currentPhase;
      }
    }

    goToPhase(phase) {
      this.state.currentPhase = phase;
      this.render();
      documentRef.getElementById('current-phase').textContent = this.state.currentPhase;
    }

    getPhaseStatus(phase) {
      if (phase < this.state.currentPhase) return 'completed';
      if (phase === this.state.currentPhase) return 'in-progress';
      return 'todo';
    }

    canAdvancePhase() {
      switch (this.state.currentPhase) {
        case 1:
          return this.state.scenario !== null;
        case 2:
          return this.state.distributionMode !== null;
        case 3:
          return this.state.associations.length > 0;
        default:
          return false;
      }
    }

    updateContinueButton() {
      const btn = documentRef.getElementById('continue-button');
      if (!btn) return;

      const canAdvance = this.canAdvancePhase();
      btn.disabled = !canAdvance;

      if (this.state.currentPhase === this.state.totalPhases) {
        btn.textContent = 'Générer les groupes';
        btn.disabled = !canAdvance;
      } else {
        btn.textContent = 'Continuer';
      }
    }

    nextPhase() {
      // Phase 3 → Générer les groupes
      if (this.state.currentPhase === 3 && this.canAdvancePhase()) {
        this.generateGroups();
        return;
      }

      // Autres phases → Avancer
      if (this.state.currentPhase < this.state.totalPhases) {
        this.state.currentPhase++;
        this.render();
      }
    }

    generateGroups() {
      console.log('🚀 Génération des groupes...');
      this.state.isLoading = true;
      this.render();

      // Préparer le payload
      const payload = {
        students: this.state.loadedClasses,
        scenario: this.state.scenario,
        distributionMode: this.state.distributionMode,
        associations: this.state.associations
      };

      // Appeler l'algorithme
      if (window.GroupsAlgorithmV4) {
        try {
          const algorithm = new window.GroupsAlgorithmV4();
          const result = algorithm.generateGroups(payload);

          if (result.success) {
            this.state.generatedGroups = result.passes || result.groups;
            this.state.statistics = result.statistics;
            this.state.alerts = result.alerts;
            this.state.currentPhase = 4; // Phase 4 : Affichage
            console.log('✅ Génération réussie');
            console.log('Groupes générés:', this.state.generatedGroups);
            console.log('Alertes:', this.state.alerts);
          } else {
            this.state.error = result.error || 'Erreur inconnue';
            console.error('❌ Erreur:', this.state.error);
          }
        } catch (error) {
          this.state.error = error.message;
          console.error('❌ Exception:', error);
        }
      } else {
        this.state.error = 'Algorithme non disponible';
        console.error('❌ GroupsAlgorithmV4 non trouvé');
      }

      this.state.isLoading = false;
      this.render();
    }

    loadClassesFromBackend() {
      // Essayer de charger les classes du backend
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler((classes) => {
          if (classes && Array.isArray(classes)) {
            this.state.loadedClasses = classes;
            this.render();
          }
        }).withFailureHandler((error) => {
          console.warn('⚠️ Impossible de charger les classes du backend:', error);
          // Utiliser des classes par défaut
          this.state.loadedClasses = ['6°1', '6°2', '5°1', '5°2', '4°1', '4°2'];
          this.render();
        }).getAvailableClasses();
      } else {
        // Environnement de test : utiliser des classes par défaut
        this.state.loadedClasses = ['6°1', '6°2', '5°1', '5°2', '4°1', '4°2'];
      }
    }

    openNewAssociationModal() {
      const modal = documentRef.getElementById('modal-new-association');
      if (modal) {
        modal.classList.remove('hidden');
        this.renderClassesSelector();
      }
    }

    closeModal() {
      const modal = documentRef.getElementById('modal-new-association');
      if (modal) {
        modal.classList.add('hidden');
        this.state.selectedClassesForModal = [];
      }
    }

    renderClassesSelector() {
      const container = documentRef.getElementById('classes-selector');
      if (!container) return;

      // Utiliser les vraies classes chargées du backend
      const classes = this.state.loadedClasses && this.state.loadedClasses.length > 0
        ? this.state.loadedClasses
        : ['6°1', '6°2', '5°1', '5°2', '4°1', '4°2'];

      container.innerHTML = classes.map(cls => `
        <label class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
          <input type="checkbox" class="class-checkbox" value="${cls}" />
          <span class="text-sm text-gray-700">${cls}</span>
        </label>
      `).join('');

      container.querySelectorAll('.class-checkbox').forEach(checkbox => {
        const handler = () => this.updateSelectedClasses();
        checkbox.addEventListener('change', handler);
        this.listeners.push({ element: checkbox, event: 'change', handler });
      });
    }

    updateSelectedClasses() {
      const checkboxes = documentRef.querySelectorAll('.class-checkbox:checked');
      this.state.selectedClassesForModal = Array.from(checkboxes).map(cb => cb.value);
      this.updateSelectedClassesList();
      this.updatePassValidation();
    }

    updateSelectedClassesList() {
      const container = documentRef.getElementById('selected-classes-list');
      if (!container) return;

      if (this.state.selectedClassesForModal.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-600">Aucune classe sélectionnée</p>';
      } else {
        container.innerHTML = this.state.selectedClassesForModal.map(cls => `
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-700">• ${cls}</span>
          </div>
        `).join('');
      }
    }

    updatePassValidation() {
      const btn = documentRef.getElementById('validate-pass-button');
      if (btn) {
        btn.disabled = this.state.selectedClassesForModal.length < 2;
      }
    }

    filterClasses(searchTerm) {
      const checkboxes = documentRef.querySelectorAll('.class-checkbox');
      checkboxes.forEach(checkbox => {
        const label = checkbox.parentElement;
        const text = checkbox.value.toLowerCase();
        const matches = text.includes(searchTerm.toLowerCase());
        label.style.display = matches ? 'flex' : 'none';
      });
    }

    validateNewAssociation() {
      const name = documentRef.getElementById('pass-name')?.value || `Passe ${String.fromCharCode(65 + this.state.associations.length)}`;
      const groupCount = parseInt(documentRef.getElementById('num-groups')?.value || 3);

      // Validation avec messages inline
      if (this.state.selectedClassesForModal.length < 2) {
        this.showInlineError('pass-validation-info', 
          '❌ Sélectionnez au moins 2 classes');
        return;
      }

      if (!name.trim()) {
        this.showInlineError('pass-validation-info', 
          '❌ Entrez un nom pour la passe');
        return;
      }

      if (groupCount < 2 || groupCount > 10) {
        this.showInlineError('pass-validation-info', 
          '❌ Le nombre de groupes doit être entre 2 et 10');
        return;
      }

      const association = {
        id: `assoc-${Date.now()}`,
        name: name,
        classes: this.state.selectedClassesForModal,
        groupCount: groupCount,
        createdAt: new Date().toISOString()
      };

      this.state.associations.push(association);
      this.showInlineError('pass-validation-info', 
        '✅ Passe créée avec succès');
      setTimeout(() => this.closeModal(), 500);
      this.render();
    }

    showInlineError(elementId, message) {
      const el = documentRef.getElementById(elementId);
      if (el) {
        el.innerHTML = `<p style="color: ${message.includes('✅') ? '#16a34a' : '#dc2626'}; font-size: 0.875rem;">${message}</p>`;
      }
    }

    saveStateToStorage() {
      try {
        localStorage.setItem('moduleGroupsV4State', JSON.stringify(this.state));
      } catch (e) {
        console.warn('Impossible de sauvegarder l\'état:', e);
      }
    }

    loadStateFromStorage() {
      try {
        const saved = localStorage.getItem('moduleGroupsV4State');
        if (saved) {
          const loaded = JSON.parse(saved);
          this.state = { ...this.state, ...loaded };
        }
      } catch (e) {
        console.warn('Impossible de charger l\'état:', e);
      }
    }

    close() {
      const module = documentRef.getElementById('groups-module-v4');
      if (module) {
        module.style.display = 'none';
      }
    }
  }

  // Initialiser le module
  if (documentRef.readyState === 'loading') {
    documentRef.addEventListener('DOMContentLoaded', () => {
      windowRef.ModuleGroupsV4 = new ModuleGroupsV4();
    });
  } else {
    windowRef.ModuleGroupsV4 = new ModuleGroupsV4();
  }

})(typeof window !== 'undefined' 
  ? window 
  : typeof global !== 'undefined' 
    ? global 
    : typeof globalThis !== 'undefined'
      ? globalThis
      : {});
