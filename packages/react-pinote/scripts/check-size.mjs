import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { URL } from "node:url";

const js = await readFile(new URL("../dist/index.js", import.meta.url));
const css = await readFile(new URL("../dist/styles.css", import.meta.url));
const jsBytes = gzipSync(js).byteLength;
// Pinote UI, content slots, focus handling and state hooks; no app-level features.
const jsBudget = 6500;
// Public motion variables add CSS tokens, with no runtime dependency.
const cssBudget = 2100;
console.log(
  `JavaScript: ${jsBytes} B gzip / ${jsBudget} B. CSS: ${css.byteLength} B minified / ${cssBudget} B (${gzipSync(css).byteLength} B gzip).`,
);
if (jsBytes >= jsBudget || css.byteLength >= cssBudget) process.exitCode = 1;
