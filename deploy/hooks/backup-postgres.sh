#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MIGRATION_BACKUP_PATH:?MIGRATION_BACKUP_PATH is required}"

backup_dir=$(dirname "$MIGRATION_BACKUP_PATH")
mkdir -p "$backup_dir"
tmp_path="${MIGRATION_BACKUP_PATH}.tmp"
rm -f "$tmp_path"
backup_database_url=$(node -e "const u=new URL(process.env.DATABASE_URL); u.searchParams.delete('schema'); process.stdout.write(u.toString())")

pg_dump --dbname "$backup_database_url" --format=custom --no-owner --no-privileges --file "$tmp_path"
test -s "$tmp_path"
mv "$tmp_path" "$MIGRATION_BACKUP_PATH"
sha256sum "$MIGRATION_BACKUP_PATH" > "${MIGRATION_BACKUP_PATH}.sha256"
