#!/bin/sh
set -eu

if [ ! -f /pb/pb_data/data.db ] && [ -n "${PB_SUPERUSER_EMAIL:-}" ] && [ -n "${PB_SUPERUSER_PASSWORD:-}" ]; then
  /pb/pocketbase superuser create "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD"
fi

exec /pb/pocketbase serve --http=0.0.0.0:${PORT:-8080} --hooksDir=/pb/pb_hooks
