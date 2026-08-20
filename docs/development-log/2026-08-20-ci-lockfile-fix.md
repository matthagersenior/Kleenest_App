# CI Lockfile Fix — 2026-08-20

## Failure
CI #112 failed before dependency installation because `actions/setup-node@v5` was configured with `cache: npm`, but the repository does not contain a package-lock.json, npm-shrinkwrap.json, or yarn.lock.

## Fix
Removed npm dependency caching from `.github/workflows/ci.yml` and retained Node 24 / checkout v5 / setup-node v5.

The Build workflow already installs without npm caching and did not have this failure mode.

## Verification target
The next CI run should progress past setup-node and reach `npm install` and `npm run build`. Any subsequent compiler/build failure should be treated separately from this infrastructure error.

## Commit
38469671d459326cf1d73325138620328a56f15e
