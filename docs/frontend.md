# Frontend Environment Notes

## Proxy vs direct Strapi access
- Default `.env` now sets `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_AUTH_BASE_URL` to `/api/strapi`, so the browser always talks to the Next proxy and the server-side proxy fans out to Strapi through `STRAPI_DIRECT_URL`.
- Update `STRAPI_DIRECT_URL` per environment (local Strapi, Cloudflare tunnel, production). If you need to bypass the proxy for CLI-only troubleshooting, temporarily point the PUBLIC vars back to the direct Strapi URL, but revert to `/api/strapi` before running `pnpm dev`.
- The proxy handler lives at `app/api/strapi/[...slug]/route.ts` and forwards headers/body to Strapi while scrubbing hop-by-hop headers and adding `x-forwarded-for` information. Keep this route enabled so GUI automation never calls Strapi directly.
