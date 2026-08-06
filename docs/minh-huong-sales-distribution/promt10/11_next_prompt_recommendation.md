# Next Prompt Recommendation

Recommended next prompt:

- `Promt_quanly_minhhuong_11.md`

Recommended scope:

- package entitlement/snapshot.

Reason:

- Prompt 10 closes the `ChannelParticipant_parentParticipantId_fkey` deploy-safety blocker;
- Prompt 9 already closed DB-backed channel-admin scope coverage;
- package entitlement/snapshot is the next high-impact commercial correctness gap still deferred;
- it can be implemented without touching affiliate/QR, payment gateway, or commission policy versioning.

Suggested guardrails:

- do not implement affiliate/QR;
- do not implement payment gateway/webhook/reconciliation;
- do not change channel hierarchy scope behavior;
- keep OrderStatusHistory lifecycle and commission policy version/snapshot separate unless the next prompt explicitly chooses one of those areas.
