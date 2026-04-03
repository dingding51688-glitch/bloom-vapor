# Wallet Withdrawal Flow

## 1. API endpoints

| Action | Method & Path | Notes |
| --- | --- | --- |
| Create | `POST /api/withdrawal-requests/account` | Body: `{ amount, currency, payoutMethod, payoutDetails, note? }`. Requires JWT. Returns `{ success, request }`. |
| List | `GET /api/withdrawal-requests/account?page=1&pageSize=10` | Pagination used by `/wallet/withdraw/history`. |

Requests are authenticated via the same Users-Permissions JWT stored by `AuthProvider`. The frontend wrapper lives in `lib/withdrawal-api.ts`.

## 2. `/wallet/withdraw`

- 3-step wizard (Amount → Payout → Review) with inline validation.
- Constants: `MIN_WITHDRAWAL = £20`, `FEE_PERCENT = 2%`. Fee + net payout are shown live under the amount field.
- Transfer ID banner appears above the wizard (shared with `/wallet` / `/wallet/topup`) so users remember to include it when ops requests screenshots or reference codes.
- Supported payout methods and fields:
  - **Bank transfer**: account name, account number, sort code, bank name (reference reminder uses Transfer ID by default).
  - **USDT transfer**: network (TRC20/ERC20) + address (reminds users to DM concierge with TX hash + Transfer ID).
  - **Locker wallet**: recipient handle + memo (for internal transfers).
- On submit we call `createWithdrawalRequest()`. Success banner shows the reference and links to `/wallet/withdraw/history`.
- If the API errors out (e.g., backend offline), the error text is displayed below the form.

## 3. `/wallet/withdraw/history`

- Uses `useSWRInfinite` + `listWithdrawalRequests` to fetch 10 rows at a time.
- Filter tabs: All / Pending / Approved / Paid / Rejected (status groups). Client-side filtering; Refresh button refetches the first page.
- Cards show reference, amount, method, status pill, created timestamp, first few payout detail fields, and optional notes.
- When the API is unreachable, we fall back to `withdrawalFixture` (documented sample data) so QA can still see the layout.

## 4. Validation

- Amount must be between £50 and the user’s available wallet balance (queried from `/api/wallet/balance`).
- Required payout fields depend on the method; missing inputs block Step 2/3 transitions.
- The form reminds users that concierge will verify within ~12h and may request screenshots.

## 5. TODO / Backend dependencies

- Ensure Strapi exposes the exact endpoints (`/api/withdrawal-requests/account`). If the path changes, update `lib/withdrawal-api.ts` accordingly.
- Ops needs to configure the actual fee/minimum rules; adjust the constants to match production.
- Once Strapi returns fee/net breakdown directly, wire those fields into the success card.

_Last updated: 2026-04-02_
