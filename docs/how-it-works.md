# Locker How-To Notes

## Locker onboarding guide (`/guide/locker`)
- Covers three phases: before ordering (wallet + Transfer ID prep), after receiving the locker SMS (PIN/QR flow), and exceptions (jammed locker, missed window, re-delivery).
- Includes FAQ + concierge CTA. Designed to be shareable with first-time users so concierge spends less time repeating the steps.
- Linked from `/checkout` sidebar, `/support`, and the marketing `/how-it-works` page. Update those links if the URL changes.
- Content is static for now; no API calls. Edit `app/guide/locker/page.tsx` to adjust copy or add media later.

## Future enhancements
- Embed GIF/video walkthrough once creative assets are ready.
- Add dynamic Transfer ID pull for anonymous viewers (today they simply read instructions; logged-in view already surfaces ID on wallet pages).
