# Bugs Found And Fixes

## Environment Blocker

The first DB-backed test run failed before test execution because local Postgres was not accepting connections:

```text
ECONNREFUSED
```

Resolution:

- Started Docker Desktop.
- Waited for `minhhuong-postgres` to become healthy.
- Reran the same focused migration spec successfully.

This was an environment condition, not a code fix.

## Code Issues

No functional code bug was found after implementation. Build passed before focused testing, and the CSV tests passed after the DB environment was available.

## Result

- migration spec passed, 17 tests
- channel-affiliate suite passed, 23 tests
- full Jest passed, 155 tests
- e2e passed, 12 tests
- final build passed
