/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#6ffbbe",
        "primary-container": "#10b981",
        "on-secondary-fixed-variant": "#0b513d",
        "secondary-fixed-dim": "#95d3ba",
        "on-tertiary-fixed-variant": "#3e4943",
        "surface-container-lowest": "#ffffff",
        "tertiary-fixed": "#d9e6dd",
        "on-primary": "#ffffff",
        "error": "#ba1a1a",
        "secondary": "#2b6954",
        "primary-fixed-dim": "#4edea3",
        "outline-variant": "#bbcabf",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#131e19",
        "secondary-fixed": "#b0f0d6",
        "surface": "#f8f9ff",
        "outline": "#6c7a71",
        "surface-tint": "#006c49",
        "surface-bright": "#f8f9ff",
        "secondary-container": "#adedd3",
        "surface-dim": "#cbdbf5",
        "on-tertiary-container": "#303c36",
        "background": "#f8f9ff",
        "on-secondary": "#ffffff",
        "tertiary-fixed-dim": "#bdcac1",
        "on-primary-fixed": "#002113",
        "surface-container-high": "#dce9ff",
        "on-background": "#0b1c30",
        "tertiary-container": "#99a69e",
        "on-surface": "#0b1c30",
        "primary": "#006c49",
        "inverse-primary": "#4edea3",
        "tertiary": "#55615a",
        "surface-container-low": "#eff4ff",
        "on-surface-variant": "#3c4a42",
        "on-error": "#ffffff",
        "inverse-surface": "#213145",
        "on-primary-container": "#00422b",
        "surface-container-highest": "#d3e4fe",
        "on-error-container": "#93000a",
        "on-secondary-container": "#306d58",
        "on-primary-fixed-variant": "#005236",
        "surface-variant": "#d3e4fe",
        "on-secondary-fixed": "#002117",
        "inverse-on-surface": "#eaf1ff",
        "error-container": "#ffdad6",
        "surface-container": "#e5eeff"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      spacing: {
        "card-gap": "24px",
        base: "8px",
        "container-padding": "32px",
        "section-margin": "48px",
        gutter: "24px"
      },
      fontFamily: {
        "neural-insight": ["Geist", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "display-metric": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"]
      },
      fontSize: {
        "neural-insight": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "display-metric": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }]
      }
    }
  },
  plugins: [],
}
