# Auth Session Disposable Backup/Restore And Two-Process Smoke

Generated: 2026-07-11T14:22:36.146Z

- Status: **PASS**
- Scope: disposable localhost PostgreSQL and synthetic account only
- Production ready: **false**
- Two API processes: 2
- Shared replay/session revocation: true
- Repository outage fail-closed (HTTP 503): true
- Backup/restore integrity: true
- Auth rows restored: 1 session, 2 token hashes, 6 audit events
- Raw token exported: false
- Backup window: 811 ms
- Observed local RPO: 929 ms
- Restore plus validation RTO: 1908 ms
- Exact random-database cleanup: true
- Temporary dump cleanup: true
