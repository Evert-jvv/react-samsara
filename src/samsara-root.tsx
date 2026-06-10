"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react";
import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { loadSamsara } from "./load-samsara.js";
import { SamsaraReactContext } from "./react-context.js";
import type { SamsaraContext, SamsaraContextOptions, SamsaraLoadState, SamsaraReadyPayload } from "./types.js";

export type SamsaraRootProps<TElement extends ElementType = "div"> = {
  as?: TElement;
  contextOptions?: SamsaraContextOptions;
  onError?: (error: Error) => void;
  onReady?: (payload: SamsaraReadyPayload) => void;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "onError" | "onReady">;

export function SamsaraRoot<TElement extends ElementType = "div">({
  as,
  children,
  contextOptions,
  onError,
  onReady,
  ...props
}: SamsaraRootProps<TElement>) {
  const Host = as ?? "div";
  const hostRef = useRef<Element | null>(null);
  const contextRef = useRef<SamsaraContext | null>(null);
  const [state, setState] = useState<SamsaraLoadState>({
    context: null,
    error: null,
    loading: true,
    samsara: null
  });

  useEffect(() => {
    let cancelled = false;

    loadSamsara()
      .then((samsara) => {
        if (cancelled || !hostRef.current) {
          return;
        }

        const context = new samsara.DOM.Context(contextOptions);
        context.mount(hostRef.current);
        contextRef.current = context;

        const nextState: SamsaraLoadState = {
          context,
          error: null,
          loading: false,
          samsara
        };

        setState(nextState);
        onReady?.({ context, samsara });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const normalized = error instanceof Error ? error : new Error(String(error));
        setState({ context: null, error: normalized, loading: false, samsara: null });
        onError?.(normalized);
      });

    return () => {
      cancelled = true;
      contextRef.current?.remove();
      contextRef.current = null;
    };
  }, [contextOptions, onError, onReady]);

  const value = useMemo(() => state, [state]);

  return (
    <SamsaraReactContext.Provider value={value}>
      {createElement(Host, { ...props, ref: hostRef }, children)}
    </SamsaraReactContext.Provider>
  );
}
