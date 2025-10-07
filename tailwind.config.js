/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066FF",
        secondary: "#1E293B",
        accent: "#00D9FF",
        surface: "#FFFFFF",
        background: "#F8FAFC",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        "display": ["31px", { lineHeight: "1.2" }],
        "h1": ["31px", { lineHeight: "1.2" }],
        "h2": ["25px", { lineHeight: "1.3" }],
        "h3": ["20px", { lineHeight: "1.4" }],
        "body": ["16px", { lineHeight: "1.5" }],
        "small": ["13px", { lineHeight: "1.5" }]
      },
      boxShadow: {
        "card": "0 2px 4px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.1)"
      }
    }
  },
  plugins: []
};