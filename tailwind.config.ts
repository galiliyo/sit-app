import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "hsl(40, 10%, 90%)",
        card: "#141414",
        "card-foreground": "hsl(40, 10%, 90%)",
        primary: "hsl(40, 10%, 90%)",
        "primary-foreground": "#0a0a0a",
        secondary: "#242424",
        "secondary-foreground": "hsl(40, 10%, 75%)",
        muted: "#1f1f1f",
        "muted-foreground": "hsl(0, 0%, 45%)",
        accent: "hsl(36, 60%, 50%)",
        "accent-foreground": "#0a0a0a",
        destructive: "hsl(0, 60%, 45%)",
        success: "hsl(152, 50%, 42%)",
        border: "#292929",
      },
      fontFamily: {
        sans: ["DMSans"],
        mono: ["JetBrainsMono"],
      },
    },
  },
  plugins: [],
} satisfies Config;
