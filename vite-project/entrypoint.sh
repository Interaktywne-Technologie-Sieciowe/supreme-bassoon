#!/bin/sh

# Inject API_URL into config.js
echo "window.APP_CONFIG = { API_URL: '${API_URL}' };" > /usr/share/nginx/html/config.js

# Start Nginx
exec nginx -g "daemon off;"
