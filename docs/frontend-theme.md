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
- `DesktopHeader` + `MobileDrawer` now consume `primaryNav`, `drawerSections`, `drawerQuickLinks`, `ctaButtons` from `data/fixtures/navigation.ts`. Routing active state handled via `match` rules.
- Header parity: both breakpoints share a circular logo badge (`#1E2D22` background, "GH" monogram) plus stacked copy (“GREEN HUB” / “DISTRIBUTOR”). Right-aligned icon set = account (→ `/login`), bag (→ `/checkout`), hamburger (opens drawer). Text nav links are moved into the drawer to mirror the legacy site composition.
- Drawer header mirrors the same logo block and keeps CTA + section fixtures inside the sheet.
- `Footer` pulls `marketingLinks`, `footerColumns`, `socialLinks`, `footerContact`.
- **Adding a new link?** Update `data/fixtures/navigation.ts` (e.g., add to `marketingLinks`), not the components.

## 7. Screenshots
Screenshots stored under `docs/frontend-shots/2026-04-02/`:
- `reference-mobile.svg` — stylised capture of legacy greenhub420.co.uk mobile hero/CTA.
- `new-mobile.svg` — updated UI snapshot for the rebuilt theme.

Automation + capture runbook now lives in `docs/tests/frontend-shots.md`. Follow it to regenerate PNGs (Playwright CLI + `pnpm screenshot:mobile`).

_(Playwright screenshot against the production site failed due to missing system libraries; SVG mockups are included to document visual parity.)_

## 8. Product cards
- `ProductCategoryCard` drives the homepage FLOWERS / PRE-ROLLS / VAPES row. Each card stacks a #1E2D22 badge + copy on the left and product art on the right, with a split background (top vs bottom colors) and arrow badge. Tone presets: `green` (`#101c11 → #182818`), `orange` (`#2c1608 → #3c200b`), `cream` (`#332515 → #251c11`). Replace the placeholder “GH” logo with the official asset once supplied (see TODO in fixtures).
- `ProductCollectionGrid` adopts the same split-background layout for live menu items. Category label + title/description stay on the left, image or placeholder badge on the right, arrow badge bottom-left. Palette automatically alternates between green/orange entries.
- Product art currently references CMS URLs; if higher fidelity renders arrive, update `featuredCollectionsContent` or the Strapi product records. Missing imagery defaults to an initial badge.

## 9. Testing
- Unit tests for the section kit live in `components/sections/__tests__/` (HeroClassic, HowItWorksLocker, PaymentRecommendation, ProductCollectionGrid).
- Run `pnpm test` (Vitest) + `pnpm lint` to validate changes.
