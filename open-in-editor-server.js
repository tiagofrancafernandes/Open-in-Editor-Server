/**
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

// let FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || process.cwd() + '/';
let FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || path.resolve(process.cwd(), './');
const EDITOR_OPEN_CMD = process.env.EDITOR_OPEN_CMD || 'code -g';
let openCmd = EDITOR_OPEN_CMD;
let dryRunMode = ['on', 'true', '1'].includes(process.env.DRY_RUN_MODE || false);
const DEFAULT_LOCAL_ROOT_PATH = process.env.DEFAULT_LOCAL_ROOT_PATH || '/tmp/current-projet-root'

const REMAP_SPLIT_STR = process.env.REMAP_SPLIT_STR || ':'; // on windows, use '=>'

// APP_BASE_PATH_REMOTE_MAP="[LOCAL_PATH]:[REMOTE_PATH]"
const APP_BASE_PATH_REMOTE_MAP = process.env.APP_BASE_PATH_REMOTE_MAP || null;

const LISTEN_HOST = process.env.LISTEN_HOST || '0.0.0.0';
const LISTEN_PORT = Number(process.env.LISTEN_PORT || 0) || 3001;
/*eslint-enable*/

const __RUNTIME_ITEMS = {}

function isString(value) {
    return typeof value === 'string';
}

function isNumeric(value) {
    return !isNaN(Number(value));
}

function ifStringOr(value, defaultValue = '') {
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
            return false
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
        ]
        return (res?.setHeader || res?.end)
            && keys?.filter(key => toCheckKeys.includes(key))?.length >= 5;
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
        headers = isNull(headers) && isObject(statusCode) ? statusCode : (isObject(headers) ? headers : null)
        statusCode = isNumeric(statusCode) ? statusCode : (isNumeric(content) ? content : 200);
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
        headers = isNull(headers) && isObject(statusCode) ? statusCode : (isObject(headers) ? headers : null)
        statusCode = isNumeric(statusCode) ? statusCode : (isNumeric(content) ? content : 200);
        content = res;
        res = isValidResponseObject(res) ? res : (__RUNTIME_ITEMS['res'] ?? __RUNTIME_ITEMS['res2'] ?? null);
    }

    headers = ifObjectOr(headers, {});

    headers['Content-Type'] = 'application/json';

    return sendResponse(res, JSON.stringify(content), statusCode, headers);
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
    }
}

const server = http.createServer((req, res) => {
    setResponseObject(res);
    __RUNTIME_ITEMS['res'] = res;
    __RUNTIME_ITEMS['res2'] = res;

    try {
        // 1. Create the URL object. A dummy base is required because req.url does not include the domain name.
        let reqBaseHost = req?.headers?.host || 'localhost';
        const url = new URL(req.url, `http://${reqBaseHost}`);

        // 2. Extract the clean path (e.g., '/products')
        const urlPath = url.pathname;
        const uri = urlPath;

        // 3. Extract the search parameters (optional)
        const urlParams = url.searchParams;

        const editor = urlParams.get('editor') || null;
        openCmd = urlParams.get('open_cmd') || openCmd;
        const file = urlParams.get('file');
        dryRunMode = ['on', 'true', '1'].includes(urlParams.get('dry_run') || urlParams.get('dryRun') || urlParams.get('dryRunMode'));
        dryRunMode = true;
        const projectRoot = String(urlParams.get('project_root')).trim() || null;

        const appBasePathRemoteMap = ((value) => {
            try {
                value = typeof value === 'string' ? value : '';

                if (!value.includes(REMAP_SPLIT_STR)) {
                    return {
                        local: DEFAULT_LOCAL_ROOT_PATH,
                        remote: DEFAULT_LOCAL_ROOT_PATH,
                    };
                }

                let values = value.split(REMAP_SPLIT_STR);

                return {
                    local: values[0] ?? values[1] ?? DEFAULT_LOCAL_ROOT_PATH,
                    remote: values[1] ?? values[0] ?? DEFAULT_LOCAL_ROOT_PATH,
                }
            } catch (error) {
                return null;
            }
        })(urlParams.get('app_base_path_remote_map') || APP_BASE_PATH_REMOTE_MAP || null);

        if (['auto', '', 'auto', 'url', 'query'].includes(FRONTEND_PROJECT_ROOT)) {
            FRONTEND_PROJECT_ROOT = projectRoot || DEFAULT_LOCAL_ROOT_PATH;
        }

        const decoded = decodeURIComponent(file);
        const [path, line = 1, col = 1] = decoded.split(':');

        // mapear path do container → host
        const mappedPath = [
            FRONTEND_PROJECT_ROOT,
            path
                .replace('/app', '')
                .replace(/^(\/){1,}/g, '')
                .trim(),
        ]
            .filter((v) => typeof v === 'string' && v.trim())
            .map((v) => v.replace(/(\/){1,}$/g, ''))
            .join('/')
            .replace(appBasePathRemoteMap?.remote || '', appBasePathRemoteMap?.local || '');

        const cmd = (dryRunMode ? 'echo ' : ' ') + `${openCmd} "${mappedPath}:${line}:${col}"`;
        let isInvalidFile = !file || cmd.includes('null/null');

        let runInfo = getRunInfo({
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
        });

        if (!isInvalidFile) {
            res.statusCode = 400;
            return sendResponseAsJson({
                message: 'Invalid file or missing file param',
                statusCode: res.statusCode,
                runInfo,
            });
        }

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                return sendResponseAsJson(
                    {
                        message: 'Error opening editor',
                        statusCode: 500,
                        error: err?.message,
                        'res.statusCode': res.statusCode,
                        runInfo,
                    }
                );
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
                    EDITOR_OPEN_CMD,
                    openCmd,
                },
                cmd,
                mappedPath,
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
                url,
                urlPath,
                urlParams,
            }),
        });

        return res.end(responseData);
    }
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
    console.log(`open-in-editor server running on http://${LISTEN_HOST}:${LISTEN_PORT}`);
});
