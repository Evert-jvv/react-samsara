import type { SamsaraNamespace } from "./types.js";

declare global {
  interface Window {
    Samsara?: SamsaraNamespace;
    __REACT_SAMSARAJS_SCRIPT_URL__?: string;
  }
}

let loadPromise: Promise<SamsaraNamespace> | null = null;

function getDefaultScriptUrl() {
  const importUrl = import.meta.url;

  if (importUrl.includes("/src/")) {
    return new URL("../vendor/samsara/dist/samsara.js", importUrl).toString();
  }

  return new URL("./vendor/samsara.js", importUrl).toString();
}

function assertSamsaraNamespace(value: unknown): asserts value is SamsaraNamespace {
  const candidate = value as Partial<SamsaraNamespace> | undefined;

  if (
    !candidate?.Core ||
    !candidate.DOM ||
    !candidate.Events ||
    !candidate.Inputs ||
    !candidate.Layouts ||
    !candidate.Streams ||
    !candidate.Camera
  ) {
    throw new Error("SamsaraJS loaded, but the expected namespace was not found.");
  }
}

export function loadSamsara(): Promise<SamsaraNamespace> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("SamsaraJS can only be loaded in a browser environment."));
  }

  if (window.Samsara) {
    try {
      assertSamsaraNamespace(window.Samsara);
      return Promise.resolve(window.Samsara);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<SamsaraNamespace>((resolve, reject) => {
    const scriptUrl = window.__REACT_SAMSARAJS_SCRIPT_URL__ ?? getDefaultScriptUrl();
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-react-samsarajs="true"][src="${scriptUrl}"]`
    );
    const script = existingScript ?? document.createElement("script");

    function cleanup() {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    }

    function onLoad() {
      cleanup();

      try {
        assertSamsaraNamespace(window.Samsara);
        resolve(window.Samsara);
      } catch (error) {
        loadPromise = null;
        reject(error);
      }
    }

    function onError() {
      cleanup();
      loadPromise = null;
      reject(new Error(`Failed to load SamsaraJS from ${scriptUrl}`));
    }

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    if (!existingScript) {
      script.async = true;
      script.dataset.reactSamsarajs = "true";
      script.src = scriptUrl;
      document.head.append(script);
    }
  });

  return loadPromise;
}
