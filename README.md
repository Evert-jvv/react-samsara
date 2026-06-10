# React SamsaraJS

Reusable React motion primitives extracted from the SamsaraJS prototype. The package provides small client-side components for reveal motion, magnetic hover response, scroll-linked scene progress, and a docking header.

This first package pass is intentionally private and demo-free. Publishing and a full example app are planned follow-up work.

## Install

```sh
npm install react-samsarajs
```

React is a peer dependency. The package targets React 18 and React 19.

## Quick Start

Import the components from the package entrypoint and the CSS from the public style export:

```tsx
import {
  SamsaraDockingHeader,
  SamsaraMagnetic,
  SamsaraReveal,
  SamsaraScrollScene
} from "react-samsarajs";
import "react-samsarajs/styles.css";

export function Example() {
  return (
    <>
      <SamsaraDockingHeader>
        <strong>Project</strong>
        <nav>Navigation</nav>
      </SamsaraDockingHeader>

      <SamsaraReveal as="section" delay={120}>
        <h1>Reveal on entry</h1>
      </SamsaraReveal>

      <SamsaraMagnetic as="a" href="/start" intensity={0.8}>
        <span>Magnetic link</span>
      </SamsaraMagnetic>

      <SamsaraScrollScene>
        <div>Scroll-linked scene content</div>
      </SamsaraScrollScene>
    </>
  );
}
```

## Components

### `SamsaraMagnetic`

Adds pointer-responsive tilt, translation, glare variables, and optional reveal motion.

Props: `as`, `children`, `className`, `delay`, `href`, `intensity`, `reveal`, `style`.

### `SamsaraReveal`

Reveals content when it intersects the viewport.

Props: `as`, `children`, `className`, `delay`, `style`.

### `SamsaraScrollScene`

Writes scroll progress variables to its root element for scene transforms and dependent styling.

Props: `children`, `className`.

### `SamsaraDockingHeader`

Animates a fixed header between floating and docked states as the page scrolls. It always includes the `samsara-docking-header` class and also accepts `className` for app styling.

Props: `children`, `className`.

## Styling

The package stylesheet defines reusable `.samsara-*` classes and CSS custom properties. App-specific colors can be customized with variables such as:

```css
:root {
  --samsara-header-bg-rgb: 15, 23, 42;
  --samsara-header-border: rgba(255, 255, 255, 0.14);
  --samsara-header-accent-rgb: 251, 191, 36;
}
```

The extracted CSS avoids portfolio-specific layout, copy, and theme globals from the original prototype.

## SSR And Accessibility

Browser-only APIs are accessed inside React effects, so importing the package during server rendering should not touch `window`, `document`, observers, or animation APIs.

The components respect `prefers-reduced-motion: reduce` by writing resting state CSS variables instead of requiring long-running animation. Consumers should keep children semantic and keyboard-accessible, especially when using `SamsaraMagnetic` with interactive content.

## Development

```sh
./scripts/setup.sh
./scripts/lint.sh
./scripts/typecheck.sh
./scripts/test.sh
./scripts/build.sh
./scripts/audit.sh
```
