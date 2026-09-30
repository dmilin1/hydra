import KeyStore from "../utils/KeyStore";

export const USE_CUSTOM_HYDRA_SERVER_KEY = "useHydraServer";
export const CUSTOM_HYDRA_SERVER_URL_KEY = "customHydraServerUrl";
export const CUSTOM_HYDRA_SERVER_HEADERS_KEY = "customHydraServerHeaders";
export const DEFAULT_HYDRA_SERVER_URL = "https://api.hydraapp.io";
export const HYDRA_SERVER_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_HYDRA_SERVER ?? DEFAULT_HYDRA_SERVER_URL)
  : (KeyStore.getString(CUSTOM_HYDRA_SERVER_URL_KEY) ??
    DEFAULT_HYDRA_SERVER_URL);

export const USING_CUSTOM_HYDRA_SERVER =
  (KeyStore.getBoolean(USE_CUSTOM_HYDRA_SERVER_KEY) ?? false) &&
  !(
    KeyStore.getString(CUSTOM_HYDRA_SERVER_URL_KEY)?.includes("hydraapp.io") ??
    false
  );

/**
 * Parses the user's custom headers setting: one "Name: value" per line.
 * Blank or malformed lines are ignored.
 */
export function parseCustomHeaders(
  raw: string | undefined,
): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of (raw ?? "").split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (name) headers[name] = value;
  }
  return headers;
}

export function getCustomHeaders(): Record<string, string> {
  return parseCustomHeaders(
    KeyStore.getString(CUSTOM_HYDRA_SERVER_HEADERS_KEY),
  );
}

/**
 * fetch() against the configured Hydra server. When a custom server is in
 * use, the user's custom headers are attached. They are never sent to the
 * official server.
 */
export function hydraFetch(path: string, init: RequestInit = {}) {
  return fetch(`${HYDRA_SERVER_URL}${path}`, {
    ...init,
    headers: {
      ...(USING_CUSTOM_HYDRA_SERVER ? getCustomHeaders() : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}
