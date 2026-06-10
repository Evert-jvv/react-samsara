import { copyFile, mkdir } from "node:fs/promises";

const vendorOutput = new URL("../dist/vendor/", import.meta.url);

await mkdir(vendorOutput, { recursive: true });
await copyFile(new URL("../vendor/samsara/dist/samsara.js", import.meta.url), new URL("samsara.js", vendorOutput));
await copyFile(new URL("../vendor/samsara/dist/samsara.css", import.meta.url), new URL("samsara.css", vendorOutput));
await copyFile(new URL("../vendor/samsara/dist/samsara.css", import.meta.url), new URL("../dist/samsara.css", import.meta.url));
await copyFile(new URL("../vendor/samsara/dist/samsara.css", import.meta.url), new URL("../dist/styles.css", import.meta.url));
