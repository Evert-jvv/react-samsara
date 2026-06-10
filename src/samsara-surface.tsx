"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSamsara } from "./react-context.js";
import type {
  SamsaraRenderTreeNode,
  SamsaraSurfaceInstance,
  SamsaraSurfaceOptions,
  SamsaraSurfaceReadyPayload
} from "./types.js";

type SurfaceEventHandler = (event: unknown) => void;

export type SamsaraSurfaceProps = Omit<SamsaraSurfaceOptions, "tagName" | "properties"> & {
  as?: SamsaraSurfaceOptions["tagName"];
  children?: ReactNode;
  onClick?: SurfaceEventHandler;
  onDeploy?: SurfaceEventHandler;
  onMouseDown?: SurfaceEventHandler;
  onMouseMove?: SurfaceEventHandler;
  onMouseUp?: SurfaceEventHandler;
  onReady?: (payload: SamsaraSurfaceReadyPayload) => void;
  onRecall?: SurfaceEventHandler;
  onTouchEnd?: SurfaceEventHandler;
  onTouchMove?: SurfaceEventHandler;
  onTouchStart?: SurfaceEventHandler;
  properties?: CSSProperties;
  tagName?: SamsaraSurfaceOptions["tagName"];
};

const eventPropMap = {
  click: "onClick",
  deploy: "onDeploy",
  mousedown: "onMouseDown",
  mousemove: "onMouseMove",
  mouseup: "onMouseUp",
  recall: "onRecall",
  touchend: "onTouchEnd",
  touchmove: "onTouchMove",
  touchstart: "onTouchStart"
} as const;

function createOptions(props: SamsaraSurfaceProps): SamsaraSurfaceOptions {
  const {
    as,
    attributes,
    children,
    classes,
    content,
    enableScroll,
    margins,
    opacity,
    origin,
    properties,
    proportions,
    size,
    tagName
  } = props;

  return {
    attributes,
    classes,
    content: children ? "" : content,
    enableScroll,
    margins,
    opacity,
    origin,
    properties,
    proportions,
    size,
    tagName: tagName ?? as
  };
}

export function SamsaraSurface(props: SamsaraSurfaceProps) {
  const {
    children,
    onClick,
    onDeploy,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onReady,
    onRecall,
    onTouchEnd,
    onTouchMove,
    onTouchStart
  } = props;
  const { context, samsara } = useSamsara();
  const surfaceRef = useRef<SamsaraSurfaceInstance | null>(null);
  const nodeRef = useRef<SamsaraRenderTreeNode | null>(null);
  const onReadyRef = useRef(onReady);
  const eventHandlersRef = useRef({
    onClick,
    onDeploy,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onRecall,
    onTouchEnd,
    onTouchMove,
    onTouchStart
  });
  const latestOptionsRef = useRef<SamsaraSurfaceOptions | null>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const options = useMemo(() => createOptions(props), [props]);

  eventHandlersRef.current = {
    onClick,
    onDeploy,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onRecall,
    onTouchEnd,
    onTouchMove,
    onTouchStart
  };
  onReadyRef.current = onReady;
  latestOptionsRef.current = options;

  useEffect(() => {
    if (!context || !samsara || surfaceRef.current) {
      return;
    }

    const surface = new samsara.DOM.Surface(latestOptionsRef.current ?? {});
    let node: SamsaraRenderTreeNode | null = null;

    surfaceRef.current = surface;

    const onDeploy = (target: unknown) => {
      const element = target instanceof Element ? target : null;

      setPortalTarget(element);
      eventHandlersRef.current.onDeploy?.(target);
      onReadyRef.current?.({ element, node, samsara, surface });
    };

    const onRecall = (event: unknown) => {
      eventHandlersRef.current.onRecall?.(event);
      setPortalTarget(null);
    };

    surface.on("deploy", onDeploy);
    surface.on("recall", onRecall);

    const registered: Array<[string, SurfaceEventHandler]> = [];

    for (const [eventName, propName] of Object.entries(eventPropMap)) {
      if (eventName === "deploy" || eventName === "recall") {
        continue;
      }

      const forwarder: SurfaceEventHandler = (event) => {
        eventHandlersRef.current[propName]?.(event);
      };

      surface.on(eventName, forwarder);
      registered.push([eventName, forwarder]);
    }

    node = context.add(surface);
    nodeRef.current = node;

    return () => {
      for (const [eventName, handler] of registered) {
        surface.off(eventName, handler);
      }
      surface.off("deploy", onDeploy);
      surface.off("recall", onRecall);
      node?.remove?.();
      surface.remove();
      surfaceRef.current = null;
      nodeRef.current = null;
      setPortalTarget(null);
    };
  }, [context, samsara]);

  useEffect(() => {
    surfaceRef.current?.setOptions(options);
  }, [options]);

  if (!portalTarget || !children) {
    return null;
  }

  return createPortal(children, portalTarget);
}
