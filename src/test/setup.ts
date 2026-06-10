import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(performance.now()), 0);
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id: number) => {
    window.clearTimeout(id);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
