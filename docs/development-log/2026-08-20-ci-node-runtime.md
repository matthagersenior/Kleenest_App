# CI Node Runtime — 2026-08-20

## Batch
Responded to the reported GitHub Actions build failure annotation and Node runtime warning.

## Changes
- Updated `actions/checkout` from v4 to v5.
- Updated `actions/setup-node` from v4 to v5.
- Standardized the Build workflow on Node 24.
- Standardized the CI workflow on Node 24.
- Enabled npm dependency caching in CI.

## Verification
The supplied CI annotation reported `Process completed with exit code 1`, but did not include the underlying compiler/build error. The available GitHub connector did not expose the run ID/logs for that manually observed run, so the underlying build failure is not being claimed as fixed yet.

The Node 20 warning is addressed by the workflow updates.

## Commits
- 90fd9fdcd888d6c6affda2791ecec51bf89a90a1 — Build workflow
- c457834ca473deb39e6e61cb23472a561a75e997 — CI workflow
