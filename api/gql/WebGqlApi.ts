import CookieManager from "@preeternal/react-native-cookie-manager";

import { postShredditGraphql, primeWebCookies, REDDIT_URL } from "./WebToken";

/**
 * A few actions exist only on www.reddit.com, not in the app's API (e.g.
 * removing a subreddit from a multireddit). The website sends them to its
 * own GraphQL proxy by operation name, authenticated by the session cookies
 * plus the csrf_token cookie's value in the body.
 */

async function getCsrfToken(): Promise<string> {
  let token = (await CookieManager.get(REDDIT_URL))?.csrf_token?.value;
  if (!token) {
    await primeWebCookies();
    token = (await CookieManager.get(REDDIT_URL))?.csrf_token?.value;
  }
  if (!token) {
    throw new Error("Reddit did not issue a csrf_token cookie");
  }
  return token;
}

/**
 * Runs one of the website's GraphQL operations and returns its data. Throws
 * when Reddit rejects it.
 */
export async function webGql<TData = any>(
  operation: string,
  variables: Record<string, any>,
): Promise<TData> {
  const response = await postShredditGraphql(
    JSON.stringify({ operation, variables, csrf_token: await getCsrfToken() }),
  );
  const text = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch (_e) {
    // Errors can come back as bare HTTP 500s with no body.
  }
  if (!response.ok || json?.data == null) {
    const detail = json?.errors?.[0]?.message;
    throw new Error(
      `${operation} failed (HTTP ${response.status}${detail ? `, ${detail}` : ""})`,
    );
  }
  return json.data;
}
