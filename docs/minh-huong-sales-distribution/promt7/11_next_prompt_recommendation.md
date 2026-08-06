# Next Prompt Recommendation

## Recommended Prompt 8

Name: `Promt_quanly_minhhuong_8.md`  
Type: blocker-fix / test-hardening  
Scope: reconcile Prisma migration history for channel hierarchy fields used by commercial scope filters and rerun DB-backed scope tests under migration deployment semantics.

## Why This Is Next

Prompt 7 proved current-code commercial scope behavior with a real database, but the harness had to use `prisma db push` because migration history does not contain SQL for current channel hierarchy fields.

Before affiliate/QR or broader commercial expansion, the deploy path should prove:

- fresh database setup with migrations creates the same schema used by the application;
- channel hierarchy fields exist after `migrate deploy`;
- Prompt 7 DB-backed scope tests still pass against migration-created schema;
- no destructive migration path is introduced.

## After Prompt 8

The next narrow test-hardening slice should add DB-backed channel-admin scope tests for:

- participant list subtree visibility;
- agency list subtree visibility;
- user list subtree visibility;
- sibling or non-descendant target action rejection.

Affiliate/QR should remain blocked until those commercial visibility foundations are deploy-safe and covered.

