import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { loadSamsara, SamsaraRoot, SamsaraSurface } from "./index.js";
import type { SamsaraNamespace, SamsaraSurfaceReadyPayload } from "./index.js";

const require = createRequire(import.meta.url);

function installVendoredSamsara() {
  if (!window.Samsara) {
    window.Samsara = require("../vendor/samsara/dist/samsara.js") as SamsaraNamespace;
  }

  return window.Samsara;
}

describe("React SamsaraJS wrapper", () => {
  it("imports package entrypoints without loading window-only SamsaraJS code", async () => {
    await expect(import("./index.js")).resolves.toMatchObject({
      SamsaraRoot: expect.any(Function),
      SamsaraSurface: expect.any(Function),
      loadSamsara: expect.any(Function),
      useSamsara: expect.any(Function),
      useSamsaraContext: expect.any(Function)
    });
  });

  it("loads the vendored Samsara namespace in a browser environment", async () => {
    installVendoredSamsara();

    await expect(loadSamsara()).resolves.toMatchObject({
      Camera: expect.any(Object),
      Core: expect.any(Object),
      DOM: expect.any(Object),
      Events: expect.any(Object),
      Inputs: expect.any(Object),
      Layouts: expect.any(Object),
      Streams: expect.any(Object)
    });
  });

  it("mounts and removes a Samsara context", async () => {
    const samsara = installVendoredSamsara();
    const remove = vi.spyOn(samsara.DOM.Context.prototype, "remove");
    const onReady = vi.fn();
    const { unmount } = render(
      <SamsaraRoot data-testid="root" onReady={onReady} style={{ height: 240 }}>
        <span>React child</span>
      </SamsaraRoot>
    );

    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId("root").classList.contains("samsara-context")).toBe(true);

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("creates a real Samsara surface, portals children, bridges events, and cleans up", async () => {
    const samsara = installVendoredSamsara();
    const surfaceRemove = vi.spyOn(samsara.DOM.Surface.prototype, "remove");
    const click = vi.fn();
    const onReady = vi.fn<(payload: SamsaraSurfaceReadyPayload) => void>();

    const { unmount } = render(
      <SamsaraRoot style={{ height: 240, width: 320 }}>
        <SamsaraSurface
          classes={["demo-surface"]}
          onClick={click}
          onReady={onReady}
          properties={{ background: "black" }}
          size={[120, 80]}
        >
          <span>Portaled child</span>
        </SamsaraSurface>
      </SamsaraRoot>
    );

    const child = await screen.findByText("Portaled child");
    const surfaceElement = child.closest(".samsara-surface");

    expect(surfaceElement).not.toBeNull();
    expect(surfaceElement?.classList.contains("demo-surface")).toBe(true);
    await waitFor(() => expect(onReady).toHaveBeenCalled());

    fireEvent.click(surfaceElement as Element);
    expect(click).toHaveBeenCalledTimes(1);

    unmount();

    expect(surfaceRemove).toHaveBeenCalled();
  });
});
