import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/NeuroFIT-/",
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  resolve: {
    alias: {
      "@tanstack/react-start": fileURLToPath(
        new URL("./src/lib/react-start-static-shim.ts", import.meta.url),
      ),
    },
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
