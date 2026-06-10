export type SpringConfig = {
  damping: number;
  mass: number;
  stiffness: number;
};

export type SpringStep = {
  current: number;
  velocity: number;
};

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function precision(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

export function stepSpring(
  current: number,
  target: number,
  velocity: number,
  delta: number,
  spring: SpringConfig
): SpringStep {
  const force = spring.stiffness * (target - current);
  const damping = spring.damping * velocity;
  const acceleration = (force - damping) / spring.mass;
  const nextVelocity = velocity + acceleration * delta;

  return {
    current: current + nextVelocity * delta,
    velocity: nextVelocity
  };
}
