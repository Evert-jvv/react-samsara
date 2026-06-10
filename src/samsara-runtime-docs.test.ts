import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readRuntimeGuide = () => readFile("docs/samsara-runtime.md", "utf8");

describe("Samsara runtime documentation", () => {
  it("documents practical runtime concepts exposed through loadSamsara", async () => {
    const guide = await readRuntimeGuide();

    const requiredSections = [
      "# Samsara Runtime Concepts",
      "## DOM.Context",
      "## DOM.Surface",
      "## Transforms",
      "## Transitionables",
      "## Events",
      "## Inputs",
      "## Layouts",
      "## Streams",
      "## Practical Integration Notes"
    ];

    for (const section of requiredSections) {
      expect(guide).toContain(section);
    }
  });

  it("covers the vendored namespace and practical usage APIs", async () => {
    const guide = await readRuntimeGuide();

    const requiredTerms = [
      "loadSamsara()",
      "Samsara.DOM.Context",
      "Samsara.DOM.Surface",
      "Samsara.Core.Transform",
      "Samsara.Core.Transitionable",
      "Samsara.Events",
      "Samsara.Inputs",
      "Samsara.Layouts",
      "Samsara.Streams",
      "context.add",
      "context.mount",
      "surface.on",
      "Transform.translate",
      "set(value, transition, callback)",
      "GenericInput",
      "SequentialLayout",
      "Stream.lift"
    ];

    for (const term of requiredTerms) {
      expect(guide).toContain(term);
    }
  });

  it("links the runtime guide from the README", async () => {
    const readme = await readFile("README.md", "utf8");

    expect(readme).toContain("[Samsara Runtime Concepts](docs/samsara-runtime.md)");
  });
});
