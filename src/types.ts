import type { CSSProperties, ReactNode } from "react";

export type SamsaraSize = [number | true | undefined, number | true | undefined];
export type SamsaraVector2 = [number, number];
export type SamsaraVector3 = [number, number, number];
export type SamsaraTransform = number[];

export type SamsaraContextOptions = {
  enableScroll?: boolean;
};

export type SamsaraSurfaceOptions = {
  aspectRatio?: number;
  attributes?: Record<string, string | number | boolean | undefined>;
  classes?: string[];
  content?: string | DocumentFragment;
  enableScroll?: boolean;
  margins?: SamsaraVector2;
  opacity?: number;
  origin?: SamsaraVector2;
  proportions?: SamsaraVector2;
  properties?: CSSProperties;
  roundToPixel?: boolean;
  size?: SamsaraSize;
  tagName?: keyof HTMLElementTagNameMap | string;
};

export type SamsaraSurfaceInstance = {
  addClass(className: string): void;
  deploy(target: Element): void;
  getClassList(): string[];
  off(type: string, handler: (event: unknown) => void): void;
  on(type: string, handler: (event: unknown) => void): void;
  remove(): void;
  removeClass(className: string): void;
  setAttributes(attributes: NonNullable<SamsaraSurfaceOptions["attributes"]>): void;
  setContent(content: NonNullable<SamsaraSurfaceOptions["content"]>): void;
  setOpacity(opacity: number): void;
  setOptions(options: SamsaraSurfaceOptions): void;
  setOrigin(origin: SamsaraVector2): void;
  setProperties(properties: NonNullable<SamsaraSurfaceOptions["properties"]>): void;
  setSize(size: SamsaraSize): void;
};

export type SamsaraRenderTreeNode = {
  remove?: () => void;
};

export type SamsaraContext = {
  add(renderable: unknown): SamsaraRenderTreeNode;
  mount(node: Element): void;
  off(type: string, handler: (event: unknown) => void): void;
  on(type: string, handler: (event: unknown) => void): void;
  remove(): void;
};

export type SamsaraNamespace = {
  Camera: Record<string, unknown>;
  Core: {
    Engine: unknown;
    Timer: unknown;
    Transform: Record<string, (...args: unknown[]) => SamsaraTransform> & Record<string, SamsaraTransform>;
    Transitionable: new (value?: unknown) => unknown;
    View: unknown;
  };
  DOM: {
    Context: new (options?: SamsaraContextOptions) => SamsaraContext;
    Surface: new (options?: SamsaraSurfaceOptions) => SamsaraSurfaceInstance;
    [key: string]: unknown;
  };
  Events: Record<string, unknown>;
  Inputs: Record<string, unknown>;
  Layouts: Record<string, unknown>;
  Streams: Record<string, unknown>;
};

export type SamsaraReadyPayload = {
  context: SamsaraContext;
  samsara: SamsaraNamespace;
};

export type SamsaraSurfaceReadyPayload = {
  element: Element | null;
  node: SamsaraRenderTreeNode | null;
  samsara: SamsaraNamespace;
  surface: SamsaraSurfaceInstance;
};

export type SamsaraLoadState = {
  context: SamsaraContext | null;
  error: Error | null;
  loading: boolean;
  samsara: SamsaraNamespace | null;
};

export type SamsaraChildren = {
  children?: ReactNode;
};
