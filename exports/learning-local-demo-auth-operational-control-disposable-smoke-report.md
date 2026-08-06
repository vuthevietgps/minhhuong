# Shared Auth Operational Control Disposable Smoke

Generated: 2026-07-11T14:23:01.706Z

- Status: **PASS**
- Scope: two local API processes and one random localhost PostgreSQL database
- Production ready: **false**
- Atomic login admission: 5 denied + 7 throttled across 12 concurrent requests
- Atomic refresh admission: 10 denied + 6 throttled across 16 concurrent requests
- Shared counters verified: true
- Adapter outage failed closed with HTTP 503: true
- Expired attempts removed: 1
- Expired metric buckets removed: 2
- Current operational rows preserved: true
- Persisted rate keys: HMAC-SHA256 only; raw keys/tokens exported: false
- API processes stopped: true
- Exact random-database cleanup: true
- Temporary directory cleanup: true
