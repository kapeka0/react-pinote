import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import config from "./browser.config.ts";

export default mergeConfig(
  config,
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^react-dom(\/.*)?$/,
          replacement: `${fileURLToPath(new URL("./node_modules/react-dom-18", import.meta.url))}$1`,
        },
        {
          find: /^react(\/.*)?$/,
          replacement: `${fileURLToPath(new URL("./node_modules/react-18", import.meta.url))}$1`,
        },
      ],
    },
    cacheDir: "node_modules/.vite-react18",
    server: { port: 4323 },
  }),
);
