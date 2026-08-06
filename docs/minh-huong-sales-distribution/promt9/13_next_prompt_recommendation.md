# Next Prompt Recommendation

## Recommended Prompt 10

Name: `Promt_quanly_minhhuong_10.md`  
Type: blocker-hardening / data-quality  
Scope: validate or prepare validation for `ChannelParticipant_parentParticipantId_fkey`.

## Why This Is Next

Prompt 8 added the parent self-FK as `NOT VALID` for safer legacy migration. Prompt 9 now covers channel-admin visibility. The next narrow deploy-safety step is to audit invalid parent references and either validate the constraint or produce a safe remediation plan.

## After Prompt 10

Good candidates after the data-quality pass:

- package entitlement/snapshot;
- OrderStatusHistory lifecycle expansion beyond approval;
- commission policy version/snapshot;
- canonical BA v1.1 affiliate/QR docs sync.

Affiliate/QR implementation should remain blocked until canonical BA docs are present and reviewed.

