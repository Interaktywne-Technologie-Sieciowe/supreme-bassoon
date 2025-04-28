#!/bin/bash

# Usage: ./migrate.sh up or ./migrate.sh down

# Set your database URL
export DATABASE_URL="postgres://myuser:mypassword@localhost:5432/mydatabase"

# Check if an argument (up/down) was passed
if [ -z "$1" ]; then
  echo "No migration direction provided. Usage: ./migrate.sh up|down"
  exit 1
fi

# Run migration
npx node-pg-migrate "$1" \
  --migration-file-extension sql \
  --migrations-dir migrations \
  --migration-filename-format timestamp
