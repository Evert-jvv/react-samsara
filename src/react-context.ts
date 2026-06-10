import { createContext, useContext, useEffect, useState } from "react";
import { loadSamsara } from "./load-samsara.js";
import type { SamsaraLoadState } from "./types.js";

export const SamsaraReactContext = createContext<SamsaraLoadState | null>(null);

const initialLoadState: SamsaraLoadState = {
  context: null,
  error: null,
  loading: true,
  samsara: null
};

export function useSamsara(): SamsaraLoadState {
  const scoped = useContext(SamsaraReactContext);
  const [standalone, setStandalone] = useState<SamsaraLoadState>(initialLoadState);

  useEffect(() => {
    if (scoped) {
      return;
    }

    let cancelled = false;

    loadSamsara()
      .then((samsara) => {
        if (!cancelled) {
          setStandalone({ context: null, error: null, loading: false, samsara });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStandalone({
            context: null,
            error: error instanceof Error ? error : new Error(String(error)),
            loading: false,
            samsara: null
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scoped]);

  return scoped ?? standalone;
}

export function useSamsaraContext() {
  return useSamsara().context;
}
