import { chromium, devices } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_PAGES = ["/", "/contact", "/faq", "/shipping", "/terms"];

const args = process.argv.slice(2);

function readOption(names, fallback) {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const prefix = `--${name}=`;
    const match = args.find((arg) => arg.startsWith(prefix));
    if (match) {
      return match.slice(prefix.length);
    }
    const envKey = name.toUpperCase().replace(/-/g, "_");
    if (process.env[envKey]) {
      return process.env[envKey];
    }
  }
  return fallback;
}

const baseUrl = readOption(["base", "base-url"], process.env.APP_BASE_URL || "http://127.0.0.1:3000");
const outputDir = readOption(["output", "output-dir"], process.env.OUTPUT_DIR || "docs/frontend-shots/2026-04-02");
const pagesArg = readOption("pages", process.env.SHOT_PATHS || DEFAULT_PAGES.join(","));
const waitMs = Number(readOption(["delay", "wait"], process.env.SHOT_WAIT || "1200"));
const width = Number(readOption("width", process.env.SHOT_WIDTH || "375"));
const height = Number(readOption("height", process.env.SHOT_HEIGHT || "812"));
const isDryRun = args.includes("--dry-run") || process.env.SHOT_DRY_RUN === "1";

function slugFromRoute(route) {
  if (route === "/" || route === "") return "home";
  const cleaned = route.replace(/^\/+/, "").replace(/\/+$/g, "");
  return cleaned.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "page";
}

function parsePage(entry) {
  const [rawRoute, rawName] = entry.split("@");
  const route = rawRoute?.trim() || "/";
  const safeName = rawName?.trim() || slugFromRoute(route);
  return {
    route,
    fileName: safeName.endsWith(".png") ? safeName : `mobile-${safeName}.png`
  };
}

const targets = pagesArg
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .map(parsePage);

async function ensureOutputDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function capture() {
  if (!targets.length) {
    console.warn("No pages supplied — nothing to capture.");
    return;
  }

  await ensureOutputDir(outputDir);

  if (isDryRun) {
    for (const target of targets) {
      const url = new URL(target.route, baseUrl).toString();
      console.log(`[dry-run] ${url} → ${path.join(outputDir, target.fileName)}`);
    }
    return;
  }

  const iphoneProfile = devices["iPhone 13 Pro"];
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      ...iphoneProfile,
      viewport: { width, height }
    });

    for (const target of targets) {
      const url = new URL(target.route, baseUrl).toString();
      const filePath = path.join(outputDir, target.fileName);
      const page = await context.newPage();
      console.log(`Capturing ${url} → ${filePath}`);
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(waitMs);
        await page.screenshot({ path: filePath, fullPage: true });
      } catch (error) {
        console.error(`Failed to capture ${url}`, error.message ?? error);
      } finally {
        await page.close();
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error("Screenshot capture failed", error);
  process.exitCode = 1;
});
