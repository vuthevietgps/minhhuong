# ERP local demo Lead -> Order -> Profit -> Ads Attribution

Generated at: 2026-06-29T00:00:00.000Z

## Safety

- Fixture-only local demo data.
- productionDbUsed=false
- providerApiUsed=false
- liveAdsExecuted=false
- realErpMutationUsed=false

## Totals

- Leads: 4
- Orders: 3
- Approved orders: 2
- Revenue: 5,700,000 VND
- Ads cost: 1,370,000 VND
- Gross profit: 4,275,000 VND
- Contribution profit after ads: 2,135,000 VND

## Attribution Rows

| Source | Campaign | Ad group | Keyword | Leads | Approved orders | Revenue | Ads cost | Gross profit | Contribution profit | ROAS |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GOOGLE_ADS | summer-enrollment-2026 | search-parent-intent | english for kids | 2 | 1 | 3,600,000 VND | 650,000 VND | 2,700,000 VND | 1,570,000 VND | 5.54 |
| FACEBOOK_ADS | retargeting-trial-2026 | video-viewers |  | 1 | 1 | 2,100,000 VND | 420,000 VND | 1,575,000 VND | 865,000 VND | 5.00 |
| TIKTOK_ADS | phonics-booster-2026 | lookalike-parents | phonics | 1 | 0 | 0 VND | 300,000 VND | 0 VND | -300,000 VND | 0.00 |

## Lead Order Map

| Lead | Order | Source | Campaign | Status | Revenue | Gross profit | Contribution before ads |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| lead-google-001 | order-google-001 | GOOGLE_ADS | summer-enrollment-2026 | APPROVED | 3,600,000 VND | 2,700,000 VND | 2,220,000 VND |
| lead-google-002 | order-google-002 | GOOGLE_ADS | summer-enrollment-2026 | PENDING_REVIEW | 0 VND | 0 VND | 0 VND |
| lead-facebook-001 | order-facebook-001 | FACEBOOK_ADS | retargeting-trial-2026 | APPROVED | 2,100,000 VND | 1,575,000 VND | 1,285,000 VND |
| lead-tiktok-001 |  | TIKTOK_ADS | phonics-booster-2026 | NO_ORDER | 0 VND | 0 VND | 0 VND |
