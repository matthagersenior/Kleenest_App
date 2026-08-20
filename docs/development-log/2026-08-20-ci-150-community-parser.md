# CI #150 — Community Parser Fix — 2026-08-20

## Failure
CI #150 on `e67cd165217927535229590cd711e71aa377fdc6` failed during Vite transform:
`src/services/community.js (14:188): Expected ')' , got 'ident'`.

## Fix
Rewrote `src/services/community.js` into explicit multiline functions and made the QR token parsing/check-in block structurally unambiguous. Preserved the existing canonical `createCheckIn` RPC path and all review/favorite/directions behavior.

## Commit
`a1c85c9acf20c9ee7f21ee78e23ca7b20be0cc72`
