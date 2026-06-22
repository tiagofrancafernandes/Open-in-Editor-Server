/*eslint no-undef: "off"*/
import path from 'path';
/*eslint-disable*/
import { fileURLToPath, URL } from 'node:url';
import http from 'http';
import { exec } from 'child_process';

// const FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || process.cwd() + '/';
const FRONTEND_PROJECT_ROOT = process.env.FRONTEND_PROJECT_ROOT || path.resolve(process.cwd(), './');
const EDITOR_OPEN_CMD = process.env.EDITOR_OPEN_CMD || 'code -g';

const LISTEN_HOST = process.env.LISTEN_HOST || '0.0.0.0';
const LISTEN_PORT = Number(process.env.LISTEN_PORT || 0) || 3001;
/*eslint-enable*/

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = url.searchParams.get('file');

    if (!file) {
        res.statusCode = 400;
        return res.end('Missing file param');
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
        .join('/');

    const cmd = `${EDITOR_OPEN_CMD} "${mappedPath}:${line}:${col}"`;

    exec(cmd, (err) => {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            return res.end('Error opening editor');
        }

        res.end(
            JSON.stringify(
                {
                    targetInfo: {
                        file,
                        path,
                        line,
                        col,
                    },
                    openInfo: {
                        FRONTEND_PROJECT_ROOT,
                        EDITOR_OPEN_CMD,
                    },
                    cmd,
                    mappedPath,
                },
                null,
                4
            )
        );
    });
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
    console.log(`open-in-editor server running on http://${LISTEN_HOST}:${LISTEN_PORT}`);
});
