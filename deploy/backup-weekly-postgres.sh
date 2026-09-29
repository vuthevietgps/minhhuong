#!/usr/bin/env bash
# Encrypted logical PostgreSQL backup for the Lumira English production stack.
# Configuration and the encryption key live outside the release directory.

set -euo pipefail
umask 077

BACKUP_DIR="${BACKUP_DIR:-/home/admin-001/minhhuong-db-backups}"
CONFIG_FILE="${CONFIG_FILE:-$BACKUP_DIR/backup.env}"
KEY_FILE="${KEY_FILE:-$BACKUP_DIR/encryption.key}"

if [[ ! -r "$CONFIG_FILE" ]]; then
  echo "Backup configuration is unavailable: $CONFIG_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$CONFIG_FILE"
set +a

: "${POSTGRES_CONTAINER:?POSTGRES_CONTAINER must be configured}"
: "${POSTGRES_DATABASE:?POSTGRES_DATABASE must be configured}"
: "${POSTGRES_USER:?POSTGRES_USER must be configured}"
: "${BACKUP_EMAIL:?BACKUP_EMAIL must be configured}"
: "${BACKUP_FROM:?BACKUP_FROM must be configured}"

if [[ ! -s "$KEY_FILE" ]]; then
  echo "Encryption key is unavailable: $KEY_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

timestamp="$(TZ=Asia/Ho_Chi_Minh date +%Y%m%d-%H%M%S)"
prefix="${POSTGRES_DATABASE}_${timestamp}"
raw_dump="$BACKUP_DIR/${prefix}.dump"
encrypted_dump="$BACKUP_DIR/${prefix}.dump.enc"
checksum_file="$BACKUP_DIR/${prefix}.dump.enc.sha256"

cleanup() {
  rm -f -- "$raw_dump"
}
trap cleanup EXIT

if ! docker inspect --format '{{.State.Running}}' "$POSTGRES_CONTAINER" | grep -qx true; then
  echo "PostgreSQL container is not running: $POSTGRES_CONTAINER" >&2
  exit 1
fi

docker exec -i "$POSTGRES_CONTAINER" \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" \
  --format=custom --no-owner --no-privileges > "$raw_dump"

if [[ ! -s "$raw_dump" ]]; then
  echo "The PostgreSQL dump is empty." >&2
  exit 1
fi

# Verify the custom-format archive before encrypting it.
docker exec -i "$POSTGRES_CONTAINER" pg_restore --list < "$raw_dump" >/dev/null

openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 -md sha256 \
  -pass "file:$KEY_FILE" -in "$raw_dump" -out "$encrypted_dump"

if [[ ! -s "$encrypted_dump" ]]; then
  echo "Encrypted backup was not created." >&2
  exit 1
fi

sha256sum "$encrypted_dump" > "$checksum_file"

boundary="minhhuong-backup-${timestamp}-$$"
message_id="minhhuong-backup-${timestamp}-$$@lumiraenglish.com"
{
  printf 'To: %s\n' "$BACKUP_EMAIL"
  printf 'From: %s\n' "$BACKUP_FROM"
  printf 'Subject: [Lumira English] Encrypted PostgreSQL backup %s\n' "$timestamp"
  printf 'Message-ID: <%s>\n' "$message_id"
  printf 'MIME-Version: 1.0\n'
  printf 'Content-Type: multipart/mixed; boundary="%s"\n\n' "$boundary"
  printf '%s\n' "--$boundary"
  printf 'Content-Type: text/plain; charset=UTF-8\n\n'
  printf 'Encrypted logical PostgreSQL backup for %s.\n' "$POSTGRES_DATABASE"
  printf 'Created: %s (Asia/Ho_Chi_Minh)\n' "$(TZ=Asia/Ho_Chi_Minh date --iso-8601=seconds)"
  printf 'SHA-256: %s\n' "$(awk '{print $1}' "$checksum_file")"
  printf 'The decryption key is retained only in the protected server backup directory.\n\n'
  printf '%s\n' "--$boundary"
  printf 'Content-Type: application/octet-stream; name="%s"\n' "$(basename "$encrypted_dump")"
  printf 'Content-Transfer-Encoding: base64\n'
  printf 'Content-Disposition: attachment; filename="%s"\n\n' "$(basename "$encrypted_dump")"
  base64 -w 76 "$encrypted_dump"
  printf '\n%s--\n' "--$boundary"
} | /usr/sbin/sendmail -t

# Sending through sendmail is asynchronous. Wait for Postfix to report that Gmail
# accepted this exact message before deleting any previous local backup.
queue_id=""
delivery_status=""
for _ in $(seq 1 12); do
  queue_id="$(sed -n "s/.*: \([A-F0-9][A-F0-9]*\): message-id=<$message_id>.*/\1/p" /var/log/mail.log 2>/dev/null | tail -n 1)"
  if [[ -n "$queue_id" ]]; then
    delivery_status="$(grep -F "$queue_id: to=<$BACKUP_EMAIL>" /var/log/mail.log 2>/dev/null | tail -n 1 || true)"
    if [[ "$delivery_status" == *'status=sent'* ]]; then
      break
    fi
    if [[ "$delivery_status" == *'status=bounced'* || "$delivery_status" == *'status=deferred'* ]]; then
      echo "Backup email was not delivered; previous backups were retained." >&2
      exit 1
    fi
  fi
  sleep 5
done

if [[ "$delivery_status" != *'status=sent'* ]]; then
  echo "Could not confirm delivery of the backup email; previous backups were retained." >&2
  exit 1
fi

# Keep exactly the newly created encrypted backup locally. Old copies are removed
# only after the dump was validated, encrypted, and accepted by Gmail.
find "$BACKUP_DIR" -maxdepth 1 -type f -name "${POSTGRES_DATABASE}_*.dump.enc" \
  ! -name "$(basename "$encrypted_dump")" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name "${POSTGRES_DATABASE}_*.dump.enc.sha256" \
  ! -name "$(basename "$checksum_file")" -delete

printf 'Backup completed: %s (SHA-256 %s)\n' \
  "$encrypted_dump" "$(awk '{print $1}' "$checksum_file")"
