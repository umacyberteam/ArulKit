declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void;
      toggle?: () => void;
      addEvent?: (
        event: string,
        metadata: Record<string, unknown>,
        callback?: () => void
      ) => void;
      setAttributes?: (
        attrs: Record<string, string>,
        callback?: (err: unknown) => void
      ) => void;
      onLoad?: () => void;
    };
  }
}

/**
 * Opens the Tawk.to widget. If a message is provided, it's sent as a
 * pre-filled event so the visitor doesn't have to retype what they wrote in
 * the "Suggest a Tool" form. Falls back to a mailto-style prompt in the
 * console if Tawk.to hasn't loaded (e.g. blocked by an ad-blocker, or not
 * configured yet).
 */
export function openTawkChat(message?: string) {
  const api = typeof window !== "undefined" ? window.Tawk_API : undefined;

  if (!api || !api.maximize) {
    return false;
  }

  if (message) {
    api.addEvent?.("suggest-a-tool", { message }, () => {
      api.maximize?.();
    });
  } else {
    api.maximize();
  }
  return true;
}
