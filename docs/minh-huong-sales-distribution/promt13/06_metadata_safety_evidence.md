# Metadata Safety Evidence

## Sanitization Rules

`apps/api/src/activation-orders/activation-orders.service.ts:1518`

`metadataJson` is sanitized recursively:

- keys containing `base64`, `blob`, `rawContent`, or `fileContent` are replaced with `[redacted]`.
- string values under keys ending in `storageKey` or `url` are reduced to a file name.
- nested objects and arrays are sanitized recursively.

## Tests

Unit test:

- `apps/api/src/activation-orders/activation-orders.service.spec.ts:274`
- verifies `invoices/private-proof.pdf` becomes `private-proof.pdf`.
- verifies raw file content is redacted.

DB-backed test:

- `apps/api/src/channel-finance/channel-scope.integration.spec.ts:149`
- verifies `invoices/scope-proof.pdf` becomes `scope-proof.pdf`.
- verifies `raw-scope-content` is not exposed.

## Existing File Metadata Context

Existing activation order list rows already include scalar invoice fields from `ActivationOrder`. Prompt 13 does not broaden list payloads. The history endpoint is more conservative than the existing order scalar output because history metadata storage paths are reduced to filenames.

