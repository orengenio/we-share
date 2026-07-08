# Source Verification Protocol

Law 1 in executable form. Run this before integrating ANY external source, and write findings to `docs/00-source-verification.md` in the engagement/build repo. Re-verify anything older than 90 days — repos move, packages change hands.

## Universal checklist (every source)

1. Read README, LICENSE, package manifests, and any install/postinstall scripts **before** execution.
2. Confirm license permits the intended use (pattern extraction vs. code reuse vs. redistribution).
3. Inspect any shell script in full before running: `sed -n '1,240p' <script>` — look for curl-pipe-bash, credential reads, telemetry, destructive ops.
4. Note maintenance signals: last commit, open security issues, ownership changes, archive status.
5. Record verdict: `adopt code | extract patterns only | reference only | reject` + why.

## The six sources

**1. GSD Core** — active repo `github.com/open-gsd/gsd-core`; the old `gsd-build/get-shit-done` is archived (read-only) and points there. Confirm archive status, structure, commands/agents/hooks, license. NPM package `@opengsd/gsd-core`: treat as untrusted until verified —

```bash
npm view @opengsd/gsd-core name version description repository license
npm view @opengsd/gsd-core dist.tarball bin scripts
# download + inspect the tarball contents before ANY execution
```

Only after inspection: `npx @opengsd/gsd-core@latest`. **Fallback:** if unverifiable, do not run it — SOVEREIGN's operating loop already embeds the GSD phase methodology internally, so the package is an enhancement, never a dependency.

**2. Career-Ops** — `github.com/santifer/career-ops`. Extract *patterns* (scanning, scoring, grading, tracker, cadence) into business-opportunity logic per license; don't fork blindly.

**3. GoViralBro** — `github.com/charlesdove977/goviralbro`. Clone, then inspect before anything runs:

```bash
git clone https://github.com/charlesdove977/goviralbro.git && cd goviralbro
sed -n '1,240p' scripts/init-viral-command.sh   # full read; only then decide to run
```

Extract the discovery/hook/script/brain patterns; SOVEREIGN's /og-viral is the branded superset.

**4. Higgsfield MCP** — `higgsfield.ai/mcp`. External engine: verify current MCP endpoint, auth mode, credit pricing, model list. Never self-host, never commit credentials.

**5. HighLevel API** — `marketplace.gohighlevel.com/docs/`. Verify current endpoints, scopes, rate limits, webhook signing before each integration build (docs shift).

**6. Repomix** — `repomix.com` / npm `repomix`. Verify package identity, then use for repo→AI-context packaging (`npx repomix` with secret-scan enabled) before large integrations or refactors.

## Standing prohibitions

No blind remote-script execution · no unverified postinstall hooks · no packages with mismatched repo/publisher identity · no "it's probably fine." If verification can't complete, the source doesn't ship — build the internal fallback instead. Ownership means never being hostage to an upstream you didn't read.
