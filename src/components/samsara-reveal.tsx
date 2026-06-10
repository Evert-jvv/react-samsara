"use client";

import type { CSSProperties, ReactNode } from "react";
import { createElement, useEffect, useRef } from "react";
import { classNames } from "../utils/class-names.js";
import { clamp } from "../utils/clamp.js";
import { prefersReducedMotion, stepSpring } from "../utils/motion.js";

type RevealTag = "div" | "section" | "article" | "aside" | "p";

export type SamsaraRevealProps = {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
};

type SpringState = {
  current: number;
  target: number;
  velocity: number;
};

const revealSpring = {
  damping: 30,
  mass: 1,
  stiffness: 300
};

export function SamsaraReveal({
  as = "div",
  children,
  className,
  delay = 0,
  style
}: SamsaraRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const revealNode = node;
    const reducedMotion = prefersReducedMotion();
    const state: SpringState = {
      current: reducedMotion ? 1 : 0,
      target: reducedMotion ? 1 : 0,
      velocity: 0
    };
    let frame = 0;
    let previousTime = performance.now();
    let timer = 0;

    function write(progress: number) {
      const clamped = clamp(progress);

      revealNode.style.setProperty("--reveal-progress", clamped.toFixed(4));
      revealNode.style.setProperty("--reveal-blur", `${((1 - clamped) * 8).toFixed(3)}px`);
      revealNode.style.setProperty("--reveal-opacity", `${(0.12 + clamped * 0.88).toFixed(4)}`);
      revealNode.style.setProperty("--reveal-scale", `${(0.985 + clamped * 0.015).toFixed(4)}`);
      revealNode.style.setProperty("--reveal-y", `${((1 - clamped) * 34).toFixed(3)}px`);
    }

    function activate() {
      timer = window.setTimeout(() => {
        state.target = 1;
      }, delay);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          activate();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    write(state.current);
    observer.observe(revealNode);

    function tick(time: number) {
      const delta = Math.min((time - previousTime) / 1000, 0.034);
      previousTime = time;

      if (!reducedMotion) {
        const next = stepSpring(state.current, state.target, state.velocity, delta, revealSpring);

        state.current = next.current;
        state.velocity = next.velocity;
        write(clamp(state.current));
      }

      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [delay]);

  return createElement(
    as,
    {
      className: classNames("samsara-reveal", className),
      ref,
      style: {
        "--reveal-blur": "8px",
        "--reveal-opacity": 0.12,
        "--reveal-progress": 0,
        "--reveal-scale": 0.985,
        "--reveal-y": "34px",
        ...style
      } as CSSProperties
    },
    children
  );
}
