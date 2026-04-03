# Frontend Environment Notes

## Proxy vs direct Strapi access
- Default `.env` now sets `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_AUTH_BASE_URL` to `/api/strapi`, so the browser always talks to the Next proxy and the server-side proxy fans out to Strapi through `STRAPI_DIRECT_URL`.
- Update `STRAPI_DIRECT_URL` per environment (local Strapi, Cloudflare tunnel, production). If you need to bypass the proxy for CLI-only troubleshooting, temporarily point the PUBLIC vars back to the direct Strapi URL, but revert to `/api/strapi` before running `pnpm dev`.
- The proxy handler lives at `app/api/strapi/[...slug]/route.ts` and forwards headers/body to Strapi while scrubbing hop-by-hop headers and adding `x-forwarded-for` information. Keep this route enabled so GUI automation never calls Strapi directly.

## Environment setup checklist
1. **Strapi + tunnel** – run Strapi locally on `:1337` (or expose it via Cloudflared). Point `STRAPI_DIRECT_URL` to whichever host is reachable by the Next dev server.
2. **Proxy defaults** – keep `NEXT_PUBLIC_API_BASE_URL=/api/strapi` and `NEXT_PUBLIC_AUTH_BASE_URL=/api/strapi`. Next's API route (`app/api/strapi/[...slug]`) resolves these relative URLs to `STRAPI_DIRECT_URL`, so both local browsers and Cloudflare tunnels stay in sync.
3. **Internal origin** – `NEXT_PUBLIC_SITE_URL` / `NEXT_INTERNAL_BASE_URL` should match the URL you open in the browser (usually `http://localhost:3000`). They are used when server-only helpers need an absolute origin.
4. **GUI QA** – set `QA_BASE_URL` (used by `scripts/gui-e2e.mjs`) to the tunnel that exposes the running Next dev server, e.g. `https://rpg-amendments-camping-coleman.trycloudflare.com`.
5. **Verification** – run `pnpm dev`, hit `http://localhost:3000/wallet`, and confirm Network requests target `/api/strapi/...` (all Strapi calls go through the proxy). If you need CLI proof, `curl http://localhost:3000/api/strapi/api/products` should return the same payload as calling Strapi directly.

