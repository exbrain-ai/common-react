# Semgrep rules (common-react, self-contained)

TS/JS-only rules used in CI. **No dependency on common-go.**

- `hardcoded-values-ts.yml` — hardcoded URLs, localhost, timeouts
- `user-facing-errors-ts.yml` — user-facing `throw new Error("...")` should use constants from `src/lib/messages.ts`

Run locally: `semgrep scan --config p/ci --config .semgrep .`
