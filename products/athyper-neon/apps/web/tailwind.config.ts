import type { Config } from "tailwindcss";
import preset from "@neon/theme/tailwind.preset";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [preset as any],
  theme: { extend: {} },
  plugins: []
} satisfies Config;
