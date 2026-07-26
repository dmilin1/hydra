/** Web has no alternate app icons; the settings entry hides itself. */
export const supportsAlternateIcons = false;

export function getAppIconAlias(): string | null {
  return null;
}

export function setAppIconAlias(): Promise<string | null> {
  return Promise.reject(
    new Error("Alternate app icons are not supported on web"),
  );
}
