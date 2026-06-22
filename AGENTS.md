# AGENTS.md - Instructions for Agents and Automation

Instructions for agents, bots, and automation systems working on this project.

---

## 🤖 What Does This Project Do?

HTTP server that maps URLs to a command that opens a file in the editor:

```
URL: http://localhost:3001/__open-in-editor?profile=app&file=/path/to/file.js:10:5
 ↓
Action: code -g "/local/path/to/file.js:10:5"
```

---

## 📋 Common Task Checklist

### Deploy/Setup

- [ ] `npm install` - Install dependencies
- [ ] `cp app.config.demo.js app.config.js` - Create config
- [ ] Edit `app.config.js` with real data
- [ ] `npm run dev` or `npm run start:prod`
- [ ] Test: `curl "http://localhost:3001/...?profile=test&file=...&runInfo=1&dryRun=1"`

### Add New Profile

```javascript
// In app.config.js
export const profiles = {
    // ... existing ...
    'new-project': {
        open_cmd: { command: 'code', args: ['-g'] },
        mapPaths: { local: '/local/path', remote: '/remote/path' },
        options: { dryRunMode: false, runInfo: false },
    },
};
```

- [ ] Edit `app.config.js`
- [ ] Copy to `app.config.demo.js`
- [ ] Test with `?profile=new-project&file=...&runInfo=1&dryRun=1`
- [ ] Commit demo changes

### Update Configuration

- [ ] Edit `app.config.js`
- [ ] Run `npm run prettier`
- [ ] Test: `node test-profiles.js` + `node test-integration.js`
- [ ] Copy to `app.config.demo.js`
- [ ] Commit if everything passes

### Troubleshooting

- [ ] Check logs: `npm run logs`
- [ ] Test with `&runInfo=1&dryRun=1`
- [ ] Run tests: `node test-profiles.js`
- [ ] Verify the editor exists: `which code` / `which antigravity`

---

## 🔗 Key Endpoints

### Open File

```
GET /__open-in-editor?profile=APP&file=PATH:LINE:COL&runInfo=1&dryRun=1
```

**Parameters**:
- `profile` (required) - Profile name
- `file` (required) - Remote path with line and column
- `runInfo` (optional) - 1 = show info, 0 = hide
- `dryRun` (optional) - 1 = do not execute, 0 = execute
- `open_cmd` (optional) - Override editor

**Response**: JSON with the result

---

## 🧪 Automated Tests

### Run Tests

```bash
npm install
node test-profiles.js      # Unit tests
node test-integration.js    # Integration tests
```

**Expected**: ✅ All passing

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run prettier
      - run: node test-profiles.js
      - run: node test-integration.js
```

---

## 🚀 Deployment

### Development

```bash
npm run dev           # With watch
npm run dev:no-watch   # Without watch
```

### Production (PM2)

```bash
npm run start         # Dev mode via PM2
npm run start:prod    # Production mode via PM2
npm run logs          # View logs
npm run stop          # Stop
npm run restart       # Restart
```

---

## 📊 Configuration Structure

```javascript
// app.config.js
export const serverConfig = {
    // Port and host
    LISTEN_PORT: 3001,
    LISTEN_HOST: '0.0.0.0',

    // Defaults
    EDITOR_OPEN_CMD: 'code -g',
    REMAP_SPLIT_STR: ':',

    // Mode
    DRY_RUN_MODE: false,
};

export const profiles = {
    'project-name': {
        open_cmd: { command: 'code', args: ['-g'] },
        mapPaths: { local: '/local', remote: '/remote' },
        options: { dryRunMode: false, runInfo: false },
    },
};

export const defaultProfile = 'project-name';
```

---

## 🔄 CI/CD Workflow

1. **Pull Request**: Tests must pass
2. **Merge**: Build + deploy
3. **Production**: PM2 reload

```bash
# Pre-deploy
npm install
node test-profiles.js
node test-integration.js

# Deploy
pm2 start ecosystem.config.cjs --env production
```

---

## 📈 Monitoring

### Logs

```bash
npm run logs
```

Watch for errors:
- "Invalid file"
- "Error opening editor"
- Path mapping issues

### Metrics

Track:
- Request count
- Most used profiles
- Errors by type
- Response time

```javascript
// Add to the server:
const requestCount = {};
const errorCount = {};

// Log each request
console.log(`${profile} | ${file} | ${statusCode}`);
```

---

## 🐛 Programmatic Debugging

### Test via HTTP

```bash
curl -s "http://localhost:3001/__open-in-editor?profile=test&file=/path:1:1&runInfo=1&dryRun=1" | jq
```

### Test via Node

```javascript
import { spawn } from 'child_process';

const proc = spawn('node', ['open-in-editor-server.js'], {
    env: { LISTEN_PORT: 3001, LISTEN_HOST: 'localhost' }
});

// Then test via HTTP...
```

---

## 📝 Code Conventions

### Profile Names

- ✅ kebab-case: `my-project`, `vue-app`
- ❌ camelCase: `myProject`
- ❌ UPPERCASE: `MY_PROJECT`

### Directory Structure

```
.
├── open-in-editor-server.js  # Server
├── app.config.js             # Config (do not commit)
├── app.config.demo.js        # Demo (commit)
├── default.config.js         # Defaults (commit)
├── ecosystem.config.cjs      # PM2 (commit)
├── package.json              # Scripts (commit)
├── test-*.js                 # Tests (commit)
└── README.md, *.md           # Docs (commit)
```

### Commits

```
fix: description          # Bug fix
feat: description         # New feature
refactor: description     # Refactoring
test: description         # New test
docs: description         # Documentation
```

---

## ✅ Quality Validation

### Before Commit

```bash
npm run prettier     # Format
node test-profiles.js
node test-integration.js
```

### Before Deploy

```bash
npm install
npm run prettier
node test-profiles.js
node test-integration.js
npm run start        # Test start
npm run stop
```

---

## 🔐 Security

### Validations

- ✅ Profile exists?
- ✅ File path valid?
- ✅ Command safe?
- ✅ dryRunMode respected?

### Production

- ✅ `dryRunMode: true` for production
- ✅ Authentication recommended
- ✅ Firewall to restrict access
- ✅ Monitor logs regularly

---

## 🚨 Known Failures and Handling

### Profile not found

```json
{
    "profile": "missing",
    "result": "Use default config or error"
}
```

**Action**: Log and notify

### Unmapped file

```json
{
    "statusCode": 400,
    "message": "Invalid file or missing file param"
}
```

**Action**: Validate mapPaths, use runInfo=1

### Editor unavailable

```json
{
    "statusCode": 500,
    "error": "ENOENT: no such file or directory"
}
```

**Action**: Check the editor, validate the command

---

## 📊 Health Checks

### Server Status

```bash
curl http://localhost:3001/
# Should return something or an HTTP error
```

### Profile Test

```bash
curl "http://localhost:3001/__open-in-editor?profile=test&file=/tmp/test.js:1:1&runInfo=1&dryRun=1" | jq
```

### Command Test

```bash
npm run status
```

---

## 🔄 Automation Example

### Deploy Script

```bash
#!/bin/bash
set -e

# Setup
npm install
npm run prettier

# Test
node test-profiles.js
node test-integration.js

# Deploy
pm2 start ecosystem.config.cjs --env production --update-env

# Verify
npm run status
npm run logs | head -20

echo "✅ Deploy complete"
```

### Rollback Script

```bash
#!/bin/bash
# Roll back to the previous version
git checkout HEAD~1 app.config.js
pm2 restart all
npm run logs
```

---

## 📞 Events to Monitor

- ✅ Server initialized
- ✅ Profile loaded
- ✅ Command executed
- ✅ Mapping error
- ✅ Command error
- ✅ dryRunMode activated

---

## 🎯 Automation with GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm run prettier
      - run: node test-profiles.js
      - run: node test-integration.js
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy steps here
          echo "Deploying..."
```

---

## 📋 Health Checklist

- [ ] Is the server responding?
- [ ] Are tests passing?
- [ ] Are configs synchronized (`app.config.js` ↔ `app.config.demo.js`)?
- [ ] Is PM2 running (if daemonized)?
- [ ] Are logs free of errors?
- [ ] Do profiles load?
- [ ] Does path mapping work?
- [ ] Is the editor available?

If any item is ❌: investigate logs and fix before production.

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Setup | `cp app.config.demo.js app.config.js` |
| Dev | `npm run dev` |
| Test | `node test-profiles.js` |
| Deploy | `npm run start:prod` |
| Logs | `npm run logs` |
| Stop | `npm run stop` |
| Status | `npm run status` |

---

Good development!
