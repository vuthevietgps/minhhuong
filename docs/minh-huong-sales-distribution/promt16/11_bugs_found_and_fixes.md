# Bugs Found And Fixes

## Implementation Bugs

No post-implementation code/test failures were encountered.

The first targeted run of `channel-affiliate` passed:

- 1 suite
- 7 tests

## Environment Notes

`git status --short` failed because the workspace is not a git repository. This is the same environment condition recorded in earlier prompts.

DB-backed suites emit the existing non-failing `pg` deprecation warning. No behavior failure was observed.

## Scope Corrections

No scope correction was needed. The implementation stayed within `AffiliateLink` + `AffiliateQrAsset` foundation scope.
