import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devtools()],
});
