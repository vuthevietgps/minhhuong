# Bugs Found And Fixes

## Fixed

| Issue | Fix | Evidence |
| --- | --- | --- |
| Subscriptions created from approved commercial orders were only traceable through overloaded `providerRef`. | Added explicit nullable `sourceOrderId` relation to `ActivationOrder`. | schema `:634`, service `:723`, migration `:3`, tests `:361`. |
| Approved subscriptions did not link to `ActivationPackage`. | Added nullable `activationPackageId` relation and exact package-code resolution during approval. | schema `:635`, service `:616-624`, service `:724`, tests `:362`. |
| Legacy package-code mismatch could have broken approval if package resolution were required. | Package resolution is optional; unresolved package writes `activationPackageId = null`. | service `:724`, test `:390-421`. |
| Revocation only targeted legacy `providerRef`. | Revocation now targets traced `sourceOrderId` or legacy `providerRef`. | service `:898`. |

## Not Changed

- Learning access logic was not rewritten.
- Entitlement/package snapshot was not implemented.
- Affiliate/QR and payment gateway work remains blocked.

## Test-Run Anomaly

One early full-unit run failed in `learning.service.spec.ts`; the same area passed in isolated run and the full unit command passed on rerun without source changes after the failure. Recorded in `07_tests_run.md`.

