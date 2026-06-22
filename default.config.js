/**
 * Default Configuration
 *
 * Esta é a configuração padrão usada quando valores não estão presentes em app.config.js
 * ou variáveis de ambiente. Todos os valores podem ser sobrescritos.
 */

export const defaultServerConfig = {
    // Porta e Host
    LISTEN_PORT: process.env.LISTEN_PORT || 3001,
    LISTEN_HOST: process.env.LISTEN_HOST || '0.0.0.0',

    // Editor padrão
    EDITOR_OPEN_CMD: process.env.EDITOR_OPEN_CMD || 'code -g',

    // Modo dry-run
    DRY_RUN_MODE: ['on', 'true', '1', 'yes'].includes(process.env.DRY_RUN_MODE || 'false'),

    // Separador de caminho (Linux: ':', Windows: '=>')
    REMAP_SPLIT_STR: process.env.REMAP_SPLIT_STR || ':',

    // Caminho raiz do projeto frontend
    FRONTEND_PROJECT_ROOT: process.env.FRONTEND_PROJECT_ROOT || '',

    // Paths locais/remotos padrão
    LOCAL_ROOT_PATH: process.env.LOCAL_ROOT_PATH || process.cwd(),
    REMOTE_ROOT_PATH: process.env.REMOTE_ROOT_PATH || process.cwd(),
};

/**
 * Perfis padrão
 *
 * Ao menos um perfil deve estar disponível.
 * Se nenhum for definido em app.config.js, estes serão usados.
 */
export const defaultProfiles = {
    default: {
        open_cmd: {
            command: 'code',
            args: ['-g'],
        },
        mapPaths: {
            local: process.cwd(),
            remote: process.cwd(),
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
};

/**
 * Perfil padrão a usar
 *
 * Se nenhum perfil for especificado via ?profile=..., usa este.
 */
export const defaultProfileName = 'default';

/**
 * Separador de caminho padrão
 */
export const defaultRemapSplitStr = ':';
