import { defineOperation, gql } from "./GqlApi";
import { contentToHtml } from "./RichText";
import { checkSubredditAccess, getSubredditInfo } from "./SubredditAccess";
import { Rule, Sidebar } from "../SubredditDetails";

const GetSubredditRules = defineOperation(
  "GetSubredditRules",
  "31711128de3533e8c03ad64c7b5229e6524b8c194995de8c817ef934a1f5331c",
);

/**
 * The subreddit's classic sidebar (its description). New Reddit and Reddit's
 * app show sidebar widgets instead, which Hydra doesn't render.
 */
export async function getSidebar(subreddit: string): Promise<Sidebar> {
  // Throws the subreddit's access errors; its info is cached by then.
  await checkSubredditAccess(subreddit);
  const info = await getSubredditInfo(subreddit);
  return {
    subscribers: info?.subscribersCount ?? 0,
    weeklyVisitors: info?.communityStats?.weeklyActiveUsersCount ?? undefined,
    weeklyContributions:
      info?.communityStats?.weeklyContributionsCount ?? undefined,
    descriptionHTML: info?.description ? contentToHtml(info.description) : "",
  };
}

export async function getRules(subreddit: string): Promise<Rule[]> {
  const data = await gql(GetSubredditRules, { name: subreddit });
  // Unlike posts and comments, rules come with real HTML.
  return (data.subredditInfoByName?.rules ?? []).map((rule: any) => ({
    name: rule.name,
    descriptionHTML: rule.content?.html ?? "",
  }));
}
