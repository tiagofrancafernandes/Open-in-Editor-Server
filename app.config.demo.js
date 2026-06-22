const gotoAntigravity = {
    command: 'antigravity',
    args: ['-g'],
}

const gotoVscode = {
    command: 'code',
    args: ['-g'],
}

export const defaultProfile = 'my-default';
export const profiles = {
    'my-default': {
        editor: gotoAntigravity,
        mapPaths: {
            local_root_path:
                '/mnt/ext4_arquivos/clientes/Guilherme-Aguiar-Squadria-11-9---0630/arquivos/Upgrade-Project-Squadria-Up-Copilot',
            remote_root_path: '/var/www/Squadria/Upgrade',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
    'Upgrade-Project-Squadria-Up-Copilot': {
        editor: gotoAntigravity,
        mapPaths: {
            local_root_path:
                '/mnt/ext4_arquivos/clientes/Guilherme-Aguiar-Squadria-11-9---0630/arquivos/Upgrade-Project-Squadria-Up-Copilot',
            remote_root_path: '/var/www/Squadria/Upgrade',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
    'my-project-1': {
        editor: {
            command: 'code',
            args: ['-g'],
        },
        mapPaths: {
            local_root_path:
                '/my-projects/my-project-1',
            remote_root_path: '/var/www/projects/my-project',
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
    'my-project-2': {
        editor: {
            command: 'antigravity',
            args: ['-g'],
        },
        mapPaths: {
            local_root_path:
                '/my-projects/my-project-2-apps',
            remote_root_path: '/var/www/projects/my-second-project',
        },
        options: {
            dryRunMode: true,
            runInfo: false,
        },
    },
    'my-windows-iss-project': {
        editor: {
            command: 'antigravity',
            args: ['-g'],
        },
        mapPaths: {
            local_root_path:
                '/my-projects/my-asp-project',
            remote_root_path: 'C:\\My-Projects\\projects\\my-remote-windows-server\\project',
        },
        options: {
            remapSplitStr: '=>',
            dryRunMode: false,
            runInfo: false,
        },
    },
};

// export const remapSplitStr = '=>' // Windows
export const remapSplitStr = ':'
