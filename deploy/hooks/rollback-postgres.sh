#!/bin/sh
set -eu

if [ "${MIGRATION_AUTO_RESTORE_ON_FAILURE:-false}" != "true" ]; then
  echo "migration rollback contained: automatic restore is disabled" >&2
  exit 0
fi

if [ "${MIGRATION_RESTORE_APPROVED:-false}" != "true" ]; then
  echo "migration rollback refused: MIGRATION_RESTORE_APPROVED=true is required" >&2
  exit 1
fi

exec sh /app/deploy/hooks/restore-postgres.sh

