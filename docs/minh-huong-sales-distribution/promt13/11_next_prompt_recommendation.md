# Next Prompt Recommendation

Recommended next narrow slice:

Improve audit read usability only if product operators need richer display data.

Allowed candidate:

- add safe actor summaries for `OrderStatusHistory` rows, such as actor display name/email, using existing RBAC and without exposing more than current admin user surfaces.

Alternative candidate:

- add customer-facing own-order history under `/me` only if product requirements explicitly need parents/customers to inspect their lifecycle trail.

Keep blocked:

- affiliate/QR
- payment gateway/webhook/reconciliation
- package entitlement enforcement/UI
- commission policy version engine
- broad hierarchy/model/order/subscription/commission rewrite
- payout lifecycle history

