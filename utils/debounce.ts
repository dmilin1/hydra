import { DependencyList, useEffect } from "react";

export function useDebouncedEffect(
  delay: number,
  func: () => void,
  deps: DependencyList,
) {
  useEffect(() => {
    const handler = setTimeout(() => func(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}
