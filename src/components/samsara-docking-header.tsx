"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { classNames } from "../utils/class-names.js";
import { clamp } from "../utils/clamp.js";
import { prefersReducedMotion, precision, stepSpring } from "../utils/motion.js";

export type SamsaraDockingHeaderProps = {
  children: ReactNode;
  className?: string;
};

type SpringState = {
  current: number;
  target: number;
  velocity: number;
};

const spring = {
  damping: 34,
  mass: 1,
  stiffness: 360
};

const dockRange = {
  end: 126,
  start: 18
};

function getDockTarget(scrollY: number) {
  const raw = (scrollY - dockRange.start) / (dockRange.end - dockRange.start);

  if (raw > 0.82) {
    return 1;
  }

  if (raw < 0.08) {
    return 0;
  }

  return clamp(raw);
}

function writeDockStyles(node: HTMLElement, progress: number) {
  const eased = 1 - Math.pow(1 - progress, 3);
  const isCompact = window.innerWidth <= 720;
  const floatingInset = isCompact ? 14 : clamp(window.innerWidth * 0.06, 20, 96);
  const floatingTop = isCompact ? 14 : 24;
  const inset = precision(floatingInset * (1 - eased), 3);
  const radius = precision(14 - eased * 14, 3);
  const height = precision(52 + eased * 6, 3);
  const blur = precision(3 + eased * 3, 3);
  const bgAlpha = precision(0.42 + eased * 0.14, 3);
  const shadowAlpha = precision(0.34 + eased * 0.18, 3);

  node.style.setProperty("--samsara-progress", String(precision(progress)));
  node.style.setProperty("--topbar-top", `${precision(floatingTop * (1 - eased), 3)}px`);
  node.style.setProperty("--topbar-inset", `${inset}px`);
  node.style.setProperty("--topbar-radius", `${radius}px`);
  node.style.setProperty("--topbar-height", `${height}px`);
  node.style.setProperty("--topbar-blur", `${blur}px`);
  node.style.setProperty("--topbar-bg-alpha", String(bgAlpha));
  node.style.setProperty("--topbar-shadow-alpha", String(shadowAlpha));
  node.dataset.docked = progress > 0.76 ? "true" : "false";
}

export function SamsaraDockingHeader({ children, className }: SamsaraDockingHeaderProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const topbar = node;
    const reducedMotion = prefersReducedMotion();
    const state: SpringState = {
      current: getDockTarget(window.scrollY),
      target: getDockTarget(window.scrollY),
      velocity: 0
    };
    let frame = 0;
    let previousTime = performance.now();

    writeDockStyles(topbar, state.current);

    function updateTarget() {
      state.target = getDockTarget(window.scrollY);

      if (reducedMotion) {
        state.current = state.target;
        state.velocity = 0;
        writeDockStyles(topbar, state.current);
      }
    }

    function tick(time: number) {
      const delta = Math.min((time - previousTime) / 1000, 0.034);
      previousTime = time;

      if (!reducedMotion) {
        const next = stepSpring(state.current, state.target, state.velocity, delta, spring);

        state.current = next.current;
        state.velocity = next.velocity;

        if (Math.abs(state.target - state.current) < 0.001 && Math.abs(state.velocity) < 0.001) {
          state.current = state.target;
          state.velocity = 0;
        }

        writeDockStyles(topbar, clamp(state.current));
      }

      frame = window.requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
    };
  }, []);

  return (
    <header
      className={classNames("samsara-docking-header", className)}
      ref={ref}
      style={{ "--samsara-progress": 0 } as CSSProperties}
    >
      {children}
    </header>
  );
}
