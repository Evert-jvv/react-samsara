"use client";

import type { CSSProperties, ReactNode } from "react";
import { createElement, useEffect, useRef } from "react";
import { classNames } from "../utils/class-names.js";
import { clamp } from "../utils/clamp.js";
import { prefersReducedMotion, stepSpring } from "../utils/motion.js";

type MagneticTag = "div" | "article" | "aside" | "a";

export type SamsaraMagneticProps = {
  as?: MagneticTag;
  children: ReactNode;
  className?: string;
  delay?: number;
  href?: string;
  intensity?: number;
  reveal?: boolean;
  style?: CSSProperties;
};

type VectorSpring = {
  currentX: number;
  currentY: number;
  revealCurrent: number;
  revealTarget: number;
  revealVelocity: number;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
};

const magneticSpring = {
  damping: 26,
  mass: 1,
  stiffness: 260
};

export function SamsaraMagnetic({
  as = "div",
  children,
  className,
  delay = 0,
  href,
  intensity = 1,
  reveal = true,
  style
}: SamsaraMagneticProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (prefersReducedMotion()) {
      node.style.setProperty("--reveal-progress", "1");
      return;
    }

    const surface = node;
    const state: VectorSpring = {
      currentX: 0,
      currentY: 0,
      revealCurrent: reveal ? 0 : 1,
      revealTarget: reveal ? 0 : 1,
      revealVelocity: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0
    };
    let frame = 0;
    let previousTime = performance.now();
    let timer = 0;

    function write() {
      const revealProgress = clamp(state.revealCurrent);
      const rx = -state.currentY * 7 * intensity;
      const ry = state.currentX * 9 * intensity;
      const tx = state.currentX * 8 * intensity;
      const ty = state.currentY * 8 * intensity;

      surface.style.setProperty("--magnet-x", `${tx.toFixed(3)}px`);
      surface.style.setProperty("--magnet-y", `${ty.toFixed(3)}px`);
      surface.style.setProperty("--magnet-rx", `${rx.toFixed(3)}deg`);
      surface.style.setProperty("--magnet-ry", `${ry.toFixed(3)}deg`);
      surface.style.setProperty("--magnet-glare-x", `${(50 + state.currentX * 28).toFixed(2)}%`);
      surface.style.setProperty("--magnet-glare-y", `${(50 + state.currentY * 28).toFixed(2)}%`);
      surface.style.setProperty(
        "--magnet-active",
        String(Math.min(Math.hypot(state.currentX, state.currentY) * 1.7, 1).toFixed(3))
      );
      surface.style.setProperty("--reveal-blur", `${((1 - revealProgress) * 8).toFixed(3)}px`);
      surface.style.setProperty("--reveal-opacity", `${(0.12 + revealProgress * 0.88).toFixed(4)}`);
      surface.style.setProperty("--reveal-progress", revealProgress.toFixed(4));
      surface.style.setProperty("--reveal-scale", `${(0.985 + revealProgress * 0.015).toFixed(4)}`);
      surface.style.setProperty("--reveal-y", `${((1 - revealProgress) * 28).toFixed(3)}px`);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = surface.getBoundingClientRect();
      state.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      state.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function onPointerLeave() {
      state.targetX = 0;
      state.targetY = 0;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          timer = window.setTimeout(() => {
            state.revealTarget = 1;
          }, delay);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    function tick(time: number) {
      const delta = Math.min((time - previousTime) / 1000, 0.034);
      previousTime = time;

      const x = stepSpring(state.currentX, state.targetX, state.velocityX, delta, magneticSpring);
      const y = stepSpring(state.currentY, state.targetY, state.velocityY, delta, magneticSpring);
      const revealSpring = stepSpring(
        state.revealCurrent,
        state.revealTarget,
        state.revealVelocity,
        delta,
        magneticSpring
      );

      state.currentX = x.current;
      state.velocityX = x.velocity;
      state.currentY = y.current;
      state.velocityY = y.velocity;
      state.revealCurrent = revealSpring.current;
      state.revealVelocity = revealSpring.velocity;
      write();

      frame = window.requestAnimationFrame(tick);
    }

    surface.addEventListener("pointermove", onPointerMove);
    surface.addEventListener("pointerleave", onPointerLeave);
    observer.observe(surface);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [delay, intensity, reveal]);

  return createElement(
    as,
    {
      className: classNames("samsara-magnetic", reveal && "samsara-reveal", className),
      href,
      ref,
      style: {
        "--magnet-active": 0,
        "--magnet-glare-x": "50%",
        "--magnet-glare-y": "50%",
        "--magnet-rx": "0deg",
        "--magnet-ry": "0deg",
        "--magnet-x": "0px",
        "--magnet-y": "0px",
        "--reveal-blur": reveal ? "8px" : "0px",
        "--reveal-opacity": reveal ? 0.12 : 1,
        "--reveal-progress": reveal ? 0 : 1,
        "--reveal-scale": reveal ? 0.985 : 1,
        "--reveal-y": reveal ? "28px" : "0px",
        ...style
      } as CSSProperties
    },
    children
  );
}
