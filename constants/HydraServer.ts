import KeyStore from "../utils/KeyStore";

export const USE_CUSTOM_HYDRA_SERVER_KEY = "useHydraServer";
export const CUSTOM_HYDRA_SERVER_URL_KEY = "customHydraServerUrl";
export const DEFAULT_HYDRA_SERVER_URL = "https://api.hydraapp.io";

const customServerEnabled =
  KeyStore.getBoolean(USE_CUSTOM_HYDRA_SERVER_KEY) ?? false;
const customServerUrl = customServerEnabled
  ? KeyStore.getString(CUSTOM_HYDRA_SERVER_URL_KEY)
  : undefined;

export const HYDRA_SERVER_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_HYDRA_SERVER ?? DEFAULT_HYDRA_SERVER_URL)
  : (customServerUrl ?? DEFAULT_HYDRA_SERVER_URL);

export const USING_CUSTOM_HYDRA_SERVER =
  customServerUrl !== undefined && !customServerUrl.includes("hydraapp.io");
