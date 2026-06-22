/**
 * Demo links:
 *
 * ?runInfo=0&dryRun=1&file=%2Fmnt%2Fext4_arquivos%2Fprojects%2Fdev-tools%2Fopen-in-editor-server%2Fpackage.json%3A7%3A39&profile=my-project-2
 * ?runInfo=0&dryRun=1&file=%2Fmnt%2Fext4_arquivos%2Fprojects%2Fdev-tools%2Fopen-in-editor-server%2Fpackage.json%3A7%3A39&app_base_path_remote_map=%2Fmnt%2Fext4_arquivos%2Fprojects%2Fdev-tools%2Fopen-in-editor-server%3A%2Fmnt%2Fext4_arquivos%2Fprojects%2Fdev-tools%2Fopen-in-editor-server
 * ?file=%2Fapp%2Fapp%2Fcomponents%2Fsearch%2FVehicleFilters.vue%3A197%3A10
 * /__open-in-editor?file=%2Fapp%2Fapp%2Fcomponents%2Fsearch%2FVehicleFilters.vue%3A197%3A10
 * /_nuxt/__open-in-editor?file=%2Fapp%2Fapp%2Fcomponents%2Fsearch%2FVehicleFilters.vue%3A197%3A10
 */

/*eslint no-undef: "off"*/
import path from 'node:path';
/*eslint-disable*/
import { fileURLToPath, URL } from 'node:url';
import http from 'node:http';
import { exec } from 'node:child_process';
import fs from 'node:fs/promises';

const projectCwd = process.cwd();
const packageJsonFile = path.resolve(process.cwd(), './package.json') || './package.json';

const CONFIG_PATH = process.env.CONFIG_PATH || null;
const CONFIG_BASE_DIR = process.env.CONFIG_BASE_DIR || process.cwd();
const configFileName = 'app.config.js';
const configPath = CONFIG_PATH || path.resolve(CONFIG_BASE_DIR, configFileName);

async function getFinalConfig() {
    // 1. Define your default values
    const defaultConfig = {
        profiles: {}, // fallback profiles
        remapSplitStr: '-', // fallback separator
        defaultProfile: null,
    };

    try {
        // 2. Check if the optional config.js exists
        await fs.access(configPath, fs.constants.F_OK);

        // 3. Import the file dynamically
        const fileConfig = await import(configPath);

        // 4. Merge values: file values will overwrite defaults
        return {
            ...defaultConfig,
            profiles: fileConfig.profiles ?? defaultConfig.profiles,
            remapSplitStr: fileConfig.remapSplitStr ?? defaultConfig.remapSplitStr,
        };
    } catch (error) {
        // 5. If the file is missing, silently return the defaults
        console.log('config.js not found. Proceeding with default values.');
        return defaultConfig;
    }
}

// Example usage using Top-Level Await
const CONFIG = await getFinalConfig();

// let FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || process.cwd() + '/';
// let FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || path.resolve(process.cwd(), './') || '';
let FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || '';
const EDITOR_OPEN_CMD = process.env.EDITOR_OPEN_CMD || 'code -g';
let openCmd = EDITOR_OPEN_CMD;
let dryRunMode = ['on', 'true', '1', 'yes'].includes(process.env.DRY_RUN_MODE || false);

let demoLink = '';

const REMAP_SPLIT_STR = process.env.REMAP_SPLIT_STR || ':'; // on windows, use '=>'

const DEFAULT_LOCAL_ROOT_PATH = process.env.DEFAULT_LOCAL_ROOT_PATH || '/tmp/current-projet-root';
const LOCAL_ROOT_PATH = process.env.LOCAL_ROOT_PATH || projectCwd;
const REMOTE_ROOT_PATH = process.env.REMOTE_ROOT_PATH || projectCwd;

// APP_BASE_PATH_REMOTE_MAP="[LOCAL_ROOT_PATH]:[REMOTE_ROOT_PATH]"
const APP_BASE_PATH_REMOTE_MAP =
    process.env.APP_BASE_PATH_REMOTE_MAP ||
    (LOCAL_ROOT_PATH && REMOTE_ROOT_PATH ? `${LOCAL_ROOT_PATH}${REMAP_SPLIT_STR}${REMOTE_ROOT_PATH}` : null);

const LISTEN_HOST = process.env.LISTEN_HOST || '0.0.0.0';
const LISTEN_PORT = Number(process.env.LISTEN_PORT || 0) || 3001;
/*eslint-enable*/

const __RUNTIME_ITEMS = {};

/**
 *
 * @param {?String} key
 * @param {*} defaultValue
 *
 * @returns {any}
 */
function getConfig(key = null, defaultValue = null) {
    try {
        if (!isObject(CONFIG)) {
            return null;
        }

        if (isNull(key)) {
            return CONFIG;
        }

        if (!isString(key)) {
            return defaultValue;
        }

        if (key in CONFIG) {
            return CONFIG[key];
        }

        return defaultValue;
    } catch (error) {
        return null;
    }
}

/**
 *
 * @param {String} profile
 * @param {Object} defaultValue
 *
 * @returns {?Object}
 */
function getProfile(profile = null, defaultValue = null) {
    try {
        const profiles = ifObjectOr(getConfig('profiles'), {});

        if (!isObject(profiles)) {
            return ifObjectOr(defaultValue, {});
        }

        if (!isString(profile)) {
            return ifObjectOr(defaultValue, {});
        }

        if (profile in profiles) {
            return profiles[profile];
        }

        return ifObjectOr(defaultValue, {});
    } catch (error) {
        return ifObjectOr(defaultValue, {});
    }
}

function getOpenCmd(profile = null, defaultValue = null) {
    profile = ifObjectOr(profile, {});
    let _openCmd = ifObjectOr(profile?.open_cmd, {});
    let _command = ifStringOr(_openCmd?.command, '')?.trim();

    if (!_command) {
        return ifStringOr(EDITOR_OPEN_CMD, defaultValue) || defaultValue;
    }

    let _args =
        ifArrayOr(_openCmd?.args, [])
            ?.filter(isString)
            ?.map((v) => v?.trim())
            ?.join(' ') || '';

    return [_command, _args].filter((s) => s.trim()).join(' ') || defaultValue;
}

console.log("Active Split String: '%s'", getConfig().remapSplitStr);

const callFn = (fn, args, callback = null) => {
    if (isUndefined(args)) {
        args = [];
    }

    args = Array.isArray(args) ? args : [args];

    let output = null;
    callback = typeof callback === 'function' ? callback : (error, output) => {};

    try {
        if (typeof fn !== 'function') {
            return undefined;
        }

        output = fn(...args);

        callback(null, output);

        return output;
    } catch (error) {
        if (callback && typeof callback === 'function') {
            try {
                callback(error, output);
            } catch (error) {
                return undefined;
            }
        }

        return undefined;
    }
};

function isString(value) {
    return typeof value === 'string';
}

function isNumeric(value) {
    return !isNaN(Number(value));
}

function ifStringOr(value, defaultValue = null) {
    return isString(value) ? value : defaultValue;
}

function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function isNull(value) {
    return value === null;
}

function isUndefined(value) {
    return value === undefined;
}

function isNulled(value) {
    return isNull(value) || isUndefined(value);
}

function ifObjectOr(value, defaultValue = {}) {
    return isObject(value) ? value : defaultValue;
}

function isArray(value) {
    return Array.isArray(value);
}

function ifArrayOr(value, defaultValue = []) {
    return isArray(value) ? value : defaultValue;
}

function runtimeItemSet(key, value) {
    if (!isString(key)) {
        return false;
    }

    __RUNTIME_ITEMS[key] = value;

    return key in __RUNTIME_ITEMS;
}

function runtimeItemDelete(key, value, keep = true) {
    if (!isString(key)) {
        return false;
    }

    return delete __RUNTIME_ITEMS[key];
}

function runtimeItemGet(key, value, keep = true) {
    if (!isString(key)) {
        return undefined;
    }

    if (key in __RUNTIME_ITEMS) {
        value = __RUNTIME_ITEMS[key];
    }

    if (!keep) {
        delete __RUNTIME_ITEMS[key];
    }

    return value;
}

function isValidResponseObject(res) {
    try {
        if (!isObject(res)) {
            return false;
        }

        const keys = Object.keys(res || {});
        let toCheckKeys = [
            'outputData',
            'outputSize',
            'writable',
            'chunkedEncoding',
            'shouldKeepAlive',
            'maxRequestsOnConnectionReached',
            'useChunkedEncodingByDefault',
            'sendDate',
            'strictContentLength',
            'finished',
            'req',
            'statusCode',
            'isValidResponseObject',
            'setHeader',
            'outputData',
            'outputSize',
        ];
        return (res?.setHeader || res?.end) && keys?.filter((key) => toCheckKeys.includes(key))?.length >= 5;
    } catch (error) {
        return false;
    }
}

function setResponseObject(res) {
    __RUNTIME_ITEMS['res'] = res;

    return;
}

function getResponseObject(res, keep = true) {
    if (isValidResponseObject(res)) {
        return res;
    }

    let value = 'res' in __RUNTIME_ITEMS['res'] ? __RUNTIME_ITEMS['res'] : res;

    if (!keep) {
        // delete __RUNTIME_ITEMS['res'];
    }

    return value;
}

function sendResponse(res, content, statusCode = null, headers = null) {
    if (!isValidResponseObject(res)) {
        headers = isNull(headers) && isObject(statusCode) ? statusCode : isObject(headers) ? headers : null;
        statusCode = isNumeric(statusCode) ? statusCode : isNumeric(content) ? content : 200;
        content = res;
        res = isValidResponseObject(res) ? res : (__RUNTIME_ITEMS['res'] ?? __RUNTIME_ITEMS['res2'] ?? null);
    }

    headers = ifObjectOr(headers, {});

    headers['Content-Type'] = headers['Content-Type'] || headers['content-type'] || 'application/json';

    if (!isValidResponseObject(res)) {
        throw new Error(`Error: 'res' param must be a valid response object!`);
    }

    headers = ifObjectOr(headers, res?.headers || res?.getHeaders() || {});

    for (let [key, value] of Object.entries(headers)) {
        if (isString(key) && isString(value) && key.trim() && value.trim()) {
            // Option 1: Use setHeader (recommended for individual headers)
            res.setHeader(key, value);

            // Option 2: Use writeHead (combines status code and headers)
            // res.writeHead(200, { 'Content-Type': 'text/html' });
        }
    }

    statusCode = Number(statusCode || res?.statusCode);

    statusCode = isNumeric(statusCode) && statusCode >= 100 && statusCode < 600 ? statusCode : 500;

    res.statusCode = statusCode;

    const responseData = content;

    return res.end(responseData);
}

function sendResponseAsJson(res, content = null, statusCode = null, headers = null) {
    if (!isValidResponseObject(res)) {
        headers = isNull(headers) && isObject(statusCode) ? statusCode : isObject(headers) ? headers : null;
        statusCode = isNumeric(statusCode) ? statusCode : isNumeric(content) ? content : 200;
        content = res;
        res = isValidResponseObject(res) ? res : (__RUNTIME_ITEMS['res'] ?? __RUNTIME_ITEMS['res2'] ?? null);
    }

    headers = ifObjectOr(headers, {});

    headers['Content-Type'] = 'application/json';

    return sendResponse(res, JSON.stringify(content), statusCode, headers);
}

function getDemoLink(extra = {}) {
    extra = ifObjectOr(extra, {});

    /** @type {URL} */
    let url = extra?.url && extra?.url instanceof URL ? new URL(extra?.url?.toString()) : null;

    if (!url) {
        let req = getResponseObject(extra?.req, true) || {};
        let reqBaseHost =
            req.headers['x-forwarded-server'] || req.headers['x-forwarded-host'] || req?.headers?.host || 'localhost';

        url = new URL(req?.url, `http://${reqBaseHost}`);
    }

    /**  @type {URLSearchParams} */
    const urlParams = url.searchParams;

    let dryRun = extra?.dryRun ?? urlParams.get('dryRun') ?? 0;
    urlParams.set('dryRun', dryRun);

    let runInfo = extra?.runInfo ?? urlParams.get('runInfo') ?? 0;
    urlParams.set('runInfo', runInfo);

    // file=/my-remote-base/projects/dev-tools/open-in-editor-server/package.json%3A7%3A39
    urlParams.set('file', `${packageJsonFile}:7:39`);

    let localRootPath = LOCAL_ROOT_PATH;
    let remoteRootPath = REMOTE_ROOT_PATH || projectCwd;

    let appBasePathRemoteMap = APP_BASE_PATH_REMOTE_MAP || `${localRootPath}${REMAP_SPLIT_STR}${remoteRootPath}`;

    urlParams.set('app_base_path_remote_map', appBasePathRemoteMap);
    // app_base_path_remote_map=/mnt/ext4_arquivos/projects/dev-tools:/my-remote-base/projects/dev-tools

    return url;
}

function getRunInfo(extra = {}) {
    extra = ifObjectOr(extra, {});

    return {
        openCmd: openCmd || 'not-set',
        LISTEN_HOST: LISTEN_HOST || 'not-set',
        LISTEN_PORT: LISTEN_PORT || 'not-set',
        fromEnv: {
            'process.env.APP_BASE_PATH_REMOTE_MAP': process.env?.APP_BASE_PATH_REMOTE_MAP || 'not-set',
            'process.env.FRONTEND_PROJECT_ROOT': process.env?.FRONTEND_PROJECT_ROOT || 'not-set',
            'process.env.EDITOR_OPEN_CMD': process.env?.EDITOR_OPEN_CMD || 'not-set',
            'process.env.LISTEN_HOST': process.env?.LISTEN_HOST || 'not-set',
            'process.env.LISTEN_PORT': process.env?.LISTEN_PORT || 'not-set',
        },
        ...extra,
    };
}

const server = http.createServer((req, res) => {
    setResponseObject(res);
    __RUNTIME_ITEMS['res'] = res;
    __RUNTIME_ITEMS['res2'] = res;

    try {
        // 1. Create the URL object. A dummy base is required because req.url does not include the domain name.
        let reqBaseHost =
            req.headers['x-forwarded-server'] || req.headers['x-forwarded-host'] || req?.headers?.host || 'localhost';
        const url = new URL(req.url, `http://${reqBaseHost}`);

        // 2. Extract the clean path (e.g., '/products')
        const urlPath = url.pathname;
        const uri = urlPath;

        // 3. Extract the search parameters (optional)
        const urlParams = url.searchParams;

        const profile = urlParams.get('profile') || null;
        const profileData = getProfile(profile);

        const editor = urlParams.get('editor') || null;
        openCmd = urlParams.get('open_cmd') || getOpenCmd(profileData);
        const file = urlParams.get('file') || urlParams.get('goTo') || urlParams.get('go_to');
        dryRunMode = ['on', 'true', '1', 'yes'].includes(
            urlParams.get('dry_run') || urlParams.get('dryRun') || urlParams.get('dryRunMode')
        );

        if (['on', 'true', '1', 'yes'].includes(urlParams.get('open'))) {
            dryRunMode = true;
        }

        if (['off', 'false', '0', 'no'].includes(urlParams.get('open'))) {
            dryRunMode = true;
        }

        if (ifObjectOr(profileData?.options)?.dryRunMode) {
            dryRunMode = true;
        }

        const projectRoot = String(urlParams.get('project_root') || '').trim() || null;

        const appBasePathRemoteMap = callFn(
            (value) => {
                value = typeof value === 'string' ? value : '';

                let profileMapPaths = ifObjectOr(profileData?.mapPaths, {});
                let mapSplitStr = ifStringOr(ifObjectOr(profileData?.options)?.remapSplitStr, null) || REMAP_SPLIT_STR;

                if (
                    ifStringOr(profileMapPaths?.local, null)?.trim() &&
                    ifStringOr(profileMapPaths?.remote, null)?.trim()
                ) {
                    return {
                        local: profileMapPaths?.local,
                        remote: profileMapPaths?.remote,
                    };
                }

                if (!value.includes(mapSplitStr) || ['undefined', 'null'].includes(value)) {
                    return {
                        local: ifStringOr(profileMapPaths?.local, null)?.trim(),
                        remote: ifStringOr(profileMapPaths?.remote, null)?.trim(),
                    };
                }

                let values = value.split(mapSplitStr);

                let local = values[0] ?? values[1] ?? ifStringOr(profileMapPaths?.local, null)?.trim();
                let remote = values[1] ?? values[0] ?? ifStringOr(profileMapPaths?.remote, null)?.trim();

                return {
                    local: String(local || '')?.replace(/^(\/){2,}/g, ''),
                    remote: String(remote || '')?.replace(/^(\/){2,}/g, ''),
                };
            },
            [urlParams.get('app_base_path_remote_map') || APP_BASE_PATH_REMOTE_MAP || null]
        );

        if (['auto', '', 'auto', 'url', 'query'].includes(FRONTEND_PROJECT_ROOT)) {
            FRONTEND_PROJECT_ROOT = projectRoot || '';
        }

        const decoded = decodeURIComponent(file);
        const [path, line = 1, col = 1] = decoded.split(':');

        // mapear path do container → host
        const mappedPath = callFn(() => {
            let value = [
                FRONTEND_PROJECT_ROOT,
                String(path || '')
                    .replace('/app', '')
                    .replace(/^(\/){2,}/g, '')
                    .trim(),
            ]
                .filter((v) => typeof v === 'string' && v.trim())
                .map((v) => v.replace(/(\/){1,}$/g, ''))
                .join('/');

            if (appBasePathRemoteMap?.remote && appBasePathRemoteMap?.local) {
                value = value.replace(appBasePathRemoteMap?.remote || '', appBasePathRemoteMap?.local || '');
            }

            if (['null', 'undefined'].includes(value)) {
                return '';
            }

            return value;
        });

        const cmd = (dryRunMode ? 'echo ' : '') + `${openCmd} "${mappedPath}:${line}:${col}"`;
        let isInvalidFile = !file || cmd.includes('null/null') || cmd.includes(' ":');

        let runInfo = ['on', 'true', '1', 'yes', ''].includes(urlParams.get('runInfo') ?? urlParams.get('debug'))
            ? getRunInfo({
                  method: req?.method,
                  url,
                  file,
                  isInvalidFile,
                  uri,
                  urlPath,
                  editor,
                  urlParams,
                  dryRunMode,
                  projectRoot,
                  appBasePathRemoteMap,
                  FRONTEND_PROJECT_ROOT,
                  mappedPath,
                  cmd,
                  configPath,
                  config: getConfig(),
                  hosts: {
                      'req?.headers?.host': req?.headers?.host,
                      "req.headers['x-forwarded-server']": req.headers['x-forwarded-server'],
                      "req.headers['x-forwarded-host']": req.headers['x-forwarded-host'],
                      currentHost:
                          req.headers['x-forwarded-server'] ||
                          req.headers['x-forwarded-host'] ||
                          req?.headers?.host ||
                          'localhost',
                  },
              })
            : undefined;

        if (isInvalidFile) {
            res.statusCode = 400;
            return sendResponseAsJson({
                message: 'Invalid file or missing file param',
                demoLinks: {
                    dryRunMode: getDemoLink({ url, dryRun: 1, runInfo: 0 }),
                    open: getDemoLink({ url, dryRun: 0, runInfo: 0 }),
                },
                statusCode: res.statusCode,
                runInfo,
                try: {
                    runInfo: 1,
                },
            });
        }

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                return sendResponseAsJson({
                    message: 'Error opening editor',
                    statusCode: 500,
                    error: err?.message,
                    'res.statusCode': res.statusCode,
                    runInfo,
                });
            }

            sendResponseAsJson({
                stdout,
                stderr,
                targetInfo: {
                    file,
                    path,
                    line,
                    col,
                },
                openInfo: {
                    FRONTEND_PROJECT_ROOT,
                    FRONTEND_PROJECT_ROOT_: FRONTEND_PROJECT_ROOT || '',
                    EDITOR_OPEN_CMD,
                    openCmd,
                },
                cmd,
                mappedPath,
                dryRunMode,
                profile,
                profileData,
                runInfo,
            });
        });
    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        const responseData = JSON.stringify({
            message: 'Server Error',
            error: {
                message: error?.message || error?.text || 'Unknown error',
                file: error?.file,
                line: error?.line,
            },
            runInfo: getRunInfo({
                method: req?.method,
            }),
        });

        return res.end(responseData);
    }
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
    console.log(`open-in-editor server running on http://${LISTEN_HOST}:${LISTEN_PORT}`);
});
