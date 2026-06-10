import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readPackageJson = async () => JSON.parse(await readFile("package.json", "utf8"));
const readPackageLock = async () => JSON.parse(await readFile("package-lock.json", "utf8"));

describe("package metadata", () => {
  it("publishes local docs and copied vendored assets", async () => {
    const packageJson = await readPackageJson();

    expect(packageJson.files).toEqual(expect.arrayContaining(["dist", "docs", "LICENSE", "NOTICE.md", "README.md"]));
    expect(packageJson.sideEffects).toEqual(
      expect.arrayContaining(["./dist/styles.css", "./dist/samsara.css", "./dist/vendor/samsara.css"])
    );
  });

  it("exports the React wrapper and CSS entrypoints without depending on samsarajs", async () => {
    const packageJson = await readPackageJson();
    const packageLock = await readPackageLock();

    expect(packageJson.exports).toMatchObject({
      ".": {
        import: "./dist/index.js",
        types: "./dist/index.d.ts"
      },
      "./samsara.css": "./dist/samsara.css",
      "./styles.css": "./dist/styles.css"
    });

    for (const dependencyGroup of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      expect(packageJson[dependencyGroup]?.samsarajs).toBeUndefined();
      expect(packageLock.packages[""]?.[dependencyGroup]?.samsarajs).toBeUndefined();
    }

    expect(packageLock.packages["node_modules/samsarajs"]).toBeUndefined();
  });

  it("wires local independence checks into standard scripts", async () => {
    const packageJson = await readPackageJson();
    const auditScript = await readFile("scripts/audit.sh", "utf8");

    expect(packageJson.scripts).toMatchObject({
      audit: "./scripts/audit.sh",
      "check:doc-links": "node scripts/check-doc-links.mjs",
      "verify:independence": "node scripts/verify-independence.mjs"
    });
    expect(auditScript).toContain("npm run check:doc-links");
    expect(auditScript).toContain("npm run verify:independence");
  });
});
