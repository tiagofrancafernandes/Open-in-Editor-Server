# CLAUDE.md - Instructions for Claude/AI

Specific instructions for AI assistants (Claude, etc.) working on this project.

---

## 🎯 Project Goal

HTTP server that opens files in the code editor from URLs, with support for project profiles and automatic local/remote path mapping.

---

## 📚 Key Documentation

Read these files FIRST before making any changes:

1. **[README.md](./README.md)** - Overview and usage instructions
2. **[GUIDE_PROFILES.md](./GUIDE_PROFILES.md)** - Practical guide with examples
3. **[PROFILE_ANALYSIS.md](./PROFILE_ANALYSIS.md)** - Detailed technical analysis
4. **[AGENTS.md](./AGENTS.md)** - Instructions for automation/agents

---

## 🛠️ Technical Stack

- **Language**: JavaScript (Node.js ES modules)
- **Runtime**: Node.js 18+
- **Process Manager**: PM2 (for daemon mode)
- **Configuration**: `app.config.js` (dynamic)
- **Tests**: Unit + integration

---

## 📋 Main Code Structure

### `open-in-editor-server.js`

Main file with:
- HTTP server via native `http`
- Dynamic config loading
- URL and parameter parser
- Path mapping
- Command execution
- Error handling

**Key functions**:
- `getFinalConfig()` - Loads config
- `getProfile(name)` - Gets a profile
- `getOpenCmd(profile)` - Extracts the command
- `sendResponse()` - Sends the HTTP response

### `app.config.js`

Configuration with profiles:
- `profiles` - Object with per-project configs
- `defaultProfile` - Default profile
- `remapSplitStr` - Global separator

**⚠️ NEVER commit `app.config.js`** - Use `app.config.demo.js` as an example.

### `ecosystem.config.cjs`

PM2 configuration for daemon mode:
- App script and environment variables
- Development vs production
- Deployment settings

### `package.json`

NPM scripts:
- `npm run dev` - Development with watch
- `npm run start` - Development daemon mode
- `npm run logs` - View logs
- Etc.

---

## 🧪 Tests

### Unit Tests (`test-profiles.js`)

```bash
node test-profiles.js
```

Validates:
- Structure of each profile
- `getOpenCmd()` with different formats
- Valid `mapPaths`
- Presence of `options`

**Expected result**: ✅ 20/20 tests passing

### Integration Tests (`test-integration.js`)

```bash
node test-integration.js
```

Simulates real HTTP requests with:
- Profile application
- Path mapping
- Dry-run mode
- Fallback to default

**Expected result**: ✅ 6/6 scenarios working

---

## 🔄 Request Flow

```
URL with parameters
    ↓
Parse profile (?profile=...)
    ↓
Load config from app.config.js
    ↓
Get profile data
    ↓
Extract command via getOpenCmd()
    ↓
Map path (remote → local)
    ↓
Apply options (dryRunMode, etc)
    ↓
Execute command via exec()
    ↓
Return result as JSON
```

---

## 🐛 Known / Fixed Bugs

### ✅ Fixed Bug: `_command` Field

**Location**: `open-in-editor-server.js:149`

**Problem**: Tried to access `_openCmd?._command` (incorrect)

**Solution**: Changed to `_openCmd?.command` (correct)

```javascript
// ❌ BEFORE
let _command = ifStringOr(_openCmd?._command, '')?.trim();

// ✅ AFTER
let _command = ifStringOr(_openCmd?.command, '')?.trim();
```

---

## 📝 Development Rules

### Commits

- ✅ Write commits as if they were written by the user (no mention of Claude)
- ✅ Include a type: feat, fix, refactor, test, docs
- ✅ Be descriptive but concise
- ✅ Update `app.config.demo.js` if `app.config.js` changes

Example:
```
fix: correct field access in getOpenCmd function
```

### Tests

- ✅ ALWAYS run tests before committing
- ✅ Tests must pass 100%
- ✅ Add new tests for new features
- ✅ Test with `&runInfo=1&dryRun=1` for safety

### Configuration

- ✅ **NEVER** commit `app.config.js`
- ✅ Always update `app.config.demo.js` in parallel
- ✅ Document changes in `PROFILE_ANALYSIS.md` if relevant
- ✅ Validate in `test-profiles.js` first

### Documentation

- ✅ Keep `README.md` updated
- ✅ Add examples to `GUIDE_PROFILES.md`
- ✅ Document technical decisions in `PROFILE_ANALYSIS.md`
- ✅ Use code comments only for non-obvious logic

---

## 🚀 Development Workflow

### 1. Understand the Context

- [ ] Read `README.md`
- [ ] Run `node test-profiles.js`
- [ ] Run `node test-integration.js`
- [ ] Understand the current structure

### 2. Make the Change

- [ ] Change the code
- [ ] Add tests if needed
- [ ] Validate with `&runInfo=1&dryRun=1`
- [ ] Verify existing tests were not broken

### 3. Document

- [ ] Update comments if needed
- [ ] Add an example in `GUIDE_PROFILES.md` if relevant
- [ ] Update `PROFILE_ANALYSIS.md` if applicable
- [ ] Update `app.config.demo.js` in parallel

### 4. Full Test

- [ ] `npm run prettier` (format)
- [ ] `node test-profiles.js` (unit)
- [ ] `node test-integration.js` (integration)
- [ ] Manual test with `&runInfo=1&dryRun=1`

### 5. Commit

- [ ] `git add .`
- [ ] `git commit -m "type: description"`
- [ ] Commit without mentioning Claude

---

## ✨ Change Checklist

Before committing ANY change, answer:

- ✅ Do tests pass? (`node test-profiles.js` + `test-integration.js`)
- ✅ Is the code formatted? (`npm run prettier`)
- ✅ Is the documentation updated? (README, GUIDE, ANALYSIS)
- ✅ If I changed `app.config.js`, did I update `app.config.demo.js`?
- ✅ Does the commit message avoid mentioning Claude?
- ✅ Did I test with `&runInfo=1&dryRun=1`?

If the answer is NO for any item above: **DO NOT COMMIT**

---

## 🔍 Debugging and Investigation

### Run with Debug

```bash
# See execution information
URL?profile=...&file=...&runInfo=1&dryRun=1
```

This returns JSON with:
- Command that would be executed
- Mapped path
- All applied configuration
- Error messages

### View Server Logs

```bash
npm run logs
```

### Test Command Manually

```bash
# See the command that would be executed
URL?profile=...&file=...&runInfo=1&dryRun=1

# Then run manually:
code -g "/path/to/file.js:10:5"
```

---

## 🎯 Common Issues and Solutions

### Profile Does Not Load

1. Check that `app.config.js` exists
2. Run `node -e "import('./app.config.js').then(c => console.log(c.profiles))"`
3. Use `&runInfo=1` to see which profile was used

### Path Does Not Map

1. Check `mapPaths` in `app.config.js`
2. Use `&runInfo=1` to see the actual mapping
3. Ensure local/remote match the file

### Command Does Not Execute

1. Test the command manually: `code -g "/path/to/file.js:10:5"`
2. Verify that the editor is installed
3. Use `&runInfo=1` to see the generated command

---

## 🤔 Design Decisions

### Why PM2?

- Easy daemon mode
- Auto-restart on crash
- Persistence after reboot
- Log management
- Alternative: systemd, Docker

### Why Dynamic `app.config.js`?

- Allows multiple profiles
- No hardcoded config
- Easy to change without rebuilding
- No restart needed after changes (reloads)

### Why Do URL Parameters Take Precedence?

- Maximum flexibility
- Can override the profile when needed
- Does not break the existing workflow

### Why Does dryRunMode Force Execution?

- Protection for production
- Prevents accidents
- When enabled in the profile, it is intentional

---

## 📊 Metrics and Performance

- **Startup**: ~100ms
- **Request handling**: ~5-50ms (depends on mapping)
- **Configuration loading**: ~10-20ms (first time)

---

## 🔐 Security Considerations

- ✅ Input validation in commands
- ✅ Protection of `dryRunMode` in sensitive profiles
- ✅ Robust error handling
- ✅ Log all executions (when `runInfo=1`)

For production:
- Consider adding authentication
- Validate profiles against a whitelist
- Monitor logs regularly

---

## 🚨 Before Making Large Changes

If you are going to make significant changes:

1. **Create a feature branch**: `git checkout -b feature/description`
2. **Discuss the architecture**: See `PROFILE_ANALYSIS.md`
3. **Run full tests**: `test-profiles.js` + `test-integration.js`
4. **Document the decision**: Add a comment in `PROFILE_ANALYSIS.md`
5. **Create new tests**: To validate the new functionality

---

## ✅ Final Checklist

Always before finishing a task:

- ✅ Did I read `README.md`?
- ✅ Did I read `GUIDE_PROFILES.md`?
- ✅ Did I read `PROFILE_ANALYSIS.md`?
- ✅ Did I run tests?
- ✅ Did I test with `&runInfo=1&dryRun=1`?
- ✅ Did I update the documentation?
- ✅ Does the commit avoid mentioning Claude?
- ✅ Was `app.config.demo.js` updated?

If NO: go back and complete it BEFORE considering it done.

---

## 📞 Support for Claude/AI

When working on this project:

1. ALWAYS read the 3 main documentation files
2. ALWAYS run tests before finishing
3. ALWAYS test with `?runInfo=1&dryRun=1`
4. NEVER commit `app.config.js`
5. NEVER mention Claude in commits
6. NEVER skip documentation

If unsure: **ask the user before making changes**.

---

Good development! 🚀
