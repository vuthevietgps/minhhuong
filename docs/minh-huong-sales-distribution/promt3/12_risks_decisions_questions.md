# Risks, Decisions, Questions

## Decisions To Lock

- Keep `ActivationPackage` name for MVP.
- Add entitlement and trace fields instead of large package rename.
- Store entitlement snapshots on both order and subscription.
- Add `OrderStatusHistory` as domain lifecycle trail separate from `AuditLog`.
- Use a general `IdempotencyRecord` table.
- Add `Subscription.sourceOrderId` and `Subscription.activationPackageId`.
- Keep `ChannelParticipant` as canonical channel scope tree.
- Keep `AgencyMember` as legacy compatibility until a later cleanup prompt.
- Add `CommissionPolicyVersion`; do not let policy edits mutate old earnings.
- Do not implement affiliate/QR until canonical BA docs are synced.

## Business Decisions Needed

- Exact MVP entitlement limits per package.
- Whether custom sale-assisted orders can override entitlements, not just amount/duration.
- Whether `ActivationOrderStatus` needs `REFUNDED` or refund remains event-only.
- Whether payout remains one-step pay/reject or gets approve + pay workflow.
- Commission policy ownership: operations-only or admin/channel director configurable.
- Revoke after already-paid commission: immediate negative ledger, future balance hold, or manual finance workflow.
- Channel parent mutation policy after orders exist.
- Affiliate attribution rule and window after BA docs are available.

## Risks If Implemented Too Early

- Entitlement enforcement can accidentally lock out paying legacy users if fallback is not defined.
- Idempotency can block valid retries if request hash includes unstable file metadata.
- Adding source-order uniqueness without duplicate audit can fail migration on legacy data.
- Commission policy engine can become too broad if version snapshot is not implemented first.
- Affiliate/QR implementation without BA canonical docs can conflict with later attribution rules.
- DB-backed scope tests need isolated database setup; bolting them onto unit tests may make CI brittle.

## Open Questions For Prompt 4 Planning

1. Should Prompt 4 implement status history plus minimal idempotency first, or subscription traceability first?
2. Should idempotency headers be required immediately for admin operations, or optional with compatibility mode?
3. Should order history include non-status events such as invoice upload with same status?
4. Should payout have its own status history table or a generic `CommercialStatusHistory` later?
5. Should package entitlement enforcement wait until all package rows have admin UI?
