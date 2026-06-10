import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readMaintainerGuide = () => readFile("docs/maintainers.md", "utf8");

describe("maintainer documentation", () => {
  it("documents the vendored SamsaraJS version and file layout", async () => {
    const guide = await readMaintainerGuide();

    const requiredTerms = [
      "samsarajs@0.2.4",
      "vendor/samsara/package.json",
      "vendor/samsara/samsara/",
      "vendor/samsara/dist/samsara.js",
      "vendor/samsara/dist/samsara.css",
      "vendor/samsara/dist/samsara.min.js",
      "vendor/samsara/LICENSE",
      "vendor/samsara/README.md",
      "vendor/samsara/CHANGELOG.md"
    ];

    for (const term of requiredTerms) {
      expect(guide).toContain(term);
    }
  });

  it("documents how build output and attribution are preserved", async () => {
    const guide = await readMaintainerGuide();

    const requiredTerms = [
      "scripts/copy-vendor.mjs",
      "dist/vendor/samsara.js",
      "dist/vendor/samsara.css",
      "dist/samsara.css",
      "dist/styles.css",
      "NOTICE.md",
      "https://github.com/dmvaldman/samsara",
      "package.json",
      "LICENSE"
    ];

    for (const term of requiredTerms) {
      expect(guide).toContain(term);
    }
  });

  it("documents package independence verification", async () => {
    const guide = await readMaintainerGuide();

    const requiredTerms = [
      "./scripts/build.sh",
      "npm pack --dry-run",
      "does not list `samsarajs`",
      "clean consumer project",
      "without installing `samsarajs`"
    ];

    for (const term of requiredTerms) {
      expect(guide).toContain(term);
    }
  });
});

