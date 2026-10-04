

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        brand: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ink: {
          DEFAULT: "#175A67",
          soft: "#2A707C",
          dark: "#0F454F",
        },
        cream: {
          DEFAULT: "#EAE3DE",
          soft: "#F5EFEB",
          dark: "#0B1E22",
        },
        primary: {
          DEFAULT: "#175A67",
          foreground: "#EAE3DE",
          50: "#f0f7f8",
          100: "#dbeef1",
          200: "#b8dce3",
          300: "#86c1cd",
          400: "#4fa0b0",
          500: "#175A67",
          600: "#134e5a",
          700: "#0F454F",
          800: "#0b2e35",
          900: "#06181c",
        },
        urgency: {
          critical: "#ef4444", // RED
          high: "#f97316",     // ORANGE
          medium: "#eab308",   // YELLOW
          low: "#22c55e",      // GREEN
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
