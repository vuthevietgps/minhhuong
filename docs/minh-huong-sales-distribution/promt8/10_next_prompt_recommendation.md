# Next Prompt Recommendation

## Recommended Prompt 9

Name: `Promt_quanly_minhhuong_9.md`  
Type: test-hardening  
Scope: DB-backed channel-admin scope tests.

## Required Coverage

Prompt 9 should cover:

- participant list subtree visibility;
- agency list subtree visibility;
- user list subtree visibility;
- sibling/non-descendant detail or action rejection;
- admin/operations global behavior;
- empty participant safety if applicable.

## Why This Is Next

Prompt 8 proves the migration-deploy scope foundation. Prompt 7 already proves core order/finance/wallet/payout/CSV scope on that foundation.

The remaining channel visibility surface is channel-admin. Affiliate/QR should remain blocked until channel-admin DB-backed scope tests pass.

