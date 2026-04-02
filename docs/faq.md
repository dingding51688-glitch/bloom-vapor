# FAQ Structure

## Categories
We maintain FAQs inside `data/fixtures/faq.ts`. Each category has an `id`, title, description, and entries with stable IDs. Current groups:

| ID | Description |
| --- | --- |
| locker | Access, pickup windows, missed deliveries. |
| payment | Wallet, NowPayments, bank / direct USDT. |
| orders | Tracking, locker changes, damaged parcels. |
| wallet | Credits, refunds, withdrawals. |
| referral | Earning from invite links, posters, leaderboard. |

`flatFaqEntries` is auto-generated for search/indexing.

## /faq page
- Tabs switch categories (with `category` query param in the URL for deep links).
- Search filters across question + answer text + keywords.
- Top three entries render as highlight cards; clicking “View answer” jumps to the accordion anchor.
- Same dataset feeds other surfaces (support page, how-it-works FAQ excerpt, guides). To update copy, edit the fixture once and downstream pages pick it up automatically.

## Maintenance tips
- Keep answers short (1–2 sentences). For longer walkthroughs, link to guides.
- When retiring a question, keep its `id` reserved for a while so deep links don’t break.
- If backend later provides dynamic FAQs, replace the fixture with an API fetch but keep the same shape so pages don’t need rewriting.
