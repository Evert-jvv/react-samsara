"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { classNames } from "../utils/class-names.js";
import { clamp } from "../utils/clamp.js";
import { prefersReducedMotion, stepSpring } from "../utils/motion.js";

export type SamsaraScrollSceneProps = {
  children: ReactNode;
  className?: string;
};

type SpringState = {
  current: number;
  target: number;
  velocity: number;
};

const scrollSpring = {
  damping: 28,
  mass: 1,
  stiffness: 180
};

export function SamsaraScrollScene({ children, className }: SamsaraScrollSceneProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const scene = node;
    const reducedMotion = prefersReducedMotion();
    const state: SpringState = {
      current: 0,
      target: 0,
      velocity: 0
    };
    let frame = 0;
    let previousTime = performance.now();

    function write() {
      const progress = state.current;
      scene.style.setProperty("--scene-progress", progress.toFixed(4));
      scene.style.setProperty("--scene-y", `${(-18 + progress * 42).toFixed(3)}px`);
      scene.style.setProperty("--scene-scale", `${(0.985 + progress * 0.04).toFixed(4)}`);
      scene.style.setProperty("--scene-glow", `${(0.58 + progress * 0.42).toFixed(4)}`);
      scene.style.setProperty("--scene-shadow-size", `${(64 + progress * 34).toFixed(3)}px`);
    }

    function updateTarget() {
      const rect = scene.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      state.target = clamp((viewportHeight * 0.72 - rect.top) / (viewportHeight + rect.height));

      if (reducedMotion) {
        state.current = state.target;
        state.velocity = 0;
        write();
      }
    }

    function tick(time: number) {
      const delta = Math.min((time - previousTime) / 1000, 0.034);
      previousTime = time;

      if (!reducedMotion) {
        const next = stepSpring(state.current, state.target, state.velocity, delta, scrollSpring);

        state.current = next.current;
        state.velocity = next.velocity;
        write();
      }

      frame = window.requestAnimationFrame(tick);
    }

    updateTarget();
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
    <div
      className={classNames("samsara-scroll-scene", className)}
      ref={ref}
      style={
        {
          "--scene-glow": 0.58,
          "--scene-progress": 0,
          "--scene-scale": 0.985,
          "--scene-shadow-size": "64px",
          "--scene-y": "-18px"
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
