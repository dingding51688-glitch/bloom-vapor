# Referral Dashboard

## API wrappers
- `lib/referral-api.ts`
  - `getReferralSummary()` → `GET /api/referrals/me` ⇒ `{ code, link, totalInvites, activeLockers, bonusEarned }`
  - `getReferralEvents({ page, pageSize })` → `GET /api/referral-events/mine` (returns invites + pagination)
  - `getCommissionTransactions({ page, pageSize })` → `GET /api/commission-transactions/mine`
- All calls reuse the JWT from `AUTH_TOKEN_KEY` and fallback to sample data if Strapi returns 4xx/5xx.

## /referral page layout
1. **Hero card**
   - Shows invite link, copy button (Clipboard API), share buttons (Telegram / WhatsApp), success toast text.
2. **Stats tiles**
   - Total invites, active lockers, lifetime bonus (GBP).
3. **History tabs**
   - Invites tab: email, locker, status, timestamp (paginates via SWR key `["referral-events", page]`).
   - Commission tab: payout reference, amount, status pill, timestamp. Pagination shares the same HistoryTable component.
4. **FAQ / CTA**
   - Step list describing how referrals unlock commission + concierge contact button + disabled “poster generator” placeholder.

## /invite landing page
Public-facing explainer at `/invite` (SEO-friendly, no auth required):
- Hero: referral summary + CTA buttons (copy invite link, register). If `?ref=CODE` exists, shows banner + register button prefilled with the code.
- Reward breakdown: cards describing click reward (£0.30) + lifetime 10%. Example payout tiles illustrate potential earnings.
- Steps: three-step flow (copy link → friend registers → earn). Styled with gradient cards.
- Testimonial + FAQ: highlight best practices, payout timing, compliance reminders.
- Concierge CTA: reuses `contactChannels` to link to Telegram support and remind people to use their Transfer ID / referral code.
- The page can accept manual code entry when no query param is supplied (Input field updates CTA + share link preview).

## Poster generator (`/referral/poster`)
- Requires login so we can inject the user’s referral link + Transfer ID.
- Two templates (locker green portrait / night neon landscape) plus custom headline, subline, footer note, accent colour, avatar toggle.
- Live preview renders inside a fixed-size div; export handled via `html-to-image` (PNG/JPEG). QR code generated via `qrcode.react` pointing at the invite URL.
- Controls remind users of the £20 minimum payout and emphasise sampling Transfer ID in references.
- Referral dashboard CTA now links to the poster page.

## Interactions
- Copy button uses `navigator.clipboard.writeText`. On success/failure, inline toast text updates for 2.5s.
- Share buttons open Telegram/WhatsApp share URLs with prefilled copy.
- Tabs + pagination are client-only (no page reload).
- When Strapi endpoints fail, fallback fixtures render so QA can preview layout without live data.

## Analytics tier-2
- `ReferralSummary` now returns: `clicks`, `clickPayoutTotal`, `registrations`, `topups`, `conversionRate`, `ctr`, `monthCommission`.
- CTR = clicks / impressions (API should deliver `ctr` directly, fallback computes from sample data).
- Conversion = topups / clicks.
- Lifetime commission splits: click rewards (`clickPayoutTotal` @ £0.30/click) vs order rewards (`bonusEarned - clickPayoutTotal`).
- Commission history table uses `CommissionTransaction` (fields: amount, status/type, sourceInvitee, createdAt).
- Referral page listens for `NotificationProvider` messages of type `commission_award` to highlight pending rewards.

## Tracking flow
- Query param `?ref=CODE` 捕获后由 `ReferralTrackingProvider` 写入 cookie/localStorage (`referralCode`，30 天)。
- Provider 在首次检测到 code 时调用 `/api/referral/click`，24 小时内同一 code 去重（localStorage: `referralClick:<code>`）。
- 成功点击会记录 `referralClick:last`，失败写入 `referralClick:error` 以便 UI 给出刷新提示。
- /register → `/api/auth/register`、/checkout → `/api/orders/checkout` 均在 payload 中附带 `referralCode`，后端即可发放 £0.30/click + 好友订单金额 10% 的奖励。
