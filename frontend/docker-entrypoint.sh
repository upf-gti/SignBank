#!/bin/sh
set -e

if [ -n "$VITE_BASE_URL" ]; then
  find /usr/share/nginx/html -type f -name "*.js" \
    -exec sed -i "s|VITE_BASE_URL_PLACEHOLDER|${VITE_BASE_URL}|g" {} +
fi

exec nginx -g 'daemon off;'
