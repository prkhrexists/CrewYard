/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    // ── Override entire borderRadius scale → sharp corners everywhere ─────
    // Keep `full` only for circular avatars/badges
    borderRadius: {
      none: "0px",
      DEFAULT: "0px",
      sm: "0px",
      md: "0px",
      lg: "0px",
      xl: "0px",
      "2xl": "0px",
      full: "9999px",
    },

    extend: {
      // ── Design-system colour tokens ────────────────────────────────────
      colors: {
        "cy-bg":     "#FBF8F2",   // warm cream — page background
        "cy-ink":    "#111111",   // near-black — text & borders
        "cy-orange": "#E8542A",   // primary accent — CTAs, active, stats
        "cy-blue":   "#2D5FE0",   // teammate ask type
        "cy-green":  "#1E8A5A",   // build_log ask type
        "cy-help":   "#E8542A",   // help ask type (same as accent)
        "cy-muted":  "#6B6B6B",   // secondary/meta copy
      },

      // ── Three-font system ──────────────────────────────────────────────
      fontFamily: {
        // Heavy editorial serif — hero h1/h2 only
        display: ['"Playfair Display"', "Georgia", "ui-serif", "serif"],
        // Monospace — nav links, tags, labels, sidebar, stats, eyebrow text
        mono:    ['"IBM Plex Mono"', "Menlo", "Consolas", "monospace"],
        // Clean neutral sans — paragraph / body copy
        sans:    ["Inter", "system-ui", "sans-serif"],
      },

      // ── Brutalist hard drop-shadow ─────────────────────────────────────
      boxShadow: {
        brutal:    "4px 4px 0 #111111",
        "brutal-sm": "2px 2px 0 #111111",
        "brutal-orange": "4px 4px 0 #E8542A",
      },

      // ── Consistent 1.5px ink border ───────────────────────────────────
      borderWidth: {
        DEFAULT: "1.5px",
        "0":  "0px",
        "2":  "2px",
        "4":  "4px",
      },
    },
  },

  plugins: [],
};
