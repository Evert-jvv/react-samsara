import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readReadme = () => readFile("README.md", "utf8");

describe("README documentation", () => {
  it("documents the public usage surface required for package consumers", async () => {
    const readme = await readReadme();

    const requiredSections = [
      "## Install",
      "## CSS Usage",
      "## SSR Behavior",
      "### `loadSamsara()`",
      "### `SamsaraRoot`",
      "### `SamsaraSurface`",
      "### Hooks",
      "## Common Examples",
      "## Troubleshooting"
    ];

    for (const section of requiredSections) {
      expect(readme).toContain(section);
    }
  });

  it("keeps examples and troubleshooting tied to exported APIs", async () => {
    const readme = await readReadme();

    const requiredTerms = [
      "react-samsarajs/samsara.css",
      "react-samsarajs/styles.css",
      "useSamsara()",
      "useSamsaraContext()",
      "onReady",
      "onError",
      "window.__REACT_SAMSARAJS_SCRIPT_URL__",
      "SamsaraJS can only be loaded in a browser environment."
    ];

    for (const term of requiredTerms) {
      expect(readme).toContain(term);
    }
  });
});
