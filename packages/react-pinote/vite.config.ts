import react from "@vitejs/plugin-react";
import MagicString from "magic-string";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

function injectAutomaticStyles(): Plugin {
  return {
    name: "react-pinote:inject-automatic-styles",
    enforce: "post" as const,
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "styles.css.d.ts",
        source: "export {};\n",
      });
    },
    renderChunk(code: string, chunk: { isEntry: boolean }) {
      if (!chunk.isEntry) return null;
      const source = new MagicString(code);
      source.prepend('"use client";\nimport "./styles.css";\n');
      return {
        code: source.toString(),
        map: source.generateMap({ hires: true }),
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), injectAutomaticStyles()],
  build: {
    cssCodeSplit: false,
    cssTarget: ["chrome123", "firefox120", "safari17.5"],
    minify: true,
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
      output: {
        // Compact whitespace while retaining purity annotations for consumers' tree shaking.
        minify: true,
        comments: { annotation: true },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});
