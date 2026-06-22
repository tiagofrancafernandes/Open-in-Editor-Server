/**
 * Application Configuration Demo
 *
 * COPY THIS FILE TO app.config.js AND CUSTOMIZE FOR YOUR ENVIRONMENT
 * This file demonstrates all available configuration options.
 *
 * IMPORTANT:
 * - app.config.js is NOT tracked in git (see .gitignore)
 * - Keep app.config.demo.js updated with your configuration examples
 * - Update both files when adding new profiles or changing structure
 */

// ============================================
// SERVER CONFIGURATION
// ============================================

/**
 * Server settings
 *
 * These can also be set via environment variables:
 * - LISTEN_PORT=3001
 * - LISTEN_HOST=0.0.0.0
 * - EDITOR_OPEN_CMD="code -g"
 * - DRY_RUN_MODE=false
 * - REMAP_SPLIT_STR=":"
 *
 * Priority: Environment variables > app.config.js > defaults
 */
export const serverConfig = {
    // Port and host
    LISTEN_PORT: process.env.LISTEN_PORT || 3001,
    LISTEN_HOST: process.env.LISTEN_HOST || '0.0.0.0',

    // Default editor command
    EDITOR_OPEN_CMD: process.env.EDITOR_OPEN_CMD || 'code -g',

    // Global dry-run mode
    DRY_RUN_MODE: ['on', 'true', '1', 'yes'].includes(process.env.DRY_RUN_MODE || 'false'),

    // Path separator: ':' for Linux/Mac, '=>' for Windows
    REMAP_SPLIT_STR: process.env.REMAP_SPLIT_STR || ':',

    // Frontend project root (auto means take from URL)
    FRONTEND_PROJECT_ROOT: process.env.FRONTEND_PROJECT_ROOT || '',
};

// ============================================
// PROFILE DEFINITIONS
// ============================================

/**
 * Helper: Command shortcuts
 */
const gotoAntigravity = {
    command: 'antigravity',
    args: ['-g'],
};

const gotoVscode = {
    command: 'code',
    args: ['-g'],
};

/**
 * Profiles: Define your projects here
 *
 * Each profile must have:
 * - open_cmd: Editor command (object with 'command' and optional 'args')
 * - mapPaths: Local/remote path mapping
 * - options: Profile-specific options
 */
export const profiles = {
    // ============================================
    // Example: Default Project
    // ============================================
    'my-default': {
        open_cmd: gotoVscode,
        mapPaths: {
            local: '/home/usuario/projetos/my-default',
            remote: '/var/www/my-default',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },

    // ============================================
    // Example: VS Code with Path Mapping
    // ============================================
    'my-project-1': {
        open_cmd: {
            command: 'code',
            args: ['-g'],
        },
        mapPaths: {
            local: '/home/usuario/projetos/my-project-1',
            remote: '/var/www/projects/my-project',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },

    // ============================================
    // Example: Protected Production Project (Dry-Run)
    // ============================================
    'my-project-2': {
        open_cmd: {
            command: 'code -g', // Can also be a single string
        },
        mapPaths: {
            local: '/home/usuario/projetos/my-project-2-apps',
            remote: '/var/www/projects/my-second-project',
        },
        options: {
            dryRunMode: true, // 🔒 Force dry-run mode!
            runInfo: false,
        },
    },

    // ============================================
    // Example: Windows IIS Project
    // ============================================
    'my-windows-iss-project': {
        open_cmd: gotoAntigravity,
        mapPaths: {
            local: 'D:\\projetos\\my-app',
            remote: 'C:\\inetpub\\wwwroot\\app',
        },
        options: {
            remapSplitStr: '=>', // Use '=>' instead of ':' for Windows
            dryRunMode: false,
            runInfo: false,
        },
    },

    // ============================================
    // Example: Antigravity Editor
    // ============================================
    'antigravity-project': {
        open_cmd: {
            command: 'antigravity',
            args: ['-g'],
        },
        mapPaths: {
            local: '/home/usuario/projetos/my-app',
            remote: '/var/www/my-app',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },

    // ============================================
    // Example: Vim Editor
    // ============================================
    'vim-project': {
        open_cmd: {
            command: 'vim',
            args: ['+call cursor({line},{col})'], // vim-specific args
        },
        mapPaths: {
            local: '/home/usuario/projetos/my-app',
            remote: '/var/www/my-app',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
};

// ============================================
// DEFAULT SETTINGS
// ============================================

/**
 * Default profile to use if none specified via ?profile=...
 */
export const defaultProfile = 'my-default';

/**
 * Global path separator (can be overridden per profile)
 * ':' for Linux/Mac
 * '=>' for Windows
 */
export const remapSplitStr = ':';

// ============================================
// USAGE EXAMPLES
// ============================================

/*
EXAMPLES:

1. Open file with default profile:
   http://localhost:3001/__open-in-editor?file=/var/www/my-default/app.js:10:5

2. Open file with specific profile:
   http://localhost:3001/__open-in-editor?profile=my-project-1&file=/var/www/projects/my-project/src/App.vue:42:10

3. Test with dry-run (show command without executing):
   http://localhost:3001/__open-in-editor?profile=my-project-1&file=/var/www/projects/my-project/src/App.vue:42:10&dryRun=1

4. Debug with info output:
   http://localhost:3001/__open-in-editor?profile=my-project-1&file=/var/www/projects/my-project/src/App.vue:42:10&runInfo=1

5. Override editor via URL:
   http://localhost:3001/__open-in-editor?profile=my-project-1&open_cmd=vim&file=/var/www/projects/my-project/src/App.vue:42:10

USAGE WITH XDEBUG (Laravel):
   Add to php.ini or .env:
   xdebug.file_link_format = "http://localhost:3001/__open-in-editor?profile=my-project-1&file=%f:%l:%c"

USAGE WITH ERROR LOGGING:
   const editorLink = `http://localhost:3001/__open-in-editor?profile=my-project-1&file=${file}:${line}:${col}`;
   console.error(`Error: ${error} ${editorLink}`);

*/
