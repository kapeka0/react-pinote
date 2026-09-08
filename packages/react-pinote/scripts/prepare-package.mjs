import { copyFile } from "node:fs/promises";
import { URL } from "node:url";

for (const name of ["README.md", "LICENSE"]) {
  await copyFile(
    new URL(`../../../../${name}`, import.meta.url),
    new URL(`../${name}`, import.meta.url),
  );
}
