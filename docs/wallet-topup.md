# Wallet Top-up Flow

This document explains how the new wallet screens interact with Strapi so ops and QA can simulate a top-up end to end.

## 1. Endpoints

| Purpose | Method / Path | Notes |
| --- | --- | --- |
| List tiers | `GET /api/topup-tiers?filters[isActive][$eq]=true&sort=minAmountUsdt:asc` | Returns Strapi collection of tier records. Frontend maps each entry into `{ id, title, minAmountUsdt, bonusPercent }`. |
| Create intent | `POST /api/wallet/recharge` | Body: `{ amount, chain }` (chain defaults to `TRC20`). Strapi calls NowPayments and creates a `topup` entry. Response: `{ success, topup: { id, orderCode, invoiceUrl, amount, chain } }`. |
| Poll status | `GET /api/topups/:id` | Used to refresh state until `status` becomes `confirmed`/`expired`/`failed`. Frontend polls every ~7s. |
| Wallet snapshot | `GET /api/wallet/balance`, `GET /api/wallet/transactions` | Existing endpoints reused to refresh `/wallet`. |

If any endpoint is unavailable (e.g., dev Strapi offline), the UI falls back to hard-coded sample tiers/transactions and displays a warning banner.

## 2. Transfer ID (compliance requirement)

Every authenticated profile now exposes `walletTransferId` (fallback to Strapi `documentId`). `/wallet`, `/wallet/topup`, and `/wallet/withdraw` surface the ID with a copy button and remind the user to include it in bank/USDT payment references so ops can match funds.

## 3. Screens

### `/wallet`
- Shows available balance, lifetime top-up, and bonus figures.
- Displays the Transfer ID banner + copy button.
- Includes “Top up” and “Withdraw” CTAs linking to the respective flows.
- Transaction list auto-refreshes every 90s. When the API errors, a fallback sample history renders for QA screenshots.

### `/wallet/topup`
1. **Amount** – pick a tier or switch to “Custom amount”. Minimum transfer (custom or manual) is **£20 GBP**. Fee text explains the 2% ops handling fee.
2. **Method** – three cards:
   - **NowPayments** (default) → calls `createTopupIntent`, shows invoice link + live status card.
   - **Bank transfer** → displays Faster Payments details from `.env` (`NEXT_PUBLIC_BANK_*`) and explicitly asks for the Transfer ID in the payment reference.
   - **Direct USDT** → shows TRC20/ERC20 address + optional QR URL (`NEXT_PUBLIC_TOPUP_USDT_*`) and reminds users to DM concierge with the Transfer ID + TX hash.
3. **Instructions** – clicking “Get payment link” (or “Show manual instructions”) renders the method-specific panel + optional countdown.

Status polling stops once the Strapi record returns `confirmed`, `failed`, `expired`, or `refunded`. Manual methods skip the API call and simply expose the instructions; ops will reconcile those manually.

## 4. Environment variables

```
NEXT_PUBLIC_BANK_ACCOUNT_NAME
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER
NEXT_PUBLIC_BANK_SORT_CODE
NEXT_PUBLIC_TOPUP_USDT_ADDRESS
NEXT_PUBLIC_TOPUP_USDT_QR
```

All of them are optional (fallback strings are shown in the UI, but update them with production values ASAP).

## 5. QA checklist

1. Log in so the JWT is stored (AuthProvider auto-attaches it to every fetch).
2. Confirm the Transfer ID banner renders and the copy button works.
3. Visit `/wallet/topup`, select a tier, choose **NowPayments**, click **Get payment link**.
4. Confirm the invoice link opens (requires Strapi + NowPayments credentials). If Strapi is offline, note the warning and skip.
5. Observe the status pill changes when the Strapi `topup` record is updated (simulate via Strapi admin panel if needed).
6. For bank/crypto methods, verify that the instructions surface `.env` data + Transfer ID reminders.
7. Head back to `/wallet` and use the refresh buttons to reload balance + activity.

## 6. Guides & references

- `/guide/payment` distills the wallet/NowPayments/manual transfer steps for new users. Both `/wallet` and `/wallet/topup` link to it so concierge can share a single URL.

## 7. Known limitations

- Strapi `Product` currently lacks draft/publish so “Save draft” behaves like publish – documented in `docs/admin-product.md`.
- Wallet recharge relies on the `/api/wallet/recharge` controller (NowPayments). If the backend introduces `/api/wallet/topups`, update `lib/wallet-api.ts` accordingly.
- Direct USDT + bank transfers do not call Strapi yet — they display instructions only. Ops still need to credit those manually.

_Last updated: 2026-04-02_
