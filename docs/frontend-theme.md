# Frontend Theme & Component Kit

_Branch: `feature/fe-home-product`_

## 1. Tokens
- Defined in `app/globals.css` + `tailwind.config.ts` (night/plum/jade/ink palettes, spacing scale, radius, shadows, fonts).
- Use Tailwind shorthands (`bg-night-950`, `px-sm`, `shadow-surface`, etc.) to stay aligned with locker brand.

## 2. UI Primitives (`components/ui/`)
| Component | Props | Notes |
| --- | --- | --- |
| `Button` | `variant` (`primary`/`secondary`/`ghost`), `size`, `fullWidth`, `asChild` | Handles focus rings + disabled state. |
| `Card` | `variant`, `padding`, optional `title/description/footer` | Padding map: `sm → p-sm`, `md → p-md`, `lg → p-lg`. |
| `Input` | `isInvalid`, `disabled` | Dark-mode input w/ warning + disabled styling. |

## 3. Section Components (`components/sections/`)
- `HeroClassic`, `HowItWorksLocker`, `ProductCollectionGrid`, `PaymentRecommendation`.
- Default copy + sample data live in `data/fixtures/marketing.ts` (import + override as needed).

## 4. Navigation Shell (`components/navigation/`)
| Component | Purpose | Notes |
| --- | --- | --- |
| `DesktopHeader` | Main header w/ logo, menu, auth state, CTA buttons | Uses `primaryNav`, `ctaButtons`; hamburger toggles `MobileDrawer` on mobile. |
| `MobileDrawer` | Slide-in drawer for small screens | Consumes `drawerSections`, `drawerQuickLinks`, CTA config; closes on link tap. |
| `Footer` | Global footer columns + contact | Pulls `footerColumns`, `footerContact`, `socialLinks`; stacks vertically on mobile, multi-column on desktop. |
| `NavLink` | Active-aware link helper | Accepts `match: "exact" | "prefix"`; highlights current route with plum underline (desktop) or bold text (drawer). |

Usage in `app/layout.tsx`:
```tsx
import { DesktopHeader, Footer } from "@/components/navigation";

<DesktopHeader />
<main>{children}</main>
<Footer />
```

## 5. Fixtures (`data/fixtures/`)
- `marketing.ts` — hero/copy/product/payment defaults for landing sections.
- `navigation.ts` — primary nav items (with match rules), CTA buttons, drawer sections + quick links, footer columns, social links, and contact info.

## 6. Testing Checklist
- `pnpm lint`
- `pnpm test` (currently outputs placeholder message — keep green)
- `pnpm dev` for visual smoke tests when wiring new UI pieces.
- Include this doc link in PR descriptions so downstream branches know how to rebase & reuse shell components.
