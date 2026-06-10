# Samsara Runtime Concepts

`loadSamsara()` resolves to the vendored `samsarajs@0.2.4` browser namespace. The React wrapper only types and wraps the core root and surface path, but advanced consumers can use the upstream runtime directly after the bundle has loaded.

```ts
import { loadSamsara } from "react-samsarajs";

const Samsara = await loadSamsara();
```

Call `loadSamsara()` only in browser code, such as a client effect, event handler, or `SamsaraRoot` callback. The returned namespace contains these top-level groups:

- `Samsara.DOM`
- `Samsara.Core`
- `Samsara.Events`
- `Samsara.Inputs`
- `Samsara.Layouts`
- `Samsara.Streams`
- `Samsara.Camera`

The package TypeScript declarations intentionally cover the stable React wrapper plus a conservative runtime namespace. For deeper runtime APIs, prefer local type refinements in application code instead of assuming this package exposes complete upstream typings.

## DOM.Context

`DOM.Context` is the top-level render target. It creates the Samsara render tree, adds the `samsara-context` class to the mounted element, measures the container, emits resize events, and registers itself with the runtime engine.

```ts
const context = new Samsara.DOM.Context({ enableScroll: false });
context.mount(hostElement);
```

Common operations:

- `context.add(renderable)` appends a surface, layout, view, or layout spec to the render tree.
- `context.mount(element)` attaches the context to an existing DOM element. Omitting the element mounts to `document.body`.
- `context.remove()` tears down the context and clears the mounted container.
- `context.on(type, handler)` and `context.off(type, handler)` listen for DOM events and runtime events such as `resize` and `deploy`.
- `context.setPerspective(value, transition, callback)` and `context.setPerspectiveOrigin(origin, transition, callback)` animate 3D camera perspective.

In React, `SamsaraRoot` creates and removes the context for you. Use `onReady` when direct access is needed:

```tsx
<SamsaraRoot
  onReady={({ context, samsara }) => {
    const surface = new samsara.DOM.Surface({
      content: "Mounted through the upstream context",
      size: [260, 80]
    });

    context.add(surface);
  }}
/>
```

## DOM.Surface

`DOM.Surface` is a renderable DOM element managed by Samsara. Samsara commits size, opacity, origin, and CSS transforms while leaving classes, attributes, properties, and content under the surface API.

```ts
const surface = new Samsara.DOM.Surface({
  content: "Hello",
  size: [160, 80],
  origin: [0.5, 0.5],
  properties: {
    background: "#111827",
    color: "white",
    padding: "16px"
  }
});

context.add(surface);
```

Useful options and setters:

- `size: [width, height]`, where each dimension can be a number, `true`, or `undefined`.
- `classes`, `properties`, `attributes`, and `content` for DOM presentation.
- `tagName` for non-`div` elements such as `img`.
- `origin`, `margins`, `proportions`, `aspectRatio`, and `opacity` for layout.
- `enableScroll` for native scroll behavior inside the surface.
- `roundToPixel` to reduce text blur during transforms at the cost of less fluid motion.
- `setContent`, `setProperties`, `setAttributes`, `setSize`, `setOrigin`, `setOpacity`, `addClass`, and `removeClass` for imperative updates.

Surfaces also emit DOM and lifecycle events:

```ts
surface.on("click", (event) => {
  console.log("clicked", event);
});

surface.on("deploy", (element) => {
  console.log("surface element", element);
});
```

In React, prefer `SamsaraSurface` for normal UI so children are portaled into the deployed surface element and event handlers are cleaned up with the component lifecycle.

## Transforms

`Samsara.Core.Transform` creates 4x4 transform matrices that Samsara commits as CSS transforms. Use transforms in render-tree layout specs or stream outputs.

```ts
const { Transform } = Samsara.Core;

context
  .add({
    transform: Transform.translate([40, 24, 0]),
    opacity: 0.95
  })
  .add(surface);
```

Frequently used helpers:

- `Transform.identity`, `Transform.inFront`, and `Transform.behind` constants.
- `translate`, `translateX`, `translateY`, and `translateZ`.
- `scale`, `scaleX`, `scaleY`, and `scaleZ`.
- `rotateX`, `rotateY`, `rotateZ`, and `rotateAxis`.
- `skewX`, `skewY`, `compose`, `composeMany`, `thenMove`, `moveThen`, and `thenScale`.
- `aboutOrigin`, `getTranslate`, `inverse`, `interpret`, `build`, `average`, `equals`, and `notEquals`.

Transforms are plain arrays. Keep them immutable in application code: create a new transform for each state rather than mutating a matrix in place.

## Transitionables

`Samsara.Core.Transitionable` animates numbers and arrays of numbers. A transitionable is also a stream, so it emits `start`, `update`, and `end` events and can be mapped into transforms, sizes, origins, opacity values, or layout values.

```ts
const x = new Samsara.Core.Transitionable(0);
const transform = x.map((value) => Samsara.Core.Transform.translateX(value));

context.add({ transform }).add(surface);

x.set(240, { duration: 600, curve: "easeOut" });
```

Common operations:

- `set(value, transition, callback)` animates to a new value. Without a transition, the value changes immediately.
- `get()` returns the current value.
- `getVelocity()` returns the current velocity when the active transition supports it.
- `reset(value, velocity)` changes value without firing events.
- `halt()` ends the active transition in place.
- `isActive()` reports whether a transition is currently running.
- `setMany([...], callback)`, `loop([...])`, and `delay(callback, duration)` sequence animation work.

Built-in transition curves include normal tweens plus named physics methods such as `spring`, `inertia`, and `damp`.

## Events

The `Samsara.Events` namespace exposes event primitives used by surfaces, inputs, transitionables, and streams.

- `EventEmitter` provides `emit`, `trigger`, `on`, `once`, and `off`.
- `EventHandler` extends `EventEmitter` with `subscribe` and `unsubscribe`, and is used to pipe one event source into another.
- `EventMapper`, `EventFilter`, and `EventSplitter` are used by stream helpers such as `map`, `filter`, and `split`.

A common pattern is to subscribe an input to a surface, then listen to normalized events on the input:

```ts
const input = new Samsara.Inputs.MouseInput({
  direction: Samsara.Inputs.MouseInput.DIRECTION.X
});

input.subscribe(surface);
input.on("update", ({ value }) => {
  x.set(value);
});
```

Always call `off` or unsubscribe from long-lived objects when a React component or manual integration is cleaned up.

## Inputs

`Samsara.Inputs` converts browser input into `start`, `update`, and `end` streams. Available constructors include:

- `MouseInput`
- `TouchInput`
- `ScrollInput`
- `ScaleInput`
- `RotateInput`
- `PinchInput`
- `GenericInput`

`MouseInput`, `TouchInput`, and `ScrollInput` expose `DIRECTION.X` and `DIRECTION.Y` constants for axis constraints. Payloads commonly include `value`, `delta`, `velocity`, `cumulate`, and the original DOM `event`.

`GenericInput` combines multiple input types behind one stream:

```ts
Samsara.Inputs.GenericInput.register({
  mouse: Samsara.Inputs.MouseInput,
  touch: Samsara.Inputs.TouchInput
});

const drag = new Samsara.Inputs.GenericInput(["mouse", "touch"], {
  direction: Samsara.Inputs.GenericInput.DIRECTION.X
});

drag.subscribe(surface);
drag.on("update", ({ value }) => {
  x.set(value);
});
```

## Layouts

`Samsara.Layouts` contains higher-level render-tree containers that arrange child renderables. The vendored namespace exposes:

- `DrawerLayout`
- `FlexibleLayout`
- `GridLayout`
- `SequentialLayout`
- `HeaderFooterLayout`
- `Scrollview`

`SequentialLayout` is the simplest place to start. It lays out items in a row or column using each item's `size`.

```ts
const layout = new Samsara.Layouts.SequentialLayout({
  direction: Samsara.Layouts.SequentialLayout.DIRECTION.Y,
  spacing: 12
});

layout.push(new Samsara.DOM.Surface({ content: "One", size: [200, 48] }));
layout.push(new Samsara.DOM.Surface({ content: "Two", size: [200, 48] }));

context.add(layout);
```

Layouts are renderables, so add them to a context or another render-tree node. They usually provide methods such as `push`, `pop`, `unshift`, `shift`, `insertAfter`, `insertBefore`, and `unlink`, depending on the layout.

## Streams

`Samsara.Streams` is the composition layer that connects inputs, transitionables, layout measurements, and transforms.

- `SimpleStream` provides `map`, `filter`, `split`, and `pluck`.
- `Stream` listens to `start`, `update`, and `end` events and batches them once per engine cycle.
- `Stream.merge(streams)` combines an array or object of streams.
- `Stream.lift(mapper, streams)` maps several streams into one derived stream.
- `Observable`, `Accumulator`, and `Differential` provide small stateful stream utilities.

Example: combine position and size into a transform.

```ts
const position = new Samsara.Core.Transitionable([0, 0]);
const size = new Samsara.Streams.Observable([100, 40]);

const transform = Samsara.Streams.Stream.lift(
  ([x, y], [width]) => Samsara.Core.Transform.translate([x + width / 2, y, 0]),
  [position, size]
);

context.add({ transform }).add(surface);
position.set([80, 20], { duration: 400 });
```

Streams may emit `false` to suppress propagation. This is useful when a mapper cannot produce a valid layout value yet, such as before a parent size is known.

## Practical Integration Notes

- Import `react-samsarajs/samsara.css` once before mounting surfaces.
- Keep direct runtime use inside browser-only code paths.
- Prefer `SamsaraRoot` and `SamsaraSurface` for React-owned UI; use direct `loadSamsara()` APIs for advanced layout, animation, input, or stream composition.
- Remove contexts, render-tree nodes, input subscriptions, and event handlers during cleanup.
- Treat upstream runtime objects as browser objects. They are not safe to create during SSR.
