# 🎯 VISUAL GUIDE - Exactly Where to Add the Includes

**Quick Reference** : Find and add 2 lines to your Apps Script template

---

## Step-by-Step Screenshots Guide

### STEP 1: Open Apps Script Editor

In your web application:
1. Click menu → **Tools** → **Script editor**
2. Or press **Ctrl + Alt + Enter**
3. A new tab opens with Google Apps Script editor

---

### STEP 2: Find the `doGet()` Function

In the Apps Script editor, look at the files on the left:

```
PROJECT FILES
├── Code.gs (or any .gs file)
├── InterfaceV2_CoreScript.html
├── InterfaceV2.html
├── ... other HTML files
```

**Click on a `.gs` file** and search for:

```javascript
function doGet()  {
  // ← THIS IS WHAT YOU'RE LOOKING FOR
}
```

Use **Ctrl+F** to search for `doGet`

---

### STEP 3: Understand Your Template

Once you find `doGet()`, it will look like ONE of these:

#### **OPTION A: Creates template from file**
```javascript
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('InterfaceV2_CoreScript');
  //                                                     ↑↑↑ This is the template file

  // Optionally add data
  template.userEmail = Session.getEffectiveUser().getEmail();

  return template.evaluate();  // ← Renders the HTML
}
```

**What to do** : Go to the file named `InterfaceV2_CoreScript` (in the editor), find where to add includes there.

---

#### **OPTION B: Creates HTML string inline**
```javascript
function doGet(e) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>App</title>
    </head>
    <body>
      <!-- Content here -->

      <script>
        // JavaScript code here
      </script>
    </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html);  // ← Returns HTML
}
```

**What to do** : Add includes in the `html` string (before `</body>`)

---

## 🎯 EXACT CODE TO ADD

### Find this section:

**IF OPTION A** (template from file):
```
File: InterfaceV2_CoreScript.html
Location: Somewhere after CoreScript content, before </body>
```

**IF OPTION B** (inline HTML):
```
In doGet(), inside the html string, before </body>
```

### Add EXACTLY these 2 lines:

```html
<!-- ✅ ORDRE 3 FIX: Charger Module Groupes V4 -->
<?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
<?!= include('InterfaceV4_Triptyque_Logic') ?>
```

---

## 📐 Visual Examples

### Example 1: If in a template file

**File: InterfaceV2_CoreScript.html**

```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <div id="app">
    <!-- Your app content -->
  </div>

  <script>
    // All the JavaScript from CoreScript
    // ... thousands of lines ...
  </script>

  <!-- ✅ ADD THESE 2 LINES BELOW (after the <script> tag) -->
  <?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
  <?!= include('InterfaceV4_Triptyque_Logic') ?>

  <!-- END OF FILE -->
</body>
</html>
```

---

### Example 2: If in doGet() function

**File: Code.gs**

```javascript
function doGet(e) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>My App</title>
      <link href="https://cdn.tailwindcss.com" rel="stylesheet">
    </head>
    <body>
      <!-- App content -->
      <div id="navbar">...</div>
      <div id="sidebar">...</div>
      <div id="main">...</div>

      <script>
        // CoreScript code here (many lines)
        console.log('App loaded');
      </script>

      <!-- ✅ ADD THESE 2 LINES HERE (after the last <script> tag) -->
      <?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
      <?!= include('InterfaceV4_Triptyque_Logic') ?>

    </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html);
}
```

---

### Example 3: If using template variables

**File: Code.gs**

```javascript
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('InterfaceV2_CoreScript');

  // Add variables if needed
  template.userName = Session.getEffectiveUser().getEmail();
  template.classesData = getClassesData();

  return template.evaluate();
}
```

**Then in InterfaceV2_CoreScript.html:**

```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <div>Welcome <?= userName ?></div>

  <script>
    window.classesData = <?= JSON.stringify(classesData) ?>;
  </script>

  <!-- ✅ ADD HERE -->
  <?!= include('InterfaceV2_GroupsModuleV4_Script') ?>
  <?!= include('InterfaceV4_Triptyque_Logic') ?>

</body>
</html>
```

---

## ✅ VERIFICATION CHECKLIST

After adding the includes:

1. **Save the file** (Ctrl+S)
2. **Go back to your app** (refresh the browser tab)
3. **Open console** (F12)
4. **Type in console:**
   ```javascript
   console.log(window.ModuleGroupsV4)
   ```
5. **Should see:** `class ModuleGroupsV4` or `function ModuleGroupsV4`
6. **If undefined** → Includes didn't load, check location

---

## 🐛 Troubleshooting

### Problem: Still getting "Paramètre file manquant"

**Check**:
- [ ] Did you add the includes to the CORRECT template file?
- [ ] Did you use EXACT names: `InterfaceV2_GroupsModuleV4_Script` and `InterfaceV4_Triptyque_Logic`?
- [ ] Did you save the Apps Script file (Ctrl+S)?
- [ ] Did you refresh the app in browser (Ctrl+F5)?
- [ ] Did you add BOTH lines (not just one)?

### Problem: "SyntaxError: Unexpected token"

**Check**:
- [ ] Are you inside an HTML context (not inside a `<script>` tag)?
- [ ] Did you use `<?!=` (with `=`) not `<?` or `<?-`?
- [ ] Are there no typos in the filenames?

### Problem: Module still doesn't load

**Check in console:**
```javascript
// Should return "function" or "class"
typeof window.ModuleGroupsV4

// Should return "function"
typeof window.TriptychGroupsModule

// If undefined, includes didn't load
```

---

## 📱 Common File Locations

Apps Script might have different file names. Here are common ones:

| Filename | Typical Content |
|----------|-----------------|
| `Code.gs` | Main backend code + `doGet()` |
| `Main.gs` | Main backend code + `doGet()` |
| `InterfaceV2_CoreScript.html` | Main HTML template |
| `InterfaceV2.html` | Alternative HTML |
| `index.html` | Alternative HTML name |

**If unsure**, search for `doGet` to find the right file.

---

## 🎬 Quick Video Description

1. Open Apps Script Editor (Ctrl+Alt+Enter)
2. Find `function doGet()`
3. Find the HTML being returned
4. Add 2 include lines before `</body>` or at end of template
5. Save (Ctrl+S)
6. Refresh app browser tab
7. Click "Groupes"
8. ✅ Module opens!

---

## ✨ After the Fix

**When done correctly, you should see:**

1. Click "Groupes" button
2. Module opens smoothly (no error HTML)
3. Triptyque loads with real classes
4. No console errors
5. Can create regroupements and generate groups

---

**Time to fix**: ~5 minutes
**Complexity**: Trivial
**Required knowledge**: Basic text editing
**Confidence**: 100% this will work

---

Let me know **exactly which option your `doGet()` uses** (A or B), and I can give you the **EXACT lines to copy-paste**.
