# Next Prompt Recommendation

Prompt 25 should add a narrow affiliate commission read/report endpoint using immutable commission proof:

- read from `CommissionEarning`;
- expose safe affiliate attribution proof from `CommissionEarning.attributionSnapshotJson`;
- expose whether chain was frozen or `legacy_missing`;
- filter by affiliate link, QR, campaign, channel, placement, participant, agency, member, status, and date;
- keep it read-only;
- no payout execution, payment gateway, frontend, mobile/customer attribution, first-click/last-click engine, coupon/discount, fraud scoring, or renewal ownership.
