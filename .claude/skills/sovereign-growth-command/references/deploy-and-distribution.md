# Deploy & Distribution

How SOVEREIGN travels: cross-runtime installs (the SKILL.md format is an open standard) and the MansaCore repo posture.

## §1 Runtime install paths

The `.skill` file is a zip of this folder. For Claude: save via the file card or drop the folder in `~/.claude/skills/`. For everything else, unzip the folder into the runtime's skills directory:

| Runtime | Global skills path | Project scope |
|---|---|---|
| Claude Code / Claude apps | `~/.claude/skills/` | project `.claude/skills/` |
| Antigravity (IDE / 2.0 / CLI) | `~/.gemini/config/skills/` | `<project>/.agents/skills/` |
| Gemini CLI | `~/.gemini/skills/` | `<project>/.agents/skills/` |
| Cursor | `~/.cursor/skills/` | — |
| Tool-agnostic emerging standard | `~/.agents/skills/` | `<project>/.agents/skills/` |

Multi-runtime management: the `npx skills` CLI (vercel-labs) symlinks one canonical copy across agents — install once, available everywhere. Note: Google is folding Gemini CLI into Antigravity CLI; Agent Skills carry over. Verify current paths on major runtime updates (directories have already moved once).

**Cross-runtime caveats:** the interop hooks (AI Board, brand-authority-os, Tango MCP, Automation Architect) assume those capabilities exist in the host runtime — where absent, SOVEREIGN's fallbacks apply (structured decision tables instead of Board rounds, lite brand intake instead of brand-authority-os, build-spec packs instead of live MCP execution). The skill degrades gracefully; the doctrine never does.

## §2 MansaCore repo scaffold

SOVEREIGN is platform IP → it lives under **MansaCore** (IP holder), delivered through OrenGen engagements (services arm). Two-entity flywheel, enforced in git.

```
mansacore/sovereign-growth-command/        (PRIVATE)
├── skill/                     ← this folder, the source of truth
├── releases/                  ← packaged .skill artifacts per version
├── CHANGELOG.md               ← what changed, why, per version
├── evals/                     ← test prompts + benchmark results per release
├── engagements/               ← (gitignored) live engagement artifacts never enter the repo
└── README.md                  ← internal operating notes
```

- **Versioning:** semver tags (`v2.0.0`). The `.skill` artifact is the release asset. Description or law changes = minor bump minimum; new modes = minor; doctrine changes = major.
- **Secrets:** none, ever. Engagement data, client profiles, and credentials never commit — the repo holds the engine, not the fuel.
- **Public-lite play (optional, later):** a sanitized fork — OrenGen constants stripped from Brand Guard, interop hooks generalized, Mode O removed — published as top-of-funnel. Repos recruit; the private version stays the moat. Ship it only after live engagements prove the engine (stars follow receipts).
- **License posture:** private = proprietary MansaCore IP. Lite (if shipped) = source-available with no-resale terms, reviewed before publishing.

## §3 Release ritual

1. Changes land in `skill/` → CHANGELOG entry → eval pass on 2–3 live-shaped prompts
2. Package (`.skill`) → drop in `releases/` → tag
3. Reinstall across active runtimes → one smoke-test invocation per runtime
4. Note breaking changes for any live engagements' STATE files
