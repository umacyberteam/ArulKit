import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-adaptive tokens (see CSS variables in app/globals.css) —
        // use these for anything that should flip between light/dark.
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        // Fixed tokens — always the same value regardless of theme, for
        // elements that need guaranteed contrast (e.g. text on a brass button).
        ink: "#12141A",
        paper: "#F7F5F1",
        brass: {
          DEFAULT: "#E8A33D",
          soft: "#F2C374",
          dim: "#8A5F22",
        },
        signal: {
          DEFAULT: "#4FD1C5",
          dim: "#1F5F58",
        },
        danger: "#E5695A",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(to right, rgb(var(--color-border) / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-border) / 0.6) 1px, transparent 1px)",
      },
      backgroundSize: {
        "blueprint-grid": "32px 32px",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      keyframes: {
        "caret-blink": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
