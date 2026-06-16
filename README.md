# Repository Lore — Turn GitHub Repositories Into Stories

**English** · [ไทย](README.th.md)

Paste any **public GitHub repository URL** and read its development history back as a
narrated, timeline-based story — complete with a reconstructed timeline, a seven-trait
**Repository DNA** profile, contributor roles, live charts, and five switchable
**narrative modes** (Documentary, Fantasy, Sci-Fi, Corporate, Meme).

> Analytics tell you _what_ happened. Repository Lore tells you the _story_ of how it happened.

- **Stateless** — no database, no accounts, no login, nothing stored.
- **Real time** — every report is computed on request from the live GitHub API.
- **Private** — repository data is held only long enough to render the page.

---

## ✨ Features

| Area                  | What you get                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Timeline**          | Genesis, first release, major versions, development bursts, community growth, present day.     |
| **Repository DNA**    | 0–100 scores for Innovation, Stability, Community, Growth, Maintenance, Documentation, Testing — each explained. |
| **Lore engine**       | A five-chapter story in five voices, rewritten instantly when you switch modes.                |
| **Contributor roles** | The Architect, Feature Builder, Bug Hunter, Maintainer, Community Champion — inferred + justified. |
| **Charts**            | Commit activity, development momentum, top contributors, release cadence, language mix (Recharts). |
| **Languages**         | Full UI in **English & Thai**, switchable on the fly; dynamic prose is translated server-side.     |
| **Design**            | "Codex" aesthetic, dark + light (parchment) themes, responsive, reduced-motion aware.          |

## 🧱 Tech stack

- **Next.js 15** (App Router, React Server Components, Suspense streaming)
- **TypeScript** (strict)
- **Tailwind CSS** + shadcn-style component primitives
- **Recharts** for visualisation
- **GitHub REST API** as the only data source
- **Vercel**-ready, **pnpm**, ESLint + Prettier

## 🚀 Getting started

```bash
# 1. install dependencies (pnpm recommended)
pnpm install        # or: npm install

# 2. (optional) raise the GitHub rate limit — see below
cp .env.example .env
#   then edit .env and set GITHUB_TOKEN=...

# 3. run the dev server
pnpm dev            # or: npm run dev
```

Open <http://localhost:3000> and paste a repository such as `facebook/react`.

### Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the dev server                 |
| `pnpm build`        | Production build                     |
| `pnpm start`        | Run the production build             |
| `pnpm lint`         | ESLint                               |
| `pnpm typecheck`    | TypeScript, no emit                  |
| `pnpm format`       | Prettier write                       |

## 🔑 Environment variables

The app needs **no environment variables to run**. There is exactly one _optional_ variable:

| Variable          | Required | Purpose                                                                                       |
| ----------------- | -------- | --------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`    | No       | Raises the GitHub API rate limit from **60 → 5,000 requests/hour**. No scopes needed. Server-only. |
| `OPENAI_API_KEY`  | No       | Enables the optional **"AI prose"** toggle. Works with any OpenAI-compatible provider. Server-only. |
| `OPENAI_BASE_URL` | No       | Point AI prose at a different provider (Groq, Gemini, OpenRouter, local Ollama, …). Default `https://api.openai.com/v1`. |
| `OPENAI_MODEL`    | No       | Overrides the model used for AI prose (default `gpt-4o-mini`).                                 |

#### Free AI providers

AI prose speaks the standard OpenAI chat-completions API, so any compatible
provider works — including several **free** ones. Set `OPENAI_BASE_URL` (+ model + key):

| Provider | Free? | `OPENAI_BASE_URL` | Example `OPENAI_MODEL` | Key from |
| --- | --- | --- | --- | --- |
| **Groq** | ✅ no card | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | <https://console.groq.com/keys> |
| **Google Gemini** | ✅ free tier | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | <https://aistudio.google.com/apikey> |
| **OpenRouter** | ✅ `:free` models | `https://openrouter.ai/api/v1` | `meta-llama/llama-3.3-70b-instruct:free` | <https://openrouter.ai/keys> |
| **Ollama** (local) | ✅ 100%, no key | `http://localhost:11434/v1` | `llama3.2` | _none — runs on your machine_ |

Create a GitHub token at <https://github.com/settings/tokens> (a classic token with **no scopes**,
or a fine-grained token with public read access, is enough). It is read only on the server
and never sent to the browser.

### AI prose (hybrid)

The lore engine is **deterministic by default** and needs no AI. If `OPENAI_API_KEY`
is set, each report gains an **"AI prose"** toggle: it calls a server route
(`POST /api/lore`) that rephrases the selected mode's chapters in their voice while being
strictly instructed not to introduce any fact not already in the data. If the key is
absent or a call fails, the deterministic text is shown instead — the feature degrades
gracefully and the app always deploys without a key.

## 🌐 Internationalization

The interface ships in **English and Thai** (`en`, `th`). A toggle in the header switches
language instantly; the choice is stored in the `lore_lang` cookie/localStorage.

- **Static UI strings** live in `lib/i18n/dictionaries.ts` — English is the source of truth
  and Thai must structurally match it.
- **Dynamic, GitHub-derived prose** (the lore, insights, DNA rationales) is generated in
  English and translated to Thai **server-side** at render time via `lib/ai/translate.ts`.
  This step uses the optional AI provider, so without an `OPENAI_API_KEY` the dynamic prose
  stays in English while the rest of the UI is still fully Thai.

## 🧩 API

A stateless JSON endpoint backs (and mirrors) the UI:

```
GET /api/analyze?repo=facebook/react
GET /api/analyze?repo=https://github.com/vercel/next.js
```

Returns the full `RepoAnalysis` on success, or a typed error
(`invalid_url`, `not_found`, `rate_limited`, `empty_repository`, `network_error`, `server_error`).

## 🗂 Project structure

```
app/
  layout.tsx            # fonts, theme provider, header/footer
  page.tsx              # landing page
  analyze/page.tsx      # report route (Suspense + streaming)
  api/analyze/route.ts  # stateless JSON API
  error.tsx, not-found.tsx
components/
  ui/                   # shadcn-style primitives (button, card, tabs, …)
  landing/              # hero, features, how-it-works, examples, faq
  analyze/              # overview, dna, timeline, contributors, lore reader
  analyze/charts/       # Recharts views
features/
  analysis/             # the analysis engine (dna, timeline, contributors, charts)
  lore/                 # the narrative engine (facts + 5 modes)
services/
  github.ts             # GitHub REST client + error handling
  analyze.ts            # parse → fetch → analyze pipeline
lib/                    # utils, formatting, parsing, examples
types/                  # github + analysis domain types
```

## 🧠 How the analysis works

1. **Parse** the input into `owner/repo` (URLs, `owner/repo`, SSH, `.git` all accepted).
2. **Fetch** repository, languages, contributors, recent commits, releases, PRs and issues
   in parallel from the GitHub REST API (cached at the edge for 10 minutes).
3. **Analyze** — classify commits, score the DNA, detect milestones, assign contributor
   roles, assess maturity, and build chart series.
4. **Narrate** — the (isomorphic) lore engine maps those facts onto five story templates,
   so switching modes is instant and happens entirely on the client.

> The narrative is **deterministic**, not AI-generated: it never invents facts that aren't
> in the data, and no repository content is sent to any third-party service.

### A note on accuracy

Metadata, contributors, releases and languages are exact. Commit-derived insights use the
most recent window the REST API exposes (up to 100 commits), so velocity and role signals
reflect _recent_ activity. A few timeline placements (e.g. community growth) are clearly
labelled **approx.**

## ▲ Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at <https://vercel.com/new> (framework auto-detected as Next.js).
3. _Optional:_ add `GITHUB_TOKEN` under **Project → Settings → Environment Variables**.
4. Deploy. No database or other services are required.

## 📄 License

[MIT](LICENSE) © 2026 Gman
