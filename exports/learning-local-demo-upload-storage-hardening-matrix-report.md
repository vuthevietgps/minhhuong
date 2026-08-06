# Learning Upload Storage Hardening Matrix

- Generated at: 2026-07-11T01:00:00.000Z
- Decision: `PASS_OBJECT_STORAGE_FOUNDATION_LOCAL_ONLY`
- Upload surfaces: 4
- Denied negative cases: 3/3
- `production_ready=false`
- `production_enabled=false`

## Upload Surfaces

| Surface | Actor scope | Route | Directory | Root |
| --- | --- | --- | --- | --- |
| admin-content-video | ADMIN_CONTENT_EDITOR | `/v1/admin/content/lessons/:lessonId/videos/upload` | `videos` | `UPLOADS_PATH` |
| teacher-content-video | TEACHER | `/v1/teacher/content/lessons/:lessonId/videos/upload` | `videos` | `UPLOADS_PATH` |
| activation-order-invoice-payment-proof | SALES_PARENT_REVIEWER | `/v1/activation-orders/*` | `invoices` | `UPLOADS_PATH` |
| channel-finance-payout-invoice | FINANCE | `/v1/channel-finance/payouts/:payoutId/pay` | `invoices` | `UPLOADS_PATH` |

## Fail-Closed Negative Cases

| Case | Expected violation | Observed | Decision |
| --- | --- | --- | --- |
| initial-api-multi-instance-denied | `HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID` | `HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID` | DENIED_AS_EXPECTED |
| s3-topology-undeclared-denied | `HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID` | `HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID` | DENIED_AS_EXPECTED |
| hosted-filesystem-without-emergency-override-denied | `HOSTED_STAGING_UPLOADS_INVALID` | `HOSTED_STAGING_UPLOADS_INVALID`, `HOSTED_STAGING_UPLOAD_TOPOLOGY_INVALID` | DENIED_AS_EXPECTED |

## Remaining Blockers

- Initial hosted staging remains limited to exactly one API replica by business decision.
- No real hosted bucket, provider credential reference, or provider acceptance has been supplied.
- Hosted storage capacity, backup/restore, retention/deletion, malware handling, private delivery, and owner acceptance remain external gates.
