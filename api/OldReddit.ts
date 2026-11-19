import { NotLoggedInError } from "./gql/WebToken";
import { USER_AGENT } from "./UserAgent";
import safeFetch from "../utils/safeFetch";

/**
 * Old Reddit still serves feeds that Reddit's app and site have dropped (like
 * r/all), but only to logged in users. Only the post ids are read from it; the
 * posts come from GraphQL like every other feed's.
 *
 * Reads the HTML pages because old Reddit's .json listings are blocked for
 * some sorts (new, rising), while the pages work for all of them.
 */

const OLD_REDDIT_URL = "https://old.reddit.com";

/**
 * The post ids (t3_...) on one page of an old Reddit listing, such as
 * "/r/all/top/?t=day", leaving out ads.
 */
export async function getOldRedditPostIds(
  path: string,
  after?: string,
): Promise<string[]> {
  let url = OLD_REDDIT_URL + path;
  if (after) url += `${path.includes("?") ? "&" : "?"}after=${after}`;

  const response = await safeFetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  // Logged out users are redirected to the login page.
  if (response.url.includes("/login")) throw new NotLoggedInError();
  if (!response.ok) {
    throw new Error(`Old Reddit returned HTTP ${response.status}`);
  }

  const html = await response.text();
  return [...html.matchAll(/<div class=" thing[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => !tag.includes('data-promoted="true"'))
    .map((tag) => tag.match(/data-fullname="(t3_\w+)"/)?.[1])
    .filter((id): id is string => id !== undefined);
}
