/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        foreground: "#F5F5F5",
        surface: "#1A1A1A",
        "accent-blue": "#00B4FF",
        "accent-gold": "#FFD700",
        "text-secondary": "#888888",
        primary: {
          DEFAULT: "#00B4FF",
          foreground: "#0D0D0D",
        },
        secondary: {
          DEFAULT: "#FFD700",
          foreground: "#0D0D0D",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#888888",
        },
        border: "rgba(0, 180, 255, 0.15)",
      },
      fontFamily: {
        heading: ["var(--font-orbitron)", "sans-serif"],
        sans: ["var(--font-rajdhani)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(0, 180, 255, 0.1)",
        "glow-strong": "0 0 30px rgba(0, 180, 255, 0.25)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #00B4FF 0%, #0088CC 50%, #FFD700 100%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 4px rgba(0, 180, 255, 0.4))",
            opacity: "1",
          },
          "50%": {
            filter: "drop-shadow(0 0 20px rgba(0, 180, 255, 0.8))",
            opacity: "0.9",
          },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "typing-dot": "typing-dot 1.4s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out forwards",
        blink: "blink 1.5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
