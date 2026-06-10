import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const output = new URL("../dist/styles.css", import.meta.url);

await mkdir(dirname(fileURLToPath(output)), { recursive: true });
await copyFile(new URL("../src/styles/samsara.css", import.meta.url), output);
