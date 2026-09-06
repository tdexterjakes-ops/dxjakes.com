# DX Editorial Design Standard

This document codifies the design system for imjustdex.com. It exists so the system does not drift. Every value listed here is pulled from production CSS as of 2026-08-31.

---

## 1. System Architecture

The site is a static editorial publishing object. No client framework, no bundler, no runtime JavaScript beyond the hand-written scripts below — but it is no longer hand-authored HTML. The 2026-04-21 Astro cutover (commit `eecabbb`, §17) made `astro build` the compiler that emits the static pages from `src/`. As of the April 2026 Phase 1 refactor, every page pulls from a shared layered CSS architecture and self-hosted fonts. Netlify runs `npm run build` and publishes `dist/`, auto-deploying on push to `main` on `tdexterjakes-ops/imjustdex.com`.

### CSS Layering

Styles live in eight purpose-built sheets loaded in dependency order. No page embeds `<style>` blocks. No inline `style=""` attributes.

| Sheet | Role |
|-------|------|
| `/css/tokens.css` | Design tokens, `@font-face` declarations, `:root` light mode, `html.dark-mode` overrides, base reset, 46px grid body, print and reduced-motion rules |
| `/css/shell.css` | Page chrome — skip-link, page-shell, rulers, masthead, brand-block, mode-toggle, footer-strip, focus states |
| `/css/plates.css` | Homepage-only — 12-col plate grid, plate variants, meta rail, image plates, ghost teaser |
| `/css/article.css` | Article/About only — article frame, header, body, drop cap, section heads, pull quotes, callouts, scripture, stat blocks, closing, share bar, reading progress, section indicator |
| `/css/notfound.css` | 404-only — `.notfound-plate`, eyebrow, headline, actions |
| `/css/home-v2.css` | Homepage v2 — identity hero treatment, standfirst bar, `.latest-tag` chip, lane filter, cascade rows |
| `/css/home-augment.css` | Homepage augments layered over the plate grid — identity hero band, narrow-viewport display fitting |
| `/css/phase0.css` | `/phase0/` campaign page only |

Load order on every page: `tokens.css` → `shell.css` → (`plates.css` ‖ `article.css` ‖ `notfound.css`). Tokens and shell are universal. The third sheet is page-type specific.

The homepage then layers two more on top of `plates.css`, in this order: `home-augment.css` → `home-v2.css` (`HomeLayout.astro`). v2 loads last and therefore wins any specificity tie. `phase0.css` is scoped to `/phase0/` and loads nowhere else.

### JavaScript

Eight small vanilla scripts in `/js/`, loaded via `<script src>`. No inline `onclick`, no third-party libraries, no bundler.

| Script | Role |
|--------|------|
| `/js/mode.js` | Mode toggle. Synchronously applied in `<head>` to prevent FOUC (sets `html.dark-mode` before first paint from cookie or `prefers-color-scheme`). `DOMContentLoaded` handler wires the toggle button, syncs the logo SVG, and listens for OS preference changes when the user has no explicit cookie. |
| `/js/progress.js` | Article reading progress bar and section indicator. `requestAnimationFrame`-throttled scroll handler. No-ops on pages without `.reading-progress` or `.article-body`. Sets ARIA progressbar attributes. |
| `/js/essay.js` | CSP-safe `data-copy-link` wiring for the share bar copy button. Replaces what used to be inline `onclick` handlers. |
| `/js/signup.js` | Inline email signup — same-origin POST to the `/api/subscribe` Netlify function (clears `connect-src 'self'`), with collapse-on-success and error states. Skips any form carrying `data-no-signup-js`. |
| `/js/subscribe.js` | Subscribe-manifesto form wiring — intercepts the submit, fetches `/api/subscribe`, and writes `loading \| success \| existing \| error` to `form.dataset.state` in place. |
| `/js/lane-filter.js` | Homepage lane filtering off `data-lane`. Progressive enhancement — no-JS shows every essay; Art is queued and ignored. |
| `/js/earlier-toggle.js` | Homepage "earlier" cascade disclosure — toggles `.earlier-more` plates and the `hidden` attribute from `[data-earlier-toggle]`. |
| `/js/phase0.js` | `/phase0/` behavior only — richer signup handler (`aria-invalid` wiring, `data-state` machine) plus page-local interactions. |

### Generators

One build-adjacent script renders brand type outside the browser: `scripts/og-plate.mjs` generates the per-article OG plate (`public/img/og-<slug>.png`) by rendering an Anton title at display size and shooting it headless. It is a real system surface, not a utility — it sets the same display face under the same rules, and it is the surface where those rules were measured (see §3 Display Type Rules). Any change to the display type contract has to be checked against it.

### Self-Hosted Fonts

All fonts ship from `/fonts/` as WOFF2 with Latin subsetting. No Google Fonts. No `fonts.googleapis.com` preconnect. No CDN dependency. Fonts are declared once in `tokens.css` via `@font-face` and preloaded in each page's `<head>`.

### Page Types

**Homepage** (`/`) — The identity hero band beneath the masthead, then a 12-column plate grid. The archive IS the homepage. No filter rail — the archive is small enough that chronology is the only index that matters. No standalone hero. No scroll indicator.

**Words Index** (`/words/`) — Same plate grid without the identity hero. Functionally identical to homepage minus identity.

**Article** (`/words/{slug}/`) — Long-form reading frame. Two editorial modes share the same template:
- *Narrative* — reflective, intimate, elegiac. Fewer section heads (2–3). More atmospheric pauses. Stat blocks for emotional turning points.
- *Thesis-Driven* — declarative, argumentative, exegetical. More section heads (4–5). Denser paragraph rhythm. Scripture blocks as structural evidence. Stat blocks for declarations.

The difference is editorial judgment in component selection, not code.

**About** (`/about/`) — Same article frame, stripped of article-specific chrome (no reading progress bar, no section indicator). Content page, not an essay.

### Shared Shell (All Pages)

Every page renders the same outer shell: rulers, masthead, footer strip, 46px grid background, mode toggle. This is non-negotiable. Exception pages (if any) must still use this shell.

---

## 2. Color System

### Light Mode (`:root`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg` | `#f4f4f1` | Page background |
| `--panel` | `#f8f8f6` | Panel/card fill |
| `--ink` | `#050505` | Primary text, structural borders |
| `--muted` | `#202020` | Subdued text |
| `--border` | `#0a0a0a` | Structural borders |
| `--rule` | `rgba(0,0,0,.14)` | Grid lines, rulers, hairlines |
| `--meta-bg` | `#0a0a0a` | Meta rail background |
| `--meta-ink` | `#f5f5f1` | Meta rail text |
| `--accent` | `#c00` | THE brand red. Borders, bars, underlines, fills, backgrounds, and large display text. Identical in both modes — this is the single visual red of the system. |
| `--accent-text` | `#c00` | Red for SMALL text only (sub-18px labels, inline link hovers, tiny metadata). Decoupled from `--accent` because in dark mode it's the ONE exception that flips to `#ff4d4d` for AA contrast. Use `--accent` everywhere else. |
| `--focus-ring` | `#c00` | `:focus-visible` outline color. Always mirrors `--accent` in both modes — no dark-mode flip. |
| `--body-color` | `rgba(5,5,5,.82)` | Article body text |
| `--body-muted` | `rgba(5,5,5,.56)` | Article metadata, secondary text |
| `--body-faint` | `rgba(5,5,5,.18)` | Faint borders in article context |
| `--body-tint` | `rgba(5,5,5,.04)` | Tinted backgrounds (pull quotes, scripture) |

### Dark Mode (`html.dark-mode`)

| Variable | Value |
|----------|-------|
| `--bg` | `#060606` |
| `--panel` | `#0d0d0d` |
| `--ink` | `#f3f0e8` |
| `--muted` | `#d7d3ca` |
| `--border` | `#f3f0e8` |
| `--rule` | `rgba(255,255,255,.16)` |
| `--accent` | `#c00` — **unchanged from light mode.** The single structural red of the system. Non-text contrast (WCAG 1.4.11) requires 3:1 — `#c00` on `#060606` clears at 3.45:1, so borders, fills, underlines, and large display text all read correctly. |
| `--accent-text` | `var(--accent-on-dark)` → `#ff4d4d` — the **one intentional flip**. `#c00` on `#060606` is 3.45:1, which fails AA normal text (4.5:1). Small red text uses this token so it lifts to 7.54:1 (AAA) for legibility. Borders, fills, and display text are unaffected. |
| `--accent-on-dark` | `#ff4d4d` — the AA-safe red reserved for small red text on dark backgrounds. Do not use directly; it powers `--accent-text`'s dark flip. |
| `--focus-ring` | `#c00` — **unchanged from light mode.** Focus outlines are non-text UI elements (WCAG 1.4.11, 3:1 threshold) — `#c00` on `#060606` clears at 3.45:1. |
| `--meta-bg` | `#f3f0e8` |
| `--meta-ink` | `#0a0a0a` |
| `--body-color` | `rgba(243,240,232,.82)` |
| `--body-muted` | `rgba(243,240,232,.52)` |
| `--body-faint` | `rgba(243,240,232,.14)` |
| `--body-tint` | `rgba(243,240,232,.04)` |

**Phase 4.1 update (2026-04-10) — Accent doctrine unification.** Phase 2 had flipped `--accent` to `#ff4d4d` in dark mode so every red-on-ink context cleared AA. Phase 4.1 reversed that decision. The problem with the flip was aesthetic, not technical: it produced two visible reds in dark mode — `#c00` on the identity plate (via a scoped override) and `#ff4d4d` everywhere else. The editorial signature is `#c00`. The rule now is: **one structural red across both modes.** `--accent`, `--focus-ring`, and all borders/fills/underlines/large display text stay `#c00` in dark mode because non-text contrast (WCAG 1.4.11) only requires 3:1 — and `#c00`/`#060606` clears at 3.45:1. The ONE exception is `--accent-text`, which still flips to `#ff4d4d` in dark mode because AA normal text requires 4.5:1. This token is reserved for small red text — inline link hovers, uppercase micro-labels, sub-18px metadata. Everything visually structural stays unified to the brand red.

**Phase 4.2 hotfix (2026-04-10).** Smoke testing Phase 4.1 in dark mode caught `.article-body a:hover` still using `var(--accent)` instead of `var(--accent-text)` — a missed small-text consumer. With `--accent` now unified to `#c00`, body-link hover fell to 3.45:1 (failing AA 4.5:1). Patched to `var(--accent-text)` in article.css so it lifts to `#ff4d4d` (7.54:1 AAA) in dark. The underline decoration color on the same `.article-body a` rule stays `var(--accent)` because it's a decorative marker governed by the 3:1 non-text contrast floor, not the 4.5:1 text floor.

Dark mode is not personalization. It is a second editorial mode. Both modes are locked and authored. Mode is cookie-persisted (`dxmode`, one-year max-age, `SameSite=Lax`) and applied via an `html.dark-mode` class toggle. The class is set on the `<html>` element (not `<body>`) by a blocking script in `<head>` so there is no flash of incorrect mode on first paint. When no cookie is set, `prefers-color-scheme` decides the initial mode, and a `matchMedia` listener follows OS preference changes until the user makes an explicit choice.

### Accent Red (`#c00`) — Rules

Red marks editorial emphasis. Never decoration.

**Permitted:**
- Section head `h2` text color (`var(--accent-text)`)
- Section head horizontal rule line (`var(--accent)`)
- Callout left-border (3px `var(--accent)` rule)
- Callout emphasis spans (`.callout-emph`, `var(--accent-text)`)
- Scripture block cite text (`var(--accent-text)` — auto-retunes to `#ff4d4d` in dark mode)
- Stat block vertical bar (`var(--accent)`)
- Identity hero tagline text (`var(--accent)`)
- Link underline on hover (article body only, `var(--accent)`)
- Plate border on hover (homepage/index, `var(--accent)`)
- Focus-visible outline rings (`var(--focus-ring)`)

**Prohibited:**
- Backgrounds
- Titles (except section heads)
- Navigation elements
- Footer elements
- Body text
- Tags or metadata

**Sanctioned exception to "Backgrounds" and "Tags or metadata" — the `.latest-tag` chip.** The homepage standfirst bar carries one `background: var(--accent)` tag: the `LATEST` chip in `LatestBar.astro`. It is a deliberate editorial signature, not drift — the single red mark that points at the newest essay — and it is the only sanctioned violation of either bullet. Any *further* red-filled tag or metadata background is still prohibited; this is an exception, not an opening.

Because it puts small text on the accent fill, it carries a mode-specific rule the rest of the accent doctrine does not need. `color: var(--bg)` resolves to cream on `#c00` in light mode (5.17:1, clears AA) but to `#060606` on `#c00` in dark (3.44:1, fails the 4.5:1 floor for 11.5px text). `css/home-v2.css` therefore pins the chip's dark-mode text to `var(--ink)`, so it renders identically in both modes at 5.17:1. The same override covers the two controls that invert onto the accent fill on hover — `.latest-cta` and `.identity-hero .hero-link.primary`.

**The boundary this draws.** Phase 4.1 (above) sanctions the `#c00`/`#060606` pair at the 3:1 **non-text** floor. That sanction does not extend to text set *on* the accent fill, which is governed by SC 1.4.3 at 4.5:1. Any new rule pairing `background: var(--accent)` with a text colour must be measured against 4.5:1 in **both** modes before it ships.

**The doctrine crosses surfaces under different token names.** The campaign layer (`social-templates`) aliases this same pair per artboard: `--sig: var(--accent)` in both modes, and `--sig-text: var(--accent-on-dark)` on dark / `var(--accent)` on light. The 18px boundary is the same boundary — display-size red is `--sig` / `--accent`, sub-18px red text is `--sig-text` / `--accent-text`. A campaign board set entirely at display size therefore carries `#c00` and no `#ff4d4d` at all. Never write `var(--accent-text)` on a campaign board: that is this site's token name, it is not declared in the template library, and an undefined custom property falls back silently to the inherited colour rather than failing.

**`--under-form` is a blend artifact, not a colour.** Where an accent word sits *wholly* under a cream knockout form driven by `mix-blend-mode: difference`, it is authored as the difference complement — `--on-accent` `#f5f5f1` minus `#c00`, i.e. `rgb(41,245,241)` — so that the blend *returns* the brand red. It reads as cyan anywhere off the form, which is why it is only ever assigned to a word measured to be wholly covered. It is a computation, not a new brand colour, and it never appears in the site palette. §15 Rule 2 ("no new colors") is not in play.

---

## 3. Typography

### Font Stack

| Variable | Value | Role |
|----------|-------|------|
| `--display` | `'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif` | Titles, identity marks, pull quotes, stat blocks, 404 headline |
| `--body` | `'IBM Plex Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif` | All body text — articles, About, plates |
| `--mono` | `'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace` | Metadata, tags, eyebrows, section heads, share bar, nav labels, footer — the system voice. System monospace, no self-hosted file. |
| `--serif` | `Georgia, 'Times New Roman', serif` | **Deprecated.** Retained in `tokens.css` as a fallback-only token; not referenced by any component. Do not use in new CSS. |

Article body previously ran on Georgia serif. As of Phase 1 it runs on Plex Sans for optical consistency with the rest of the system. If a future component needs a serif, add a new token with intent rather than resurrecting `--serif`.

### Self-Hosted Font Files

| File | Format | Use |
|------|--------|-----|
| `/fonts/Anton-Regular.woff2` | Anton Regular | All `--display` text |
| `/fonts/IBMPlexSans-Regular.woff2` | Plex Sans 400 | Body, mono register |
| `/fonts/IBMPlexSans-Italic.woff2` | Plex Sans 400 italic | Scripture body, closing block, article-nav ghost |
| `/fonts/IBMPlexSans-Bold.woff2` | Plex Sans 700 | Bold body, bold mono register |

The three upright faces preload in every page's `<head>` with `rel="preload" as="font" type="font/woff2" crossorigin`. Italic ships as a real fourth file rather than preloading, because `body` sets `font-synthesis: none` (`tokens.css`) — a faked oblique is impossible, so every italic the article components ask for must resolve to a shipped face or it renders upright. No other weights or styles ship.

### Display Type Rules

All display type (`--display`) uses: `text-transform: uppercase`, `font-weight: 400` (Anton Regular is the display weight — the font is pre-condensed and pre-heavy, so 400 is already maximum impact), `line-height: .86`, `letter-spacing: -.03em`, `word-break: break-word`, `text-wrap: balance`.

**`.86` is a single-line value — measure the ink before you stack lines.** Anton's painted ink is not its em box. Measured on the live face with canvas `TextMetrics`: `fontBoundingBoxAscent` `1.174em` and `actualBoundingBoxAscent` `.867em` inside a `1.500em` em box. Ink therefore begins `.30em` below the line box's top edge and its foot sits at `1.20em` — a `.90em` painted band inside a `.86em` line box. Consecutive all-caps lines overlap by roughly `.04em` (~1.7% of font size), at every size, forever.

`scripts/og-plate.mjs` hit exactly this generating the first phase31 plate with a title long enough to wrap, and raised `.title` to `line-height: .92` (commit `9301d61`) — which clears the caps by `.045em` and keeps the leading tight. The rule: **`.86` holds for display type that sets one line; anything that can wrap needs `.92` or its own measured value.** Never trust `offsetHeight` to catch this — it reports the CSS line box (n × `.86em`), not the painted glyph, so a collision measures clean. And do not derive the band from cap height: the guessed `.427` / `1.157` pair was wrong on the top edge by `.12em`.

### Font-Weight Normalization (Phase 1)

Every `font-weight: 900` in the old system has been normalized to a real shipped weight:

- Anton display text → `font-weight: 400` (Anton only ships Regular; 900 was a synthesized bold browsers were inventing)
- Plex body/mono text that used to be `900` → `font-weight: 700` (Plex Sans Bold, the heaviest weight we ship)

Visual change is zero. The old declarations relied on browser font synthesis, which produced the same effective weight. The system now declares what it ships.

Phase 7 later tokenized both raw weights into `--weight-regular` (400) and `--weight-bold` (700). See §4 Font-Weight Scale.

### Typography Scale (Phase 5)

Before Phase 5, every CSS file carried raw `font-size` and `line-height` values — 42+ declarations across `article.css`, `plates.css`, `shell.css`, and `notfound.css`, with zero typography tokens. Phase 5 introduces a **two-tier token system** so the scale becomes the single source of truth and consumers express intent, not arithmetic.

**Two tiers — primitives and semantic aliases.**

`--size-*` primitives define the scale itself. `--text-*` semantic aliases point at primitives and express role. Consumers should always reach for the semantic alias first; dropping to a primitive is reserved for one-offs where no alias fits the intent. New intents earn a new alias — never speculate aliases without a consumer.

This is the pattern every mature design system converges on (Radix, Primer, Material 3). It's the only structure that doesn't force a tradeoff between flexibility and meaning. Pure semantic naming locks you in when a new context needs a near-but-not-identical size; pure t-shirt naming (`--text-xl`, `--text-2xl`) strips intent from the CSS. Two tiers give an escape hatch in both directions.

**Primitive scale — empirically derived, not mathematical.**

A golden-ratio or 1.25 modular scale is prettier in a spec doc but would force every existing value to round up or down, breaking visual calibration that was done by eye across months of editorial tuning. Phase 5 instead clusters the existing 42+ values and snaps to natural steps. Sub-display sizes consolidate only where differences sat below the perception threshold (sub-pixel noise: `.7rem ≈ .72rem`, `.8rem ≈ .82rem`, `.84rem ≈ .88rem`, `1rem ≈ 1.02rem`). Display sizes preserve every distinct clamp — those were tuned with editorial intent and collapsing them would visibly shift the site.

**Sub-display tier — fixed rem.** Sub-body sizes do not respond to viewport. Fluid type below body flattens hierarchy on mobile and produces muddy chrome.

| Token | Value | Role |
|-------|-------|------|
| `--size-1` | `.6rem` | Meta rail numerals |
| `--size-2` | `.72rem` | Micro labels (share labels, stat block spans, scripture citation, article nav labels) |
| `--size-3` | `.75rem` | Chips, eyebrows, tags, article back button, identity sub |
| `--size-4` | `.82rem` | Article deck, plate ghost date, plate meta rail |
| `--size-5` | `.88rem` | Shell nav (mode toggle, footer strip) |
| `--size-6` | `.92rem` | Brand word, 404 actions |
| `--size-7` | `1rem` | Body paragraphs, scripture body, closing block, 404 copy |
| `--size-8` | `1.08rem` | Article lede (body copy) |
| `--size-9` | `1.15rem` | Callout pull-quote |

**Display tier — fluid `clamp()`.** Every editorial clamp preserved as its own step. Consumers write `font-size: var(--text-h1)` and get fluidity for free.

| Token | Value | Role |
|-------|-------|------|
| `--size-10` | `clamp(1.2rem, 2vw, 1.6rem)` | Article h3, article-nav titles |
| `--size-11` | `clamp(1.35rem, 2.4vw, 2.4rem)` | Identity tagline |
| `--size-12` | `clamp(1.6rem, 4vw, 2.4rem)` | Pull quote, h2 |
| `--size-13` | `clamp(1.6rem, 5vw, 2.6rem)` | Stat block |
| `--size-14` | `clamp(2rem, 4vw, 4rem)` | Plate title (default) |
| `--size-15` | `clamp(2.35rem, 5vw, 5rem)` | Plate title (med) |
| `--size-16` | `clamp(2.8rem, 7vw, 5rem)` | Article h1 |
| `--size-17` | `clamp(3rem, 10vw, 9rem)` | 404 headline |
| `--size-18` | `clamp(3.5rem, 7vw, 7.2rem)` | Plate title (lg) |
| `--size-19` | `clamp(3.8rem, 10vw, 7.5rem)` | Identity name |

**Semantic aliases — role, not size.**

| Alias | Primitive | Intent |
|-------|-----------|--------|
| `--text-meta` | `--size-1` | Meta rail numerals |
| `--text-micro` | `--size-2` | Micro labels — the smallest legible system voice |
| `--text-label` | `--size-3` | Chips, eyebrows, buttons |
| `--text-citation` | `--size-4` | Scripture citation, article deck |
| `--text-nav` | `--size-5` | Shell navigation |
| `--text-chrome` | `--size-6` | Large chrome (brand word, 404 actions) |
| `--text-body` | `--size-7` | Paragraph body text |
| `--text-lede` | `--size-8` | Article lede copy |
| `--text-quote` | `--size-9` | Callout pull quotes |
| `--text-h3` | `--size-10` | Section sub-heads, article-nav titles |
| `--text-tagline` | `--size-11` | Identity tagline |
| `--text-h2` | `--size-12` | Pull quote, section heads |
| `--text-stat` | `--size-13` | Stat block display |
| `--text-plate` | `--size-14` | Default plate title |
| `--text-plate-med` | `--size-15` | Medium plate variant |
| `--text-h1` | `--size-16` | Article title |
| `--text-display` | `--size-17` | 404 display headline |
| `--text-plate-lg` | `--size-18` | Large plate variant |
| `--text-identity` | `--size-19` | Identity hero name (`.hero-name`) |

**Line-height ladder — decoupled from size.**

Coupling line-height to font-size assumes a 1:1 mapping that doesn't hold. Body at `1rem` wants `1.7`. Lede at `1.08rem` wants `1.85`. Display at `clamp(...)` wants `.86`. These ratios repeat across sizes, so one ladder with five ratios keeps the rhythm honest across the whole system.

| Token | Value | Role |
|-------|-------|------|
| `--lh-display` | `.86` | Headlines, plate titles, article h1 — a **single-line** value; see Display Type Rules above for the wrapping case |
| `--lh-tight` | `1.05` | h2, h3, pull quote, stat block |
| `--lh-snug` | `1.4` | Body base, chrome, deck, research cta |
| `--lh-normal` | `1.7` | Article body, scripture, closing |
| `--lh-loose` | `1.85` | Article lede |

**Exceptions.** A handful of ratios sit between ladder steps or serve unique contexts and remain raw with inline `/* Phase 5 exception */` comments: drop cap `4.8em`/`.72` (relative multipliers, not ramp values), `line-height: 1` on badge-style elements (meta rail, brand block, 404 eyebrow), `.82`/`.9`/`.95`/`1.55` tuned ratios on identity name, identity tagline, article-nav title, and 404 copy, and the mobile `.52rem` responsive step-down on `.section-indicator`. These are documented where they live.

### Title Scale

All sizes reference Phase 5 semantic aliases. The resolved `clamp()` value is shown in parentheses for quick reference.

**Homepage plates:**

| Class | Token | Resolved | Notes |
|-------|-------|----------|-------|
| `.plate-title` (default) | `var(--text-plate)` | `clamp(2rem, 4vw, 4rem)` | Standard plate |
| `.plate-title.med` | `var(--text-plate-med)` | `clamp(2.35rem, 5vw, 5rem)` | Medium emphasis |
| `.plate-title.lg` | `var(--text-plate-lg)` | `clamp(3.5rem, 7vw, 7.2rem)` | Large emphasis, `max-width: 8ch` on desktop |

**Article:**

| Element | Token | Resolved |
|---------|-------|----------|
| `.article-title` | `var(--text-h1)` / `var(--lh-display)` | `clamp(2.8rem, 7vw, 5rem)` / `.86` |
| `.article-deck` | `var(--text-citation)` / `var(--lh-snug)` | `.82rem` / `1.4` |
| `.article-tag` | `var(--text-label)` | `.75rem` mono, inverted fill |
| `.article-date`, `.article-read` | `var(--text-label)` | `.75rem` mono, `color: var(--body-muted)` |

### Body Text

Article body: `font-family: var(--body)` (Plex Sans), `font-size: var(--text-lede)` (`1.08rem`), `line-height: var(--lh-loose)` (`1.85`), `color: var(--body-color)`.

Paragraph spacing: `margin-bottom: 1.5em`.

Article body links: `text-decoration: underline`, `text-decoration-color: var(--accent)`, `text-underline-offset: 3px`, `text-decoration-thickness: 2px`. Hover: `color: var(--accent)`.

### Drop Cap

`.article-body .intro .dropcap` — `font-family: var(--display)` (Anton), `font-size: 4.8em`, `font-weight: 400`, `float: left`, `line-height: .72`, `margin-right: 8px`, `margin-top: 4px`, `color: var(--ink)`.

**Markup pattern:**
```html
<p class="intro"><span class="dropcap">I</span> always skipped Saturday.</p>
```

Applied only to the first paragraph of each article. Never repeated.

**Phase 3 change (2026-04-10):** The prior pattern used the `::first-letter` pseudo-element. That selector is fragile — inconsistent rendering across browsers, no handle for assistive tech, and breaks on text normalization. The explicit `<span class="dropcap">` pattern is addressable, reliable, and survives copy-paste.

### Mono Register Rules

All mono-set elements (`--mono`): always uppercase, always small (`.65`–`.84rem`), always tracked (`.06`–`.15em`). This is the system voice — functional, stamped, non-decorative.

---

## 4. Structural Elements

### Border Language

Border weights are tokenized so a single edit rebalances the whole system. The doctrine is **content vs chrome**:

```css
--border-weight-content: 3px;   /* content frames */
--border-weight-chrome:  2px;   /* chrome elements */
```

**`var(--border-weight-content)` — primary structural borders:**
- Plate outlines (homepage grid)
- Article header, body, closing, share bar, research CTA
- Pull quote top/bottom borders
- Article nav top border
- Section indicator border
- Section head horizontal rule (3px bar)
- Callout left border (uses `var(--accent)` for color)

**`var(--border-weight-chrome)` — secondary borders:**
- Brand block + nav elements
- Mode toggle
- Footer strip items
- Back button
- Subscribe/Follow Me button
- Article nav prev/next cards
- Article tags (`.article-tag`)
- Meta rail top/right edges
- Scripture block border (uses `var(--body-faint)` for color)
- Identity sub label

**Rule:** if the element frames *content*, it uses the content weight. If it frames *an action or a label*, it uses the chrome weight. Never hardcode `3px` or `2px` in a border rule — always reference the token.

**Hairline exemption.** Decorative 1px hairlines are allowed — they are not frame borders, they are texture. The only permitted uses are:

- `.ruler-top` / `.ruler-left` — fixed-position measurement rulers at `border-color: var(--rule)`

If you're adding a 1px border and the element isn't a decorative ruler, you're doing it wrong. Use the token. (A second exemption, `.identity-plate .meta-rail`, was removed 2026-08-28 with the plate itself — see *Identity Plate*.)

### Spacing Scale

Spacing is tokenized on a single semantic scale. No primitive/semantic split — one namespace, ten slots, named for editorial intent.

```css
/* tokens.css */
--space-0:        0;
--space-hairline: 4px;   /* micro gaps, tag chip top padding */
--space-xs:       8px;   /* tight chrome padding, tag chip sides */
--space-sm:       12px;  /* grid gap, standard chrome vertical, footer inner, plate-body bottom */
--space-chrome:   14px;  /* chrome horizontal padding baseline — named tier, not a drift */
--space-md:       16px;  /* callout inner, plate-body sides, article header sides (mobile) */
--space-lg:       24px;  /* article body sides, section-head margin-bottom */
--space-xl:       32px;  /* ghost plate padding, article header top, pull-quote/callout margin */
--space-2xl:      48px;  /* article-body vertical, section-head top margin, pull-quote margin-top */
--space-3xl:      80px;  /* article-frame bottom breathing room, notfound-rule width */
```

**The `--space-chrome: 14px` slot is deliberate.** Chrome elements (mode-toggle, footer-strip items, subscribe-link, article-back, notfound eyebrow) need a micro-padding tier that sits between `--space-sm` (12) and `--space-md` (16). Rather than drift a sibling token to fit, the scale owns a dedicated chrome slot. If you add a new chrome element and reach for `13px`, use `--space-chrome`. If you reach for `15px`, you're wrong.

**`--grid-gap` and `--outer-pad` are scope-excluded.**

- `--grid-gap` is repointed at `var(--space-sm)` (12px). The name stays because the homepage grid semantics outrank the raw scale value. **Same value across desktop and mobile** — no breakpoint override.
- `--outer-pad` stays as its own token (`28px` desktop, `18px` mobile). It's a layout primitive, not a spacing scale consumer — the shell's horizontal rhythm is independent of the component scale.

**Also scope-excluded from the scale:**

- `env(safe-area-inset-*)` — system-driven, not designable
- `1.5em` relative values in article body (line-height-relative paragraph spacing)
- `-1px` decorative hairlines (see Border Language above)
- Intrinsic element dimensions (SVG heights, logo min-widths, 44px tap-target min-heights)
- Focus-ring geometry (`outline-offset` stays local per Focus Rings below)
- Ruler-chrome mechanics (`22px` strip depth, `44px` tick interval — decorative system, distinct from the 46px ruler)

**Exception Policy — 9 locations hold raw pixel values.**

All nine are optical corrections on uppercase chrome text where a 1px bottom-padding trim is required to visually center glyphs inside their frame. Uppercase geometry puts more mass above the x-height than below; symmetric padding reads bottom-heavy. The fix is a 1px pull that does not belong in the scale.

| # | Selector | Value | Reason |
|---|----------|-------|--------|
| 1 | `.brand-mark`, `.brand-word` | `8px 12px 7px` | 1px pull on uppercase DX mark + WORDS label |
| 2 | `.mode-toggle` | `14px 16px 13px` | 1px pull on "MODE: DARK" / "MODE: LIGHT" |
| 3 | `.footer-strip > *` | `12px 14px 11px` | 1px pull on uppercase footer labels |
| 4 | `.meta-rail` | `7px 8px 6px` | Below-scale micro-chrome for plate meta row (7/8/6 all sit under `--space-xs`) |
| 5 | ~~`.identity-sub`~~ | ~~`5px 7px 4px`~~ | **Retired 2026-08-28** with the identity plate. Number kept — the other exceptions are cross-referenced by number in prose. |
| 6 | `.article-tag` | `4px 8px 3px` | 1px pull on uppercase section tag |
| 7 | `.article-back` | `12px 14px 11px` | 1px pull on uppercase BACK button |
| 8 | `.notfound-actions a` | `22px 24px 21px` | 22/21 held at scale boundary — snapping to 24 would introduce 3px drift |
| 9 | `.subscribe-link` | `12px 14px` (symmetric) | Optical correction dropped intentionally — sub-button scale is below perception threshold for 1px delta |

**Rule for future components:** if you're reaching for a raw pixel value that isn't in the scale, you need either (a) a new scale slot or (b) a documented entry in this exception table. No silent drift. Every deviation is a named choice.

**Rule for existing components:** if a padding or margin value matches a scale slot, it MUST reference the token. `16px` is `var(--space-md)`, not `16px`. The tokens are the source of truth; raw numbers are drift.

### Letter-Spacing Scale

Letter-spacing is tokenized as **12 semantic slots**, each tuned to a specific text role. No consolidation — at uppercase chrome sizes, a `.03em` delta is visibly perceptible, so every distinct editorial tracking value on the site earns its own token.

```css
/* tokens.css */
--track-display:    -.03em;  /* article h1, plate titles, stat block, 404 headline */
--track-title:      -.02em;  /* pull-quote, article-nav title, identity tagline */
--track-brand:       .03em;  /* brand-mark / brand-word only */
--track-nav:         .04em;  /* mode toggle, article eyebrow date */
--track-footer:      .06em;  /* footer-strip items */
--track-badge:       .08em;  /* meta-rail, 404 actions */
--track-chrome:      .1em;   /* article meta, article-back, share bar */
--track-tag:         .12em;  /* tag chip, stat microlabel, article-nav label */
--track-teaser:      .14em;  /* identity meta-rail, teaser-date */
--track-label:       .15em;  /* section-head h2, scripture cite, research-cta */
--track-indicator:   .18em;  /* section-indicator (fixed editorial mark) */
--track-eyebrow:     .22em;  /* 404 eyebrow (widest tracking on the site) */
```

**Two directions, one doctrine.**

- **Negative tracking (`--track-display`, `--track-title`)** is display-tier only. Tight letterforms at h1/plate/pull-quote scale read as editorial confidence. Never applied below 18px.
- **Positive tracking (`--track-brand` through `--track-eyebrow`)** is chrome and uppercase. The wider the tracking, the smaller and more label-like the element — tiny eyebrows get `.22em`, meta rails get `.08em`, brand wordmark gets a restrained `.03em`.

**Why no consolidation?** The spacing scale tolerates 2–4px drift below the perception threshold. Letter-spacing does not — a `.03em` delta on uppercase tag-chips at `.75rem` is visible side-by-side. Collapsing `.08em` and `.1em` into one slot would force a visible shift on every meta rail or chrome label in the system. The 12-slot scale is the minimum that preserves fidelity.

**Rule:** every `letter-spacing` declaration in the site's CSS points at a `--track-*` token. Zero exceptions. Raw values are drift.

### Font-Weight Scale

Font-weight is tokenized as a **binary**: regular and bold. No intermediate weights.

```css
/* tokens.css */
--weight-regular: 400;
--weight-bold:    700;
```

**Why binary?** The site uses exactly two weights: 400 for all body and display type, 700 for all chrome, labels, tags, and strong emphasis. No medium, semibold, or black. The tokens earn their keep by making the binary legible at the call site — `var(--weight-bold)` tells you the element belongs to the chrome vocabulary; `700` does not.

**Exception:** `@font-face` declarations hold raw `400` / `700` values because CSS custom properties do not resolve inside `@font-face` at-rules. This is a language constraint, not a drift.

**Rule:** every `font-weight` declaration in normal selectors points at a `--weight-*` token. `@font-face` is the only place raw numbers are permitted.

### Focus Rings

Focus outlines for `:focus-visible` states are tokenized on width but not on offset.

```css
--focus-ring-width: 2px;   /* matches --border-weight-chrome */
--focus-ring:       #c00;  /* unified — same value in both modes (Phase 4.1) */
```

**Rule:** every `:focus-visible` outline on the site uses `outline: var(--focus-ring-width) solid var(--focus-ring);`. Never hardcode the width.

**Offset is intentionally local.** `outline-offset` stays hardcoded per selector because the correct offset depends on what the element sits inside:

- Chrome elements (`.mode-toggle`, `.brand-block`, `.footer-strip a`, article links, back button, CTAs) → `outline-offset: 2px` — the ring floats outside the element
- Content frames (`a.plate`, `.notfound-actions a`) → negative offset (`-5px` / `-4px`) — the ring insets *inside* the 3px content border so it doesn't compete visually with the frame

Tokenizing offset would force one rule to fit both cases. Leave it local.

### Reduced Motion

Reduced motion is handled globally in `tokens.css` via a blanket override:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}
```

This catches every transition on the site, including those that use `var(--motion-fast/med/slow)`. Do not add per-component reduced-motion rules — they are redundant.

### Grid Background

46px repeating grid lines at `var(--rule)` opacity. Applied to `body` via `background-image` on all pages. `tokens.css` names it in place: `/* 46px ruler grid background — locked to the typographic grid */`.

**The ruler governs the horizontal axis. The type's line grid governs the vertical.** 46px is the brand's one measure, shared with the campaign layer, but it is not square in authority. Measured across the campaign library, the gap between two lines' *ink* runs 3–33px at every size the display type sets — always narrower than one ruler unit — so a ruler-aligned horizontal edge can never land *between* two lines, only *through* one. Demanding a ruler-aligned `top` or `height` would force every horizontal edge through a line of type.

The split is enforced machine-side in `tools/lint-brand.mjs` (R10 `plate-ruler`, `RULER = 46`): a form's `width` and `left` must sit on the ruler or on an inset-derived value; `top` and `height` are exempt and follow the line grid instead. Where a form's job is to contain type, the type wins the vertical.

**Two-plane rule — text is never on the bare grid.** The grid belongs to the page backdrop and may show ONLY in structural negative space (margins, rulers, rails, gutters, inter-section bands). Any container holding running text MUST sit on an opaque plate from the ground set (`--bg` / `--panel`; use a `.plate` helper or a `--reading-surface` token that tracks `--bg` so it follows dark mode). Never let body copy be a direct child of the grid-bearing element — grid in the gutters, text on a plate. This is enforceable with a runtime lint that flags any text region computing `transparent` over the grid (shipped in the pulpit-notes delivery system).

**Homepage implementation:**
```css
background-image:
  linear-gradient(to right, transparent 0, transparent calc(100% - 1px), var(--rule) calc(100% - 1px)),
  linear-gradient(to bottom, transparent 0, transparent calc(100% - 1px), var(--rule) calc(100% - 1px));
background-size: 46px 46px;
```

**Article/About implementation** (uses `--body-faint` for slightly different opacity):
```css
background-image:
  linear-gradient(to right, var(--body-faint) 1px, transparent 1px),
  linear-gradient(to bottom, var(--body-faint) 1px, transparent 1px);
background-size: 46px 46px;
```

### Ruler Chrome (`.ruler-top` / `.ruler-left`)

Not to be confused with *the ruler* — the 46px grid unit of Grid Background above. These are the decorative measurement strips that frame the page: fixed-position, `pointer-events: none`, `z-index: 1`, `opacity: .75`.

- `.ruler-top`: `height: 22px`, horizontal tick marks at 44px intervals, `border-bottom: 1px solid var(--rule)`
- `.ruler-left`: `width: 22px`, vertical tick marks at 44px intervals, `border-right: 1px solid var(--rule)`

The tick interval is a chrome rhythm and deliberately does not equal the ruler. Two measures, two jobs, one unfortunate word — when this document says "the ruler" without qualification it means 46px.

Hidden on mobile (`< 760px`).

### Page Shell

`.page-shell`: `max-width: 1440px`, `margin: 0 auto`, `padding: var(--space-sm) var(--outer-pad) var(--space-lg)`. Respects `env(safe-area-inset-left/right)`.

`--outer-pad`: `28px` desktop, `18px` mobile. Scope-excluded layout primitive — see §4 Spacing Scale.

---

## 5. Page Shell Components

### Masthead

`position: sticky`, `top: 0`, `z-index: 50`. Flex row: brand-block + mode-toggle. `background: linear-gradient(to bottom, var(--bg) 70%, rgba(0,0,0,0))` — fades to transparent.

**Brand block:** Inline-flex, `var(--border-weight-chrome) solid var(--border)`, contains:
- `.brand-mark`: DX logo SVG (`height: 28px`), `min-width: 72px`, centered. Logo switches between `logo-dark.svg` (light mode) and `logo-white.svg` (dark mode) via JavaScript.
- `.brand-word`: "Words" label, inverted fill (`background: var(--ink)`, `color: var(--bg)`), `var(--text-chrome)`, `font-weight: 700`.

Both segments: `padding: var(--space-xs) var(--space-sm) 7px` (Exception 1 — 1px optical pull on uppercase DX/WORDS marks; sides snap 10→12 to align with the `--space-sm` slot), `border-right: var(--border-weight-chrome) solid var(--border)`, uppercase, `letter-spacing: .03em`.

**Mode toggle:** `margin-left: auto`. Bordered button, `var(--text-nav)`, `font-weight: 700`, `min-height: 44px`, `padding: var(--space-chrome) var(--space-md) 13px` (Exception 2 — 1px optical pull on "MODE: DARK" / "MODE: LIGHT"). Text reads "Mode: Light" / "Mode: Dark". Cookie-persisted.

### Footer Strip

Two-item grid: "Follow @ImJustDex" (links to Instagram) | "Est. 1994".

```css
.footer-strip {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-sm); margin-top: var(--space-sm);
  position: relative; z-index: 2;
}
.footer-strip > * {
  border: var(--border-weight-chrome) solid var(--border); background: var(--panel);
  /* Exception 3 — 11px bottom = 1px optical pull on uppercase footer labels.
     Horizontal sits on --space-chrome (14), the named chrome tier. */
  padding: var(--space-sm) var(--space-chrome) 11px;
  text-transform: uppercase;
  letter-spacing: .06em; font-size: var(--text-nav); font-weight: 700;
  min-height: 44px;
}
```

Stacks to single column on mobile (`grid-template-columns: 1fr`).

---

## 6. Homepage Plate Grid

### Grid Structure

12-column CSS grid, `gap: var(--grid-gap)`. `--grid-gap` is repointed at `var(--space-sm)` (12px) and holds across breakpoints — the homepage grid semantics outrank the raw scale value, so the name stays even though it now resolves to a token. See §4 Spacing Scale.

### Plate Base

A plate is the base archive card. It renders as either:

- `<a class="plate" href="…">` — the 4 article cards (interactive). The anchor IS the card. One focusable element. No overlay links. No nested tab stops.
- `<article class="plate">` — ghost teaser (static). No hover highlight, no pointer cursor, no focus outline.

```css
.plate {
  border: var(--border-weight-content) solid var(--border);
  background: var(--panel);
  display: flex; flex-direction: column;
  justify-content: space-between;
  overflow: hidden; isolation: isolate;
  color: inherit; text-decoration: none;
  transition: border-color var(--motion-fast) var(--ease-default);
}
/* Native <a> cursor already renders as pointer — no redundant rule. */
a.plate:hover { border-color: var(--accent); }
a.plate:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: -5px;
}
```

**Phase 2 change (2026-04-10):** The prior pattern was `<article class="plate">` + absolutely-positioned `<a class="plate-link">` overlay. That created a nested-focusable anti-pattern and made the plate's semantics ambiguous. It is gone. The whole card is now a single block-level anchor.

### Plate Sizes

| Class | Span | Min Height |
|-------|------|------------|
| `.plate-feature` | `span 5` | `346px` |
| `.plate-secondary` | `span 3` | `230px` |
| `.plate-wide` | `span 5` | `230px` |
| `.plate-banner` | `span 4` | `230px` |

### Identity Plate — retired 2026-08-28

**Retired.** `.identity-plate`, `.identity-sub` and their dark-mode overrides were orphaned by the 2026-04-21 Astro cutover: `Plate.astro` has no code path that emits them, so they rendered nowhere while this document went on describing them as live. Roughly 100 lines of unreachable CSS shipped on every homepage load until they were removed, along with the `--identity-plate-bg` / `--identity-plate-ink` tokens and the `/brand/` specimen that mirrored them. Git has all of it at `de589e2`.

**Superseded by the identity hero** (`.identity-hero`, `home-augment.css` + `IdentityHero.astro`), which carries the same content — the ImJustDex label, "Dexter Jakes", the tagline — as a full-width band beneath the masthead rather than a `span 4` plate inside the cascade. See Identity Hero, next.

*Kept as a heading rather than deleted so the history stays legible: what the plate was, why it went, and what took its place.*

### Identity Hero

Full-width band beneath the masthead. `.identity-hero`, styled in `home-augment.css` (band, `.hero-name`, `.hero-tagline`) with `home-v2.css` on top, rendered by `src/components/home/IdentityHero.astro`.

Two columns. `.hero-main` carries the corner mark (`The Writer → 01`), the `ImJustDex` label (`.hero-sub`), the name at `var(--text-identity)` / `line-height: .82` (`.hero-name`, set as the page `h1`), and the tagline at `var(--text-h2)` (`.hero-tagline`, `var(--accent)` — the sanctioned accent use in §2). `.hero-side` carries the eyebrow, the bio, and two links — `.hero-link.primary` to `/about/`, plus the subscribe jump.

It sits **outside** the plate grid, so it takes no column span and needs no breakpoint rule of its own. It is a band, not a plate: nothing in §6's grid, size, or alternation vocabulary applies to it.

### Image Plates

CSS-generated textures via `::before` pseudo-element. Three texture classes:

**`.img-concrete`** — layered gradients simulating concrete/stone.
**`.img-noise`** — dark noise with a subtle monochrome edge split (light-left / dark-right). Reads as chromatic aberration translated to value, not hue — no pink/cyan, per the monochrome + single-red-accent discipline.
**`.img-lines`** — diagonal line pattern on gray gradient.

Shared image plate rules:
```css
.plate-image::before {
  content: ""; position: absolute; inset: 0;
  filter: grayscale(1) contrast(1.15);
  z-index: 0; transform: scale(1.02);
}
.plate-image::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,.08) 55%, rgba(0,0,0,.14));
  z-index: 1;
}
/* Load-bearing, not cosmetic: the ::after gradient is .78 black at the BOTTOM
   and only .14 at the top, so the white title is only readable if it sits at
   the bottom. This works because .plate-body is `display: flex; flex-direction:
   column` — justify-content on a block container does nothing. [F100] */
.plate-image .plate-body { justify-content: flex-end; padding: var(--space-md); }
.plate-image .plate-title { color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.45); }
.plate-image .meta-rail { color: #0a0a0a; background: #f5f5f1; border-color: #0a0a0a; }
```

**Mirror the layout, not just the color.** `/brand/`'s `.demo-plate-*` specimens exist to
dogfood these rules, and a mirror that copies the paint but drops the box model is worse than
no mirror — it documents a component the site does not ship. `.demo-plate-body` carried
`justify-content: flex-end` for the image-plate variant but not the `display: flex` that makes
it do anything, so every specimen title rendered in the LIGHT end of the gradient at 2.6:1
while production rendered it in the dark end at 19:1 [F100]. When a specimen and its production
component disagree, the specimen is wrong until proven otherwise.

**Phase 3a change (2026-04-10):** Image plates used to flip to white fills in dark mode via an `invert(1)` on the `::before` filter and a mirrored gradient. That created a fragmented visual field — textured plates bleached out against adjacent dark plain plates. Image plates now stay dark in both modes. The only dark-mode override is none. The grayscale filter and black-to-transparent gradient hold in light and dark.

### Meta Rail

Stamped label at bottom-left of each plate.

```css
.meta-rail {
  align-self: flex-start; margin: auto 0 0;
  /* Exception 4 — 7/6 vertical = 1px optical pull on uppercase meta label.
     Sides snap 10→8 to --space-xs to keep the badge tight (10→12 would
     fatten the meta-rail and break compact plate proportions). */
  padding: 7px var(--space-xs) 6px;
  background: var(--meta-bg); color: var(--meta-ink);
  border-top: var(--border-weight-chrome) solid var(--border);
  border-right: var(--border-weight-chrome) solid var(--border);
  font-size: var(--text-citation); letter-spacing: .08em;
  text-transform: uppercase; font-weight: 700;
  line-height: 1; white-space: nowrap;
}
```

Content format: reading time only (e.g., "8 min"). No dates. No "Read Time:" label.

### Plate Layout (Current)

**Row 1:** Reckonings (span 5, light, `.med`) → The Nets (span 3, dark `.img-concrete`, `.med`)

**Row 2:** Nobody Handed Me This (span 5, dark `.img-noise`, `.lg`) → The Price of Sunday (span 5, light, `.lg`)

**Texture Alternation Rule:** Adjacent plates must never share the same background treatment. Textured plates (img-concrete, img-noise, img-lines) and plain plates must alternate so every card contrasts its neighbor. This applies both horizontally within a row and across row boundaries in reading order.

### Ghost Teaser Plate

```css
.plate-ghost {
  grid-column: span 5; min-height: 230px;
  background: transparent;
  border: var(--border-weight-content) dashed var(--border);
  cursor: default;
}
.plate-ghost .plate-title {
  color: var(--ink); font-size: var(--text-h2); opacity: .46;
}
html.dark-mode .plate-ghost .plate-title { opacity: .40; }
.plate-ghost .teaser-date {
  font-family: var(--body); font-size: var(--text-citation);
  font-weight: var(--weight-bold); letter-spacing: var(--track-teaser);
  text-transform: uppercase;
  color: var(--body-muted);
}
.plate-ghost .meta-rail {
  background: transparent; color: var(--body-muted);
  border-top: var(--border-weight-chrome) dashed var(--border); border-right: none;
}
```

Used to tease an upcoming article before its publish date. Contains title (muted), "Publishing [date]" microcopy, and "Coming Soon" meta rail. The dashed border and transparency signal *this space is held*.

**Rendered by `GhostPlate.astro`** for every entry `isUpcoming()` returns true for — status `published` or `upcoming` with a future `publishedDate`. It heads the cascade as its own `01 · Next` row, above `This Week`, because the cascade reads strictly newest-first and an upcoming essay is newer than the lead. Nothing to swap on launch day: the daily rebuild flips the entry past its date and the same essay renders as a normal plate. It is deliberately **static** — no `<a>`, no hover, no focus ring (see *Interaction States*) — and carries no `data-lane`, so a lane filter hides it and the published-only lane counts stay honest against what is on screen.

**Muting comes from `--body-muted`, not an opacity multiplier**, on the date and the meta rail — the same reasoning as the lane badge below. Stacking a multiplier on an already alpha-tuned token drove these to 1.80–2.37:1. The title keeps a multiplier because it is a display face on a held plate, but at `.46` / `.40` rather than `.35`, which failed the 3:1 large-text floor in both modes.

### Lane Badge

```css
.plate-lane {
  position: absolute; top: 0; right: 0; z-index: 3;
  font-family: var(--mono); font-size: var(--text-micro);
  font-weight: var(--weight-bold); letter-spacing: var(--track-indicator);
  text-transform: uppercase; padding: 4px var(--space-xs) 3px;
  border-left: var(--border-weight-chrome) solid var(--border);
  border-bottom: var(--border-weight-chrome) solid var(--border);
  background: var(--panel); color: var(--body-muted);
  line-height: 1; pointer-events: none;
}
.plate-image .plate-lane { background: rgba(0,0,0,.72); color: rgba(255,255,255,.88); border-color: rgba(255,255,255,.18); }
.plate-ghost .plate-lane { background: transparent; color: var(--body-muted); border-style: dashed; border-color: var(--body-faint); }
```

Editorial lane indicator — top-right corner of each plate. Three lanes: **Faith**, **Identity**, **Art**. Subordination comes from size (`.72rem` / `--text-micro`) and tracking (`.18em`), not opacity — no opacity means real contrast, which means accessible. Panel plates hit ~4.8:1 light / ~5.0:1 dark (AA pass). Image plates use an opaque dark badge bg (`.72` alpha) with bright text (`.88` alpha) to guarantee contrast regardless of image content. Ghost plates stay visually muted via `--body-muted` color and dashed `--body-faint` borders. `pointer-events: none` so badges don't interfere with plate click targets. Each plate carries a `data-lane` attribute for future filtering or JS hooks.

### Responsive Grid

**Tablet (`< 1120px`):** 8-column grid. Feature/secondary/banner → `span 4`. Wide → `span 8`.

**Mobile (`< 760px`):** Single column. All plates `span 1`, `min-height: 210px`. `.plate-title.lg` gets `max-width: 100%`.

---

## 7. Article Components

### Article Frame

`.article-frame`: `max-width: 680px`, `margin: 0 auto`, `padding: 0 0 var(--space-3xl)` (80px breathing room before footer).

### Article Header

`border: var(--border-weight-content) solid var(--border)`, `background: var(--panel)`, `padding: var(--space-xl) var(--space-lg) var(--space-lg)`. **Phase 6 drift:** top 28→32 (snap to `--space-xl`) and bottom 22→24 (snap to `--space-lg`) — both are well inside perception threshold for the article header's frame size and worth taking to keep the doc on-scale.

### Section Head

Flex row: `h2` label + horizontal rule line.

```css
/* Margin bottom drift: 20→24 (snap to --space-lg). */
.section-head { display: flex; align-items: center; gap: var(--space-chrome); margin: var(--space-2xl) 0 var(--space-lg); }
.section-head h2 {
  font-family: var(--mono); font-size: .75rem; font-weight: 700;
  letter-spacing: .15em; text-transform: uppercase; color: var(--accent);
}
.section-head-line { flex: 1; height: 3px; background: var(--accent); }
```

### Pull Quote

Full-width break inside article body. Bleeds into article padding with negative margins.

```css
/* Top/bottom margin drift: 40→48 (snap to --space-2xl).
   Negative side margins match --space-lg exactly so the pull-quote
   bleeds flush to the inner edge of the article-body's 3px border —
   the "full-bleed-within-frame" pattern. */
.pull-quote {
  margin: var(--space-2xl) calc(-1 * var(--space-lg));
  padding: var(--space-xl) var(--space-lg);
  border-top: var(--border-weight-content) solid var(--border);
  border-bottom: var(--border-weight-content) solid var(--border);
  background: var(--body-tint);
}
.pull-quote p {
  font-family: var(--display);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 400; line-height: 1.1;
  letter-spacing: -.02em; text-transform: uppercase;
  color: var(--ink);
}
```

Maximum two per article.

### Callout

```css
/* Drifts: margin 36→32 (snap to --space-xl), left padding 18→16
   (snap to --space-md). Both pull tighter into the scale without
   visibly altering the callout's rhythm against surrounding body. */
.callout {
  margin: var(--space-xl) 0; padding: 0 0 0 var(--space-md);
  border-left: var(--border-weight-content) solid var(--accent);
  font-family: var(--body); font-size: 1.15rem;
  font-weight: 700; line-height: 1.4; color: var(--ink);
}
```

Single sentence or short phrase. Used for rhetorical pivots. Maximum two per article.

### Callout Emphasis

```css
.callout-emph {
  color: var(--accent-text);
  font-weight: 700;
}
```

Optional span class inside `.callout` blocks to highlight a single word or phrase in accent red. Uses `--accent-text` so it auto-lifts to `#ff4d4d` in dark mode — no per-mode override required. Available on all article pages.

### Scripture Block

```css
/* Margin drift: 36→32 (snap to --space-xl). */
.scripture {
  border: var(--border-weight-chrome) solid var(--body-faint);
  background: var(--body-tint);
  padding: var(--space-lg); margin: var(--space-xl) 0;
}
.scripture p {
  font-family: var(--body); font-size: 1rem;
  line-height: 1.7; color: var(--body-color);
  font-style: italic;
}
.scripture cite {
  font-family: var(--mono); font-style: normal;
  font-size: .7rem; letter-spacing: .15em;
  text-transform: uppercase; color: var(--accent-text);
}
```

### Stat Block

```css
/* Same full-bleed-within-frame pattern as .pull-quote — negative side
   margins match --space-lg so the bar+text align flush to the inner
   border. Column gap drift: 20→24 (snap to --space-lg). */
.stat-block {
  margin: var(--space-2xl) calc(-1 * var(--space-lg));
  padding: 0 var(--space-lg);
  display: grid; grid-template-columns: 3px 1fr; gap: 0 var(--space-lg);
}
.stat-block-bar { background: var(--accent); }
.stat-block-text {
  font-family: var(--display);
  font-size: clamp(1.6rem, 5vw, 2.6rem);
  font-weight: 400; letter-spacing: -.03em;
  line-height: 1.05; text-transform: uppercase;
  color: var(--ink);
}
.stat-block-text span {
  display: block; font-family: var(--mono);
  font-size: .7rem; font-weight: 400;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--body-muted); margin-top: 8px;
}
```

Maximum two per article.

### Closing Block

```css
/* Top padding drift: 28→32 (snap to --space-xl). */
.closing {
  margin-top: var(--space-2xl); padding: var(--space-xl) var(--space-lg);
  border: var(--border-weight-content) solid var(--border);
  background: var(--panel);
  font-family: var(--body); font-size: 1rem;
  line-height: 1.75; color: var(--body-color);
  font-style: italic;
}
```

Always present. Never more than 3–4 sentences. The final direct address to the reader.

### Share Bar

Sits directly below article body (no gap, `border-top: 0`).

```css
.share-bar {
  display: flex; align-items: center; gap: var(--space-chrome);
  padding: var(--space-chrome) var(--space-lg);
  border: var(--border-weight-content) solid var(--border); border-top: 0;
  background: var(--panel);
}
```

The internal `.subscribe-link` button drops the 1px optical pull intentionally — `padding: var(--space-sm) var(--space-chrome)` is symmetric (Exception 9). Sub-button scale is below the perception threshold for a 1px delta, so the pull gets dropped to keep the block reading clean.

Contains: "Share" label (mono, `.7rem`) → X link → Copy Link button → "Follow Me" subscribe button (inverted fill, `margin-left: auto`).

### Research CTA

```css
/* Drifts: vertical padding 18→16 (snap to --space-md), link side
   padding 20→24 (snap to --space-lg). Both sit comfortably inside the
   research-cta's frame proportions. */
.research-cta {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border: var(--border-weight-content) solid var(--border); border-top: 0;
  background: var(--panel); gap: var(--space-md);
}
.research-cta-text {
  font-family: var(--mono); font-size: .7rem; letter-spacing: .15em;
  text-transform: uppercase; color: var(--body-muted); line-height: 1.5;
}
.research-cta-link {
  flex-shrink: 0; font-family: var(--mono);
  font-size: .75rem; letter-spacing: .1em;
  text-transform: uppercase; font-weight: 700;
  padding: var(--space-sm) var(--space-lg); min-height: 44px;
  border: var(--border-weight-chrome) solid var(--border);
  background: var(--ink); color: var(--bg);
  text-decoration: none; white-space: nowrap;
}
```

Reusable CTA bar between article body and share bar. Links to external research, study, or source material that backs the essay. CSS is available on all article pages; add HTML only when an article has a backing research document. Stacks vertically on mobile.

### Back Button

```css
/* Exception 7 — 11px bottom = 1px optical pull on uppercase BACK label.
   Horizontal sits on --space-chrome (14), the named chrome tier. */
.article-back {
  display: inline-block; margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-chrome) 11px; min-height: 44px;
  border: var(--border-weight-chrome) solid var(--border); background: var(--panel);
  font-family: var(--mono); font-size: .75rem;
  letter-spacing: .1em; text-transform: uppercase;
  font-weight: 700;
}
.article-back:hover { border-color: var(--accent); }
```

### Reading Progress Bar (Articles Only)

```css
.reading-progress {
  position: fixed; top: 0; left: 0; width: 0%; height: 3px;
  background: var(--ink); z-index: 9999;
  transition: width var(--motion-fast) linear; pointer-events: none;
}
```

**Phase 3b change (2026-04-10):** Progress bar recolored from `--accent` (red) to `--ink` (black/cream). Red is reserved for section heads, callouts, underlines, and focus rings. A red bar at the top of the viewport was competing with the masthead and diluting the accent's semantic weight.

### Section Indicator (Articles Only)

Fixed-position label at bottom-left. Shows current section head text. Fades in/out via `.visible` class.

```css
/* Drifts: bottom/left 28→32 (snap to --space-xl), padding 6→8 / 12.
   The fixed-position editorial mark sits on the scale cleanly. */
.section-indicator {
  position: fixed; bottom: var(--space-xl); left: var(--space-xl); z-index: 9998;
  font-family: var(--mono); font-size: .6rem;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--ink); background: var(--bg);
  border: var(--border-weight-content) solid var(--ink);
  padding: var(--space-xs) var(--space-sm); opacity: 0;
  transition: opacity var(--motion-slow) ease; pointer-events: none;
  max-width: 260px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
```

**Phase 3b change (2026-04-10):** Dropped the `border-radius`, `box-shadow`, and `1px var(--rule)` hairline in favor of a content-weight hard border on `var(--ink)`. The indicator now reads as a stamped editorial mark, not a floating tooltip chip.

Mobile: `bottom: 16px`, `left: 16px`, `font-size: .52rem`, `max-width: 200px`.

### Component Patterns (Canonical HTML)

Every article component has one correct markup shape. These are the production patterns — copy them exactly when creating new articles. CSS classes are defined in `article.css` (and `shell.css` for the email signup honeypot utility).

#### Article Header

```html
<header class="article-header">
  <div class="article-eyebrow">
    <span class="article-tag">Faith + Strategy</span>
    <span class="article-date"><time datetime="2026-04-08">Apr 8, 2026</time></span>
    <span class="article-read">14 min</span>
  </div>
  <h1 class="article-title">The Nets Were Already Full</h1>
  <p class="article-deck">What the Galilee shore teaches about the sequence most ministries get wrong.</p>
</header>
```

Rules: `article-tag` is the editorial classification (e.g. "Faith + Strategy", "Food", "Faith"). `article-date` wraps a `<time>` with ISO `datetime`. `article-deck` is the single-sentence sub-headline — never more than one sentence.

**`.article-eyebrow` MUST wrap below 760px.** The rail is a flex row whose child count is not
fixed — it carries one chip per lane plus one per tag, then the date and the read-time. A
two-lane / two-tag essay puts six children in it. At `flex-wrap: nowrap` that rail overflowed
the article frame on every page that uses it (all 17 articles plus `/about/`): measured live at
375px on a six-chip essay, 105px of overflow, with the read-time **100% invisible** and the date
92% clipped.

It is lost content, not offscreen content — `body` and `.page-shell` are `overflow-x: clip`, so
there is no scrollbar and no gesture that reaches the clipped text (WCAG 2.2 SC 1.4.10 Reflow).
The rule is four lines inside the existing 760px block:

```css
@media (max-width: 760px) {
  .article-eyebrow { flex-wrap: wrap; }
}
```

Source-only review cannot catch this class of defect: the CSS is valid, and the failure only
exists once the flex row is laid out under 760px. Verify it by measuring
`scrollWidth − clientWidth` on a rendered page at 375px, not by reading the sheet.

#### Scripture Block

```html
<div class="scripture">
  <p>"I have become all things to all people, that by all means I might save some."</p>
  <cite>1 Corinthians 9:22, ESV</cite>
</div>
```

Rules: Always include translation abbreviation in `<cite>`. Text inside `<p>` is always italicized via CSS (`font-style: italic`). No `<blockquote>` — the `.scripture` class carries the semantic weight. Place at the top of the article body (before the intro paragraph) or inline between paragraphs as structural evidence.

#### Callout

```html
<div class="callout"><p>The cost of the yes tells you the weight of the ask.</p></div>
```

With optional accent emphasis:

```html
<div class="callout"><p>Trust is not a tactic. It's a <span class="callout-emph">timeline</span>.</p></div>
```

Rules: Single sentence or short phrase. Used for rhetorical pivots. Maximum two per article. The `<p>` is required inside the `<div>`. `.callout-emph` highlights one word or phrase in accent red — uses `--accent-text` so it auto-lifts in dark mode.

#### Pull Quote

```html
<div class="pull-quote">
  <p>You don't always need a bigger platform. You need a better position.</p>
</div>
```

Rules: Full-bleed within the article frame (negative margins in CSS). One or two sentences max. Used for the essay's most quotable moment — the thing someone would screenshot. Maximum two per article. Never stack adjacent to a callout.

#### Stat Block

```html
<div class="stat-block">
  <div class="stat-block-bar" aria-hidden="true"></div>
  <div class="stat-block-text">
    The one reached becomes the one reaching.
    <span>Not through pressure — through transformation.</span>
  </div>
</div>
```

Rules: Full-bleed within frame (same negative-margin pattern as pull quote). The `<span>` inside `.stat-block-text` renders as a micro-label below the main declaration — mono font, muted color, uppercase. The `.stat-block-bar` is a 3px accent-red vertical rule. Maximum two per article. Used for declarations and emotional turning points, not data.

#### Share Bar

```html
<div class="share-bar" aria-label="Share this essay">
  <span class="share-label">Share</span>
  <a href="https://x.com/intent/tweet?url=https://imjustdex.com/words/{slug}/&text={encoded-title}%20%E2%80%94%20DX"
     target="_blank" rel="noopener noreferrer" class="share-link">X</a>
  <button type="button" class="share-link" data-copy-link="https://imjustdex.com/words/{slug}/">Copy link</button>
  <a href="https://instagram.com/ImJustDex" target="_blank" rel="noopener noreferrer" class="subscribe-link">Follow Me</a>
</div>
```

Rules: Sits directly below `</article>` (or below `.research-cta` if present). `border-top: 0` in CSS — it shares the top border with the element above. The `data-copy-link` attribute is wired by `essay.js` to copy the URL and swap button text to "Copied" for 2 seconds. Replace `{slug}` and `{encoded-title}` per article.

#### Email Signup

```html
<form class="email-signup" action="/api/subscribe" method="post">
  <span class="email-signup-label">Get notified when I publish</span>
  <div class="email-signup-fields">
    <label for="email" class="sr-only">Email address</label>
    <input type="email" name="EMAIL" id="email"
           class="email-signup-input" placeholder="Your email" required>
    <button type="submit" class="email-signup-submit">Notify me</button>
  </div>
  <div class="email-signup-hp" aria-hidden="true">
    <input type="text" name="website" tabindex="-1" value="">
  </div>
</form>
```

Rules: Posts to `/api/subscribe` (Netlify Function → Mailchimp). The `.email-signup-hp` div is a honeypot for bots — `aria-hidden="true"` and `tabindex="-1"` keep it invisible to users and assistive tech. The field name `website` is the web-standard honeypot convention; the function rejects any submission where it's populated. The `sr-only` label on the email input is required for WCAG AA. `signup.js` handles AJAX submission and success/error states (adds `.email-signup--done` class on success). Sits below the share bar in every article.

---

## 8. Interaction & Accessibility

### Focus States

All interactive elements use `outline: var(--focus-ring-width) solid var(--focus-ring)` on `:focus-visible`. Width is tokenized (`--focus-ring-width: 2px`); offset stays local per selector (`2px` on chrome elements, `-5px`/`-4px` inset on content frames — see §4 Focus Rings). `--focus-ring` is `#c00` in both modes (unified in Phase 4.1) — non-text contrast only requires 3:1 and `#c00`/`#060606` clears 3.45:1.

**"All" means all, including the skip link.** A control with no `:focus-visible` rule does not
lose its focus indicator — it silently inherits the UA default (Chrome paints `1px auto #99c8ff`),
which passes WCAG 2.4.7 and therefore never shows up as a contrast or a11y failure. It only reads
as a system break: one pale-blue hairline among 2px `#c00` rings. `.skip-link` sat that way on
every route until F98, which is the worst place for it — the skip link is the first element a
keyboard user ever focuses, so the default ring was the site's opening impression of its own
focus treatment. It now rides the shared chrome block in `shell.css` alongside `.mode-toggle`,
`.brand-block` and `.footer-strip a`. **Auditing for this needs a rule-existence check, not a
contrast check** — walk the loaded cascade for a `:focus-visible` selector per interactive class
rather than measuring what the ring looks like.

### Touch Targets

All buttons and interactive elements have `min-height: 44px` for WCAG compliance.

### Selection

Light mode: `::selection { background: var(--ink); color: var(--bg); }` (homepage)
Article pages: `::selection { background: rgba(204,0,0,.14); }`

### Skip Link

Hidden off-screen, appears on focus: `background: var(--ink)`, `color: var(--bg)`, `padding: var(--space-sm) var(--space-chrome)`.

### Motion Doctrine

Motion is a three-rung duration scale + one easing curve, applied sparingly:

```css
--motion-fast:   120ms;
--motion-med:    180ms;
--motion-slow:   300ms;
--ease-default:  cubic-bezier(.2, .8, .2, 1);
```

If a duration isn't in this scale, it doesn't belong in the product.

**Where each rung lives:**
- **`--motion-fast`** — hover chrome (`a.plate`, `.article-nav-link`, `.mode-toggle` border-color/background), reading progress bar `width` (paired with `linear`).
- **`--motion-med`** — body `background`/`color` mode flip (`html.dark-mode` transition), research CTA `opacity` hover.
- **`--motion-slow`** — section indicator fade (ambient chrome reveal).

Everything else stays instant. No fade-ins. No scroll reveals. No page transitions. `--motion-tiny` from earlier phases was collapsed into `--motion-fast` + `--ease-default` to keep duration and easing authored as orthogonal tokens.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}
```

### Print

Hides: rulers, mode toggle, share bar, reading progress, section indicator, research CTA. Removes background images. Forces `#fff`/`#000`. Appends URLs to links.

---

## 9. Responsive Breakpoints

| Breakpoint | Trigger | Key Changes |
|------------|---------|-------------|
| `< 1120px` | Tablet | Plate grid → 8 columns. Feature/secondary/banner → span 4. Wide → span 8. |
| `< 760px` | Mobile | Single column plates. Masthead wraps. Footer stacks. Rulers hidden. `--outer-pad: 18px`. `--grid-gap` holds at `var(--space-sm)` (12px) across breakpoints. Article header/body padding reduces. Share bar wraps. Section indicator shrinks. Article nav stacks to single column. **`.article-eyebrow` wraps** (see Article Header below). |

---

## 10. Dark Mode Behavior

### Global

All structural colors invert through CSS custom properties. The toggle adds/removes `html.dark-mode` (set on the `<html>` element, not `<body>`, so a blocking head script can flip the class before first paint and avoid a flash of the wrong mode). Logo SVG swaps via `/js/mode.js` (`logo-dark.svg` ↔ `logo-white.svg`) using the `data-base` attribute on the logo `<img>` to resolve paths.

When no explicit `dxmode` cookie is set, the page respects the OS `prefers-color-scheme` at load and follows OS preference changes live via `matchMedia`. Once the user clicks the toggle, the cookie takes over and OS changes no longer override.

**Two layers, not one.** `tokens.css` carries a CSS-only dark block — `@media (prefers-color-scheme: dark) { :root:not(.mode-resolved) { … } }` — that covers the window where JS has not run or has failed outright. `mode.js` adds `.mode-resolved` to `<html>` once it has read the cookie and settled a mode, which retires the CSS fallback and hands authority to `html.dark-mode`. CSS covers the gap; JS covers explicit user preference; there is no flash in either scenario. **Any new dark-mode token must be declared in *both* blocks** or it will resolve differently in the pre-JS window.

### Identity Hero (Special Case)

The hero band inverts to a dark field in both modes (`.identity-hero`, `home-augment.css` + `home-v2.css`), holding its editorial signature regardless of ambient mode. No accent scoping is needed — as of Phase 4.1 `--accent` is `#c00` in both modes globally, so the tagline reads at the intended weight on the dark field without any per-element override.

### Image Plates (Special Case)

Stay dark in both modes. No `html.dark-mode` overrides — the grayscale filter and black-to-transparent gradient hold in light and dark. Flipping them to light in dark mode was fragmenting the visual field; keeping them dark lets textured and plain plates alternate cleanly.

### Scripture Citation

`color: var(--accent-text)` — resolves to `#c00` in light mode and `#ff4d4d` in dark mode. No per-mode override at the selector level. `--accent-text` is the **only** token in the system that still flips in dark mode — the single intentional exception to the unified `#c00` doctrine, because small red text on `#060606` fails WCAG AA at `#c00` (3.45:1) and needs the lifted `#ff4d4d` (7.54:1).

---

## 11. Image Language (Target — Not Yet Implemented)

When images replace the current CSS-generated textures, they must follow these rules:

**Permitted categories:** Monochrome documentary stills. Architecture and concrete forms. Close-cropped textures. High-contrast domestic objects. Archival-feeling personal photography. Degraded digital artifacts.

**Treatment:** Always `filter: grayscale(1) contrast(1.15)`. Always covered with gradient overlay for text legibility. Images stay dark in both modes — no per-mode flip. Light-mode legibility comes from the gradient; dark-mode integration comes from the ambient dark field.

**Test:** Every image must answer: *what tension does this create with the title?* If it doesn't increase tension, cut it.

---

## 11.5 Security, CSP, and Caching

### Content Security Policy

`netlify.toml` ships a strict self-only CSP. No `unsafe-inline` anywhere.

```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests
```

Every script lives in `/js/*`. Every stylesheet lives in `/css/*`. Every font lives in `/fonts/*`. No inline `<style>` blocks. No inline `<script>` blocks. No inline `onclick` / `onload` / `onerror` attributes. No Google Fonts. No analytics beacons. No CDNs.

When adding behavior, the rule is: write it in `/js/*.js`, gate it on the DOM elements it targets (no-op if absent), and load it with `<script src>`. When adding copy-to-clipboard or similar interactions, use `data-*` attributes read by the script — never inline handlers.

### Other Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

### Cache-Control

| Path pattern | Header |
|--------------|--------|
| `/*.html` | `public, max-age=0, must-revalidate` |
| `/css/*` | `public, max-age=31536000, immutable` |
| `/js/*` | `public, max-age=31536000, immutable` |
| `/fonts/*` | `public, max-age=31536000, immutable` + `Access-Control-Allow-Origin: *` |
| `/img/*` | `public, max-age=31536000, immutable` |

HTML is always fresh. Static assets cache for a year and are busted by a **`?v=phaseNN` query
string on the reference**, not by filename — the files keep stable names. Fonts get CORS on top
of the immutable cache so cross-origin preloads never get blocked.

**The bust is as much a part of the change as the CSS is.** `/css/*` is served
`max-age=31536000, immutable`, so editing a sheet without moving its `?v=` means every returning
reader keeps the year-cached copy and never receives the fix — while it looks correct in every
local test. Two rules:

1. **Bump every reference together — and the references are not all in `src/`.** The two
   passthrough pages, `brand/index.html` and `phase0/index.html`, link the shared sheets with
   their own hand-written `?v=`, so a sheet's reference count is the `src/` count plus however
   many passthroughs load it. `article.css` has **four** references: `ArticleLayout.astro`,
   `ComingSoonLayout.astro`, `about.astro` and `brand/index.html`. `shell.css` has **seven** —
   five in `src/` plus both passthroughs. Miss one and that route serves a stale sheet against
   fresh markup, for up to a year.
2. **Jump to the current phase, don't increment.** When `shell.css` changed in `79df261` it went
   `phase23 → phase36`. `article.css` went `phase24 → phase37` in `558aa07` (merged to main as
   `f8d7702`). Take the highest phase in use anywhere and go one past it — as `shell.css` did
   going `phase36 → phase38` in the F98 fix, stepping over `article.css`'s phase37.

**Scan the whole repo, not just `src/`.** This is exactly how `/brand/` got left on
`article.css?v=phase24` for two days after `558aa07` moved the other three references to
phase37 — a `src/`-only sweep cannot see the passthroughs [F99]:

```
grep -rn --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=audit \
  -oE '/css/[a-z0-9-]+\.css\?v=[a-z0-9]+' . | sort
```

(`audit/` is excluded because the feature ledger quotes these paths as prose and would otherwise
report a phantom eighth `tokens.css` reference.)

**The route-scoped sheets version on their own scheme and the grep above cannot see them.**
`/brand/brand.css` uses `?v=brandN`, not `?v=phaseNN`, so it falls outside both the `/css/`
path prefix and the `phase` token. It has one reference today (`brand/index.html`), so it
cannot drift against itself — but it still has to be bumped whenever `brand/brand.css` changes,
or `/brand/` serves a stale immutable copy of its own bespoke sheet. Sweep it separately:

```
grep -rn --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=audit \
  -oE '/(brand|phase0)/[a-z0-9-]+\.css\?v=[a-z0-9]+' . | sort
```

Every sheet should show exactly one `?v=` across all of its references; two distinct values for
one filename is the drift. For the high-water mark:

```
grep -rh --exclude-dir=node_modules --exclude-dir=dist -oE '\?v=phase[0-9]+' . | grep -oE '[0-9]+' | sort -n | tail -1
```

---

## 12. Metadata & SEO

### Title Pattern

- Homepage: `DX — Dexter Jakes`
- Article: `{Article Title} — DX`
- About: `About — DX`

### OG/Social

All pages set: `og:title`, `og:description`, `og:image` (default: `/img/og-default.png`), `og:url`, `og:type`, `og:site_name` ("DX"). Articles add `article:author` ("Dexter Jakes") and `article:published_time`.

Twitter cards: `summary_large_image`.

### Title Standardization

Titles appear on four surfaces: archive plate, article `<h1>`, `<title>` tag, and OG/social metadata. All four use the same string. No periods in display titles. CSS `text-transform: uppercase` handles casing — source HTML uses natural case.

---

## 13. Microcopy & Editorial Voice

All interface-level language follows one register: **terse, stamped, authored.**

**No articles or prepositions in labels.** "Est. 1994" — not "Established in 1994."

**No verbs in metadata.** "8 min" — not "Takes 8 minutes to read."

**No friendliness.** No "Welcome," "Thanks for reading," "Enjoy." The site does not greet. It presents.

**No marketing language.** No "Don't miss out," "Join the community," "Stay updated." The only CTAs permitted are "Follow Me" and "Follow @ImJustDex."

**Mode toggle reads as state, not invitation.** "Mode: Light" / "Mode: Dark" — not "Switch to dark mode."

**Footer text is identity, not explanation.** "Est. 1994" is a mark, not a description. It does not need to be understood by everyone. It needs to be consistent.

**Tags are classification, not decoration.** Single-word categorical labels. Never cute. Never clever. Never more than two per piece.

### Editorial Lanes (Homepage Badge System)

Three active lanes, each a single word naming a weight:

**Faith** — Theological weight essays anchored in specific texts. Confession through Scripture.
**Identity** — Personal confession, inheritance, self-definition. The human behind the writing.
**Art** — Music, food, photography, creative practice. Absorbs all craft-driven essays.

Lane badges appear top-right on every homepage plate via `.plate-lane` (see §6 Lane Badge). Each plate carries a `data-lane` attribute. New lanes may be added when the catalog earns them — not before. A fourth lane (e.g. culinary essays) should only be introduced when 2+ articles occupy it.

### Permitted Tag Vocabulary (Article Pages)

Tags on article detail pages use a broader vocabulary than the homepage lane system. Permitted: Faith, Identity, Art, Work, Grief, Inheritance, Language, Calling, Strategy. These appear in the article eyebrow as `.article-tag` classification badges.

New tags may be added. Each must be a single word that names a weight, not a topic.

---

## 14. File Structure

The hand-authored `index.html` / `about/index.html` / `words/<slug>/index.html` tree this section used to list was retired by the 2026-04-21 Astro cutover (commit `eecabbb`, §17). Pages are now compiled out of `src/` into `dist/`; there is no checked-in HTML route to edit.

```
imjustdex.com/
├── astro.config.mjs              ← Astro config; sitemap filter reads words frontmatter at eval time
├── src/
│   ├── content/words/*.mdx       ← One file per essay. Frontmatter is the single source of truth.
│   ├── content/config.ts         ← Zod schema — the contract. `npm run build` hard-fails on violation.
│   ├── layouts/                  ← HomeLayout, ArticleLayout, ComingSoonLayout
│   ├── components/               ← Article components + home/ (Plate, GhostPlate, IdentityHero, LatestBar, …)
│   ├── pages/                    ← index, about, 404, words/, feed.xml.ts (Atom generator)
│   └── utils/published.mjs       ← The publicly-live predicate, shared by config and pages
├── public/                       ← css/, js/, fonts/, img/, brand/, phase0/ as served (mirrors the source dirs)
├── css/                          ← Source sheets — tokens, shell, plates, article, notfound, home-v2, home-augment, phase0
├── js/                           ← Source scripts — mode, progress, essay, signup, subscribe, lane-filter, earlier-toggle, phase0
├── fonts/                        ← Anton-Regular, IBMPlexSans Regular / Italic / Bold (WOFF2)
├── img/                          ← Logos, favicons, per-article OG plates
├── scripts/og-plate.mjs          ← Per-article OG plate generator (see §1 Generators)
├── brand/  phase0/  audit/       ← Brand specimen, campaign page, QA ledger
├── DESIGN-SYSTEM.md              ← This file
└── netlify.toml                  ← Deploy config (strict CSP, trailing-slash redirects, cache headers)
```

No page embeds inline CSS or inline JavaScript. Every page loads the same `tokens.css` + `shell.css` universal pair, then one page-type sheet (`plates.css`, `article.css`, or `notfound.css`) — plus, on the homepage, `home-augment.css` → `home-v2.css`. Shared elements are defined once in the layouts and never replicated by hand — changing the masthead or footer means editing `shell.css` and one layout, once.

### Removed Routes (April 2026)

The following TPH-era prototype routes have been removed from the editorial repo and redirect to `/` in `netlify.toml`. They were migrated into the Cowork OS under `TPH Marketing/`.

- `/opsmeeting` and `/opsmeeting/*`
- `/leadership-prep` and `/leadership-prep/*`
- `/asana-workflow` and `/asana-workflow/*`

### Trailing-Slash Canonical

All article and About URLs are canonical with a trailing slash (`/about/`, `/words/the-nets/`, etc.). Non-slash variants 301-redirect to the slash version in `netlify.toml`. The homepage (`/`) and `404.html` are the only pages without a trailing-slash canonical.

---

## 15. Exception Policy

The standard governs all production pages. Exceptions are permitted only under these conditions:

**What qualifies:** A photo essay, a long-form project page, a collaboration, a one-time editorial experiment, or any page that cannot fulfill its purpose within the standard template.

**What does not qualify:** Wanting more color. Wanting a different font. Wanting the page to "feel different." Aesthetic preference is not an exception — it is drift.

### Exception Rules

1. Must use the same shell (masthead, rulers, footer strip, grid background, mode toggle).
2. Must use the same color variables. No new colors.
3. Must be visually recognizable as part of imjustdex.com within the first viewport.
4. Must be documented here with a one-line rationale before it ships.

### Active Exceptions

(None)

---

## 16. What This System Is Not

This is not a blog theme. It is not a personal website template.

Every decision — border weight, title scale, metadata format, accent placement — exists to make the site feel printed, rigid, and inevitable. If a change makes the site feel more like a "website" and less like a "publication," the change is wrong.

---

## 17. Machine-Legibility Layer (Phase 2 → Phase 30)

Added 2026-04-10 to make the site machine-legible for search engines, feed readers, and schema consumers without altering a single visible pixel.

**Phase 30 update (2026-05-07) — cutover-aware rewrite.** This section originally described a hand-maintained layer: every new article required edits to `/index.html`, `/sitemap.xml`, `/feed.xml`, and the prev/next chain in two places. The Astro cutover (2026-04-21, commit `eecabbb`) collapsed all of that into a single source of truth — frontmatter in `src/content/words/<slug>.mdx`, validated by Zod in `src/content/config.ts`, consumed by the homepage cascade, the Atom feed generator (`src/pages/feed.xml.ts`), the sitemap (`@astrojs/sitemap`), JSON-LD blocks in `ArticleLayout.astro`, and the prev/next chain via `data.prev` + `data.next`. The "Update Rules" subsection below was rewritten to match.

### Structured Data (JSON-LD)

Every page ships Schema.org JSON-LD in the `<head>`, embedded as `<script type="application/ld+json">`.

- **Homepage (`/`)** — `@graph` with `WebSite` + `Person` nodes. The `Person` node is the canonical identity (`@id: https://imjustdex.com/#person`) referenced from every article's `author` and `publisher` fields.
- **About (`/about/`)** — `ProfilePage` whose `mainEntity` is the same `Person` node.
- **Each article (`/words/*/`)** — `BlogPosting` with `headline`, `description`, `datePublished`, `dateModified`, `author`, `publisher`, `mainEntityOfPage`, `image`, `url`, `inLanguage`, and `wordCount`.

`wordCount` is set per article in frontmatter (`wordCount: 4187`) and refreshed when the article is materially rewritten.

`image` resolves to `/img/og-<slug>.png?v=<ogImagePhase>` — per-article (default `ogImagePhase: "phase26"`). The schema shape stays identical across articles. The 2026-04-21 Second-Run scrub caught a regression where `image` had been hardcoded to `og-default.png` site-wide; commit `ab2092a` made it per-slug from frontmatter.

### Sitemap

- **`/sitemap-index.xml`** — index pointing at `/sitemap-0.xml`, both auto-generated by `@astrojs/sitemap`.
- **`/sitemap-0.xml`** — `urlset` containing the homepage, About, Brand, Phase 0, and every publicly-live article. Drafts and Coming-Soon entries are excluded by the filter in `astro.config.mjs`.
- **`/robots.txt`** — `Allow: /` plus a `Sitemap: https://imjustdex.com/sitemap-index.xml` pointer. No disallow rules.

**Phase 30 architectural note (2026-05-07) — sitemap filter is content-aware.** `astro.config.mjs` now reads `src/content/words/*.mdx` frontmatter at config-eval time to build a Set of publicly-live article URLs, then filters the sitemap against that Set. The predicate (`status === 'published' AND publishedDate <= now`) lives in `src/utils/published.mjs` — a deps-free pure-JS module — and is re-exported from `src/utils/visibility.ts` with the typed `WordsEntry` wrapper. Both contexts (TS pages + `.mjs` config) consume the same predicate, eliminating drift risk between sitemap and homepage / feed / route paths. *Before:* 5 noindex Coming-Soon pages appeared in `/sitemap-0.xml`, generating Search Console "Submitted URL marked 'noindex'" warnings. *After:* sitemap shrinks to publicly-live entries only (16 → 11 URLs at the time of the change). Malformed frontmatter (missing `status` or `publishedDate`) emits a `console.warn` at build time and excludes the slug from the sitemap; Zod's full validation remains the authoritative gate.

### Atom Feed

- **`/feed.xml`** — Atom 1.0 with site-level metadata and one `<entry>` per publicly-live article in reverse-chronological order, generated by `src/pages/feed.xml.ts` from the `words` collection. `summary` ships (not full content) to keep the file light.
- **`/feed.xsl`** — XSL stylesheet that renders the feed human-readably when opened in a browser. The `<?xml-stylesheet href="/feed.xsl"?>` PI is the first line of the feed.
- Discovery: `<link rel="alternate" type="application/atom+xml" href="/feed.xml">` in the `<head>` of `/` and `/about/`.

**Phase 30 hygiene (2026-05-07).** `<logo>` URL now versioned (`og-default.png?v=phase26`) so feed-reader caches invalidate alongside article OG images and `/phase0/`. Brings the feed asset in line with the rest of the cache-bust regime.

**Phase 30.1 (2026-05-07) — `<category>` restored, lanes only.** The original Phase 2 prose described `<category>` tags mirroring the article's `data-tags` attribute (a pre-cutover composite of lane + tag). Post-cutover the two axes split into `lanes: ["Faith"|"Identity"|"Art"]` (structural, enum-bounded, drives the homepage cascade) and `tags: string[]` (decorative, free-form, rendered in the article eyebrow). `feed.xml.ts` now emits one `<category term="…" scheme="https://imjustdex.com/lanes/"/>` per lane in `lanes[]`, using a distinct scheme so feed consumers can filter on the lane axis specifically. Tags are intentionally excluded from the feed — they're decorative metadata for human readers, not a categorization axis. The `lanes/` scheme leaves `tags/` reserved if that decision ever reverses. Lane values are ASCII-only enum strings; `escapeXml` is applied defensively in case the vocabulary is ever expanded.

### Per-Article Dates

Every archive plate and article header carries a `<time datetime="YYYY-MM-DD…">` element. The plate renders the date inline in the meta rail (`Apr 8 · 14 min`); the article header renders the full formatted date. Both machine-readable and visible. Source: frontmatter `publishedDate`, normalized to ISO-8601 with the `-05:00` offset (Phase 28 normalization).

### Previous / Next Essay

Every article has two links to its chronological neighbors:

1. **`<head>`** — `<link rel="prev" href="…">` and `<link rel="next" href="…">` for crawlers.
2. **Article body** — A `.article-nav` block below the share bar: a two-column grid of prev and next, each with a mono label and a display-cased title. On viewports narrower than 640px the grid collapses to a single column. First and last articles render only one direction, spanning the full row (`:only-child`).

Source: frontmatter `prev: { slug, title }` and `next: { slug, title, date?, ghost? }` per article. Chronological order is by `publishedDate` (oldest → newest). The `next.ghost: true` flag renders **this article's own next link** in the ghost treatment (`.article-nav-ghost`, article.css) when the target isn't live yet — it is an article-page affordance and has never had anything to do with the homepage. The homepage's own upcoming-essay announcement is the ghost teaser plate above; the `.issue-next` strip that this sentence used to name was retired 2026-08-27.

### Update Rules

When a new article ships:

1. Create `src/content/words/<slug>.mdx` with required frontmatter. The Zod schema in `src/content/config.ts` is the contract — `npm run build` hard-fails on any violation.
2. Set `status: "published"` to release; or leave `publishedDate` in the future to ship a Coming-Soon placeholder (renders with `<meta name="robots" content="noindex">`, omitted from sitemap and feed).
3. Wire `prev: { slug, title }` to the prior article and update the prior article's `next: { slug, title }` to point at this one.
4. Drop the per-article OG image at `public/img/og-<slug>.png` (phase-stamped via `ogImagePhase` frontmatter, default `"phase26"`).

The cascade is automatic: homepage plate, lane counts, feed entry, sitemap URL, JSON-LD `BlogPosting`, prev/next chain, and `<time>` markers all derive from frontmatter on the next build.
