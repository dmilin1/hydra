import { assertOk, defineOperation, gql } from "./GqlApi";
import { getAvailableSubreddit } from "./SubredditAccess";
import { Subreddits, SubredditListItem } from "../Subreddits";

const UserSubreddits = defineOperation(
  "UserSubreddits",
  "333abc2dc448cbfa598f984225c4a05a69c70db0ed55d88a33a526d5403389ef",
);

const UpdateSubredditSubscriptions = defineOperation(
  "UpdateSubredditSubscriptions",
  "5de46969ea6ea4ba6ec17ad2f7174498982453f96b1b9cc1172b63c18f2a7f2f",
);

// Reddit's app asks for this many at once and doesn't page.
const PAGE_SIZE = 5000;

type ListName = "subscribed" | "moderated" | "followed";

type ListPage = { edges: any[]; pageInfo: any } | undefined;

/**
 * One UserSubreddits request for the lists that aren't complete yet. A list's
 * cursor is null for its first page and false once it's complete.
 */
async function getUserSubredditsPage(
  cursors: Record<ListName, string | null | false>,
): Promise<Record<ListName, ListPage>> {
  const data = await gql(UserSubreddits, {
    fetchSubscribed: cursors.subscribed !== false,
    subscribedAfter: cursors.subscribed || null,
    fetchFollowed: cursors.followed !== false,
    followedAfter: cursors.followed || null,
    fetchModerated: cursors.moderated !== false,
    moderatedAfter: cursors.moderated || null,
    limit: PAGE_SIZE,
    includeRedditHandleInfo: false,
    includeVerificationStatus: false,
  });
  return {
    subscribed: data.identity?.subscribedSubredditInfos,
    moderated: data.identity?.redditor?.moderatedSubreddits,
    followed: data.identity?.followedRedditorsInfo,
  };
}

export const sortByName = (a: SubredditListItem, b: SubredditListItem) =>
  a.name.localeCompare(b.name);

/** What every subreddit item has, from any query's Subreddit (id t5_...). */
export function formatSubredditBase(node: any): SubredditListItem {
  return {
    id: node.id.replace(/^t5_/, ""),
    type: "subreddit",
    name: node.name,
    url: `https://www.reddit.com/r/${node.name}/`,
    iconURL: node.styles?.icon || node.styles?.legacyIcon?.url || undefined,
  };
}

/**
 * A followed user as a subscription, like Reddit's old API listed them: named
 * u_<name> and linking to their user page.
 */
export function formatFollowedUser(
  userName: string,
  profile?: any,
): SubredditListItem {
  return {
    id: (profile?.id ?? "").replace(/^t5_/, ""),
    type: "subreddit",
    name: `u_${userName}`,
    url: `https://www.reddit.com/user/${userName}/`,
    iconURL:
      profile?.styles?.icon || profile?.styles?.legacyIcon?.url || undefined,
  };
}

/**
 * The user's subscribed and moderated subreddits, sorted by name, with
 * followed users among the subscriptions. Subscribed subreddits that are now
 * banned or private are left out.
 */
export async function getSubreddits(): Promise<Omit<Subreddits, "favorites">> {
  const edges: Record<ListName, any[]> = {
    subscribed: [],
    moderated: [],
    followed: [],
  };
  const cursors: Record<ListName, string | null | false> = {
    subscribed: null,
    moderated: null,
    followed: null,
  };
  const lists = Object.keys(cursors) as ListName[];
  while (lists.some((list) => cursors[list] !== false)) {
    const page = await getUserSubredditsPage(cursors);
    for (const list of lists) {
      if (cursors[list] === false) continue;
      edges[list].push(...(page[list]?.edges ?? []));
      cursors[list] =
        (page[list]?.pageInfo?.hasNextPage && page[list]?.pageInfo.endCursor) ||
        false;
    }
  }

  const toNodes = (listEdges: any[]) =>
    listEdges
      .map((edge) => edge?.node)
      .filter((node) => node?.__typename === "Subreddit");
  const moderatedNodes = toNodes(edges.moderated);
  const followedUsers = edges.followed
    .map((edge) => edge?.node?.profile)
    .filter((profile) => profile?.name)
    .map((profile) =>
      formatFollowedUser(
        profile.redditorInfo?.prefixedName?.replace(/^u\//, "") ??
          profile.name.replace(/^u_/, ""),
        profile,
      ),
    );
  return {
    moderator: moderatedNodes.map(formatSubredditBase).sort(sortByName),
    subscriber: [
      ...toNodes(edges.subscribed).map(formatSubredditBase),
      ...followedUsers,
    ].sort(sortByName),
  };
}

/**
 * Subscribes to or unsubscribes from a subreddit. Returns the subreddit and
 * its new subscription state, so callers can update their lists without
 * fetching them again: right after the change, Reddit can still return the
 * old lists. Reddit's app updates its local copy the same way.
 */
export async function setSubscriptionStatus(
  subreddit: string,
  subscribe: boolean,
): Promise<{ subreddit: SubredditListItem; subscribed: boolean }> {
  const info = await getAvailableSubreddit(subreddit);
  const data = await gql(UpdateSubredditSubscriptions, {
    input: {
      inputs: [
        {
          subredditId: info.id,
          subscribeState: subscribe ? "SUBSCRIBED" : "NONE",
        },
      ],
    },
  });
  const result = data.updateSubredditSubscriptions;
  assertOk(result, "Failed to update subscription");
  // Not payload.subreddit.isSubscribed: Reddit returns it from before the
  // change. payload.state is the new state.
  const state = result.payloads?.[0]?.state;
  const subscribed = state ? state === "SUBSCRIBED" : subscribe;
  return { subreddit: formatSubredditBase(info), subscribed };
}
