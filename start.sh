#!/bin/bash

# Wrapper para iniciar servidor com PM2
#
# Uso: ./start.sh [pm2 args] [flags]
#
# Exemplos:
#    bash ./start.sh                              # Usa ecosystem.config.cjs
#    bash ./start.sh --env development            # Com variável de ambiente
#    bash ./start.sh --watch --env development    # Com watch/reload automático
#    bash ./start.sh start ecosystem.config.cjs --env production
#    bash ./start.sh start ecosystem.config.cjs --env development
#    bash ./start.sh start my-prod-ecosystem.prod.cjs --env production
#
# PM2 Flags (opcional):
#   --watch                   - Reinicia servidor ao mudar arquivos
#   --env <name>              - Define variável de ambiente NODE_ENV
#   --no-autorestart          - Desabilita auto-restart em crashes
#   --restart-delay <ms>      - Delay entre restarts automáticos
#   --no-daemon               - Executa em foreground (útil para debug)
#
# Scripts recomendados (npm):
#   npm run start             - Inicia sem watch
#   npm run dev               - Inicia sem watch (mesmo que start)
#   npm run dev:watch         - Inicia com watch (reload automático)
#   npm run logs              - Ver logs em tempo real

set -e  # Exit on error

__DIR__=$(dirname $(readlink -f $0));

cd $__DIR__

CONFIG_FILE="ecosystem.config.cjs"

# Valida existência do arquivo de configuração
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Erro: Arquivo de configuração '$CONFIG_FILE' não encontrado"
    exit 1
fi

if [[ "$1" = ""  || -z "$1" ]]; then
    # Remove primeiro argumento para passar o resto
    shift 2>/dev/null || true

    # Inicia com PM2
    npx -y pm2 start "$CONFIG_FILE" -- \
        --name 'open-in-editor-server' \
        --ignore-watch="node_modules" \
        --port 1520 \
        --max-memory-restart 200MB \
        --time "$@"
else
    npx -y pm2 "$@"
fi
