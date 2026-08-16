# Design — Connected (Social-Media-NLP)

/* Hallmark · pre-emit critique: P5 H4 E4 S5 R4 V5 */

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre

playful

## Context

"Connected" is a consumer social platform with NLP sentiment analysis. The
2026-08-17 redesign replaces a dark glassmorphism skin (purple bloom
gradients, glass cards, indigo `#6366F1` buttons) with the Hallmark **Hum**
register: cream paper, multi-accent surfaces (pear / sky-cyan / coral),
rounded sans throughout, push-button physics, one character moment, star-burst
on primary success. Glassmorphism and gradient text were banned by the genre;
all instances removed.

**Audience** — community users logging in daily to post, chat, and follow.
**Use case** — land on login, then live in the feed/chat shell.
**Tone** — playful.

## Macrostructure family

- **Auth pages** (Login/Register): Split Studio — art flank left
  (accent colour block + the character mark), form right. Off-centre. Never
  the centred hero stack.
- **App shell pages** (Home feed, Messages, Notifications, Bookmarks,
  Profile, Settings, Admin): Workbench — N3 side-rail nav owns the left edge;
  the feed column is the tour; right rail on home only.
- **Catalogue pages** (Groups, Events lists): Catalogue — uniform cards,
  each card owns one accent tint at rest (~6%), deepens to ~12% on hover,
  lifts 4px. One accent per tile, never blended.

## Theme — Hum

Light (default):

- `--color-paper`      oklch(97% 0.012 95)   cream, pear pull
- `--color-paper-2`    oklch(94% 0.016 95)   tinted band
- `--color-paper-3`    oklch(91% 0.020 95)   hover/deeper
- `--color-ink`        oklch(20% 0.012 250)  near-black, cool tilt
- `--color-ink-2`      oklch(42% 0.012 250)  muted ink
- `--color-rule`       oklch(88% 0.016 95)   dashed-rule colour
- `--color-accent`     oklch(86% 0.18 95)    pear-yellow (primary action)
- `--color-accent-deep` oklch(76% 0.20 95)   pear edge/shadow
- `--color-accent-2`   oklch(66% 0.18 235)   sky-cyan (links, hover tints)
- `--color-accent-3`   oklch(68% 0.24 18)    coral (one pop moment)
- `--color-mint`       oklch(80% 0.16 150)   success / sentiment-good
- `--color-lavender`   oklch(74% 0.16 305)   decorative chips
- `--color-focus`      oklch(66% 0.18 235)   focus rings

Night variant (the app's dark-mode toggle stays functional; Hum's dark
register re-maps paper/ink, keeps the same accents):

- `--color-paper`      oklch(22% 0.015 250)
- `--color-paper-2`    oklch(26% 0.018 250)
- `--color-paper-3`    oklch(31% 0.020 250)
- `--color-ink`        oklch(94% 0.008 95)
- `--color-ink-2`      oklch(72% 0.008 95)
- `--color-rule`       oklch(36% 0.015 250)

Accent rules: pear = primary action only · cyan = links/hover-tints ·
coral = the single high-energy moment · mint/lavender occasional. No
accent-to-accent gradients, ever. Ink is modified with opacity (body 88%,
links 95%, hover 100%), not new hexes.

## Typography

- Display: Plus Jakarta Sans, weight 600, style normal (never italic)
- Body: Plus Jakarta Sans, weight 400 (500 for inline emphasis)
- Mono: JetBrains Mono, weight 500 — uppercase labels, counters, sentiment tags
- Display tracking: -0.025em
- Type scale: `--text-display` clamp(2.4rem, 4vw + 1rem, 4rem) · heading-xl 2rem · lg 1.5rem · md 1.125rem · sm 0.875rem · xs 0.75rem
- No serif anywhere. (The old "Great Vibes" script import was removed.)

## Spacing

4-point named scale in `tokens.css`: `--space-3xs` 4px → `--space-3xl` 112px.
Pages use `var(--space-*)`, never raw px for layout gaps.

## Motion

- Easings: `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` (primary CTA
  + character only) · `--ease-snap: cubic-bezier(0.22, 1, 0.36, 1)` ·
  `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- Button press: lift -2px on hover, depress +3px on active (snap 140ms/70ms).
- Cards: lift -4px + shadow brighten, 220ms spring.
- Reduced motion: opacity-only ≤150ms; counters render final; star-burst off.

## Microinteractions stance

- Push is the feedback — no scale() on buttons.
- One character moment: the pear dot over the wordmark "Connected" pulses at
  rest (4s), star-bursts coral on successful login.
- Star-burst: 420ms, once per primary-action success.
- No toast decorations — react-toastify messages keep default placement,
  theme follows tokens.

## CTA voice

- Primary: `.btn` push — pill 999px radius, pear face, solid pear-deep edge
  `0 4px 0 0` + soft cast shadow. Antd primary buttons are overridden to
  match via ConfigProvider + `.ant-btn-primary` rules.
- Secondary: soft — flat lift, no colour edge.
- Tertiary: outline — hairline + accent fill sweep on hover.

## Per-page allowances

- Auth/login MAY use the colour-block flank + character mark.
- App pages MUST NOT use enrichment — function carries the page.
- Sentiment indicators keep their semantic mapping: good = mint, moderate =
  pear, bad = coral (dot + mono tag). These replace the old green/amber/red
  hexes.

## What pages MUST share

- Wordmark "Connected" with its pear dot.
- Accent placement ≤ 5% per viewport.
- Plus Jakarta Sans (display + body), JetBrains Mono (labels).
- Push-button physics (shape 999px pill, depress-on-active).
- Card physics: 20px radius, layered contact + ambient shadow, hover lift.

## What pages MAY differ on

- Macrostructure within the family (auth = Split Studio, shell = Workbench,
  catalogue pages = Catalogue grid).
- Which accent owns a page's punctuation (home = pear, messages = cyan,
  notifications = coral moment, admin = lavender chips).

## Exports

### tokens.css

See `FE-Social-Media/src/index.css` — the canonical token block for this
system, mirrored by the Antd v5 theme in `FE-Social-Media/src/theme/antdTheme.ts`.
