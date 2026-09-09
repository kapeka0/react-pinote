import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://react-pinote.vercel.app",
  integrations: [react()],
  output: "static",
  devToolbar: { enabled: false },
  vite: { ssr: { noExternal: ["react-pinote"] } },
});
