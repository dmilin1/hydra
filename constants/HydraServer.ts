import KeyStore from "../utils/KeyStore";

export const USE_CUSTOM_HYDRA_SERVER_KEY = "useHydraServer";
export const CUSTOM_HYDRA_SERVER_URL_KEY = "customHydraServerUrl";
export const DEFAULT_HYDRA_SERVER_URL = "https://api.hydraapp.io";
export const HYDRA_SERVER_URL = __DEV__
  ? process.env.EXPO_PUBLIC_HYDRA_SERVER
  : "https://api.hydraapp.io";

export const USING_CUSTOM_HYDRA_SERVER =
  (KeyStore.getBoolean(USE_CUSTOM_HYDRA_SERVER_KEY) ?? false) &&
  !(
    KeyStore.getString(CUSTOM_HYDRA_SERVER_URL_KEY)?.includes("hydraapp.io") ??
    false
  );
