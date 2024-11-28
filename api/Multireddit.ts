import "react-native-url-polyfill/auto";
import { api } from "./RedditApi";
import { formatSubredditData, Subreddit } from "./Subreddits";

export type Multi = {
  id: string;
  type: "multi";
  name: string;
  iconURL: string;
  url: string;
  subreddits: Subreddit[];
};

export function formatMultiData(data: any): Multi {
  return {
    id: data.name,
    type: "multi",
    name: data.display_name,
    iconURL: data.icon_url,
    url: data.path,
    subreddits: data.subreddits
      .map((subreddit: any) => formatSubredditData(subreddit))
      .sort((a: Subreddit, b: Subreddit) => a.name.localeCompare(b.name)),
  };
}

export async function getMyMultis(): Promise<Multi[]> {
  const searchParams = new URLSearchParams({
    expand_srs: "true",
  });
  const multis = await api(
    `https://www.reddit.com/api/multi/mine?${searchParams.toString()}`,
    {},
    { requireAuth: true },
  );
  return multis.map((multi: any) => formatMultiData(multi.data));
}

export async function addToMulti(
  multi: Multi,
  subredditName: Subreddit["name"],
) {
  await api(
    `https://www.reddit.com/api/multi${multi.url}/r/${subredditName}`,
    {
      method: "PUT",
    },
    {
      requireAuth: true,
      body: {
        model: JSON.stringify({
          name: subredditName,
        }),
      },
    },
  );
}

export async function removeFromMulti(
  multi: Multi,
  subredditName: Subreddit["name"],
) {
  await api(
    `https://www.reddit.com/api/multi${multi.url}/r/${subredditName}`,
    {
      method: "DELETE",
    },
    {
      requireAuth: true,
      dontJsonifyResponse: true,
    },
  );
}
