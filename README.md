# Open in Editor Server

> **📖 Available in other languages:** [Português (pt-br)](./README.pt-br.md)

An HTTP server that makes it easy to open files in your code editor directly from URLs, with support for local/remote path mapping and project profiles.

## 🎯 What Does It Do?

Transforms a URL like:
```
http://localhost:3001/__open-in-editor?profile=my-app&file=/var/www/app/index.js:10:5
```

Into a real command:
```bash
code -g "/home/dev/projects/my-app/index.js:10:5"
```

Perfect for:
- ✅ Clickable stack traces in production
- ✅ Error links in logs
- ✅ XDebug/PHPStorm integrations
- ✅ Multiple projects with automatic mapping

---

## 📋 Requirements

- **Node.js** 18+ (with ES modules support)
- **PM2** for daemon mode (automatic with `npm install`)

```bash
# Check Node version
node --version  # v18.0.0 or higher
```

---

## 🚀 Installation

### 1. Clone/Copy the Repository

```bash
git clone <your-repo> open-in-editor-server
cd open-in-editor-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Project

Create `app.config.js` based on `app.config.demo.js`:

```bash
cp app.config.demo.js app.config.js
```

Edit `app.config.js` with your projects:

```javascript
export const profiles = {
    'my-project': {
        open_cmd: {
            command: 'code',
            args: ['-g']
        },
        mapPaths: {
            local: '/home/user/projects/my-project',
            remote: '/var/www/my-project'
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
};

export const defaultProfile = 'my-project';
export const remapSplitStr = ':';  // use '=>' on Windows
```

---

## 🎬 How to Use

### Development Mode (without Watch)

Ideal for simple local development:

```bash
npm run dev
```

**Features**:
- ✅ Runs as daemon in background
- ✅ No automatic reload
- ✅ Saves logs in PM2
- ✅ Easy to manage

### Development Mode (with Watch/Reload)

For development with automatic reload when code changes:

```bash
npm run dev:watch
```

**Features**:
- ✅ Auto-reloads when code changes
- ✅ Runs as daemon in background
- ✅ Useful for active development
- ✅ Log output available with `npm run logs`

### Production Mode (Daemon with PM2)

To keep the server running in background:

```bash
# Start in development
npm run start

# Or start in production (with production settings)
npm run start:prod
```

**Features**:
- ✅ Runs as daemon (background)
- ✅ Persists after reboot
- ✅ Auto-restart on crash
- ✅ PM2 management
- ✅ Recommended for production

### Manage the Daemon

```bash
# See status
npm run status

# View logs in real-time
npm run logs

# Restart
npm run restart

# Stop
npm run stop
```

---

## 🔄 Auto-start with System

To have the server start automatically when your computer reboots, configure PM2:

### Option 1: Configure Auto-startup (Recommended)

```bash
# Configure PM2 to start with the system (systemd)
npm run pm2:startup

# This will:
# 1. Create systemd service for PM2
# 2. Save current applications
# 3. Test configuration
```

**Verify it worked:**
```bash
# See if the PM2 service is enabled
systemctl status pm2-$(whoami)

# See saved applications
pm2 list
```

### Option 2: Remove Auto-startup

If you need to disable it:

```bash
npm run pm2:unstartup
```

### How Does It Work?

1. `npm run pm2:startup` creates a systemd service that manages PM2
2. PM2 loads all saved applications on boot
3. If the server crashes, PM2 restarts it automatically
4. Logs available at: `/home/$(whoami)/.pm2/logs/`

### ⚠️ Important

- **Before enabling**, make sure that:
  - `npm run start` works without errors
  - File `app.config.js` is configured correctly
  - Port 3001 (or your configured port) is not in use

- **After enabling**, test:
  ```bash
  npm run status
  npm run logs
  ```

---

## ⚙️ Configuration

### File: `app.config.js`

This file defines all your project profiles. **Whenever you modify it, also update `app.config.demo.js`**:

```bash
# 1. Edit app.config.js as needed
# 2. Update app.config.demo.js with the same changes
cp app.config.js app.config.demo.js
```

#### Full Profile Structure

```javascript
export const profiles = {
    'my-project': {
        // Editor to use
        open_cmd: {
            command: 'code',      // Editor command
            args: ['-g']          // Arguments (optional)
        },

        // Path mapping
        mapPaths: {
            local: '/home/dev/projects/my-project',  // Your local path
            remote: '/var/www/my-project'             // Remote/container path
        },

        // Profile-specific options
        options: {
            dryRunMode: false,           // Force dry-run mode (no execution)
            runInfo: false,              // Show execution information
            remapSplitStr: ':'           // Separator for paths (linux)
                                         // Use '=>' for Windows
        },
    },
};

// Default profile if none is specified
export const defaultProfile = 'my-project';

// Global separator (if not defined in profile)
export const remapSplitStr = ':';  // ':' for Linux/Mac, '=>' for Windows
```

### Environment Variables

Alternative/complement to `app.config.js`:

```bash
# Default editor
export EDITOR_OPEN_CMD="code -g"

# Port and host
export LISTEN_PORT=3001
export LISTEN_HOST=0.0.0.0

# Dry-run mode (test without executing)
export DRY_RUN_MODE=false

# Path separator
export REMAP_SPLIT_STR=":"

# Start server
npm run dev
```

**Priority**:
1. URL parameters (`?file=...`)
2. Profile config (`app.config.js`)
3. Environment variables
4. Default values

---

## 📖 Usage Examples

### Example 1: VS Code with Vue Project

```javascript
// app.config.js
'vue-app': {
    open_cmd: { command: 'code', args: ['-g'] },
    mapPaths: {
        local: '/home/dev/projects/vue-app',
        remote: '/var/www/vue-app'
    },
}
```

URL:
```
http://localhost:3001/__open-in-editor?profile=vue-app&file=/var/www/vue-app/src/App.vue:42:10
```

### Example 2: Antigravity with Laravel Project

```javascript
// app.config.js
'laravel-app': {
    open_cmd: { command: 'antigravity', args: ['-g'] },
    mapPaths: {
        local: '/home/dev/projects/laravel-app',
        remote: '/var/www/laravel-app'
    },
}
```

URL:
```
?profile=laravel-app&file=/var/www/laravel-app/app/Http/Controllers/PostController.php:15:20
```

### Example 3: Windows Project (IIS)

```javascript
// app.config.js
'windows-app': {
    open_cmd: { command: 'code', args: ['-g'] },
    mapPaths: {
        local: 'D:\\projetos\\windows-app',
        remote: 'C:\\inetpub\\wwwroot\\app'
    },
    options: {
        remapSplitStr: '=>'  // For Windows
    },
}
```

### Example 4: Protected Mode for Production

```javascript
// app.config.js
'prod-app': {
    open_cmd: { command: 'code', args: ['-g'] },
    mapPaths: {
        local: '/home/prod/apps/my-app',
        remote: '/var/www/my-app'
    },
    options: {
        dryRunMode: true,  // 🔒 Force dry-run mode!
        runInfo: true,     // Show the command without executing
    },
}
```

---

## 🔗 Integrating with Your Project

### With Laravel (XDebug)

Add to `php.ini` or `.env`:

```ini
xdebug.file_link_format = "http://localhost:3001/__open-in-editor?profile=my-app&file=%f:%l:%c"
```

### With Vue/Nuxt

In your middleware or error handler:

```javascript
const editorLink = `http://localhost:3001/__open-in-editor?profile=my-app&file=${file}:${line}:${col}`;
console.log(`Error: ${message} ${editorLink}`);
```

### With Node/Express

In your error handler:

```javascript
app.use((err, req, res, next) => {
    const file = err.stack.match(/\((.+?):(\d+):/)?.[1] || 'unknown';
    const line = err.stack.match(/:(\d+):/)?.[1] || 1;
    const editorLink = `http://localhost:3001/__open-in-editor?profile=my-app&file=${file}:${line}`;

    res.render('error', { error: err, editorLink });
});
```

---

## 🐛 Debug and Troubleshooting

### View Execution Information

Add `&runInfo=1` to see details:

```
?profile=my-app&file=/var/www/my-app/app.js:10:5&runInfo=1
```

Returns JSON with:
- Command that will/was executed
- Mapped path
- All applied configurations

### Dry-Run Mode (Test without Executing)

```
?profile=my-app&file=/var/www/my-app/app.js:10:5&dryRun=1
```

Shows the command without actually executing it.

### View Server Logs

```bash
# In real-time
npm run logs

# Or see status
npm run status
```

### Common Issues

#### "Invalid file or missing file param"
- Verify that the file exists in the mapped path
- Use `&runInfo=1` to see the actual mapping

#### "Error opening editor"
- Verify the editor is installed: `which code`, `which antigravity`
- Test the command manually: `code -g "/path/to/file.js:10:5"`

#### Profile not found
- Use `&runInfo=1` to see which profile was used
- Verify the profile name in `app.config.js`

---

## 📁 Project Structure

```
open-in-editor-server/
├── open-in-editor-server.js      # Main server
├── app.config.js                 # Configuration (DO NOT commit to git)
├── app.config.demo.js            # Configuration example
├── ecosystem.config.cjs          # PM2 Config
├── package.json                  # Scripts and dependencies
├── package-lock.json             # Lock file
├── README.md                      # This file (English)
├── README.pt-br.md               # Portuguese version
├── GUIDE_PROFILES.md             # Profiles practical guide (English)
├── GUIDE_PROFILES.pt-br.md       # Portuguese version
├── PROFILE_ANALYSIS.md           # Technical analysis
├── test-profiles.js              # Unit tests
├── test-integration.js           # Integration tests
└── .gitignore                    # Ignores app.config.js
```

---

## 📝 `.gitignore` File

Make sure `app.config.js` is ignored:

```gitignore
# Configuration (always ignore!)
app.config.js

# Dependencies
node_modules/

# PM2 logs
logs/

# OS files
.DS_Store
```

---

## 🚀 Recommended Workflow

### 1. Initial Setup

```bash
git clone <repo>
cd open-in-editor-server
npm install
cp app.config.demo.js app.config.js
# Edit app.config.js with your data
```

### 2. Local Development

```bash
npm run dev
# Server with watch: http://localhost:3001
```

### 3. Test Before Committing

```bash
npm run prettier  # Format code
# Test URLs with &runInfo=1&dryRun=1
```

### 4. Deploy to Production

```bash
# Via PM2
npm run start:prod

# See status
npm run status

# View logs
npm run logs
```

### 5. Maintenance

```bash
# When updating app.config.js, also update demo:
cp app.config.js app.config.demo.js
git add app.config.demo.js
git commit -m "refactor: update config demo"
```

---

## 📚 Additional Documentation

- **[GUIDE_PROFILES.md](./GUIDE_PROFILES.md)** - Practical guide with real examples
- **[GUIDE_PROFILES.pt-br.md](./GUIDE_PROFILES.pt-br.md)** - Portuguese version (Versão em português)
- **[README.pt-br.md](./README.pt-br.md)** - Portuguese version of this file (Versão em português deste arquivo)
- **[PROFILE_ANALYSIS.md](./PROFILE_ANALYSIS.md)** - Technical implementation analysis
- **[CLAUDE.md](./CLAUDE.md)** - Instructions for AI/Claude
- **[AGENTS.md](./AGENTS.md)** - Automation instructions

---

## 🔐 Security

### ⚠️ Important for Production

1. **Always use `dryRunMode: true` for production**
   ```javascript
   'prod-app': {
       options: { dryRunMode: true }  // Protects against accidental execution
   }
   ```

2. **Never commit `app.config.js`**
   - Add to `.gitignore`
   - Use `app.config.demo.js` as an example

3. **Validate access permissions**
   - Consider adding authentication if public
   - Use firewall to restrict access

4. **Monitor logs**
   - Check logs regularly with `npm run logs`
   - Alert on abnormal errors

---

## 🤝 Contributing

1. Make your changes in a branch
2. Run the tests: `node test-profiles.js` and `node test-integration.js`
3. Format the code: `npm run prettier`
4. If you modify `app.config.js`, update `app.config.demo.js`
5. Commit with a descriptive message

---

## 📞 Support

For questions or issues:

1. Check this README
2. See [GUIDE_PROFILES.md](./GUIDE_PROFILES.md)
3. Run with `&runInfo=1` for debugging
4. Check the logs with `npm run logs`

---

## 📄 License

See LICENSE file (if applicable)

---

## 🎉 Ready!

Your server is configured and ready to use. Start with:

```bash
npm run dev
# Access: http://localhost:3001/__open-in-editor?profile=your-profile&file=/path/to/file.js:10:5
```

Happy coding! 🚀

---

**Next step:** Read [GUIDE_PROFILES.md](./GUIDE_PROFILES.md) for practical examples and how to create your first profile!
