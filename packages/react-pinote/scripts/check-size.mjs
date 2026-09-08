import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { URL } from "node:url";

const js = await readFile(new URL("../dist/index.js", import.meta.url));
const css = await readFile(new URL("../dist/styles.css", import.meta.url));
const jsBytes = gzipSync(js).byteLength;
console.log(
  `JavaScript: ${jsBytes} B gzip / 5000 B. CSS: ${css.byteLength} B minified / 2000 B (${gzipSync(css).byteLength} B gzip).`,
);
if (jsBytes >= 5000 || css.byteLength >= 2000) process.exitCode = 1;
