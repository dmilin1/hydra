import CookieManager from "@react-native-cookies/cookies";
import * as SecureStore from "expo-secure-store";

import { Account } from "../api/User";

export default class RedditCookies {
  static async restoreSessionCookies(account: Account) {
    const redditSession = await SecureStore.getItemAsync(
      `redditSession-${account.username}`,
    );
    if (redditSession) {
      await CookieManager.set(
        "https://www.reddit.com",
        JSON.parse(redditSession),
      );
    }
  }

  static async getSessionCookies(account: Account) {
    return await SecureStore.getItemAsync(`redditSession-${account.username}`);
  }

  static async saveSessionCookies(account: Account) {
    const cookies = await CookieManager.get("https://www.reddit.com");
    if (cookies?.reddit_session) {
      await SecureStore.setItemAsync(
        `redditSession-${account.username}`,
        JSON.stringify(cookies.reddit_session),
      );
    }
  }

  static async deleteSessionCookies(account: Account) {
    await SecureStore.deleteItemAsync(`redditSession-${account.username}`);
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
    await CookieManager.clearAll();
    await CookieManager.clearAll(true);
    await CookieManager.removeSessionCookies();
  }
}
