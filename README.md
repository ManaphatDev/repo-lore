<div align="center">

# Repository Lore

### Turn GitHub Repositories Into Stories

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)

**English** · [ไทย](README.th.md)

</div>

---

Paste any **public GitHub repository URL** and read its development history back as a narrated, timeline-based story — complete with a reconstructed timeline, a seven-trait **Repository DNA** profile, contributor roles, live charts, and five switchable **narrative modes**.

> Analytics tell you _what_ happened. Repository Lore tells you the _story_ of how it happened.

- **Stateless** — no database, no accounts, no login, nothing stored.
- **Real time** — every report is computed on request from the live GitHub API.
- **Private** — repository data is held only long enough to render the page.

---

## Features

| Area | What you get |
| --- | --- |
| **Timeline** | Genesis, first release, major versions, development bursts, community growth, present day |
| **Repository DNA** | 0–100 scores for Innovation, Stability, Community, Growth, Maintenance, Documentation, Testing — each explained |
| **Lore engine** | A five-chapter story in five voices, rewritten instantly when you switch modes |
| **Narrative modes** | Documentary · Fantasy · Sci-Fi · Corporate · Meme |
| **Contributor roles** | The Architect · Feature Builder · Bug Hunter · Maintainer · Community Champion — inferred + justified |
| **Charts** | Commit activity, development momentum, top contributors, release cadence, language mix |
| **Languages** | Full UI in English & Thai, switchable on the fly; dynamic prose is translated server-side |
| **Design** | "Codex" aesthetic, dark + light themes, responsive, reduced-motion aware |

---

## Tech Stack

| | |
| --- | --- |
| **Framework** | Next.js 15 — App Router, React Server Components, Suspense streaming |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS + shadcn-style component primitives |
| **Charts** | Recharts |
| **Data** | GitHub REST API (the only data source) |
| **Deploy** | Vercel-ready · pnpm · ESLint + Prettier |

---

## Getting Started

```bash
# 1. install dependencies
pnpm install        # or: npm install

# 2. (optional) raise the GitHub rate limit
cp .env.example .env
#   edit .env and set GITHUB_TOKEN=...

# 3. start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a repository such as `facebook/react`.

### Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm format` | Prettier write |

---

## Environment Variables

The app runs with **no environment variables**. All four are optional and server-only:

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Raises the GitHub API rate limit from **60 → 5,000 requests/hour**. No scopes needed. |
| `OPENAI_API_KEY` | Enables the optional **AI prose** toggle. Works with any OpenAI-compatible provider. |
| `OPENAI_BASE_URL` | Point AI prose at a different provider. Default: `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Override the model used for AI prose. Default: `gpt-4o-mini` |

### Free AI Providers

AI prose uses the standard OpenAI chat-completions API, so any compatible provider works — including several free ones:

| Provider | Free? | `OPENAI_BASE_URL` | `OPENAI_MODEL` | Keys |
| --- | --- | --- | --- | --- |
| **Groq** | ✅ no card | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | [console.groq.com](https://console.groq.com/keys) |
| **Google Gemini** | ✅ free tier | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **OpenRouter** | ✅ `:free` models | `https://openrouter.ai/api/v1` | `meta-llama/llama-3.3-70b-instruct:free` | [openrouter.ai](https://openrouter.ai/keys) |
| **Ollama** (local) | ✅ 100%, no key | `http://localhost:11434/v1` | `llama3.2` | none |

Create a GitHub token at [github.com/settings/tokens](https://github.com/settings/tokens) — a classic token with **no scopes** is enough. It is read only on the server and never sent to the browser.

### AI Prose

The lore engine is **deterministic by default** and needs no AI. If `OPENAI_API_KEY` is set, each report gains an **AI prose** toggle that rephrases the selected mode's chapters in their narrative voice — strictly instructed not to introduce any fact not already in the data. If the key is absent or a call fails, the deterministic text is shown instead. The app always deploys and works without a key.

---

## Internationalization

The interface ships in **English** and **Thai** (`en`, `th`). A toggle in the header switches language instantly; the choice is stored in the `lore_lang` cookie/localStorage.

- **Static UI strings** live in `lib/i18n/dictionaries.ts` — English is the source of truth; Thai must structurally match it.
- **Dynamic prose** (lore, insights, DNA rationales) is generated in English and translated to Thai **server-side** via `lib/ai/translate.ts`. Without an `OPENAI_API_KEY`, dynamic prose stays in English while the rest of the UI is fully Thai.

---

## API

A stateless JSON endpoint backs and mirrors the UI:

```
GET /api/analyze?repo=facebook/react
GET /api/analyze?repo=https://github.com/vercel/next.js
```

Returns the full `RepoAnalysis` on success, or a typed error: `invalid_url` · `not_found` · `rate_limited` · `empty_repository` · `network_error` · `server_error`.

---

## Project Structure

```
app/
  layout.tsx              fonts, theme provider, header/footer
  page.tsx                landing page
  analyze/page.tsx        report route (Suspense + streaming)
  api/analyze/route.ts    stateless JSON API
  error.tsx, not-found.tsx

components/
  ui/                     shadcn-style primitives (button, card, tabs…)
  landing/                hero, features, how-it-works, examples, faq
  analyze/                overview, dna, timeline, contributors, lore reader
  analyze/charts/         Recharts views

features/
  analysis/               analysis engine (dna, timeline, contributors, charts)
  lore/                   narrative engine (facts + 5 modes)

services/
  github.ts               GitHub REST client + error handling
  analyze.ts              parse → fetch → analyze pipeline

lib/                      utils, formatting, parsing, examples
types/                    github + analysis domain types
```

---

## How It Works

```
Input URL / owner/repo
       │
       ▼
   Parse ──────────── normalize to owner/repo (URLs, SSH, .git all accepted)
       │
       ▼
   Fetch ──────────── repo · languages · contributors · commits · releases
       │               pulls · issues — all in parallel, edge-cached 10 min
       ▼
  Analyze ─────────── classify commits · score DNA · detect milestones
       │               assign contributor roles · build chart series
       ▼
  Narrate ─────────── map facts onto 5 story templates
                       mode-switching is instant (all 5 generated up front)
```

**A note on accuracy:** Metadata, contributors, releases, and languages are exact. Commit-derived insights use the most recent window the REST API exposes (up to 100 commits), so velocity and role signals reflect _recent_ activity. A few timeline placements are clearly labelled **approx.**

---

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — framework is auto-detected as Next.js.
3. _Optional:_ add `GITHUB_TOKEN` under **Project → Settings → Environment Variables**.
4. Deploy. No database or other services required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## License

[MIT](LICENSE) © 2026 Gman
