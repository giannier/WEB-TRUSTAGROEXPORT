/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./lineas/**/*.html",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // Verde de marca (CTA, acentos)
        brand: {
          50: "#f3f8ec",
          100: "#e3f0d1",
          200: "#c9e2a8",
          300: "#a9d075",
          400: "#8dc054",
          500: "#74b33c", // primario (botones)
          600: "#5a9a2c",
          700: "#457524",
          800: "#395d22",
          900: "#314e20",
          950: "#182b0d",
        },
        // Verde bosque profundo (secciones oscuras, hero)
        forest: {
          50: "#f0f6f1",
          100: "#dbe9dd",
          200: "#b9d3bd",
          300: "#8db494",
          400: "#5d8f68",
          500: "#3d7149",
          600: "#2c5938",
          700: "#24472e",
          800: "#1c3824",
          900: "#132a1a",
          950: "#0a1c10", // casi negro verdoso
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1500px",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(19, 42, 26, 0.12)",
        card: "0 12px 40px -12px rgba(19, 42, 26, 0.18)",
        "card-hover": "0 24px 60px -16px rgba(19, 42, 26, 0.32)",
        glow: "0 0 0 1px rgba(116, 179, 60, 0.35), 0 8px 32px -8px rgba(116, 179, 60, 0.45)",
      },
      backgroundImage: {
        "hero-fade": "linear-gradient(180deg, rgba(10,28,16,0.55) 0%, rgba(10,28,16,0.35) 40%, rgba(10,28,16,0.85) 100%)",
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "shine": {
          "0%": { transform: "translateX(-120%)" },
          "60%, 100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
