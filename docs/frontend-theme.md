# Frontend Theme & Component Kit

_Branch: `feature/fe-home-product`_

## 1. Tokens
- Defined in `app/globals.css` + `tailwind.config.ts` (night/plum/jade/ink palettes, spacing scale, radius, shadows, fonts).
- Use Tailwind shorthands (`bg-night-950`, `px-sm`, `shadow-surface`, etc.) to stay consistent with locker brand.

## 2. UI Primitives (`components/ui/`)
| Component | Props | Notes |
| --- | --- | --- |
| `Button` | `variant` (`primary`/`secondary`/`ghost`), `size`, `fullWidth`, `asChild` | Handles focus rings + disabled state. |
| `Card` | `variant`, `padding`, optional `title/description/footer` | Padding map: `sm → p-sm`, `md → p-md`, `lg → p-lg`. |
| `Input` | `isInvalid`, `disabled` | Dark mode input w/ warning + disabled styles. |

## 3. Section Components (`components/sections/`)
- `HeroClassic`, `HowItWorksLocker`, `ProductCollectionGrid`, `PaymentRecommendation`.
- Default copy + sample data live in `data/fixtures/marketing.ts` (import + override as needed).

## 4. Navigation Shell (`components/navigation/`)
| Component | Purpose | Notes |
| --- | --- | --- |
| `DesktopHeader` | Desktop header w/ menu, CTA, auth state | Uses `primaryNav`, `ctaButtons`; opens the drawer on mobile. |
| `MobileDrawer` | Slide-in drawer for mobile menus | Sections defined in `drawerSections`, includes CTA buttons. |
| `Footer` | Global footer columns + disclaimer | Data from `footerColumns`, `footerContact`. |
| `NavLink` | Active-aware link helper | Highlights current route via `usePathname`. |

Usage (already wired in `app/layout.tsx`):
```tsx
import { DesktopHeader, Footer } from "@/components/navigation";

<DesktopHeader />
<main>{children}</main>
<Footer />
```

## 5. Fixtures (`data/fixtures/`)
- `marketing.ts` — hero/copy/product/payment defaults.
- `navigation.ts` — menu links, CTA buttons, drawer sections, footer columns/contact info.

## 6. Testing Checklist
- `pnpm lint`
- `pnpm test` (currently prints stub message; keep green)
- Include this doc link in PR descriptions so downstream branches know how to rebase + reuse shell components.
