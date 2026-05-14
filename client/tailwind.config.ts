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
        sage: "#8B5E3C",
        pearl: "#F3EADF",
        brand: "#F3EADF",
        "brand-dark": "#8B5E3C",
        primary: "#8B5E3C", // Darker for text/icons
        "primary-light": "#F3EADF", // The requested color
        "on-primary": "#ffffff",
        background: "#FFFBF0",
        surface: "#FFFBF0",
        "on-surface": "#3D2418",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Lexend", "sans-serif"],
        body: ["Nunito", "sans-serif"],
        label: ["Nunito", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
