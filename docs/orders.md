# Orders History UI

This page documents the `/orders` screen and how it interacts with Strapi.

## 1. Data source

- Primary: `listMyOrders({ page, pageSize })` in `lib/orders-api.ts`, which calls `GET /api/orders/mine` with the current JWT (AuthProvider).
- Pagination: `pageSize=10` per SWR infinite page. Fetch stops when a page returns fewer rows.
- Offline fallback: when the API fails before any data is returned, the UI shows a warning plus `ordersFixture` sample data so QA can still preview the layout.

## 2. Filters

Tabs at the top map to status groups:

| Tab | Included statuses |
| --- | --- |
| All | everything |
| Active | `pending`, `paid`, `processing`, `awaiting_confirmations` |
| Fulfilled | `dispatched`, `delivered`, `completed` |
| Canceled | `canceled`, `rejected`, `refunded` |

Selecting a tab filters the in-memory list (no extra API call). The “Refresh” button revalidates the first page.

## 3. Card layout

Each order card shows:
- Reference (`#GH-2401`), amount, currency
- Status pill (colour-coded)
- Created timestamp
- Up to two item summaries (qty + weight + line total) with a “+N more” placeholder
- Pickup postcode + payment option footnote
- CTA → `/orders/[reference]`

Hover states on desktop lift the border; on mobile the CTA sits below the summary.

## 4. Summary row

Top of the page displays:
- Total orders (count of fetched list or fallback sample)
- Wallet spend (sum of `totalAmount`)
- Last locker (locker postcode + timestamp of the latest order)

These values update as soon as data/filters change.

## 5. Empty & error states

- Not signed in → `StateMessage` prompting login.
- API error before data → error banner + sample orders.
- Filter with zero results → empty state + “Shop now” CTA.

## 6. Pagination

“Load more” fetches the next page via `useSWRInfinite`. The button disappears once the server returns < pageSize rows. A subtle spinner text (“Loading…”) appears while the next chunk streams in.

_Last updated: 2026-04-02_
