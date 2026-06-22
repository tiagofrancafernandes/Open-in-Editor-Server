# Practical Guide: Using Profiles in Open-in-Editor-Server

> **📖 Available in other languages:** [Português (pt-br)](./GUIDE_PROFILES.pt-br.md)

> **📚 See also:** [README.md](./README.md) - Full documentation

## 🎯 Objective

This guide shows you how to effectively use the profile system to open files in different editors with automatic path mapping.

---

## 📖 What Is a Profile?

A profile is a set of configurations that defines:
- **Which editor** to open (VS Code, Vim, Antigravity, etc)
- **How to map paths** from development/production
- **Special options** like dry-run mode

---

## 🚀 Quick Start Guide

### 1️⃣ Use an Existing Profile

**URL**:
```
http://localhost:3001/__open-in-editor?profile=my-project-2&file=/var/www/projects/my-second-project/app.js:10:5
```

**What happens**:
1. Looks up configuration for `my-project-2`
2. Extracts editor: `code -g`
3. Maps `/var/www/...` → `/my-projects/my-project-2-apps/app.js`
4. Opens in VS Code at the correct file and line

### 2️⃣ Create a New Profile

**File**: `app.config.js`

```javascript
export const profiles = {
    // ... existing profiles ...

    'my-project': {
        open_cmd: {
            command: 'code',
            args: ['-g']
        },
        mapPaths: {
            local: '/home/user/projects/my-project',
            remote: '/var/www/html/my-project'
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
};
```

**Then use it**:
```
?profile=my-project&file=/var/www/html/my-project/src/index.js:1:1
```

### 3️⃣ Override Profile Configuration

The URL always has priority:

```
?profile=my-project-2&open_cmd=vim&file=/var/www/...
```

Here the profile is used for mapPaths, but the editor is forced to `vim`.

---

## 📋 Practical Examples

### Example 1: Vue.js Project in Production

**Scenario**:
- Remote server: `/var/www/vue-app`
- Local machine: `/home/dev/projects/vue-app`
- Editor: VS Code

**Profile in `app.config.js`**:
```javascript
'vue-app-prod': {
    open_cmd: {
        command: 'code',
        args: ['-g']
    },
    mapPaths: {
        local: '/home/dev/projects/vue-app',
        remote: '/var/www/vue-app'
    },
    options: {
        dryRunMode: false,  // Real mode for production
        runInfo: false,
    },
}
```

**URL from browser console error**:
```
http://localhost:3001/__open-in-editor?profile=vue-app-prod&file=/var/www/vue-app/src/components/Button.vue:42:15
```

**Result**: Opens `Button.vue` at line 42, column 15 in VS Code

---

### Example 2: Laravel Project with Antigravity Editor

**Scenario**:
- Remote server: `/var/www/laravel-app`
- Local machine: `/home/dev/projects/laravel-app`
- Editor: Antigravity

**Profile**:
```javascript
'laravel-app': {
    open_cmd: {
        command: 'antigravity',
        args: ['-g']
    },
    mapPaths: {
        local: '/home/dev/projects/laravel-app',
        remote: '/var/www/laravel-app'
    },
    options: {
        dryRunMode: false,
        runInfo: false,
    },
}
```

**URL**:
```
?profile=laravel-app&file=/var/www/laravel-app/app/Http/Controllers/PostController.php:15:20
```

---

### Example 3: Windows Project (IIS)

**Scenario**:
- Remote server: `C:\inetpub\wwwroot\app`
- Local machine: `D:\projetos\my-app`
- Separator: `=>` (because it uses backslash on Windows)

**Profile**:
```javascript
'windows-iis-app': {
    open_cmd: {
        command: 'code',
        args: ['-g']
    },
    mapPaths: {
        local: 'D:\\projetos\\my-app',
        remote: 'C:\\inetpub\\wwwroot\\app'
    },
    options: {
        remapSplitStr: '=>',
        dryRunMode: false,
        runInfo: false,
    },
}
```

**URL**:
```
?profile=windows-iis-app&file=C:\inetpub\wwwroot\app\Controllers\Home.cs:25:10
```

---

### Example 4: Dry-Run Mode (Safe for Production)

**Scenario**: You want to test URLs without actually opening the editor

**Profile with protection**:
```javascript
'production-safe': {
    open_cmd: {
        command: 'code',
        args: ['-g']
    },
    mapPaths: {
        local: '/home/dev/projects/prod-app',
        remote: '/var/www/prod-app'
    },
    options: {
        dryRunMode: true,  // 🔒 Force dry-run!
        runInfo: true,     // Show information
    },
}
```

**URL**:
```
?profile=production-safe&file=/var/www/prod-app/main.py:100:5
```

**Result**:
- Shows the command that WOULD be executed
- Doesn't actually open the editor
- Useful for testing first

---

## 🔄 Detailed Flow

When you make a request with a profile:

```
1. URL: ?profile=my-project-2&file=/var/www/projects/my-second-project/app.js:10:5
   ↓
2. Server reads: profile = 'my-project-2'
   ↓
3. Looks in app.config.js:
   - open_cmd: { command: 'code', args: ['-g'] }
   - mapPaths.local: '/my-projects/my-project-2-apps'
   - mapPaths.remote: '/var/www/projects/my-second-project'
   ↓
4. Maps the path:
   '/var/www/projects/my-second-project/app.js'
   → '/my-projects/my-project-2-apps/app.js'
   ↓
5. Extracts line and column: 10:5
   ↓
6. Builds command:
   code -g "/my-projects/my-project-2-apps/app.js:10:5"
   ↓
7. Executes the command → Opens in VS Code!
```

---

## 💡 Real-World Use Cases

### Case 1: Stack Trace in Production

You see an error in production:
```
Error at /var/www/app/src/User.php:45:12
```

Instead of searching manually, click the link:
```html
<a href="http://localhost:3001/__open-in-editor?profile=my-app&file=/var/www/app/src/User.php:45:12">
    Open in Editor
</a>
```

### Case 2: Debug in Development

Your framework generates an interactive error link:
```
XDebug: /var/www/laravel-app/app/Http/Controllers/OrderController.php:89:5
```

Configure your app to generate URLs like this:
```
xdebug.file_link_format = "http://localhost:3001/__open-in-editor?profile=laravel-app&file=%f:%l:%c"
```

### Case 3: Links in Logs

Your logging system can generate clickable links:
```javascript
// In your logger
const editorLink = `http://localhost:3001/__open-in-editor?profile=my-app&file=${file}:${line}:${col}`;
log(`Error: ${message} ${editorLink}`);
```

---

## ⚙️ Environment Variables

If you prefer not to use `app.config.js`, you can use environment variables:

```bash
export EDITOR_OPEN_CMD="code -g"
export LISTEN_PORT=3001
export LISTEN_HOST=0.0.0.0
export REMAP_SPLIT_STR=":"

node open-in-editor-server.js
```

But we **recommend** using `app.config.js` for better control.

---

## 🎯 Debug & Troubleshooting

### View Execution Information

Add `&runInfo=1` to the URL:

```
?profile=my-project-2&file=/var/www/.../app.js:10:5&runInfo=1
```

**Returns JSON with**:
- Command executed
- Mapped path
- Applied settings
- Error messages

### Dry-Run Mode (Without Executing)

```
?profile=my-project-2&file=/var/www/.../app.js:10:5&dryRun=1
```

Shows what WOULD be executed without actually executing it.

### Check Path Mapping

Use `&runInfo=1` to see:
```json
{
    "appBasePathRemoteMap": {
        "remote": "/var/www/projects/my-second-project",
        "local": "/my-projects/my-project-2-apps"
    },
    "mappedPath": "/my-projects/my-project-2-apps/app.js"
}
```

---

## 📝 Configuration Checklist

When creating a new profile, verify:

- ✅ Profile name is unique
- ✅ Editor exists on the system (`code`, `vim`, etc)
- ✅ Local and remote paths are correct
- ✅ Separator is correct (`:` for Linux/Mac, `=>` for Windows)
- ✅ `dryRunMode` reflects your intent (protection vs speed)
- ✅ `runInfo` helps with debugging if needed

---

## 🚨 Common Errors

### ❌ "Invalid file or missing file param"

**Cause**: Path not mapped correctly

**Solution**:
```
// Verify the file exists:
// Local: /my-projects/my-project-2-apps/app.js
// URL Remote: /var/www/projects/my-second-project/app.js
```

### ❌ "Error opening editor"

**Cause**: Editor is not installed/configured

**Solution**:
```bash
# Test the command manually
code -g "/path/to/file.js:10:5"

# If it doesn't work, adjust the configuration
```

### ❌ Path not mapping

**Cause**: `mapPaths` doesn't match the file

**Solution**:
```
Use &runInfo=1 to see the actual mapping
Adjust mapPaths.remote to match the file
```

---

## ✨ Professional Tips

1. **Automate in your Framework**
   - Laravel: Configure `xdebug.file_link_format`
   - Vue: Add plugin to generate links
   - Node: Use middleware to intercept errors

2. **Create Profiles by Environment**
   - `my-app-dev`, `my-app-staging`, `my-app-prod`
   - Each with its own configuration

3. **Protect Production**
   - Production profile: `dryRunMode: true`
   - Only use `false` for development

4. **Use Dynamic Links**
   - Encode the URL correctly
   - Test with `&runInfo=1` first

---

## 🎓 Next Steps

1. Create your profiles in `app.config.js`
2. Test with `&runInfo=1&dryRun=1` first
3. Integrate with your framework/logger
4. Enjoy the productivity boost! 🚀

---

**Have questions?** See `PROFILE_ANALYSIS.md` for technical details.

**Want more details?** Read [README.md](./README.md) for complete documentation, including setup instructions and integration examples.
