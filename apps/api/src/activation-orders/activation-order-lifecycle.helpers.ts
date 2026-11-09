export function sanitizeHistoryMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeHistoryMetadata(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey.includes('base64') ||
      normalizedKey.includes('blob') ||
      normalizedKey.includes('rawcontent') ||
      normalizedKey.includes('filecontent')
    ) {
      sanitized[key] = '[redacted]';
      continue;
    }

    if (
      typeof entry === 'string' &&
      (normalizedKey.endsWith('storagekey') || normalizedKey.endsWith('url'))
    ) {
      sanitized[key] = safeHistoryFileReference(entry);
      continue;
    }

    sanitized[key] = sanitizeHistoryMetadata(entry);
  }

  return sanitized;
}

export function safeHistoryFileReference(value: string) {
  const fileName = value.split(/[\\/]/).filter(Boolean).pop();
  return fileName || '[redacted]';
}
