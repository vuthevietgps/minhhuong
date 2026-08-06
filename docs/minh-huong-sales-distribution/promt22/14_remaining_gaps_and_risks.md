# Remaining Gaps And Risks

## Remaining Gaps

- Audit read is intentionally narrow and only covers affiliate report/export access.
- Audit rows reuse generic `AuditLog`; there is no dedicated typed table.
- No request id is stored because no existing safe request-id pattern was found.
- No raw IP/User-Agent is stored by design.
- No async export/object storage audit because async export is still out of scope.

## Residual Risks

- Generic `AuditLog.metadata` is JSON and not strongly typed at the DB level.
- Audit write failure currently fails the report/export request because Prompt 22 requires successful access to create audit rows.
- Very high-volume audit reads may need additional indexes or a dedicated table later.

## Accepted For This Slice

These are acceptable because Prompt 22 requested a narrow operational access audit foundation and existing `AuditLog` was already the local audit pattern.
