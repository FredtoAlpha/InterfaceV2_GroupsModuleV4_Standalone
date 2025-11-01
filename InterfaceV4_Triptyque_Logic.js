// ═══════════════════════════════════════════════════════════════
//  LOGIQUE TRIPTYQUE POUR MODULE GROUPES V4
// ═══════════════════════════════════════════════════════════════

// Cette logique remplace l'ancien système de phases successives
// par une interface triptyque avec 3 volets permanents côte à côte

function initTriptyqueLogic(container, state, voletDistribution, voletRegroupements, regroupementsContainer, btnGenerate) {
  
  console.log('🎯 Initialisation de la logique triptyque');
  
  // ═══════════════════════════════════════════════════════════════
  //  VOLET 1 : SÉLECTION DU SCÉNARIO
  // ═══════════════════════════════════════════════════════════════
  
  const btnNeeds = container.querySelector('#btn-needs');
  const btnLv2 = container.querySelector('#btn-lv2');
  const btnOptions = container.querySelector('#btn-options');
  
  function selectScenario(scenario, button) {
    state.scenario = scenario;
    console.log(`✅ Scénario sélectionné: ${scenario}`);
    
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
