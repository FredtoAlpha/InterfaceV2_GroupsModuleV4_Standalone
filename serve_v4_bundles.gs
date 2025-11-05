/**
 * Web App endpoint for serving the V4 bundle files as raw JavaScript.
 *
 * Example: https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercache?file=InterfaceV4_Triptyque_Logic.js
 */
var V4_ALLOWED_FILES = [
  'InterfaceV4_Triptyque_Logic.js',
  'GroupsAlgorithmV4_Distribution.js',
  'InterfaceV2_GroupsModuleV4_Script.js'
];

function doGet(e) {
  try {
    var fileName = e && e.parameter ? e.parameter.file : '';

    if (!fileName) {
      var usageMessage = [
        "console.error('Missing \"file\" parameter for the V4 bundles endpoint.');",
        "console.info('Usage: ?file=InterfaceV4_Triptyque_Logic.js');",
        "console.info('Available files: " + V4_ALLOWED_FILES.join(', ') + "');"
      ].join('\n');

      return ContentService.createTextOutput(usageMessage)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    if (V4_ALLOWED_FILES.indexOf(fileName) === -1) {
      var errorMessage = [
        "console.error('File not allowed: " + fileName + "');",
        "console.info('Available files: " + V4_ALLOWED_FILES.join(', ') + "');"
      ].join('\n');

      return ContentService.createTextOutput(errorMessage)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    var scriptProperties = PropertiesService.getScriptProperties();
    var fileContent = scriptProperties.getProperty('V4_' + fileName);

    if (!fileContent) {
      var notFoundMessage = [
        "console.error('File not found in ScriptProperties: " + fileName + "');",
        "console.info('Run uploadV4Bundles() to upload the latest bundles.');"
      ].join('\n');

      return ContentService.createTextOutput(notFoundMessage)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(fileContent)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    var safeMessage = '';
    if (error && error.message) {
      safeMessage = String(error.message);
    } else if (error) {
      safeMessage = String(error);
    }

    safeMessage = safeMessage.replace(/[^ -~]/g, '');

    return ContentService.createTextOutput(
      "console.error('Server error: " + safeMessage.replace(/'/g, "\\'") + "');"
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function uploadV4Bundles() {
  var scriptProperties = PropertiesService.getScriptProperties();

  V4_ALLOWED_FILES.forEach(function(fileName) {
    try {
      var content = getFileContentFromDrive(fileName);
      if (content) {
        scriptProperties.setProperty('V4_' + fileName, content);
      } else {
        var placeholder = "// PLACEHOLDER: " + fileName + " not uploaded\n" +
          "console.error('Missing bundle: " + fileName + "');";
        scriptProperties.setProperty('V4_' + fileName, placeholder);
      }
    } catch (error) {
      var safeMessage = '';
      if (error && error.message) {
        safeMessage = String(error.message);
      } else if (error) {
        safeMessage = String(error);
      }
      safeMessage = safeMessage.replace(/[^ -~]/g, '');
      console.error('Failed to store ' + fileName + ': ' + safeMessage);
    }
  });
}

function getFileContentFromDrive(fileName) {
  try {
    var files = DriveApp.getFilesByName(fileName);

    if (files.hasNext()) {
      var file = files.next();
      return file.getAs('text/plain').getDataAsString();
    }

    console.warn('Drive file not found: ' + fileName);
    return null;
  } catch (error) {
    var safeMessage = '';
    if (error && error.message) {
      safeMessage = String(error.message);
    } else if (error) {
      safeMessage = String(error);
    }
    safeMessage = safeMessage.replace(/[^ -~]/g, '');
    console.error('Drive error for ' + fileName + ': ' + safeMessage);
    return null;
  }
}

function getWebAppUrl() {
  var scriptId = ScriptApp.getScriptId();
  var url = 'https://script.google.com/macros/d/' + scriptId + '/usercache';
  console.log('V4 bundle endpoint: ' + url);
  return url;
}
