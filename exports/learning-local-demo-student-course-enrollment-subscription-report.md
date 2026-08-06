# Learning local demo Student -> Course -> Enrollment -> Subscription/Payment -> Refund/Commission Report

Generated at: 2026-06-29T00:00:00.000Z

## Safety

- Fixture-only local demo data.
- productionDbUsed=false
- providerApiUsed=false
- paymentProviderUsed=false
- liveAdsExecuted=false
- realStudentMutationUsed=false
- realCourseMutationUsed=false
- realEnrollmentMutationUsed=false
- realPaymentMutationUsed=false
- realRefundMutationUsed=false
- realCommissionMutationUsed=false
- realClassMutationUsed=false
- realSessionMutationUsed=false
- realAttendanceMutationUsed=false
- realProgressMutationUsed=false
- realErpMutationUsed=false
- secretsRequired=false

## Totals

- Students: 4
- Courses: 2
- Enrollments: 4
- Active enrollments: 2
- Pending enrollments: 1
- Canceled enrollments: 1
- Subscriptions: 4
- Payments: 4
- Refunds: 1
- Commissions: 4
- Gross paid: 8,400,000 VND
- Pending payment amount: 2,400,000 VND
- Refunded amount: 2,400,000 VND
- Net revenue: 6,000,000 VND
- Commission pending: 240,000 VND
- Commission payable: 252,000 VND
- Commission approved: 288,000 VND
- Commission canceled: 240,000 VND

## Course Aggregates

| Course | Enrollments | Active | Pending | Canceled | Gross paid | Refunded | Net revenue | Earned commission |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MH-A1-STARTER English Starter A1 | 3 | 1 | 1 | 1 | 4,800,000 VND | 2,400,000 VND | 2,400,000 VND | 240,000 VND |
| MH-PHONICS-BOOSTER Phonics Booster | 1 | 1 | 0 | 0 | 3,600,000 VND | 0 VND | 3,600,000 VND | 540,000 VND |

## Enrollment Rows

| Student | Course | Enrollment | Subscription | Payment | Refund | Gross paid | Pending payment | Refunded | Net revenue | Commission pending | Commission payable | Commission approved | Commission canceled |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Ava Nguyen (child-ava-demo) | MH-A1-STARTER | ACTIVE | ACTIVE | SUCCEEDED | NONE | 2,400,000 VND | 0 VND | 0 VND | 2,400,000 VND | 240,000 VND | 0 VND | 0 VND | 0 VND |
| Khoa Le (child-khoa-demo) | MH-A1-STARTER | CANCELED | CANCELED | REFUNDED | SUCCEEDED | 2,400,000 VND | 0 VND | 2,400,000 VND | 0 VND | 0 VND | 0 VND | 0 VND | 240,000 VND |
| Minh Tran (child-minh-demo) | MH-A1-STARTER | PENDING | TRIALING | PENDING | NONE | 0 VND | 2,400,000 VND | 0 VND | 0 VND | 0 VND | 0 VND | 0 VND | 0 VND |
| Linh Pham (child-linh-demo) | MH-PHONICS-BOOSTER | ACTIVE | ACTIVE | SUCCEEDED | NONE | 3,600,000 VND | 0 VND | 0 VND | 3,600,000 VND | 0 VND | 252,000 VND | 288,000 VND | 0 VND |
