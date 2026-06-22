#!/bin/bash

# # Specify an app name
# --name <app_name>

# # Watch and Restart app when files change
# --watch

# # Set memory threshold for app reload
# --max-memory-restart <200MB>

# # Specify log file
# --log <log_path>

# # Pass extra arguments to the script
# -- arg1 arg2 arg3

# # Delay between automatic restarts
# --restart-delay <delay in ms>

# # Prefix logs with time
# --time

# # Do not auto restart app
# --no-autorestart

# # Specify cron for forced restart
# --cron <cron_pattern>

# # Attach to application log
# --no-daemon

### pm2 start ecosystem.config.js

npx -y pm2 start ecosystem.config.cjs -- --name 'open-in-editor-server' \
    --ignore-watch="node_modules" \
    --port 1520 \
    --max-memory-restart 200MB \
    --time $@
