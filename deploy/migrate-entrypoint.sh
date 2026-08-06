#!/bin/sh
set -eu

mkdir -p /backups
chown node:node /backups
exec su-exec node node scripts/run-hosted-migration.mjs "$@"

