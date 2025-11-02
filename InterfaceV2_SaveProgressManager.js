/**
 * SAVE PROGRESS MANAGER
 * Gestion de la barre de progression pour les sauvegardes
 * Extrait de InterfaceV2_CoreScript.html pour modularité
 */

class SaveProgressManager {
  constructor() {
    this.progressBar = null;
    this.progressFill = null;
    this.progressPercentage = null;
    this.currentSave = null;
    this.init();
  }
  
  init() {
    // Créer la barre de progression dynamiquement
    const progressHTML = `
      <div id="saveProgressBar" class="save-progress-bar">
        <div class="save-progress-header">
          <span><i class="fas fa-save mr-2"></i>Création des onglets FIN...</span>
          <button id="minimizeProgress" class="text-white hover:text-yellow-200 transition-colors">
            <i class="fas fa-minus"></i>
          </button>
        </div>
        <div class="save-progress-content">
          <div class="progress-bar-container">
            <div id="progressBarFill" class="progress-bar-fill"></div>
          </div>
          <div id="progressPercentage" class="text-center text-sm font-semibold text-gray-700">0%</div>
          <div class="progress-steps">
            <div id="step1" class="progress-step">
              <i class="fas fa-circle-notch"></i>
              <span>Préparation des données...</span>
            </div>
            <div id="step2" class="progress-step">
              <i class="fas fa-circle-notch"></i>
              <span>Validation LV2 obligatoire...</span>
            </div>
            <div id="step3" class="progress-step">
              <i class="fas fa-circle-notch"></i>
              <span>Création onglets FIN...</span>
            </div>
            <div id="step4" class="progress-step">
              <i class="fas fa-circle-notch"></i>
              <span>Formatage automatique...</span>
            </div>
            <div id="step5" class="progress-step">
              <i class="fas fa-circle-notch"></i>
              <span>Finalisation...</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', progressHTML);
    
    this.progressBar = document.getElementById('saveProgressBar');
    this.progressFill = document.getElementById('progressBarFill');
    this.progressPercentage = document.getElementById('progressPercentage');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const minimizeBtn = document.getElementById('minimizeProgress');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    }
  }
  
  start() {
    if (this.currentSave) {
      if (typeof toast === 'function') {
        toast('Une sauvegarde est déjà en cours...', 'warning');
      }
      return false;
    }
    this.currentSave = Date.now();
    this.show();
    this.updateProgress(0, 'step1');
    return true;
  }
  
  show() {
    if (this.progressBar) {
      this.progressBar.classList.add('show');
    }
  }
  
  hide() {
    if (this.progressBar) {
      this.progressBar.classList.remove('show');
    }
    this.currentSave = null;
    setTimeout(() => this.reset(), 300);
  }
  
  updateProgress(percent, currentStep) {
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
    if (this.progressPercentage) {
      this.progressPercentage.textContent = `${Math.round(percent)}%`;
    }
    
    // Mettre à jour les étapes
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    steps.forEach((step, idx) => {
      const el = document.getElementById(step);
      if (!el) return;
      
      if (step === currentStep) {
        el.classList.add('active');
        el.classList.remove('completed');
      } else if (steps.indexOf(currentStep) > idx) {
        el.classList.add('completed');
        el.classList.remove('active');
      } else {
        el.classList.remove('active', 'completed');
      }
    });
  }
  
  complete(success = true) {
    if (success) {
      this.updateProgress(100, 'step5');
      setTimeout(() => this.hide(), 1500);
    } else {
      this.hide();
    }
  }
  
  reset() {
    if (this.progressFill) {
      this.progressFill.style.width = '0%';
    }
    if (this.progressPercentage) {
      this.progressPercentage.textContent = '0%';
    }
    
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    steps.forEach(step => {
      const el = document.getElementById(step);
      if (el) {
        el.classList.remove('active', 'completed');
      }
    });
  }
  
  toggleMinimize() {
    if (this.progressBar) {
      this.progressBar.classList.toggle('minimized');
    }
  }
}

// Exposer globalement
window.SaveProgressManager = SaveProgressManager;
