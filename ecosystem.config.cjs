// !!!! ATTENTION
// `pm2 ecosystem` will recreate this file

module.exports = {
    apps: [
        {
            script: './open-in-editor-server.js',
            // watch: '.',
            env: {
                NODE_ENV: 'development',
                FRONTEND_PROJECT_ROOT: 'auto',
                EDITOR_OPEN_CMD: 'antigravity -g', // 'code -g' | 'antigravity -g'
                LISTEN_HOST: '0.0.0.0',
                LISTEN_PORT: '3333',

                // -------------------------------------
                // https://pm2.keymetrics.io/docs/usage/expose/
                // PM2_SERVE_PATH: '.',
                // PM2_SERVE_PORT: 8080,
                // PM2_SERVE_BASIC_AUTH: 'true',
                // PM2_SERVE_BASIC_AUTH_USERNAME: 'example-login',
                // PM2_SERVE_BASIC_AUTH_PASSWORD: 'example-password'
                // -------------------------------------
            },
            env_production: {
                NODE_ENV: 'production',
                FRONTEND_PROJECT_ROOT: 'auto',
                EDITOR_OPEN_CMD: 'antigravity -g', // 'code -g' | 'antigravity -g'
                LISTEN_HOST: '0.0.0.0',
                LISTEN_PORT: '3333',
            },
        },
        // {
        //     script: './service-worker/',
        //     watch: ['./service-worker']
        // },
        //
    ],

    deploy: {
        production: {
            user: 'SSH_USERNAME',
            host: 'SSH_HOSTMACHINE',
            ref: 'origin/master',
            repo: 'GIT_REPOSITORY',
            path: 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
        },
    },
};
