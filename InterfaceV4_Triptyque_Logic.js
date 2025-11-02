/**
 * INTERFACE TRIPTYQUE - MODULE GROUPES V4
 * Architecture permanente en 3 volets avec gestion d'état centralisée
 * Remplace le système de phases successives
 */

(function(global) {
  'use strict';

  // Détection robuste de l'environnement
  const windowRef = typeof window !== 'undefined' 
    ? window 
    : typeof global !== 'undefined' 
      ? global 
      : typeof globalThis !== 'undefined'
        ? globalThis
        : {};
  
  const documentRef = windowRef?.document;

  if (!windowRef || !documentRef) {
    console.warn('❌ TriptychGroupsModule: environnement navigateur non détecté');
    return;
  }

  // Classes par défaut si aucune donnée injectée
  const DEFAULT_CLASSES = [
    { id: '6-1', label: '6°1' },
    { id: '6-2', label: '6°2' },
    { id: '6-3', label: '6°3' },
    { id: '6-4', label: '6°4' },
    { id: '6-5', label: '6°5' }
  ];

  // Configuration des scénarios
  const SCENARIOS = {
    needs: {
      id: 'needs',
      title: 'Besoins',
      description: "Équilibrer les besoins spécifiques (accompagnement, PPRE, ULIS…)",
      helper: "Choisissez les classes à prendre en compte dans vos regroupements puis vérifiez l'équilibre des profils."
    },
    lv2: {
      id: 'lv2',
      title: 'LV2',
      description: 'Rassembler les classes selon la langue vivante 2 choisie',
      helper: "Sélectionnez les classes concernées par la LV2 pour orchestrer vos groupes ESP/ITA."
    },
    options: {
      id: 'options',
      title: 'Options',
      description: 'Créer des regroupements autour des enseignements facultatifs',
      helper: "Identifiez les classes où l'option est proposée et composez vos regroupements en conséquence."
    }
  };

  // Configuration des modes de distribution
  const MODES = {
    heterogeneous: {
      id: 'heterogeneous',
      label: 'Hétérogène',
      description: "Distribution équilibrée automatiquement par le moteur (round-robin)."
    },
    homogeneous: {
      id: 'homogeneous',
      label: 'Homogène',
      description: "Constitution de groupes par niveau via les quantiles sélectionnés."
    }
  };

  /**
   * Classe principale du module triptyque
   */
  class TriptychGroupsModule {
    constructor(rootSelector = '#groups-module-v4') {
      this.root = typeof rootSelector === 'string'
        ? documentRef.querySelector(rootSelector)
        : rootSelector;

      if (!this.root) {
        console.warn('❌ TriptychGroupsModule: élément racine introuvable');
        return;
      }

      console.log('🚀 Initialisation TriptychGroupsModule');

      this.state = {
        scenario: 'needs',
        distributionMode: 'heterogeneous',
        regroupementCount: 2,
        regroupements: [],
        availableClasses: this.resolveAvailableClasses(),
        generationLog: []
      };

      this.ensureRegroupementPool();
      this.cacheDom();
      this.bindStaticEvents();
      this.renderAll();

      console.log('✅ TriptychGroupsModule initialisé avec succès');
    }

    /**
     * Résout les classes disponibles depuis les données injectées ou utilise les valeurs par défaut
     */
    resolveAvailableClasses() {
      const injected = windowRef?.GROUPS_MODULE_V4_DATA?.classes;
      if (Array.isArray(injected) && injected.length) {
        return injected.map((cls, index) => {
          if (typeof cls === 'string') {
            return { id: `cls-${index}`, label: cls };
          }
          if (cls && typeof cls === 'object') {
            const label = cls.label || cls.name || cls.id || `Classe ${index + 1}`;
            const id = cls.id || cls.code || `cls-${index}`;
            return { id: String(id), label };
          }
          return { id: `cls-${index}`, label: `Classe ${index + 1}` };
        });
      }

      return DEFAULT_CLASSES;
    }

    /**
     * S'assure que le nombre de regroupements correspond au paramètre
     */
    ensureRegroupementPool() {
      const { regroupementCount, regroupements } = this.state;
      if (regroupements.length < regroupementCount) {
        const missing = regroupementCount - regroupements.length;
        for (let i = 0; i < missing; i += 1) {
          const index = regroupements.length + 1;
          this.state.regroupements.push({
            id: `regroupement-${index}`,
            name: `Regroupement ${index}`,
            classes: [],
            groupCount: 3,
            notes: '',
            updatedAt: Date.now()
          });
        }
      } else if (regroupements.length > regroupementCount) {
        this.state.regroupements = regroupements.slice(0, regroupementCount);
      }
    }

    /**
     * Cache les références DOM
     */
    cacheDom() {
      this.dom = {
        scenarioButtons: Array.from(this.root.querySelectorAll('[data-scenario]')),
        scenarioHelper: this.root.querySelector('[data-scenario-helper]'),
        modeButtons: Array.from(this.root.querySelectorAll('[data-mode]')),
        modeHelper: this.root.querySelector('[data-mode-helper]'),
        regroupementCountInput: this.root.querySelector('#regroupement-count'),
        regroupementApplyBtn: this.root.querySelector('#apply-regroupement-count'),
        regroupementColumns: this.root.querySelector('#regroupements-columns'),
        regroupementTimeline: this.root.querySelector('#regroupement-timeline'),
        statsContainer: this.root.querySelector('#regroupement-stats'),
        generationLog: this.root.querySelector('#generation-log'),
        generateBtn: this.root.querySelector('#generate-regroupements'),
        resetBtn: this.root.querySelector('#reset-regroupements'),
        summaryScenario: this.root.querySelector('[data-summary-scenario]'),
        summaryMode: this.root.querySelector('[data-summary-mode]'),
        summaryRegroupements: this.root.querySelector('[data-summary-regroupements]'),
        closeButton: this.root.querySelector('#close-module')
      };
    }

    /**
     * Attache les événements statiques
     */
    bindStaticEvents() {
      // Bouton de fermeture
      if (this.dom.closeButton) {
        this.dom.closeButton.addEventListener('click', () => {
          this.appendLog('⏹️ Fermeture de l\'interface Groupes V4.');
          this.root.dispatchEvent(new CustomEvent('groups:close'));
          this.root.style.display = 'none';
        });
      }

      // Boutons de scénario
      this.dom.scenarioButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const scenarioId = btn.dataset.scenario;
          if (scenarioId && SCENARIOS[scenarioId]) {
            this.state.scenario = scenarioId;
            this.appendLog(`🎯 Scénario sélectionné : ${SCENARIOS[scenarioId].title}`);
            this.renderScenario();
            this.renderSummary();
          }
        });
      });

      // Boutons de mode
      this.dom.modeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const modeId = btn.dataset.mode;
          if (modeId && MODES[modeId]) {
            this.state.distributionMode = modeId;
            this.appendLog(`⚙️ Mode de distribution : ${MODES[modeId].label}`);
            this.renderModes();
            this.renderSummary();
          }
        });
      });

      // Appliquer le nombre de regroupements
      if (this.dom.regroupementApplyBtn) {
        this.dom.regroupementApplyBtn.addEventListener('click', () => {
          const value = Number(this.dom.regroupementCountInput?.value ?? 0);
          if (Number.isFinite(value) && value >= 1 && value <= 10) {
            this.state.regroupementCount = Math.trunc(value);
            this.ensureRegroupementPool();
            this.appendLog(`➕ Nombre de regroupements fixé à ${this.state.regroupementCount}`);
            this.renderRegroupements();
            this.renderSummary();
          } else {
            this.appendLog('⚠️ Veuillez choisir un nombre de regroupements entre 1 et 10.');
          }
        });
      }

      // Bouton de génération
      if (this.dom.generateBtn) {
        this.dom.generateBtn.addEventListener('click', () => {
          const ready = this.validateRegroupements();
          if (!ready.valid) {
            this.appendLog(`❌ Génération impossible : ${ready.message}`);
            return;
          }
          this.appendLog('🚀 Génération lancée pour tous les regroupements…');
          const payload = this.state.regroupements.map((reg) => ({
            id: reg.id,
            name: reg.name,
            classes: reg.classes,
            groupCount: reg.groupCount
          }));
          const event = new CustomEvent('groups:generate', { detail: payload });
          this.root.dispatchEvent(event);
          this.appendLog('✅ Données prêtes à être transmises au moteur de répartition.');
        });
      }

      // Bouton de réinitialisation
      if (this.dom.resetBtn) {
        this.dom.resetBtn.addEventListener('click', () => {
          this.state.regroupements = [];
          this.ensureRegroupementPool();
          this.appendLog('🧽 Réinitialisation complète des regroupements.');
          this.renderRegroupements();
          this.renderSummary();
        });
      }
    }

    /**
     * Rend tous les composants
     */
    renderAll() {
      if (this.dom.regroupementCountInput) {
        this.dom.regroupementCountInput.value = String(this.state.regroupementCount);
      }
      this.renderScenario();
      this.renderModes();
      this.renderRegroupements();
      this.renderSummary();
    }

    /**
     * Rend la sélection de scénario
     */
    renderScenario() {
      this.dom.scenarioButtons.forEach((btn) => {
        const isActive = btn.dataset.scenario === this.state.scenario;
        btn.classList.toggle('is-active', isActive);
      });

      if (this.dom.scenarioHelper) {
        const scenario = SCENARIOS[this.state.scenario];
        this.dom.scenarioHelper.textContent = scenario?.helper ?? '';
      }
    }

    /**
     * Rend la sélection de mode
     */
    renderModes() {
      this.dom.modeButtons.forEach((btn) => {
        const isActive = btn.dataset.mode === this.state.distributionMode;
        btn.classList.toggle('is-active', isActive);
      });

      if (this.dom.modeHelper) {
        const mode = MODES[this.state.distributionMode];
        this.dom.modeHelper.textContent = mode?.description ?? '';
      }
    }

    /**
     * Rend les regroupements
     */
    renderRegroupements() {
      if (!this.dom.regroupementColumns) {
        return;
      }

      this.dom.regroupementColumns.innerHTML = '';
      this.state.regroupements.forEach((regroupement) => {
        const card = this.buildRegroupementCard(regroupement);
        this.dom.regroupementColumns.appendChild(card);
      });

      this.renderStats();
      this.renderTimeline();
    }

    /**
     * Construit une carte de regroupement
     */
    buildRegroupementCard(regroupement) {
      const card = documentRef.createElement('div');
      card.className = 'regroupement-card';
      card.dataset.regroupementId = regroupement.id;

      // Header
      const header = documentRef.createElement('div');
      header.className = 'regroupement-card__header';
      
      const title = documentRef.createElement('h3');
      title.textContent = regroupement.name;
      header.appendChild(title);

      const actions = documentRef.createElement('div');
      actions.className = 'regroupement-card__actions';

      // Bouton renommer
      const renameBtn = documentRef.createElement('button');
      renameBtn.type = 'button';
      renameBtn.className = 'button-link';
      renameBtn.textContent = 'Renommer';
      renameBtn.addEventListener('click', () => {
        const newName = windowRef.prompt('Nom du regroupement', regroupement.name);
        if (newName) {
          regroupement.name = newName.trim();
          regroupement.updatedAt = Date.now();
          this.appendLog(`✏️ ${regroupement.id} renommé en « ${regroupement.name} ».`);
          this.renderRegroupements();
          this.renderSummary();
        }
      });

      // Bouton dupliquer
      const duplicateBtn = documentRef.createElement('button');
      duplicateBtn.type = 'button';
      duplicateBtn.className = 'button-link';
      duplicateBtn.textContent = 'Dupliquer';
      duplicateBtn.addEventListener('click', () => {
        const clone = {
          ...regroupement,
          id: `regroupement-${this.state.regroupements.length + 1}`,
          name: `${regroupement.name} (copie)`,
          updatedAt: Date.now()
        };
        this.state.regroupements.push(clone);
        this.state.regroupementCount = this.state.regroupements.length;
        this.appendLog(`🗂️ Duplication de ${regroupement.name}.`);
        this.renderAll();
      });

      actions.appendChild(renameBtn);
      actions.appendChild(duplicateBtn);
      header.appendChild(actions);

      // Content
      const content = documentRef.createElement('div');
      content.className = 'regroupement-card__content';

      // Section classes
      const classesSection = documentRef.createElement('div');
      classesSection.className = 'regroupement-card__section';

      const classesTitle = documentRef.createElement('h4');
      classesTitle.textContent = 'Classes associées';
      classesSection.appendChild(classesTitle);

      const classesHint = documentRef.createElement('p');
      classesHint.className = 'regroupement-card__hint';
      classesHint.textContent = "Sélectionnez les classes qui composent ce regroupement.";
      classesSection.appendChild(classesHint);

      const classesList = documentRef.createElement('div');
      classesList.className = 'regroupement-card__classes';

      this.state.availableClasses.forEach((classe) => {
        const checkboxId = `${regroupement.id}-${classe.id}`;
        const wrapper = documentRef.createElement('label');
        wrapper.className = 'regroupement-card__class-item';
        wrapper.setAttribute('for', checkboxId);

        const checkbox = documentRef.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = classe.id;
        checkbox.checked = regroupement.classes.includes(classe.id);
        checkbox.addEventListener('change', (event) => {
          this.toggleClassForRegroupement(regroupement.id, classe.id, event.target.checked);
        });

        const span = documentRef.createElement('span');
        span.textContent = classe.label;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(span);
        classesList.appendChild(wrapper);
      });

      classesSection.appendChild(classesList);

      // Section nombre de groupes
      const groupCountSection = documentRef.createElement('div');
      groupCountSection.className = 'regroupement-card__section';

      const groupCountLabel = documentRef.createElement('label');
      groupCountLabel.textContent = 'Nombre de groupes à générer';
      groupCountLabel.setAttribute('for', `${regroupement.id}-group-count`);
      groupCountSection.appendChild(groupCountLabel);

      const groupCountInput = documentRef.createElement('input');
      groupCountInput.type = 'number';
      groupCountInput.min = '2';
      groupCountInput.max = '10';
      groupCountInput.value = String(regroupement.groupCount);
      groupCountInput.id = `${regroupement.id}-group-count`;
      groupCountInput.addEventListener('change', (event) => {
        const value = Number(event.target.value);
        if (Number.isFinite(value) && value >= 2 && value <= 10) {
          regroupement.groupCount = Math.trunc(value);
          regroupement.updatedAt = Date.now();
          this.appendLog(`📦 ${regroupement.name} : ${regroupement.groupCount} groupes demandés.`);
          this.renderSummary();
        } else {
          event.target.value = String(regroupement.groupCount);
          this.appendLog('⚠️ Le nombre de groupes doit être compris entre 2 et 10.');
        }
      });

      groupCountSection.appendChild(groupCountInput);

      content.appendChild(classesSection);
      content.appendChild(groupCountSection);

      // Footer
      const footer = documentRef.createElement('div');
      footer.className = 'regroupement-card__footer';
      footer.innerHTML = `
        <p>🕒 Mise à jour : <strong>${new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(regroupement.updatedAt)}</strong></p>
        <p>${regroupement.classes.length} classe(s) sélectionnée(s)</p>
      `;

      card.appendChild(header);
      card.appendChild(content);
      card.appendChild(footer);

      return card;
    }

    /**
     * Rend les statistiques
     */
    renderStats() {
      if (!this.dom.statsContainer) {
        return;
      }

      const totalClasses = this.state.regroupements.reduce((acc, reg) => acc + reg.classes.length, 0);
      const uniqueClasses = new Set(this.state.regroupements.flatMap((reg) => reg.classes));
      const totalRegroupements = this.state.regroupements.length;

      this.dom.statsContainer.innerHTML = `
        <div class="stat-card">
          <span class="stat-card__label">Regroupements configurés</span>
          <span class="stat-card__value">${totalRegroupements}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Classes impliquées</span>
          <span class="stat-card__value">${uniqueClasses.size}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Sélections totales</span>
          <span class="stat-card__value">${totalClasses}</span>
        </div>
      `;
    }

    /**
     * Rend la timeline
     */
    renderTimeline() {
      if (!this.dom.regroupementTimeline) {
        return;
      }

      const items = this.state.regroupements.map((reg, index) => {
        const label = `${index + 1}. ${reg.name}`;
        return `<li>${label} • ${reg.classes.length} classe(s) • ${reg.groupCount} groupe(s)</li>`;
      });

      this.dom.regroupementTimeline.innerHTML = items.join('');
    }

    /**
     * Rend le récapitulatif
     */
    renderSummary() {
      if (this.dom.summaryScenario) {
        const scenario = SCENARIOS[this.state.scenario];
        this.dom.summaryScenario.textContent = scenario ? `${scenario.title} – ${scenario.description}` : '';
      }

      if (this.dom.summaryMode) {
        const mode = MODES[this.state.distributionMode];
        this.dom.summaryMode.textContent = mode ? `${mode.label} – ${mode.description}` : '';
      }

      if (this.dom.summaryRegroupements) {
        const details = this.state.regroupements.map((reg) => `• ${reg.name} : ${reg.classes.length} classe(s), ${reg.groupCount} groupe(s)`).join('\n');
        this.dom.summaryRegroupements.textContent = details || 'Aucun regroupement configuré pour le moment.';
      }
    }

    /**
     * Ajoute une entrée au journal
     */
    appendLog(message) {
      if (!this.dom.generationLog) {
        return;
      }
      const entry = documentRef.createElement('div');
      entry.className = 'log-entry';
      entry.textContent = `${new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date())} — ${message}`;
      this.dom.generationLog.prepend(entry);
    }

    /**
     * Bascule une classe pour un regroupement
     */
    toggleClassForRegroupement(regroupementId, classId, isChecked) {
      const regroupement = this.state.regroupements.find((reg) => reg.id === regroupementId);
      if (!regroupement) {
        return;
      }

      if (isChecked) {
        if (!regroupement.classes.includes(classId)) {
          regroupement.classes.push(classId);
        }
      } else {
        regroupement.classes = regroupement.classes.filter((cls) => cls !== classId);
      }
      regroupement.updatedAt = Date.now();
      this.appendLog(`📌 ${regroupement.name} → ${regroupement.classes.length} classe(s) sélectionnée(s).`);
      this.renderRegroupements();
      this.renderSummary();
    }

    /**
     * Valide les regroupements avant génération
     */
    validateRegroupements() {
      if (!this.state.regroupements.length) {
        return { valid: false, message: 'aucun regroupement configuré.' };
      }

      const incomplete = this.state.regroupements.find((reg) => reg.classes.length === 0);
      if (incomplete) {
        return { valid: false, message: `${incomplete.name} n'a aucune classe associée.` };
      }

      return { valid: true };
    }
  }

  // Exposer globalement
  windowRef.TriptychGroupsModule = TriptychGroupsModule;

  // Auto-initialisation si l'élément existe
  if (documentRef.readyState === 'loading') {
    documentRef.addEventListener('DOMContentLoaded', () => {
      const root = documentRef.querySelector('#groups-module-v4');
      if (root && !windowRef.__triptychModuleInstance) {
        windowRef.__triptychModuleInstance = new TriptychGroupsModule(root);
      }
    });
  } else {
    const root = documentRef.querySelector('#groups-module-v4');
    if (root && !windowRef.__triptychModuleInstance) {
      windowRef.__triptychModuleInstance = new TriptychGroupsModule(root);
    }
  }

  console.log('✅ InterfaceV4_Triptyque_Logic.js chargé');

})(typeof globalThis !== 'undefined'
  ? globalThis
  : typeof window !== 'undefined' 
    ? window 
    : typeof global !== 'undefined' 
      ? global 
      : {});
    
    // Mise à jour visuelle
    [btnNeeds, btnLv2].forEach(btn => {
      btn.classList.remove('ring-4', 'ring-purple-500', 'bg-purple-50');
    });
    button.classList.add('ring-4', 'ring-purple-500', 'bg-purple-50');
    
    // Ouvrir le volet 2 (Distribution)
    voletDistribution.classList.remove('hidden');
  }
  
  btnNeeds.addEventListener('click', () => selectScenario('needs', btnNeeds));
  btnLv2.addEventListener('click', () => selectScenario('lv2', btnLv2));
  
  // ═══════════════════════════════════════════════════════════════
  //  VOLET 2 : MODE DE DISTRIBUTION
  // ═══════════════════════════════════════════════════════════════
  
  const btnHeterogeneous = container.querySelector('#btn-heterogeneous');
  const btnHomogeneous = container.querySelector('#btn-homogeneous');
  
  function selectDistribution(mode, button) {
    state.distributionMode = mode;
    console.log(`✅ Mode de distribution sélectionné: ${mode}`);
    
    // Mise à jour visuelle
    [btnHeterogeneous, btnHomogeneous].forEach(btn => {
      btn.classList.remove('ring-4', 'ring-purple-500');
    });
    button.classList.add('ring-4', 'ring-purple-500');
    
    // Ouvrir le volet 3 (Regroupements)
    voletRegroupements.classList.remove('hidden');
  }
  
  btnHeterogeneous.addEventListener('click', () => selectDistribution('heterogeneous', btnHeterogeneous));
  btnHomogeneous.addEventListener('click', () => selectDistribution('homogeneous', btnHomogeneous));
  
  // ═══════════════════════════════════════════════════════════════
  //  VOLET 3 : GESTION DES REGROUPEMENTS
  // ═══════════════════════════════════════════════════════════════
  
  const btnAddRegroupement = container.querySelector('#btn-add-regroupement');
  let regroupementCounter = 0;
  
  // Classes disponibles (à charger depuis le backend plus tard)
  const availableClasses = [
    { id: '6°1', name: '6°1', students: 24 },
    { id: '6°2', name: '6°2', students: 25 },
    { id: '6°3', name: '6°3', students: 23 },
    { id: '6°4', name: '6°4', students: 26 },
    { id: '6°5', name: '6°5', students: 24 }
  ];
  
  function createRegroupement() {
    regroupementCounter++;
    const regroupementId = `regroupement-${regroupementCounter}`;
    
    // Supprimer le message vide si c'est le premier regroupement
    if (regroupementCounter === 1) {
      regroupementsContainer.innerHTML = '';
    }
    
    const regroupement = {
      id: regroupementId,
      name: `Regroupement ${regroupementCounter}`,
      classes: [],
      groupsCount: 3
    };
    
    state.regroupements.push(regroupement);
    
    // Créer la colonne
    const column = document.createElement('div');
    column.id = regroupementId;
    column.className = 'min-w-[320px] bg-slate-50 rounded-xl border-2 border-slate-200 flex flex-col';
    column.innerHTML = `
      <div class="p-4 border-b border-slate-200 bg-white rounded-t-xl">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-slate-900">${regroupement.name}</h4>
          <button class="btn-delete-regroupement text-slate-400 hover:text-red-600 p-1" data-id="${regroupementId}">
            <i class="fas fa-trash text-sm"></i>
          </button>
        </div>
        <div class="text-xs text-slate-500 space-y-1">
          <div class="flex items-center justify-between">
            <span>Classes:</span>
            <span class="font-semibold class-count">0</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Élèves:</span>
            <span class="font-semibold student-count">0</span>
          </div>
        </div>
      </div>
      
      <div class="flex-1 p-4 overflow-y-auto">
        <div class="mb-4">
          <label class="text-xs font-semibold text-slate-700 mb-2 block">Sélectionner les classes</label>
          <div class="space-y-2 classes-selector">
            ${availableClasses.map(cls => `
              <label class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-purple-400 cursor-pointer transition-all">
                <input type="checkbox" class="class-checkbox w-4 h-4 text-purple-600 rounded" value="${cls.id}" data-students="${cls.students}">
                <span class="text-sm font-medium text-slate-700">${cls.name}</span>
                <span class="ml-auto text-xs text-slate-500">${cls.students} él.</span>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div>
          <label class="text-xs font-semibold text-slate-700 mb-2 block">Nombre de groupes</label>
          <input type="number" class="groups-count-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" min="2" max="10" value="3">
        </div>
      </div>
    `;
    
    regroupementsContainer.appendChild(column);
    
    // Event listeners pour cette colonne
    const classCheckboxes = column.querySelectorAll('.class-checkbox');
    const groupsCountInput = column.querySelector('.groups-count-input');
    const btnDelete = column.querySelector('.btn-delete-regroupement');
    
    function updateRegroupementStats() {
      const selectedClasses = Array.from(classCheckboxes).filter(cb => cb.checked);
      const totalStudents = selectedClasses.reduce((sum, cb) => sum + parseInt(cb.dataset.students), 0);
      const groupsCount = parseInt(groupsCountInput.value);
      
      column.querySelector('.class-count').textContent = selectedClasses.length;
      column.querySelector('.student-count').textContent = totalStudents;
      
      // Mettre à jour l'état
      regroupement.classes = selectedClasses.map(cb => cb.value);
      regroupement.groupsCount = groupsCount;
      
      // Activer le bouton Générer si au moins un regroupement valide
      updateGenerateButton();
    }
    
    classCheckboxes.forEach(cb => cb.addEventListener('change', updateRegroupementStats));
    groupsCountInput.addEventListener('input', updateRegroupementStats);
    
    btnDelete.addEventListener('click', () => {
      // Supprimer de l'état
      const index = state.regroupements.findIndex(r => r.id === regroupementId);
      if (index > -1) {
        state.regroupements.splice(index, 1);
      }
      
      // Supprimer du DOM
      column.remove();
      
      // Si plus de regroupements, afficher le message vide
      if (state.regroupements.length === 0) {
        regroupementsContainer.innerHTML = `
          <div class="flex items-center justify-center w-full text-slate-400">
            <div class="text-center">
              <i class="fas fa-layer-group text-4xl mb-2"></i>
              <p class="text-sm">Cliquez sur "Ajouter" pour créer votre premier regroupement</p>
            </div>
          </div>
        `;
      }
      
      updateGenerateButton();
      console.log(`🗑️ Regroupement ${regroupementId} supprimé`);
    });
    
    console.log(`✅ Regroupement ${regroupementCounter} créé`);
  }
  
  function updateGenerateButton() {
    const hasValidRegroupement = state.regroupements.some(r => r.classes.length >= 2);
    btnGenerate.disabled = !hasValidRegroupement;
  }
  
  btnAddRegroupement.addEventListener('click', createRegroupement);
  
  // ═══════════════════════════════════════════════════════════════
  //  GÉNÉRATION DES GROUPES
  // ═══════════════════════════════════════════════════════════════
  
  btnGenerate.addEventListener('click', () => {
    console.log('🎯 Génération des groupes avec:', state);
    
    const summary = state.regroupements.map((r, i) => 
      `Regroupement ${i+1}: ${r.classes.join(', ')} → ${r.groupsCount} groupes`
    ).join('\n');
    
    alert(`Génération des groupes en cours...\n\nScénario: ${state.scenario}\nMode: ${state.distributionMode}\n\n${summary}`);
    
    // TODO: Appeler l'algorithme de génération
    // TODO: Afficher le panneau de résultats avec les colonnes de groupes
  });
  
  console.log('✅ Logique triptyque initialisée');
}

// Exposer globalement
if (typeof window !== 'undefined') {
  window.initTriptyqueLogic = initTriptyqueLogic;
}
