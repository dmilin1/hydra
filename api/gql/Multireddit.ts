import { assertOk, defineOperation, gql } from "./GqlApi";
import { getAvailableSubreddit } from "./SubredditAccess";
import {
  formatFollowedUser,
  formatSubredditBase,
  sortByName,
} from "./Subreddits";
import { webGql } from "./WebGqlApi";
import { Multi } from "../Multireddit";
import { SubredditListItem } from "../Subreddits";

const MyAuthoredMultireddits = defineOperation(
  "MyAuthoredMultireddits",
  "39752da7022860e18d1b899324d28ee4cd2571e07f8fa2049a6905d525e4f9b7",
);

const AddSubredditsToMultireddit = defineOperation(
  "AddSubredditsToMultireddit",
  "3dbe9de6840b240e9e45480e384fdc52dd3ea633afd18b1984a8d3dc0381fb3e",
);

function formatMulti(node: any): Multi {
  return {
    id: node.name,
    type: "multi",
    name: node.displayName,
    iconURL: node.icon,
    url: node.path,
    subreddits: [
      ...(node.subreddits?.edges ?? [])
        .map((edge: any) => edge?.node)
        .filter((subreddit: any) => subreddit?.name)
        .map(formatSubredditBase),
      ...(node.profiles?.edges ?? [])
        .map((edge: any) => edge?.node)
        .filter((profile: any) => profile?.redditorInfo?.name)
        .map((profile: any) =>
          formatFollowedUser(profile.redditorInfo.name, profile),
        ),
    ].sort(sortByName),
  };
}

/**
 * The multireddits the user created (not ones they follow), like Reddit's
 * old /api/multi/mine.
 */
export async function getMyMultis(): Promise<Multi[]> {
  const multis: Multi[] = [];
  let after: string | null = null;
  do {
    const data: any = await gql(MyAuthoredMultireddits, {
      withSubreddits: true,
      after,
    });
    const page = data.identity?.authoredMultireddits;
    for (const edge of page?.edges ?? []) {
      if (edge?.node) multis.push(formatMulti(edge.node));
    }
    after = page?.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return multis;
}

/**
 * Adds a subreddit to one of the user's multireddits. Returns the added
 * subreddit, so callers can update their copy of the multireddit: right after
 * the change, Reddit can still return the old list.
 */
export async function addToMulti(
  multi: Multi,
  subredditName: string,
): Promise<SubredditListItem> {
  const info = await getAvailableSubreddit(subredditName);
  const data = await gql(AddSubredditsToMultireddit, {
    // multiLabel is the multireddit's path, not its name.
    input: { multiLabel: multi.url, subredditIds: [info.id] },
  });
  const result = data.addSubredditsToMultireddit;
  assertOk(result, "Failed to add to multireddit");
  return formatSubredditBase(info);
}

/**
 * Removes a subreddit from one of the user's multireddits. Reddit's app can't
 * do this, so it goes through the website's operation.
 */
export async function removeFromMulti(
  multi: Multi,
  subreddit: SubredditListItem,
): Promise<void> {
  const data = await webGql("CustomFeedRemoveSubreddits", {
    label: multi.url,
    subredditIds: [`t5_${subreddit.id}`],
  });
  assertOk(
    data.deleteSubredditsFromMultireddit,
    "Failed to remove from multireddit",
  );
}
