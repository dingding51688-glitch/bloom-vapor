# Admin Product Upload Runbook

This guide documents the new `/admin/products/*` workflow that lets ops publish products straight into Strapi.

## 1. Requirements

1. **Environment variables**
   - `NEXT_PUBLIC_API_BASE_URL` → e.g. `http://127.0.0.1:1338`
   - `NEXT_PUBLIC_AUTH_BASE_URL` (optional) if auth is hosted elsewhere. When unset the API base is reused.
2. **JWT**
   - Log in or register via the existing `/login` flow. The JWT issued by Strapi is shared with the admin tools (stored in `localStorage`).
   - No extra admin token is required right now; if Strapi introduces RBAC later, document the service token in `.env.example`.
3. **Strapi media permissions**
   - The authenticated role must have access to `upload` (POST `/api/upload`). Ops should already have this because the storefront uses the same JWT.

## 2. UI Overview

| Location | Description |
| --- | --- |
| `/admin/products/new` | Draft a new product by filling in details, uploading a cover, and defining weight options. |
| `/admin/products/[id]` | Edit an existing product (fetches Strapi record, including media + weight options). |

Both pages use a split layout: left = form, right = summary + notes. Required fields (title, price, cover) show inline validation. Weight options support add/remove rows, featured toggles, and price inputs. Cover + gallery upload areas accept drag/drop or clipboard paste.

## 3. API helpers

All Strapi mutations live in `lib/admin-api.ts`:

- `adminFetch` – wraps `fetch` with JWT + base URL handling.
- `createProduct(payload)` / `updateProduct(id, payload)` – sends `{ data: ... }` payloads aligned with Strapi's schema.
- `uploadImage(file)` – posts to `/api/upload` and returns the uploaded asset.

`ProductEditor` handles mapping form state → payload (weight options, gallery IDs, etc.).

## 4. Save Draft vs Publish

Strapi's `Product` type currently has `draftAndPublish: false`, so both buttons submit the same payload. "Save draft" is provided for parity with ops flows but still publishes immediately. Banner + docs call this out so no one expects hidden drafts until the backend adds proper support.

## 5. Workflow

1. Browse to `/admin/products/new` while authenticated.
2. Fill in basics (Title, hero badge, price, strain info).
3. Upload a cover (drag/drop or paste). Optional gallery images can be appended.
4. Configure weight options (label + price). Mark one as **Featured** to highlight in cards.
5. Choose a collection (optional) – list pulls from `/api/collections`.
6. Click **Save draft** (stores payload) or **Publish product** (same payload, different toast copy). You’ll be redirected to `/products/[slug]` on success.
7. Use `/admin/products/[id]` for edits; the document ID is available from Strapi’s list view or network logs.

## 6. Error handling / troubleshooting

| Symptom | Fix |
| --- | --- |
| "Authentication required" toast | Login again – JWT probably expired or missing. |
| Upload errors | Confirm the authenticated role can `POST /api/upload` and that `NEXT_PUBLIC_API_BASE_URL` points at the Strapi origin. |
| Validation errors | Required fields highlight in amber; fix them and re-run. |

## 7. Checklist updates

`docs/content-parity-checklist.md` references admin tooling; link this runbook when describing product uploads so QA can reproduce the workflow end-to-end.

---
_Last updated: 2026-04-02_
