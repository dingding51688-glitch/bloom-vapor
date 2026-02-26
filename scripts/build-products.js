import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const PRODUCTS_DIR = path.join(ROOT, 'data', 'products');
const OUTPUT_FILE = path.join(ROOT, 'data', 'products.json');

async function build() {
  try {
    const entries = await fs.readdir(PRODUCTS_DIR);
    const products = [];
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const filePath = path.join(PRODUCTS_DIR, entry);
      const raw = await fs.readFile(filePath, 'utf8');
      try {
        const data = JSON.parse(raw);
        products.push(data);
      } catch (err) {
        console.error(`[build-products] Failed to parse ${entry}:`, err.message);
      }
    }

    products.sort((a, b) => {
      const orderA = a.sort_order ?? 9999;
      const orderB = b.sort_order ?? 9999;
      if (orderA === orderB) {
        return String(a.name || '').localeCompare(String(b.name || ''));
      }
      return orderA - orderB;
    });

    const payload = { products };
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2) + '\n');
    console.log(`[build-products] Wrote ${products.length} products to data/products.json`);
  } catch (err) {
    console.error('[build-products] Failed:', err);
    process.exitCode = 1;
  }
}

build();
