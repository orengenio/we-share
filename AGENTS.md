# AGENTS.md

## Cursor Cloud specific instructions

### Repo layout (important)
This repository has two very different kinds of content depending on the branch:

- `main` and `cursor/coolify-migration-plan-db16` (this branch): **docs/content only** — markdown handbooks, static HTML, a migration plan. There is no runnable application here (no `package.json`).
- `claude/affiliate-partner-program-p42c0p`: the **actual product** — a Next.js 14 (App Router, `output: standalone`) + Prisma/PostgreSQL + Redis + Stripe/GHL/email app called "WeShare". This is what you run and develop.

Because the app lives on a feature branch, the update script is guarded: `npm install` / `prisma generate` only run when a `package.json` / `prisma/schema.prisma` exist at the repo root. On the docs-only branch it safely no-ops.

### Running the app
The app was set up in a git worktree so the primary checkout stays on this branch:
`/home/ubuntu/we-share-app` (checked out from `claude/affiliate-partner-program-p42c0p`). If it is missing, recreate it with `git worktree add /home/ubuntu/we-share-app origin/claude/affiliate-partner-program-p42c0p`, then `npm ci` inside it. Alternatively, check that branch out at `/workspace` and the update script will install deps for you.

Run the dev server from the app directory: `npm run dev` (Next.js on http://localhost:3000). Standard scripts live in `package.json` (`dev`, `build`, `start`, `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio`).

### Services (installed in the VM snapshot, but NOT auto-started)
PostgreSQL 16 and Redis 7 are installed but there is no systemd/runlevel in this VM, so they do not start on boot. Start them each session before running the app:
- Postgres: `sudo pg_ctlcluster 16 main start`
- Redis: `sudo redis-server /etc/redis/redis.conf` (config has `daemonize yes`); verify with `redis-cli ping`.

Local DB is `weshare` owned by role `weshare` / password `weshare_pass` on `127.0.0.1:5432`. The Postgres data directory (including seeded data) persists in the snapshot; only the process needs restarting.

### Env & database setup (app dir)
The app reads `.env.local` (Next.js) and `.env` (Prisma CLI reads `DATABASE_URL` here). Both were created locally pointing at the local Postgres/Redis with a generated `JWT_SECRET` and dummy Stripe/GHL/email keys. These files are gitignored and not committed. Integration clients (Stripe, GHL, email, Redis) initialize lazily / degrade gracefully, so the app boots and the auth flow works without real third-party keys.

- Apply schema: `npx prisma migrate deploy` (migrations in `prisma/migrations/`).
- Seed admin + settings: `npm run db:seed`. The seed and `ts-node` do NOT auto-load `.env.local`; pass vars inline, e.g. `DATABASE_URL=... ADMIN_EMAILS=admin@weshare.local ADMIN_DEFAULT_PASSWORD='ChangeMe2026!' npm run db:seed`. Seeded admin: `admin@weshare.local` / `ChangeMe2026!`.

### Lint / build gotchas
- `npm run lint` is **not usable non-interactively**: the repo ships no ESLint config, so `next lint` prompts to configure. `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true`, so lint/type errors do not fail `npm run build`.
- `npm run build` works and produces a standalone build.
