/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Escala numérica útil para hover/active states
          50:  "color-mix(in srgb, hsl(var(--primary)) 10%, white)",
          100: "color-mix(in srgb, hsl(var(--primary)) 20%, white)",
          200: "color-mix(in srgb, hsl(var(--primary)) 35%, white)",
          300: "color-mix(in srgb, hsl(var(--primary)) 50%, white)",
          400: "color-mix(in srgb, hsl(var(--primary)) 70%, white)",
          500: "hsl(var(--primary))",
          600: "color-mix(in srgb, hsl(var(--primary)) 85%, black)",
          700: "color-mix(in srgb, hsl(var(--primary)) 70%, black)",
          800: "color-mix(in srgb, hsl(var(--primary)) 55%, black)",
          900: "color-mix(in srgb, hsl(var(--primary)) 35%, black)",
          950: "color-mix(in srgb, hsl(var(--primary)) 20%, black)",
        },

        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Nuevos tokens ──────────────────────────────────
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },

        // Burbujas de chat (outgoing / incoming)
        "bubble-out": {
          DEFAULT:    "hsl(var(--bubble-out))",
          foreground: "hsl(var(--bubble-out-foreground))",
        },
        "bubble-in": {
          DEFAULT:    "hsl(var(--bubble-in))",
          foreground: "hsl(var(--bubble-in-foreground))",
        },

        // Sidebar
        sidebar: {
          DEFAULT:    "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: {
            DEFAULT:    "hsl(var(--sidebar-primary))",
            foreground: "hsl(var(--sidebar-primary-foreground))",
          },
          accent: {
            DEFAULT:    "hsl(var(--sidebar-accent))",
            foreground: "hsl(var(--sidebar-accent-foreground))",
          },
          border:     "hsl(var(--sidebar-border))",
          ring:       "hsl(var(--sidebar-ring))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
