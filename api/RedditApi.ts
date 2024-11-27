import { Alert } from "react-native";

import { UserAuth } from "./Authentication";
import RedditCookies from "../utils/RedditCookies";
import RedditURL from "../utils/RedditURL";

type ApiOptions = {
  depaginate?: boolean;
  requireAuth?: boolean;
  body?: { [key: string]: any };
};

export async function api(
  url: string,
  fetchOptions: RequestInit = {},
  apiOptions: ApiOptions = {},
): Promise<any> {
  if (apiOptions.requireAuth) {
    if (!UserAuth.modhash) {
      Alert.alert("You need to log in first!");
      throw new Error("User is not authenticated");
    }
    const authorizedHeaders: HeadersInit = new Headers(fetchOptions?.headers);
    authorizedHeaders.set("X-Modhash", UserAuth.modhash);
    fetchOptions.headers = authorizedHeaders;
  }

  fetchOptions.cache = "no-store";

  if (apiOptions.body) {
    const contentTypeHeaders: HeadersInit = new Headers(fetchOptions?.headers);
    contentTypeHeaders.set("Content-Type", "application/x-www-form-urlencoded");
    fetchOptions.headers = contentTypeHeaders;
    fetchOptions.body = new URLSearchParams(apiOptions.body).toString();
  }

  const res = await fetch(url, fetchOptions);

  /**
   * Reddit's session cookie doesn't set an expiration date meaning it expires
   * when the session ends. iOS automatically clears cookies without an expiration
   * date on app launch. We want sessions to persist between app closes,
   * so we set an expiration date of 10,000 days in the future.
   */
  await RedditCookies.persistSessionCookies();

  const json = await res.json();
  if (apiOptions.depaginate) {
    if (json?.data?.after != null) {
      const newURL = new RedditURL(url)
        .changeQueryParam("after", json.data.after)
        .toString();
      const nextJson = await api(newURL, fetchOptions, apiOptions);
      return [...json.data.children, ...nextJson];
    } else {
      return json.data.children;
    }
  }
  return json;
}
