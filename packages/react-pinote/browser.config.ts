import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "browser",
  plugins: [react()],
  server: { host: "127.0.0.1", port: 4322, strictPort: true },
});
