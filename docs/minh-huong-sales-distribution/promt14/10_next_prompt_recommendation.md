# Next Prompt Recommendation

Recommended next narrow slice:

Only proceed with another read-side audit usability task if product operators need it.

Possible candidates:

- add a conservative display fallback for actor rows with no `Profile.displayName`, such as using email as the UI label while keeping the payload fields unchanged.
- add customer-facing own-order history under `/me` only if product requirements explicitly need parents/customers to inspect their lifecycle trail.

Keep blocked:

- affiliate/QR.
- payment gateway/webhook/reconciliation.
- package entitlement enforcement/UI.
- commission policy version engine.
- broad hierarchy/model/order/subscription/commission rewrite.
- payout lifecycle history.
- lifecycle write-semantic changes.

