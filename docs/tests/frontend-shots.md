# Frontend Screenshot Runbook

This guide documents the new Playwright-based mobile screenshot pipeline. It captures `/`, `/contact`, `/faq`, `/shipping`, `/terms` (and any additional pages you pass in) with a 375×812 viewport.

## 1. Requirements

1. Install dependencies:
   ```bash
   pnpm install
   pnpm dlx playwright install chromium --with-deps
   ```
   > `--with-deps` installs the Linux system packages that Chromium needs (GTK4, libgst*, libxslt, etc.). Without them the capture step aborts, as seen on this host earlier.
2. Ensure `pnpm dev` can serve the site locally (defaults to <http://127.0.0.1:3000/>).

## 2. Default workflow (`pnpm screenshot:mobile`)

```bash
pnpm screenshot:mobile
```

This script:
1. Starts the dev server (`pnpm dev`).
2. Waits until `http://127.0.0.1:3000` responds.
3. Runs `node scripts/capture-shots.mjs` with default settings (375×812 viewport, `/ /contact /faq /shipping /terms`).
4. Saves PNGs to `docs/frontend-shots/2026-04-02/` following the pattern `mobile-<slug>.png` (e.g., `/contact` → `mobile-contact.png`).

Stop the run with `Ctrl+C` — `start-server-and-test` will clean up the dev server.

## 3. Customising the capture script

`scripts/capture-shots.mjs` accepts CLI flags or environment variables:

| Flag / Env             | Description                                              | Default |
| ---------------------- | -------------------------------------------------------- | ------- |
| `--base` / `APP_BASE_URL` | Base URL to screenshot                                 | `http://127.0.0.1:3000` |
| `--output` / `OUTPUT_DIR` | Directory for PNG files                                | `docs/frontend-shots/2026-04-02` |
| `--pages` / `SHOT_PATHS`  | Comma-separated routes (optionally `route@file-name`)  | `/,/contact,/faq,/shipping,/terms` |
| `--width`, `--height`     | Viewport size in px                                    | `375×812` |
| `--delay`                 | Extra wait time after load (ms)                        | `1200` |
| `--dry-run` / `SHOT_DRY_RUN=1` | Log planned captures without launching Playwright | disabled |

Examples:

```bash
# Capture additional marketing pages to a dated folder
OUTPUT_DIR="docs/frontend-shots/$(date +%Y-%m-%d)" \
  node scripts/capture-shots.mjs --pages "/,/contact,/faq,/shipping,/terms,/about@mobile-about"

# Dry-run (useful on hosts without GTK/libgst deps)
node scripts/capture-shots.mjs --dry-run
```

Routes can specify custom filenames via `route@slug`. If no filename is supplied, the slug is derived from the route (e.g., `/legal/returns` → `mobile-legal-returns.png`).

## 4. Known issues / troubleshooting

| Symptom | Fix |
| --- | --- |
| `Host system is missing dependencies to run browsers… libgtk-4.so.1 …` | Run `pnpm dlx playwright install chromium --with-deps` on a desktop/CI image that has package install rights. For headless servers, install the GTK/GStreamer packages listed in the error or run the script from a workstation. |
| `Executable doesn't exist at .../pw_run.sh` | Playwright browsers were not installed after updating dependencies. Re-run `pnpm dlx playwright install chromium --with-deps`. |
| Script exits immediately | Ensure the dev server is reachable; override `APP_BASE_URL` if it serves on another port. |

## 5. Outputs

Screenshots are stored under `docs/frontend-shots/<date>/`. Each PNG name maps to the captured route, making diffs easy to track. Commit both the images and the updated runbook when regenerating shots.

> Note: On this WSL host the GTK/GStreamer libraries are still missing, so only `--dry-run` was executed (see logs in the latest QA run). The tooling is ready for any machine that satisfies the Playwright prerequisites above.
