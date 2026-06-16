# Product

## Register

brand

## Users

Two overlapping groups, roughly equal in weight:

- **Developers showcasing their own work.** They paste their repo to see it rendered as something more than raw stats. The emotional goal is pride and wonder: "my repo has a story." They share the output.
- **Developers exploring others' repos.** They arrive curious and leave knowing something they didn't before. The emotional goal is discovery: "I understand this project now."

Both groups are technical. They notice when a tool is sloppy. They reward craft and get tired of generic.

## Product Purpose

Repo Lore turns the raw commit history and metadata of any public GitHub repository into a narrated report, rendered in one of several literary voices (documentary, fantasy, sci-fi, corporate, meme, noir, breaking news). It makes the invisible history of a project visible and enjoyable. Success looks like someone reading their own report and sharing it because it felt unexpectedly true.

## Brand Personality

Authoritative · Elegant · Timeless

Voice: an editor, not a hype man. Confident without being loud. The product handles serious historical material (a codebase's real history) and treats it with appropriate weight. Playfulness is in the modes, not in the chrome.

## Anti-references

- **AI-generated content sites**: cream/sand body backgrounds, neutral sans-serif everywhere, copy full of "seamless" and "powerful" — this is the exact aesthetic Repo Lore must avoid. The warm-parchment light theme flirts with this territory and should be watched.
- **Gaming / hacker aesthetics**: neon accents, matrix green, terminal vibes — Repo Lore is editorial, not edgy.
- **SaaS dashboard**: hero metrics with gradient numbers, pricing tiers, benefit bullets — too utility-forward for a product whose primary value is narrative.
- **GitHub itself**: monochrome, flat, utility-first — too close to the data source; the product needs to feel like a different register entirely.

## Design Principles

1. **Editorial confidence over UI convention.** The manuscript metaphor earns its keep only if it's committed. Half-measures (a serif here, a parchment token there, but otherwise a standard SaaS layout) produce neither the literary feel nor the tool feel. Commit or strip back.
2. **The data is the hero.** Chrome supports the report; it does not compete with it. Decorative elements exist to frame and reveal, not to entertain on their own.
3. **Timeless, not trendy.** Avoid any technique that will read as "circa 2025 AI tool" in three years: glassmorphism, gradient text, tracked eyebrows above every section, cream backgrounds. Prefer techniques that feel like they could have appeared in a well-designed book.
4. **Craft at every scale.** The drop-cap on the lore prose, the film grain, the gold pulse-ring — these details are what separate Repo Lore from a plain stats page. Maintain that level of detail as new surfaces are added.
5. **Degrade gracefully, everywhere.** The product is stateless and best-effort: partial data still tells a story, missing AI keys still produce lore, broken image routes return safe placeholders. UI should follow the same rule: no surface should hard-fail.

## Accessibility & Inclusion

WCAG AA minimum (4.5:1 body text contrast). Reduced-motion support is already in globals.css and must be preserved in any new animation work.
