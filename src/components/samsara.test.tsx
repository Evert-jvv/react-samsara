import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  SamsaraDockingHeader,
  SamsaraMagnetic,
  SamsaraReveal,
  SamsaraScrollScene
} from "../index.js";

function mockAnimationFrame() {
  const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 100);
  const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

  return { cancel, request };
}

describe("Samsara React primitives", () => {
  it("renders all exported components", () => {
    mockAnimationFrame();

    render(
      <>
        <SamsaraDockingHeader>Header</SamsaraDockingHeader>
        <SamsaraMagnetic>Magnetic</SamsaraMagnetic>
        <SamsaraReveal>Reveal</SamsaraReveal>
        <SamsaraScrollScene>Scene</SamsaraScrollScene>
      </>
    );

    expect(screen.getByText("Header").className).toContain("samsara-docking-header");
    expect(screen.getByText("Magnetic").className).toContain("samsara-magnetic");
    expect(screen.getByText("Reveal").className).toContain("samsara-reveal");
    expect(screen.getByText("Scene").className).toContain("samsara-scroll-scene");
  });

  it("does not require window at module import time", async () => {
    await expect(import("../index.js")).resolves.toMatchObject({
      SamsaraDockingHeader: expect.any(Function),
      SamsaraMagnetic: expect.any(Function),
      SamsaraReveal: expect.any(Function),
      SamsaraScrollScene: expect.any(Function)
    });
  });

  it("sets reveal progress immediately for reduced motion", () => {
    mockAnimationFrame();
    globalThis.__setSamsaraReducedMotion(true);

    render(<SamsaraReveal>Reduced</SamsaraReveal>);

    expect(screen.getByText("Reduced").style.getPropertyValue("--reveal-progress")).toBe("1.0000");
  });

  it("sets magnetic reveal progress immediately for reduced motion", () => {
    globalThis.__setSamsaraReducedMotion(true);

    render(<SamsaraMagnetic>Reduced magnetic</SamsaraMagnetic>);

    expect(screen.getByText("Reduced magnetic").style.getPropertyValue("--reveal-progress")).toBe("1");
  });

  it("cleans up animation frames, timers, and observers", () => {
    vi.useFakeTimers();
    const { cancel } = mockAnimationFrame();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<SamsaraReveal delay={80}>Timed reveal</SamsaraReveal>);
    const [observer] = globalThis.__getSamsaraIntersectionObservers();

    observer?.trigger(true, screen.getByText("Timed reveal"));
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(100);
    expect(observer?.disconnect).toHaveBeenCalled();
  });

  it("cleans up pointer listeners on magnetic surfaces", () => {
    mockAnimationFrame();
    const add = vi.spyOn(HTMLElement.prototype, "addEventListener");
    const remove = vi.spyOn(HTMLElement.prototype, "removeEventListener");
    const { unmount } = render(<SamsaraMagnetic>Pointer surface</SamsaraMagnetic>);

    expect(add).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(add).toHaveBeenCalledWith("pointerleave", expect.any(Function));

    unmount();

    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("pointerleave", expect.any(Function));
  });

  it("cleans up window scroll and resize listeners", () => {
    mockAnimationFrame();
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<SamsaraScrollScene>Scroll scene</SamsaraScrollScene>);

    expect(add).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    expect(add).toHaveBeenCalledWith("resize", expect.any(Function));

    unmount();

    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
