import type { Config } from "tailwindcss";
import matrixExtension from "./tailwind_extension";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [matrixExtension],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
