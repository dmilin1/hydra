import { useContext } from "react";

import { ToastContext } from "../contexts/ToastContext";

/**
 * Runs a write to Reddit (vote, save, subscribe...) and shows a toast with
 * Reddit's message if it fails. Returns undefined on failure, so callers can
 * skip updating the UI as if it worked, and true for writes that return
 * nothing.
 */
export default function useWriteWithToast() {
  const { showToast } = useContext(ToastContext);

  return async <T>(
    action: string,
    write: () => Promise<T>,
  ): Promise<(T extends void ? true : T) | undefined> => {
    try {
      const result = await write();
      return (result === undefined ? true : result) as T extends void
        ? true
        : T;
    } catch (e) {
      showToast({
        title: `Couldn't ${action}`,
        body: e instanceof Error ? e.message : undefined,
      });
      return undefined;
    }
  };
}
