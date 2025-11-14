/**
 * CLIENT ENVIRONMENT GUARDS
 * Protection contre l'exécution de code DOM côté serveur
 *
 * À inclure au début de tout fichier HTML qui utilise le DOM
 */

(function(global) {
  'use strict';

  /**
   * Détecte si on est côté client (navigateur)
   */
  const isClient = typeof document !== 'undefined' && typeof window !== 'undefined';

  /**
   * Détecte si on est côté serveur (Apps Script)
   */
  const isServer = !isClient;

  /**
   * Guard simple : exécute la fonction uniquement côté client
   * @param {Function} fn - Fonction à exécuter côté client
   */
  function runOnClient(fn) {
    if (!isClient) {
      console.warn('[Guard] Skipping client-side code in server context');
      return;
    }

    // Si DOM déjà chargé, exécuter immédiatement
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /**
   * Guard pour window : exécute uniquement si window existe
   * @param {Function} fn - Fonction nécessitant window
   */
  function runOnWindow(fn) {
    if (typeof window !== 'undefined') {
      fn(window);
    }
  }

  /**
   * Guard pour document : exécute uniquement si document existe
   * @param {Function} fn - Fonction nécessitant document
   */
  function runOnDocument(fn) {
    if (typeof document !== 'undefined') {
      fn(document);
    }
  }

  /**
   * Safe getElementById : retourne null côté serveur
   * @param {string} id - ID de l'élément
   * @returns {HTMLElement|null}
   */
  function safeGetElementById(id) {
    if (typeof document === 'undefined') {
      return null;
    }
    return document.getElementById(id);
  }

  /**
   * Safe querySelector : retourne null côté serveur
   * @param {string} selector - Sélecteur CSS
   * @returns {HTMLElement|null}
   */
  function safeQuerySelector(selector) {
    if (typeof document === 'undefined') {
      return null;
    }
    return document.querySelector(selector);
  }

  /**
   * Safe querySelectorAll : retourne array vide côté serveur
   * @param {string} selector - Sélecteur CSS
   * @returns {NodeList|Array}
   */
  function safeQuerySelectorAll(selector) {
    if (typeof document === 'undefined') {
      return [];
    }
    return document.querySelectorAll(selector);
  }

  /**
   * Safe addEventListener : ne fait rien côté serveur
   * @param {string} event - Nom de l'événement
   * @param {Function} handler - Gestionnaire d'événement
   */
  function safeAddEventListener(event, handler) {
    if (typeof document !== 'undefined') {
      document.addEventListener(event, handler);
    }
  }

  /**
   * Guard pour l'exécution différée (après chargement)
   * @param {Function} fn - Fonction à exécuter après chargement
   */
  function whenReady(fn) {
    if (typeof document === 'undefined') {
      console.warn('[Guard] whenReady called in server context, skipping');
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      // DOM déjà chargé, exécution immédiate
      fn();
    }
  }

  /**
   * Exporte les guards vers l'objet global
   * Côté serveur: ne fait rien
   * Côté client: rend disponible dans window
   */
  if (isClient) {
    global.ClientGuards = {
      isClient: isClient,
      isServer: isServer,
      runOnClient: runOnClient,
      runOnWindow: runOnWindow,
      runOnDocument: runOnDocument,
      safeGetElementById: safeGetElementById,
      safeQuerySelector: safeQuerySelector,
      safeQuerySelectorAll: safeQuerySelectorAll,
      safeAddEventListener: safeAddEventListener,
      whenReady: whenReady
    };

    console.log('✅ Client Environment Guards loaded');
  } else {
    console.log('⚠️  Client Guards: Running in server context, guards inactive');
  }

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {}));
