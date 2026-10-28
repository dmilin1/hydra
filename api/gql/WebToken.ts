import CookieManager from "@preeternal/react-native-cookie-manager";
import * as Sentry from "@sentry/react-native";

import { USER_AGENT } from "../UserAgent";
import safeFetch, {
  SafeFetchOptions,
  SafeFetchResponse,
} from "../../utils/safeFetch";

/**
 * Reddit's GraphQL API authenticates with the same `token_v2` JWT that
 * www.reddit.com hands to logged-in browsers. The website gets it as a
 * Set-Cookie (valid for 24 hours) on its POST requests to /svc/shreddit/*,
 * but only when the request doesn't already carry a valid one. Page loads
 * stopped setting it in October 2026, but they still set the other cookies
 * (loid, csrf_token, ...) the POST needs.
 *
 * The native cookie jar is the source of truth, so switching accounts or
 * logging out (which clears the jar) automatically invalidates the token.
 */

export const REDDIT_URL = "https://www.reddit.com";

// Treat tokens this close to expiring as expired, so requests don't race the expiry.
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

// A rejected token younger than this wasn't rejected for being stale (e.g.
// Reddit's edge blocking the request), so a new one wouldn't help.
const MIN_TOKEN_AGE_FOR_REFRESH_MS = 60 * 1000;

let pendingRefresh: Promise<string> | null = null;

/**
 * The token the last refresh got, and the session cookie it was for. It's
 * trusted for that exact session even if its account check fails, so a change
 * in Reddit's token or session format can't make every request refresh.
 */
let lastIssued: { session: string; token: string; at: number } | null = null;
let reportedAccountMismatch = false;

export class NotLoggedInError extends Error {
  name: "NotLoggedInError";
  constructor() {
    super("Reddit's GraphQL API requires a logged in user");
    this.name = "NotLoggedInError";
  }
}

/** Thrown instead of refreshing when Reddit rejects a token it just issued. */
export class RecentTokenRejectedError extends Error {
  constructor() {
    super("Reddit rejected a token it just issued");
    this.name = "RecentTokenRejectedError";
  }
}

function getClaims(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (_e) {
    return null;
  }
}

function getExpiry(token: string): number | null {
  const exp = getClaims(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
}

function isFresh(token: string): boolean {
  const expiry = getExpiry(token);
  return expiry !== null && expiry - EXPIRY_MARGIN_MS > Date.now();
}

async function getCookies() {
  return await CookieManager.get(REDDIT_URL);
}

async function clearTokenCookie() {
  try {
    await CookieManager.clearByName(REDDIT_URL, "token_v2");
  } catch (_e) {
    // clearByName isn't supported by older Android WebView providers, so
    // overwrite the cookie with an expired one instead.
    await CookieManager.set(REDDIT_URL, {
      name: "token_v2",
      value: "",
      domain: ".reddit.com",
      path: "/",
      expires: new Date(0).toISOString(),
    });
  }
}

/** The account (t2_...) a reddit_session cookie belongs to, if readable. */
export function getSessionAccount(session: string): string | undefined {
  const account = getClaims(session)?.sub;
  return typeof account === "string" ? account : undefined;
}

async function requestNewToken(): Promise<string> {
  const startSession = (await getCookies())?.reddit_session?.value;
  if (!startSession) {
    throw new NotLoggedInError();
  }
  // Reddit only issues a new token when the request doesn't carry a valid one.
  await clearTokenCookie();
  await primeWebCookies();
  // Reddit rejects the empty body (HTTP 400) but still sets token_v2.
  await postShredditGraphql("{}");
  const cookies = await getCookies();
  const token = cookies?.token_v2?.value;
  if (!token || !isFresh(token)) {
    throw new Error("Reddit did not issue a token_v2 cookie");
  }
  // The HEAD renews reddit_session, so compare accounts, not cookie values.
  // changeSessionCookies() keeps a switch from overlapping the requests; this
  // is a backstop so a refresh can't hand out the previous account's token.
  const session = cookies?.reddit_session?.value;
  if (
    !session ||
    getSessionAccount(session) !== getSessionAccount(startSession)
  ) {
    throw new Error("The account changed while refreshing the token");
  }
  if (!isForSession(token, session) && !reportedAccountMismatch) {
    reportedAccountMismatch = true;
    Sentry.addBreadcrumb({
      message: "New token_v2 doesn't match reddit_session's account",
    });
  }
  lastIssued = { session, token, at: Date.now() };
  return token;
}

/**
 * Gets a new token even if the current one hasn't expired yet, for when Reddit
 * rejects `failedToken`. Concurrent callers share a single refresh request, and
 * a newer token another request already got is reused. Throws
 * RecentTokenRejectedError when the rejected token was only just issued.
 */
export async function refreshWebToken(failedToken?: string): Promise<string> {
  if (failedToken && !pendingRefresh) {
    const current = await getTrustedJarToken();
    if (current && current !== failedToken) {
      return current;
    }
    // Hydra's own clock, since the device's can be off from Reddit's.
    if (
      lastIssued?.token === failedToken &&
      Date.now() - lastIssued.at < MIN_TOKEN_AGE_FOR_REFRESH_MS
    ) {
      throw new RecentTokenRejectedError();
    }
  }
  if (!pendingRefresh) {
    pendingRefresh = requestNewToken().finally(() => {
      pendingRefresh = null;
    });
  }
  return await pendingRefresh;
}

/** Requests in flight whose responses can set session cookies. */
const cookieRequests = new Set<Promise<unknown>>();
let sessionChange: Promise<void> | null = null;

async function cookieRequest(url: string, init: SafeFetchOptions) {
  while (sessionChange) await sessionChange;
  const request = safeFetch(url, init);
  cookieRequests.add(request);
  try {
    return await request;
  } finally {
    cookieRequests.delete(request);
  }
}

/**
 * Swaps or clears the session cookies with `change`. Responses to requests
 * still in flight would write the previous account's session back, so it
 * waits for them, and holds new ones back until it's done.
 */
export async function changeSessionCookies(
  change: () => Promise<void>,
): Promise<void> {
  const previous = sessionChange;
  const run = (async () => {
    await previous;
    await Promise.allSettled([...cookieRequests]);
    await change();
  })();
  // Requests wait for it but shouldn't fail because of it.
  const settled = run.catch(() => {});
  sessionChange = settled;
  try {
    await run;
  } finally {
    if (sessionChange === settled) sessionChange = null;
  }
}

/**
 * Loads the cookies www.reddit.com's page sets (loid, csrf_token, ...; it also
 * renews reddit_session), with a HEAD: same Set-Cookie headers as GET, without
 * downloading the page.
 */
export async function primeWebCookies(): Promise<void> {
  await cookieRequest(`${REDDIT_URL}/`, {
    method: "HEAD",
    cache: "no-store",
    headers: { "User-Agent": USER_AGENT },
  });
}

/** POSTs to the website's GraphQL proxy, which also issues token_v2. */
export async function postShredditGraphql(
  body: string,
): Promise<SafeFetchResponse> {
  return await cookieRequest(`${REDDIT_URL}/svc/shreddit/graphql`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  });
}

/**
 * Whether the token was issued for the reddit_session cookie's account.
 * Switching accounts only swaps reddit_session, so the previous account's
 * token can still be in the jar.
 */
function isForSession(token: string, session: string): boolean {
  const sessionUserId = getSessionAccount(session);
  // Can't tell (e.g. Reddit changed the session format): trust the token.
  if (!sessionUserId) return true;
  return getClaims(token)?.lid === sessionUserId;
}

/** isForSession, or the token Hydra itself got for exactly this session. */
function isTrusted(token: string, session: string | undefined): boolean {
  // Logged out: a leftover token mustn't keep working.
  if (!session) return false;
  if (lastIssued?.token === token && lastIssued.session === session) {
    return true;
  }
  return isForSession(token, session);
}

/**
 * Returns a valid `token_v2` for the logged in account, refreshing it first
 * if it's missing, about to expire, or belongs to another account.
 */
export async function getWebToken(): Promise<string> {
  // The refresh records its token in lastIssued, so the jar read trusts it,
  // unless the account changed in the meantime. Its failure can be the
  // previous account's, so this one tries on its own.
  if (pendingRefresh) await pendingRefresh.catch(() => {});
  return (await getTrustedJarToken()) ?? (await refreshWebToken());
}

/** The jar's token_v2, if it's fresh and for the session's account. */
async function getTrustedJarToken(): Promise<string | undefined> {
  const cookies = await getCookies();
  const token = cookies?.token_v2?.value;
  return token &&
    isFresh(token) &&
    isTrusted(token, cookies?.reddit_session?.value)
    ? token
    : undefined;
}

/**
 * The logged in user's id (t2_...), read from the token. Throws
 * NotLoggedInError when no user is logged in.
 */
export async function getCurrentUserId(): Promise<string> {
  const userId = getClaims(await getWebToken())?.lid;
  return typeof userId === "string" ? userId : "";
}
