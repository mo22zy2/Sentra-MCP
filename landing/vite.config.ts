import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Project Pages serve under /<repo>/ — absolute asset URLs would 404.
  base: "/Sentra-MCP/",
  plugins: [tailwindcss(), react()],
});
