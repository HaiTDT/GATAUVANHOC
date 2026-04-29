import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        rosewood: "#7c2d3a",
        sage: "#6f7f63",
        pearl: "#f8f5f0",
        "on-tertiary": "#ffffff",
        "on-primary": "#ffffff",
        "on-tertiary-container": "#ffc8c8",
        "primary-container": "#106a42",
        "tertiary-fixed": "#ffdad9",
        "surface-container-highest": "#e2e2e2",
        surface: "#f9f9f9",
        "on-secondary-fixed-variant": "#783200",
        "on-background": "#1a1c1c",
        "on-secondary-container": "#5c2400",
        error: "#ba1a1a",
        "secondary-fixed": "#ffdbca",
        "on-surface-variant": "#3f4942",
        "surface-container-high": "#e8e8e8",
        "secondary-fixed-dim": "#ffb690",
        "primary-fixed-dim": "#86d7a6",
        primary: "#00502f",
        "on-tertiary-fixed": "#3e030c",
        "surface-variant": "#e2e2e2",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "surface-container-lowest": "#ffffff",
        "on-error": "#ffffff",
        "on-surface": "#1a1c1c",
        "on-primary-fixed-variant": "#005230",
        "secondary-container": "#fd761a",
        tertiary: "#752d32",
        secondary: "#9d4300",
        "tertiary-container": "#934448",
        background: "#f9f9f9",
        "outline-variant": "#bec9bf",
        "on-secondary-fixed": "#341100",
        "inverse-surface": "#2f3131",
        "on-primary-fixed": "#002111",
        "inverse-on-surface": "#f1f1f1",
        "on-tertiary-fixed-variant": "#782f34",
        "tertiary-fixed-dim": "#ffb3b4",
        "inverse-primary": "#86d7a6",
        "surface-bright": "#f9f9f9",
        "primary-fixed": "#a2f4c1",
        "surface-container": "#eeeeee",
        "on-secondary": "#ffffff",
        outline: "#6f7a71",
        "on-primary-container": "#95e7b5",
        "surface-dim": "#dadada",
        "surface-container-low": "#f3f3f3",
        "surface-tint": "#136c44"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      fontFamily: {
        headline: ["Be Vietnam Pro", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
