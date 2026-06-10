import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

declare global {
  var __getSamsaraIntersectionObservers: () => MockIntersectionObserver[];
  var __setSamsaraReducedMotion: (value: boolean) => void;
}

let reducedMotion = false;

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root: Element | Document | null = null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
  unobserve = vi.fn();

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.rootMargin = options.rootMargin ?? "";
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting = true, target: Element = document.body) {
    this.callback(
      [
        {
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting,
          rootBounds: null,
          target,
          time: performance.now()
        }
      ],
      this
    );
  }
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  configurable: true,
  value: MockIntersectionObserver,
  writable: true
});

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: reducedMotion && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn()
  })),
  writable: true
});

if (!window.requestAnimationFrame) {
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16),
    writable: true
  });
}

if (!window.cancelAnimationFrame) {
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: (id: number) => window.clearTimeout(id),
    writable: true
  });
}

globalThis.__setSamsaraReducedMotion = (value: boolean) => {
  reducedMotion = value;
};

globalThis.__getSamsaraIntersectionObservers = () => MockIntersectionObserver.instances;

afterEach(() => {
  cleanup();
  reducedMotion = false;
  MockIntersectionObserver.instances = [];
  vi.useRealTimers();
  vi.restoreAllMocks();
});
