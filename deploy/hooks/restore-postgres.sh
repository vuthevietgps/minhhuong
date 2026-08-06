#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MIGRATION_BACKUP_PATH:?MIGRATION_BACKUP_PATH is required}"
: "${MIGRATION_RESTORE_CONFIRM_DATABASE:?MIGRATION_RESTORE_CONFIRM_DATABASE is required}"

database_name=$(node -e "process.stdout.write(new URL(process.env.DATABASE_URL).pathname.replace(/^\\//, ''))")
restore_database_url=$(node -e "const u=new URL(process.env.DATABASE_URL); u.searchParams.delete('schema'); process.stdout.write(u.toString())")
if [ -z "$database_name" ] || [ "$database_name" != "$MIGRATION_RESTORE_CONFIRM_DATABASE" ]; then
  echo "restore refused: confirmation database does not match DATABASE_URL" >&2
  exit 1
fi

test -s "$MIGRATION_BACKUP_PATH"
cd "$(dirname "$MIGRATION_BACKUP_PATH")"
sha256sum -c "$(basename "$MIGRATION_BACKUP_PATH").sha256"
pg_restore --dbname "$restore_database_url" --clean --if-exists --no-owner --no-privileges "$MIGRATION_BACKUP_PATH"
