# BA Canonical Docs Sync

## Target Files

Prompt 3 searched for:

- `ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614-v1.1-affiliate-qr.md`
- `ba-bo-sung-affiliate-link-qr-minh-huong-learning-platform-20260614.md`

## Search Result

Status: `MISSING_CANONICAL_BA_DOCS`

Searched locations:

- repo paths via `rg --files`.
- `C:\Users\PC\Downloads`.

Found:

- nearest non-canonical file: `C:\Users\PC\Downloads\ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614.md`

Not found:

- v1.1 affiliate/QR canonical BA file.
- affiliate/QR addendum file.

## Decision

No BA file was copied into `docs/minh-huong-sales-distribution/ba/` because the exact canonical v1.1/addendum files were not present. Do not implement affiliate/QR until these files are synced.

## Checklist Before Affiliate/QR Prompt

1. Copy `ba-phan-quan-ly-ban-hang-phan-phoi-minh-huong-learning-platform-20260614-v1.1-affiliate-qr.md` into `docs/minh-huong-sales-distribution/ba/`.
2. Copy `ba-bo-sung-affiliate-link-qr-minh-huong-learning-platform-20260614.md` into `docs/minh-huong-sales-distribution/ba/`.
3. Record file size and checksum.
4. Reconcile BA target models with current schema:
   - `AffiliateLink`
   - `AffiliateQrAsset`
   - `AffiliateClickEvent`
   - `AppInstallAttribution`
   - `CustomerAttribution`
5. Confirm that click/install/register events do not create revenue or commission.
6. Confirm attribution rule: first click, last click, override, attribution window, dispute.

## Prompt 4 Rule

Affiliate/QR must remain blocked in Prompt 4 if canonical BA docs are still missing.
