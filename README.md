# React SamsaraJS

React SamsaraJS is a React wrapper for the SamsaraJS continuous UI engine.

The package vendors `samsarajs@0.2.4` so React consumers can use Samsara contexts and surfaces without depending on a remote runtime package. Samsara itself remains browser-only, so this wrapper keeps package imports SSR-safe and loads the engine only in client effects or explicit browser calls.

## Install

```sh
npm install react-samsarajs
```

React and React DOM are peer dependencies. Install them in the application if they are not already present:

```sh
npm install react react-dom
```

The package targets React 18 and React 19 and requires Node.js 20 or newer for local development.

## CSS Usage

Import the upstream Samsara CSS once in your app:

```tsx
import "react-samsarajs/samsara.css";
```

`react-samsarajs/styles.css` is kept as an alias for the same upstream stylesheet. Use either path, but do not import both.

Place the import in your application root, layout, or main entry file so every `SamsaraRoot` and `SamsaraSurface` receives the upstream layout styles. Without the CSS, Samsara can still create DOM nodes, but surfaces may not be positioned or measured correctly.

The package marks the distributed CSS files as side effects, so bundlers should keep the import during production builds.

## SSR Behavior

Package imports are SSR-safe:

```ts
import { SamsaraRoot, SamsaraSurface, loadSamsara } from "react-samsarajs";
```

Importing the package does not evaluate the browser-only SamsaraJS bundle. `SamsaraRoot`, `SamsaraSurface`, and `useSamsara` load Samsara from client effects after `window` and `document` exist.

`loadSamsara()` rejects outside the browser. If you call it directly, call it from a client-only effect, event handler, or framework-specific browser boundary.

For React Server Components frameworks, render this package from a client component. The component files already include `"use client"`, but your importing component may also need a framework client boundary.

## Quick Start

```tsx
import { SamsaraRoot, SamsaraSurface } from "react-samsarajs";
import "react-samsarajs/samsara.css";

export function Example() {
  return (
    <SamsaraRoot style={{ height: 320 }}>
      <SamsaraSurface
        size={[160, 80]}
        origin={[0.5, 0.5]}
        properties={{ background: "#111827", borderRadius: "12px", color: "white" }}
      >
        <strong>Hello Samsara</strong>
      </SamsaraSurface>
    </SamsaraRoot>
  );
}
```

## API

### `loadSamsara()`

Loads the vendored SamsaraJS browser bundle and resolves to the upstream namespace:

```ts
import { loadSamsara } from "react-samsarajs";

const Samsara = await loadSamsara();
const surface = new Samsara.DOM.Surface({ size: [100, 100] });
```

Behavior:

- resolves immediately when `window.Samsara` already contains a valid namespace
- injects one async script tag for the vendored bundle when needed
- reuses the same pending load promise for concurrent callers
- rejects outside a browser environment
- does not run during package import

Advanced consumers can set `window.__REACT_SAMSARAJS_SCRIPT_URL__` before calling `loadSamsara()` to load the script from a custom URL.

For direct vendored runtime usage, see [Samsara Runtime Concepts](docs/samsara-runtime.md).

### `SamsaraRoot`

Renders a host element, loads SamsaraJS on the client, creates a `Samsara.DOM.Context`, mounts it to the host, and provides the context to child components.

Useful props:

- `as`: host element or component to render, defaulting to `div`
- `contextOptions`: options passed to `new Samsara.DOM.Context(...)`
- `onReady`: called with `{ context, samsara }` after the context mounts
- `onError`: called if the browser load or context setup fails
- standard host element props such as `className`, `style`, and `data-*`

Unmounting a `SamsaraRoot` removes the Samsara context.

### `SamsaraSurface`

Creates a real `Samsara.DOM.Surface`, adds it to the nearest `SamsaraRoot`, updates supported options, bridges common DOM events, and portals React children into the deployed surface element.

Supported v1 props:

- `as` / `tagName`
- `content`
- `children`
- `aspectRatio`
- `size`
- `classes`
- `properties`
- `attributes`
- `opacity`
- `origin`
- `margins`
- `proportions`
- `enableScroll`
- `roundToPixel`
- `onReady`
- common handlers such as `onClick`, `onMouseMove`, `onTouchStart`, `onDeploy`, and `onRecall`

When `children` are provided, the wrapper portals them into the Samsara surface element after deployment. When `children` are omitted, use `content` for plain upstream Samsara content.

`onReady` receives `{ element, node, samsara, surface }`, which is useful when you need the underlying surface instance or render tree node.

### Hooks

`useSamsara()` returns `{ loading, error, samsara, context }`.

- Inside a `SamsaraRoot`, it returns the root load state and mounted context.
- Outside a `SamsaraRoot`, it still loads Samsara on the client and returns `context: null`.

`useSamsaraContext()` returns the nearest mounted Samsara context, or `null` while loading.

## Common Examples

### Handle Load State

```tsx
import { useSamsara } from "react-samsarajs";

export function SamsaraStatus() {
  const { error, loading, samsara } = useSamsara();

  if (loading) return <span>Loading</span>;
  if (error) return <span>{error.message}</span>;

  return <span>{samsara ? "Ready" : "Unavailable"}</span>;
}
```

### Use `onReady`

```tsx
import { SamsaraRoot } from "react-samsarajs";

export function RootWithReadyCallback() {
  return (
    <SamsaraRoot
      onReady={({ context, samsara }) => {
        const surface = new samsara.DOM.Surface({
          content: "Created from onReady",
          size: [180, 60]
        });

        context.add(surface);
      }}
      style={{ height: 240 }}
    />
  );
}
```

### Render Interactive Surface Children

```tsx
import { SamsaraRoot, SamsaraSurface } from "react-samsarajs";

export function ClickableSurface() {
  return (
    <SamsaraRoot style={{ height: 240 }}>
      <SamsaraSurface
        onClick={() => console.log("surface clicked")}
        properties={{ background: "#0f766e", color: "white", padding: "16px" }}
        size={[220, 80]}
      >
        <button type="button">Click inside the surface</button>
      </SamsaraSurface>
    </SamsaraRoot>
  );
}
```

### Read The Context From A Child

```tsx
import { useEffect } from "react";
import { useSamsaraContext } from "react-samsarajs";

export function ContextConsumer() {
  const context = useSamsaraContext();

  useEffect(() => {
    if (!context) return;

    const onResize = (event: unknown) => {
      console.log("Samsara resize", event);
    };

    context.on("resize", onResize);

    return () => context.off("resize", onResize);
  }, [context]);

  return null;
}
```

## Troubleshooting

### Surfaces Render In The Wrong Place

Confirm that `react-samsarajs/samsara.css` or `react-samsarajs/styles.css` is imported exactly once from an application root.

### `SamsaraJS can only be loaded in a browser environment.`

`loadSamsara()` was called during SSR or in a non-browser test environment. Move the call into a client effect or render through `SamsaraRoot`.

### `useSamsaraContext()` Returns `null`

The context is `null` until the client load finishes. It also remains `null` when the hook is used outside `SamsaraRoot`.

### `onReady` Does Not Fire

Check whether `onError` on `SamsaraRoot` is receiving a load error. If you configured `window.__REACT_SAMSARAJS_SCRIPT_URL__`, verify that the URL serves the vendored Samsara bundle and that the bundle creates `window.Samsara`.

### React Children Do Not Appear In A Surface

Children are portaled only after the upstream surface emits `deploy`. Make sure the `SamsaraSurface` is rendered under a mounted `SamsaraRoot` and that the root has a visible size.

## Vendored Upstream

This package vendors `samsarajs@0.2.4` from `dmvaldman/samsara`. See `NOTICE.md` and `vendor/samsara/LICENSE` for attribution and license details.

## Local Docs

- [Samsara Runtime Concepts](docs/samsara-runtime.md) covers the vendored runtime namespace exposed by `loadSamsara()`.
- [Maintainer Notes](docs/maintainers.md) covers vendored files, build output, package independence, and release verification.

## Development

```sh
./scripts/setup.sh
./scripts/lint.sh
./scripts/typecheck.sh
./scripts/test.sh
./scripts/build.sh
./scripts/audit.sh
```
