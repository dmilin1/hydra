import CookieManager from "@react-native-cookies/cookies";
import * as SecureStore from "expo-secure-store";

export default class RedditCookies {
  static async restoreSessionCookies(username: string) {
    const redditSession = await SecureStore.getItemAsync(
      `redditSession-${username}`,
    );
    if (redditSession) {
      await CookieManager.set(
        "https://www.reddit.com",
        JSON.parse(redditSession),
      );
    }
  }

  static async getSessionCookies(username: string) {
    return await SecureStore.getItemAsync(`redditSession-${username}`);
  }

  static async hasSessionCookieBeenSet() {
    const cookies = await CookieManager.get("https://www.reddit.com");
    return cookies?.reddit_session !== undefined;
  }

  static async saveSessionCookies(username: string) {
    const cookies = await CookieManager.get("https://www.reddit.com");
    if (cookies?.reddit_session) {
      await SecureStore.setItemAsync(
        `redditSession-${username}`,
        JSON.stringify(cookies.reddit_session),
      );
    }
  }

  static async deleteSessionCookies(username: string) {
    await SecureStore.deleteItemAsync(`redditSession-${username}`);
  }

  static async persistSessionCookies() {
    const cookies = await CookieManager.get("https://www.reddit.com");
    if (cookies?.reddit_session && !cookies?.reddit_session?.expires) {
      const newCookies = {
        ...cookies.reddit_session,
        expires: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 10_000,
        ).toISOString(),
      };
      await CookieManager.set("https://www.reddit.com", newCookies);
    }
  }

  static async clearSessionCookies() {
    // First, invalidate the reddit_session cookie by setting it to expired.
    // This works around a bug in @react-native-cookies/cookies where clearAll(true)
    // triggers a sync FROM WebKit TO HTTP, restoring cookies that were just cleared.
    // See: https://github.com/react-native-cookies/cookies/pull/152
    const staleRedditSessionCookie = {
      name: "reddit_session",
      value: "",
      domain: ".reddit.com",
      path: "/",
      expires: new Date(0).toISOString(),
    };
    await CookieManager.set("https://www.reddit.com", staleRedditSessionCookie);
    await CookieManager.set(
      "https://www.reddit.com",
      staleRedditSessionCookie,
      true,
    );
    await CookieManager.clearAll();
    await CookieManager.clearAll(true);
  }
}
