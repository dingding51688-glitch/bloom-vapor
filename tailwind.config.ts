import type { Config } from "tailwindcss";

const colors = {
  base: {
    DEFAULT: "#050505",
    soft: "#070707",
    alt: "#0f1412"
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255,255,255,0.8)",
    muted: "rgba(255,255,255,0.6)"
  },
  cta: {
    start: "#0d5b3f",
    end: "#13a86b"
  },
  orange: {
    start: "#af5a13",
    end: "#f2a33a"
  }
};

const spacing = {
  sectionX: "var(--gh-spacing-section-x)",
  sectionY: "var(--gh-spacing-section-y)",
  3.5: "0.875rem",
  4.5: "1.125rem"
};

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./docs/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ["Geist", "Geist Sans", "Space Grotesk", "Inter", "system-ui", "sans-serif"],
        display: ["Geist", "Geist Sans", "Space Grotesk", "Inter", "system-ui", "sans-serif"]
      },
      spacing,
      borderRadius: {
        lg: "var(--gh-radius-lg)",
        card: "var(--gh-radius-card)",
        pill: "var(--gh-radius-pill)"
      },
      boxShadow: {
        header: "var(--gh-shadow-header)",
        card: "var(--gh-shadow-card)",
        cta: "var(--gh-shadow-cta)"
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg,#050505,#0f1412)",
        "cta-gradient": "linear-gradient(135deg,#0d5b3f,#13a86b)",
        "card-green": "linear-gradient(160deg,#0d5b3f,#13a86b)",
        "card-orange": "linear-gradient(160deg,#af5a13,#f2a33a)"
      }
    }
  },
  plugins: []
};

export default config;
