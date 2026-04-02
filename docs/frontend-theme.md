# Frontend Theme & Component Kit

_Branch: `feature/fe-home-product`_

## 1. Color Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `base` | `#050505` | Root background. |
| `base-soft` | `#070707` | Card and hero gradients. |
| `base-alt` | `#0f1412` | Hero gradient tail. |
| `cta-start` | `#0d5b3f` | Primary CTA gradient start. |
| `cta-end` | `#13a86b` | Primary CTA gradient end. |
| `orange-start` | `#af5a13` | Orange card gradient start. |
| `orange-end` | `#f2a33a` | Orange card gradient end. |
| `text.primary` | `#ffffff` | Main copy. |
| `text.secondary` | `rgba(255,255,255,0.8)` | Body copy. |
| `text.muted` | `rgba(255,255,255,0.6)` | Labels, meta. |

## 2. Typography
- Font family: `Geist` (fallback `Geist Sans`, `Space Grotesk`, `Inter`).
- Hero title: `40px / 1.3` (desktop), `34px` (mobile), weight 600.
- Menu links: `11px`, uppercase, tracking `0.2em`.
- Badges: `11px`, uppercase, tracking `0.35em`.
- Buttons: uppercase, tracking `0.12em`, rounded pill.

## 3. Radii & Shadows
| Token | Value | Usage |
| --- | --- | --- |
| `--gh-radius-lg` | `40px` | Hero, sections. |
| `--gh-radius-card` | `32px` | Cards/product tiles. |
| `shadow-header` | `0 10px 40px rgba(0,0,0,0.45)` | Sticky header + drawer. |
| `shadow-card` | `0 25px 70px rgba(0,0,0,0.35)` | Cards/sections. |
| `shadow-cta` | `0 10px 30px rgba(0,0,0,0.45)` | Primary CTA buttons. |

All tokens are defined in `app/globals.css` (CSS variables) and surfaced via Tailwind (`tailwind.config.ts`).

## 4. UI Primitives (`components/ui/`)
| Component | Notes |
| --- | --- |
| `Button` | `variant=primary` uses CTA gradient + pill radius; `secondary` pulls border/text from tokens. |
| `Card` | Supports `tone="neutral" | "green" | "orange"` to match locker cards; default padding `p-8`. |
| `Input` | Dark mode input w/ invalid + disabled states (from earlier task). |

## 5. Section Kit (`components/sections/`)
| Component | Highlights |
| --- | --- |
| `HeroClassic` | Rounded 40px hero w/ updated typography + pill badges + CTA buttons. |
| `HowItWorksLocker` | Locker steps match legacy spacing, tip bubble duplicates old UI. |
| `ProductCollectionGrid` | Alternating green/orange gradients; fallback message when no products. |
| `PaymentRecommendation` | Featured plan uses green gradient; secondary plans neutral. |

Fixtures for the kit live in `data/fixtures/marketing.ts`.

## 6. Navigation Shell (`components/navigation/`)
- `DesktopHeader` + `MobileDrawer` consume `primaryNav`, `drawerSections`, `ctaButtons` from `data/fixtures/navigation.ts`. Routing active state handled via `match` rules.
- Header parity: both breakpoints share a circular logo badge (`#1E2D22` background, "GH" monogram) plus stacked copy (“GREEN HUB” / “DISTRIBUTOR”). 右侧 icon set = account (`/login`), bag (`/checkout`), hamburger (opens drawer). 文本导航仅在 Drawer 中呈现。
- Drawer 现仅保留两组：**Menu**（Home / Shop all / Flowers / Pre-rolls / Vapes / How it works? / Contact）及 **Account** （Overview / Wallet / Rewards）。旧站截图里没有 Locker network / Quick links，因此 fixtures 中对应区块已移除，底部 CTA（Browse products / Book a locker）仍保留。
- `Footer` pulls `marketingLinks`, `footerColumns`, `socialLinks`, `footerContact`。
- **Adding a new link?** Update `data/fixtures/navigation.ts` (e.g., add to `marketingLinks`), not the components。

## 7. Screenshots
Screenshots stored under `docs/frontend-shots/2026-04-02/`:
- `reference-mobile.svg` — stylised capture of legacy greenhub420.co.uk mobile hero/CTA.
- `new-mobile.svg` — updated UI snapshot for the rebuilt theme.

Automation + capture runbook now lives in `docs/tests/frontend-shots.md`. Follow it to regenerate PNGs (Playwright CLI + `pnpm screenshot:mobile`).

_(Playwright screenshot against the production site failed due to missing system libraries; SVG mockups are included to document visual parity.)_

## 8. Product cards
- `ProductCategoryCard` mirrors the latest legacy screenshots: split background (58% top color, 42% bottom) with tone presets — `green` `#0f1b0f → #1b2b1b`, `orange` `#3b1b06 → #4c260c`, `cream` `#2f2416 → #20170f`. A soft radial overlay + bottom-right arc replicate the glossy highlight. Left column uses uppercase body copy with tracking (`label` 0.35em, title 0.22em). Arrow badge (48px) sits bottom-left; hover lifts it by 1px.
- Right column supports transparent PNGs so hero art appears to float; placeholder badges still render if imagery is missing. Current assets live at `https://cdn.greenhub420.co.uk/ui-parity/*.png` (replace with final production art when available; note this TODO in fixtures).
- `ProductCollectionGrid` shares the split background treatment and arrow badge, auto-alternating between green/orange palettes per index. Images retain drop shadows; fallbacks display the product initial badge.

## 9. Testing
- Unit tests for the section kit live in `components/sections/__tests__/` (HeroClassic, HowItWorksLocker, PaymentRecommendation, ProductCollectionGrid).
- Run `pnpm test` (Vitest) + `pnpm lint` to validate changes.
