#!/bin/bash

if [ -z "$1" ]; then # if the first arguemnt is null or empty
    echo "No name specified for the migration. Usage ./new-migration.sh <my name of migration e.g., create-user-table>"

    exit 1
fi

npx node-pg-migrate create $1 --migrations-dir migrations --migration-file-language sql