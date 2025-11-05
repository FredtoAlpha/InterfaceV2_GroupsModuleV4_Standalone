/**
 * ENDPOINT WEB APP - Module Groupes V4
 *
 * ✅ ORDRE 4 : Créer endpoint Web App pour bundles
 *
 * Fonction: Servir les fichiers JS V4 avec le bon MIME type (text/javascript)
 * But: Éviter 404 → HTML response → SyntaxError: Unexpected token '<'
 *
 * Déploiement :
 * 1. Copier ce code dans Apps Script
 * 2. Déployer en tant que Web App (Exécuter en tant que: votre compte, Accès: Tous)
 * 3. Copier l'URL publique
 * 4. Utiliser cette URL pour charger les bundles V4
 *
 * URL format :
 * https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercache?file=InterfaceV4_Triptyque_Logic.js
 *
 * Fichiers publiés:
 * - InterfaceV4_Triptyque_Logic.js
 * - GroupsAlgorithmV4_Distribution.js
 * - InterfaceV2_GroupsModuleV4_Script.js
 */

/**
 * Handler Web App - GET requests
 * Retourne le contenu du fichier demandé avec le bon MIME type
 */
function doGet(e) {
  try {
    const fileName = e.parameter.file;

    if (!fileName) {
      const usageMessage = [
        "console.error('Parametre \\"file\\" manquant pour l\'endpoint V4.');",
        "console.info('Usage: ?file=InterfaceV4_Triptyque_Logic.js');",
        "console.info('Fichiers disponibles: InterfaceV4_Triptyque_Logic.js, GroupsAlgorithmV4_Distribution.js, InterfaceV2_GroupsModuleV4_Script.js');"
      ].join('\n');

      return ContentService.createTextOutput(usageMessage)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Valider le nom du fichier (sécurité)
    const allowedFiles = [
      'InterfaceV4_Triptyque_Logic.js',
      'GroupsAlgorithmV4_Distribution.js',
      'InterfaceV2_GroupsModuleV4_Script.js'
    ];

    if (!allowedFiles.includes(fileName)) {
      const errorMessage = [
        "console.error('Fichier non autorise: " + fileName + "');",
        "console.info('Fichiers disponibles: " + allowedFiles.join(', ') + "');"
      ].join('\n');

      return ContentService.createTextOutput(errorMessage)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Récupérer le contenu du fichier (depuis Google Drive via ScriptProperties)
    const scriptProperties = PropertiesService.getScriptProperties();
    const fileContent = scriptProperties.getProperty('V4_' + fileName);

    if (!fileContent) {
      console.warn('Fichier non trouve dans ScriptProperties: ' + fileName);
      const notFoundMessage = [
        "console.error('Erreur 404: Fichier non trouve - " + fileName + "');",
        "console.info('Solution: Executer uploadV4Bundles() pour charger les fichiers.');"
      ].join('\n');

      return ContentService.createTextOutput(notFoundMessage)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Retourner avec le bon MIME type (JavaScript brut, pas HTML)
    console.log('Servant ' + fileName + ' (' + fileContent.length + ' bytes)');
    return ContentService.createTextOutput(fileContent)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    console.error('Erreur doGet:', error);
    return ContentService.createTextOutput(
      "console.error('Erreur serveur: " + error.message.replace(/'/g, "\\'") + "');"
    )
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/**
 * Charger les fichiers V4 dans ScriptProperties
 * À exécuter UNE FOIS après copier les fichiers JS dans le projet
 */
function uploadV4Bundles() {
  console.log('Chargement des bundles V4...');

  const scriptProperties = PropertiesService.getScriptProperties();

  // Liste des fichiers à charger (depuis Google Drive ou copier/coller le contenu)
  const files = [
    'InterfaceV4_Triptyque_Logic.js',
    'GroupsAlgorithmV4_Distribution.js',
    'InterfaceV2_GroupsModuleV4_Script.js'
  ];

  files.forEach(fileName => {
    try {
      // ⚠️ IMPORTANT: Le contenu doit être fourni manuellement ou depuis Drive
      // Pour l'instant, on va créer un placeholder

      const content = getFileContentFromDrive(fileName);
      if (content) {
        scriptProperties.setProperty('V4_' + fileName, content);
        console.log(fileName + ' charge (' + content.length + ' bytes)');
      } else {
        console.warn(fileName + ' introuvable - placeholder utilise');
        const placeholder = "// PLACEHOLDER: " + fileName + " non charge\\nconsole.error('Fichier " + fileName + " manquant');";
        scriptProperties.setProperty('V4_' + fileName, placeholder);
      }
    } catch (error) {
      console.error('Erreur chargement ' + fileName + ':', error);
    }
  });

  console.log('Bundles V4 charges');
}

/**
 * Récupérer le contenu d'un fichier depuis Google Drive
 * ⚠️ Adaptez selon votre structure Drive
 */
function getFileContentFromDrive(fileName) {
  try {
    // Rechercher le fichier dans Drive
    const files = DriveApp.getFilesByName(fileName);

    if (files.hasNext()) {
      const file = files.next();
      const content = file.getAs('text/plain').getDataAsString();
      console.log('Fichier trouve: ' + fileName);
      return content;
    } else {
      console.warn('Fichier non trouve dans Drive: ' + fileName);
      return null;
    }
  } catch (error) {
    console.error('Erreur Drive pour ' + fileName + ':', error);
    return null;
  }
}

/**
 * Obtenir l'URL publique du Web App
 * À afficher après déploiement
 */
function getWebAppUrl() {
  const scriptId = ScriptApp.getScriptId();
  console.log(
    '\nURL du Web App endpoint V4 :\n' +
    'https://script.google.com/macros/d/' + scriptId + '/usercache\n\n' +
    'Utilisation :\n' +
    '- Charger Triptyque: ?file=InterfaceV4_Triptyque_Logic.js\n' +
    '- Charger Algo: ?file=GroupsAlgorithmV4_Distribution.js\n' +
    '- Charger Loader: ?file=InterfaceV2_GroupsModuleV4_Script.js\n\n' +
    'MIME type retourne: application/javascript'
  );
  return scriptId;
}

/**
 * Test du endpoint
 * Vérifie que tout fonctionne
 */
function testV4Endpoint() {
  console.log('Test du endpoint V4...');

  const scriptProperties = PropertiesService.getScriptProperties();
  const files = [
    'InterfaceV4_Triptyque_Logic.js',
    'GroupsAlgorithmV4_Distribution.js',
    'InterfaceV2_GroupsModuleV4_Script.js'
  ];

  files.forEach(fileName => {
    const content = scriptProperties.getProperty('V4_' + fileName);
    if (content) {
      console.log(fileName + ': ' + content.length + ' bytes pret');
    } else {
      console.warn(fileName + ': MANQUANT - Executer uploadV4Bundles()');
    }
  });

  console.log('\nProchaines etapes:');
  console.log('1. Deployer ce script en tant que Web App');
  console.log('2. Executer uploadV4Bundles() pour charger les fichiers');
  console.log('3. Executer getWebAppUrl() pour obtenir l\'URL');
  console.log('4. Utiliser l\'URL dans le HTML pour charger les bundles V4');
}

/**
 * Fonction utilitaire: Charger les fichiers directement (copier-coller)
 * À utiliser si les fichiers ne sont pas dans Drive
 */
function setV4BundleManually(fileName, content) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('V4_' + fileName, content);
  console.log(fileName + ' defini manuellement (' + content.length + ' bytes)');
}
