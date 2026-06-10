# React SamsaraJS

React SamsaraJS is a React wrapper for the original [SamsaraJS](https://github.com/dmvaldman/samsara) continuous UI engine.

The package vendors `samsarajs@0.2.4` so React consumers can use Samsara contexts and surfaces without depending on a remote runtime package. Samsara itself remains browser-only, so this wrapper keeps package imports SSR-safe and loads the engine only in client effects or explicit browser calls.

## Install

```sh
npm install react-samsarajs
```

React and React DOM are peer dependencies. The package targets React 18 and React 19.

## CSS

Import the upstream Samsara CSS once in your app:

```tsx
import "react-samsarajs/samsara.css";
```

`react-samsarajs/styles.css` is kept as an alias for the same upstream stylesheet.

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
        properties={{ background: "#111827", color: "white", borderRadius: "12px" }}
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
const Samsara = await loadSamsara();
const surface = new Samsara.DOM.Surface({ size: [100, 100] });
```

The function rejects outside a browser environment. It does not run during package import.

### `SamsaraRoot`

Renders a host element, loads SamsaraJS on the client, creates a `Samsara.DOM.Context`, mounts it to the host, and provides the context to child components.

Useful props:

- `as`
- `contextOptions`
- `onReady`
- `onError`
- standard host element props such as `className` and `style`

### `SamsaraSurface`

Creates a real `Samsara.DOM.Surface`, adds it to the nearest `SamsaraRoot`, updates supported options, bridges common DOM events, and portals React children into the deployed surface element.

Supported v1 props:

- `as` / `tagName`
- `content`
- `children`
- `size`
- `classes`
- `properties`
- `attributes`
- `opacity`
- `origin`
- `margins`
- `proportions`
- `enableScroll`
- `onReady`
- common handlers such as `onClick`, `onMouseMove`, and touch events

### Hooks

`useSamsara()` returns `{ loading, error, samsara, context }`.

`useSamsaraContext()` returns the nearest mounted Samsara context, or `null` while loading.

## Vendored Upstream

This package vendors `samsarajs@0.2.4` from `dmvaldman/samsara`. See `NOTICE.md` and `vendor/samsara/LICENSE` for attribution and license details.

## Development

```sh
./scripts/setup.sh
./scripts/lint.sh
./scripts/typecheck.sh
./scripts/test.sh
./scripts/build.sh
./scripts/audit.sh
```
