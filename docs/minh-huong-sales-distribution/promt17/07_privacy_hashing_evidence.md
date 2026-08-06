# Privacy Hashing Evidence

## Implementation

`apps/api/src/channel-affiliate/channel-affiliate.service.ts`

- `ipHash` uses `hashSensitive`: line 437
- `userAgentHash` uses `hashSensitive`: line 438
- `deviceHint` is sanitized/truncated: line 439
- dedupe key is hashed: line 345 and line 862
- HMAC-SHA256 implementation: lines 867-871
- hash secret reads `AFFILIATE_HASH_SECRET`, then `JWT_SECRET`, then dev fallback: lines 878-884
- device hint sanitizer removes unsafe characters and limits length: lines 886-893

## Config

`.env.example`

- `AFFILIATE_REDIRECT_BASE_URL`: line 12
- `AFFILIATE_HASH_SECRET`: line 13

## Tests

`apps/api/src/channel-affiliate/channel-affiliate-redirect.integration.spec.ts`

- raw IP and raw User-Agent are not present in DB row serialization: lines 180-181
- hash fields match SHA-256 hex shape: lines 178-179
- metadata does not contain Authorization/cookie: lines 182-183

## Metadata Policy

Click metadata stores only safe flags such as source, QR accepted, and explicit dedupe. It does not store raw request headers, cookies, Authorization, or raw PII.
