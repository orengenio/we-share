# WeShare → Coolify Migration Plan

**Goal:** Connect the **new** `orengenio/we-share` repo to the **existing** Coolify application (replacing the old WeShare deployment), without losing domain, env, or infrastructure already wired on your self-hosted Coolify instance.

**Target Coolify app (OLD — keep this one):**  
`{COOLIFY_BASE_URL}/project/r11tj9huum731lgceomqhik3/environment/g3hkojl4719qlm1vf6yj6m28/application/ze8fhivmw2ug39pcz7sg3c9d`

**Application UUID:** `ze8fhivmw2ug39pcz7sg3c9d`  
**Project UUID:** `r11tj9huum731lgceomqhik3`  
**Environment UUID:** `g3hkojl4719qlm1vf6yj6m28`  
**Production domain:** `weshare.orengen.io`

---

## Current State (as of 2026-06-27)

| Item | Status | Notes |
|------|--------|-------|
| GitHub repo | `orengenio/we-share` | This workspace |
| `main` branch | Docs only | Markdown + static HTML. **Not deployable as the full app.** |
| App code branch | `claude/affiliate-partner-program-p42c0p` | Full Next.js 14 + Prisma + Dockerfile |
| Live site | `weshare.orengen.io` → HTTP 200 | Serving **old static HTML** (Inter font, dark theme). Last-Modified: 2026-03-30 |
| Coolify API | **Blocked** | `COOLIFY_API_TOKEN` returns `Unauthenticated` — token expired or revoked |
| `weshare.origin.io` | Does not resolve | Likely a typo for `weshare.orengen.io`, or a mistaken repo/domain reference |

### What likely went wrong

1. A **new** Coolify connection was made (possibly pointing at the wrong repo, branch, or a duplicate app) instead of **updating the existing app** at UUID `ze8fhivmw2ug39pcz7sg3c9d`.
2. The **deployable code** lives on a feature branch, while `main` only has handbook/content files — so even a correct repo hook would fail to build the full app until the branch is fixed.
3. The Coolify API token in the agent environment is **no longer valid**, so automated reconnection cannot proceed until a fresh token is issued.

---

## Architecture (target)

```
GitHub: orengenio/we-share (main)
        │
        ▼  git push / webhook
Coolify: {COOLIFY_BASE_URL}
        App UUID: ze8fhivmw2ug39pcz7sg3c9d
        Build: Dockerfile (Next.js standalone)
        │
        ├── PostgreSQL (Coolify managed)
        ├── Redis (Coolify managed)
        └── Domain: weshare.orengen.io
```

**Required env vars** (from `.env.example` on the app branch):

- `DATABASE_URL`, `REDIS_URL`
- `NEXT_PUBLIC_APP_URL=https://weshare.orengen.io`
- `JWT_SECRET`, `COOKIE_DOMAIN=.orengen.io`
- Stripe keys + price IDs
- GHL keys + pipeline stage IDs
- Resend email keys
- n8n webhook URLs (optional)
- `ADMIN_EMAILS`

---

## Migration Checklist

Track progress here. Mark `[x]` when done.

### Phase 0 — Prerequisites

- [ ] **0.1** Regenerate Coolify API token at your Coolify dashboard → **Keys & Tokens** → create token with `read` + `write` on Applications
- [ ] **0.2** Confirm GitHub App / deploy key on Coolify can access `orengenio/we-share` (Settings → Sources → GitHub)
- [ ] **0.3** Identify and **disable/remove any duplicate WeShare app** created by mistake (do NOT delete `ze8fhivmw2ug39pcz7sg3c9d`)
- [ ] **0.4** Snapshot current env vars from the old app (Coolify UI → Application → Environment Variables → export/copy)

### Phase 1 — Repo readiness

- [ ] **1.1** Merge `claude/affiliate-partner-program-p42c0p` → `main` (or open PR and merge after review)
- [ ] **1.2** Verify `Dockerfile`, `package.json`, `prisma/schema.prisma` are on `main`
- [ ] **1.3** Confirm `npm run build` passes locally or in CI
- [ ] **1.4** Push merged `main` to GitHub

### Phase 2 — Point OLD Coolify app at NEW repo

**Option A — Coolify UI (recommended if API token unavailable)**

1. Open the target app in Coolify (project `r11tj9huum731lgceomqhik3`, app UUID `ze8fhivmw2ug39pcz7sg3c9d`)
2. **General** → Source:
   - Repository: `orengenio/we-share`
   - Branch: `main`
   - Build pack: **Dockerfile** (not Nixpacks)
   - Base directory: `/` (repo root)
3. **General** → Domains: confirm `weshare.orengen.io` is attached to **this** app only
4. **Environment Variables**: paste vars from Phase 0.4; update `NEXT_PUBLIC_APP_URL` if needed
5. **Services**: confirm linked PostgreSQL + Redis UUIDs match the old deployment (do not create new DBs unless intentional)
6. Save → **Deploy**

**Option B — Coolify API (after token refresh)**

```bash
export COOLIFY_BASE_URL="<your-coolify-url>"
export COOLIFY_API_TOKEN="<new-token>"
export APP_UUID="ze8fhivmw2ug39pcz7sg3c9d"

# Inspect current app
curl -sS -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  "$COOLIFY_BASE_URL/api/v1/applications/$APP_UUID" | jq .

# Update git source
curl -sS -X PATCH \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "git_repository": "https://github.com/orengenio/we-share",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "is_preserve_repository_enabled": false
  }' \
  "$COOLIFY_BASE_URL/api/v1/applications/$APP_UUID"

# Trigger deploy
curl -sS -X POST \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  "$COOLIFY_BASE_URL/api/v1/applications/$APP_UUID/restart"
```

- [ ] **2.1** Update git repository on app `ze8fhivmw2ug39pcz7sg3c9d`
- [ ] **2.2** Set branch to `main`, build pack to Dockerfile
- [ ] **2.3** Re-apply environment variables
- [ ] **2.4** Trigger deployment
- [ ] **2.5** Remove/disable wrongly connected duplicate app (if one exists)

### Phase 3 — Database & data

- [ ] **3.1** If old app had production data: **do not** point `DATABASE_URL` at a fresh empty DB without a migration plan
- [ ] **3.2** On first deploy, container runs `prisma migrate deploy` (see Dockerfile CMD)
- [ ] **3.3** Run seed only if this is a fresh environment: `npm run db:seed` (one-time, via Coolify terminal or exec)
- [ ] **3.4** Verify admin login with `ADMIN_EMAILS` bootstrap account

### Phase 4 — Verification

- [ ] **4.1** `https://weshare.orengen.io` loads new Next.js landing (Public Sans, light theme, Join Now CTA)
- [ ] **4.2** `/register`, `/login`, `/leaderboard`, `/calculator` respond
- [ ] **4.3** Stripe webhook endpoint reachable from Stripe dashboard
- [ ] **4.4** GHL webhook test event processes
- [ ] **4.5** Affiliate cookie attribution works (`COOKIE_DOMAIN=.orengen.io`)
- [ ] **4.6** Coolify health check green; logs show no Prisma migration errors

### Phase 5 — Cleanup

- [ ] **5.1** Delete/disable duplicate Coolify application (if created in error)
- [ ] **5.2** Remove stale DNS or domain bindings on wrong apps
- [ ] **5.3** Store new `COOLIFY_API_TOKEN` in agent secrets / password manager
- [ ] **5.4** Enable auto-deploy on push to `main` (optional)

---

## Rollback plan

If the new deploy breaks production:

1. Coolify → Application → **Deployments** → redeploy last known-good deployment
2. Or revert git source to previous repo/branch and redeploy
3. Keep PostgreSQL volume intact — do not destroy the DB service

---

## Blockers (action required from you)

| Blocker | Owner | Action |
|---------|-------|--------|
| Expired Coolify API token | Admin | Regenerate in Coolify dashboard → Keys & Tokens |
| App code not on `main` | Dev | Merge PR from `claude/affiliate-partner-program-p42c0p` |
| Unknown duplicate app | Admin | List all apps in Coolify project; identify the mistaken connection |
| Production secrets | Admin | Confirm Stripe/GHL/Resend keys in Coolify env match live integrations |

---

## Next agent actions (once unblocked)

1. Validate API token → `GET /api/v1/applications/ze8fhivmw2ug39pcz7sg3c9d`
2. List all applications → find duplicate WeShare
3. Merge feature branch to `main` if approved
4. PATCH application git source + deploy
5. Run verification checklist Phase 4

---

*Last updated: 2026-06-27 · Branch: `cursor/coolify-migration-plan-db16`*
