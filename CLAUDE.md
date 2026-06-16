# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (npm works too). Verification is `typecheck` + `lint` + `test`
(Vitest, covering the pure analysis/lore/parse layer in `tests/`).

```bash
pnpm dev          # dev server on http://localhost:3000
pnpm build        # production build
pnpm typecheck    # tsc --noEmit (strict) — run this after any TS change
pnpm lint         # next lint (ESLint)
pnpm test         # vitest run (unit tests in tests/)
pnpm format       # prettier --write
```

`@/*` path alias maps to the repo root (see tsconfig.json).

## Environment

The app runs with **no env vars**. All four are optional and server-only:
`GITHUB_TOKEN` (raises GitHub rate limit 60→5,000/hr), `OPENAI_API_KEY` /
`OPENAI_BASE_URL` / `OPENAI_MODEL` (enable + configure the optional "AI prose" feature,
any OpenAI-compatible provider). Copy `.env.example` to `.env` to set them.

## Architecture

A **stateless** Next.js 15 (App Router, React 19, RSC) app. No database, no auth, nothing
persisted. Every report is computed on request from the live GitHub REST API. The core
pipeline is **parse → fetch → analyze → narrate**:

1. **Parse** (`lib/parse-repo.ts`) — normalize any input (URL, `owner/repo`, SSH, `.git`)
   into a `RepoRef`.
2. **Fetch** (`services/github.ts`) — `fetchRepoData` pulls repo + languages + contributors +
   commits + releases + pulls + issues in parallel. Only the repo itself is required;
   everything else is best-effort (`.catch(() => null)`) so partial data still produces a
   report. Commits are capped at the **100 most recent** (GitHub API window), so velocity and
   role signals reflect *recent* activity only. Responses are edge-cached 10 min
   (`next: { revalidate: 600 }`).
3. **Analyze** (`features/analysis/`) — `analyzeRepo` (`engine.ts`) is the pure entry point.
   It builds an
   `AnalysisContext` (`context.ts`) of derived metrics once, then fans out to `dna.ts`
   (7-trait 0–100 scores), `timeline.ts`, `contributors.ts` (role inference), `charts.ts`
   (Recharts series), plus inline maturity + insights. **Add new derived metrics to
   `AnalysisContext`, not recomputed per-module.**
4. **Narrate** (`features/lore/`) — `generateLore(analysis, mode)` (`generator.ts`) is **pure
   and isomorphic**
   (no `server-only`). `buildFacts` (`facts.ts`) reduces the analysis to a `LoreFacts` bag; `MODES`
   (`modes.ts`) holds the 5 narrative voices (documentary/fantasy/scifi/corporate/meme) as
   `(facts) => string` template functions. This is why mode-switching is instant on the
   client — all 5 are generated up front via `generateAllLore`.

`services/analyze.ts` (`runAnalysis`) wraps the whole pipeline and **never throws**: it
always resolves to a discriminated `AnalyzeResult` (`{ ok: true, analysis }` or a typed
`AnalyzeError`).

### Server/client boundary

Modules that touch GitHub or secrets import `'server-only'` (`services/*`, `lib/ai/*`). The
analysis and lore engines are deliberately pure so the lore can run in the browser. Keep this
split: do not import `server-only` modules into client components, and do not add Node/secret
dependencies to `features/analysis` or `features/lore`.

### Error contract

`GitHubServiceError` carries a `code` from a fixed set (`invalid_url`, `not_found`,
`rate_limited`, `empty_repository`, `network_error`, `server_error`) that maps 1:1 onto both
the JSON API and the UI error component. When adding a failure mode, add the code to
`AnalyzeError['code']` in `types/` and handle it in the analyze error UI — don't invent
ad-hoc error strings.

### Routes

- `app/page.tsx` — landing.
- `app/analyze/page.tsx` — report route. Server component, Suspense-streamed. Reads the
  `lore_lang` cookie and, for Thai, runs `localizeAnalysis` before rendering. Takes `?repo=`
  (or legacy `?url=`); adding `?vs=owner/repo` switches to the **battle** view — `runAnalysis`
  runs for both repos in parallel and renders `<Battle>` (trait-by-trait comparison) instead
  of `<Report>`.
- `app/api/analyze/route.ts` — `GET ?repo=...`, mirrors the UI as stateless JSON.
- `app/api/lore/route.ts` — `POST { repo, mode, lang }`, returns AI-enhanced lore.
- `app/api/status/route.ts` — live diagnostics (GitHub reachability/rate-limit/token, AI
  config). Uses `/rate_limit`, which does not consume the rate budget.
- `app/api/badge/route.ts` — `GET ?repo=...[&trait=Innovation][&label=...]`, a shields-style
  SVG badge (maturity stage by default, or one DNA score). **Always returns 200** — failures
  render a neutral "unknown" badge so a README image never breaks.
- `app/api/og/route.tsx` — `GET ?repo=...[&vs=owner/repo]`, a 1200×630 social card (PNG via
  `next/og`/satori), single-repo or head-to-head. **Never 500s** — falls back to a generic
  card if satori throws, since social crawlers must not receive an error.

The two image routes are a second reason `runAnalysis` must never throw: they wrap it and
degrade to a safe placeholder rather than erroring.

### AI prose (optional, must degrade gracefully)

`lib/ai/lore-ai.ts#enhanceLore` rephrases deterministic lore in its mode's voice via an
OpenAI-compatible endpoint. It is **strictly grounded** — the model may only rephrase, never
add facts. On *any* failure (no key, network, bad JSON) it returns the original lore unchanged.
Preserve this: the app must always deploy and work without a key. `isAiAvailable()` is true if
either `OPENAI_API_KEY` or `OPENAI_BASE_URL` is set (the latter covers keyless local Ollama).

### Client-side extras

The server is stateless, but two features keep state/output in the browser:
`lib/recent.ts` (`getRecent`/`addRecent`/`clearRecent`) persists recently-viewed repo slugs
in `localStorage` for `components/recent-repos.tsx`; `lib/report-markdown.ts#buildReportMarkdown`
renders the analysis to a localized Markdown document for the export button. Both are pure
(no `server-only`) and run client-side.

### Internationalization

Languages are `en` and `th` (`lib/i18n/config.ts`). Static UI strings live in
`lib/i18n/dictionaries.ts`. Language is stored in the `lore_lang` cookie/localStorage. The
dynamic, GitHub-derived analysis prose is translated server-side at render time via
`lib/ai/translate.ts#localizeAnalysis` (Thai only); English is the source and passes through
untouched.
