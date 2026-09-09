import { writeFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import { build, preview } from "astro";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
await build({ root: fileURLToPath(root) });
const server = await preview({
  root: fileURLToPath(root),
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
let browser;

try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await page.goto(`http://127.0.0.1:${server.port}/`, {
    waitUntil: "networkidle",
  });
  await page.locator("astro-island[ssr]").waitFor({ state: "detached" });
  await page.locator("html").evaluate((node) => node.ownerDocument.fonts.ready);
  await page.locator('[data-slot="pinote-trigger"]').first().waitFor();

  const capture = await page.screenshot({
    type: "png",
    animations: "disabled",
  });
  const { data, info } = await sharp(capture)
    .png({ palette: true, compressionLevel: 9, effort: 10 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(new URL("public/og-image.png", root), data);
  await writeFile(new URL("dist/og-image.png", root), data);
  console.log(
    `OG image: ${info.width}×${info.height}, ${data.length} bytes (${Math.round((1 - data.length / capture.length) * 100)}% smaller than the capture).`,
  );
} finally {
  await browser?.close();
  await server.stop();
}
