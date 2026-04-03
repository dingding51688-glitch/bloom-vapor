import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    css: true,
    include: [
      "components/**/*.test.{ts,tsx}",
      "components/**/__tests__/**/*.{test,spec}.{ts,tsx}"
    ],
    alias: {
      "@": path.resolve(__dirname, ".")
    },
    coverage: {
      reporter: ["text", "html"],
      include: ["components/sections/**/*.{ts,tsx}"]
    }
  }
});
