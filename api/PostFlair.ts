import { useEffect, useState } from "react";
import { api } from "./RedditApi";
import { decode } from "html-entities";

export type PostFlair = {
  id: string;
  text: string;
  modOnly: boolean;
};

export function formatPostFlair(postData: any): PostFlair | null {
  if (postData.link_flair_template_id && postData.link_flair_text) {
    return {
      id: postData.link_flair_template_id,
      text: decode(postData.link_flair_text),
      modOnly: false,
    };
  }
  return null;
}

export function formatAllowedPostFlair(flairData: any): PostFlair {
  return {
    id: flairData.id,
    text: decode(flairData.text),
    modOnly: flairData.mod_only,
  };
}

export async function getAllowedPostFlairs(
  subreddit: string,
): Promise<PostFlair[]> {
  const data = await api(
    `https://www.reddit.com/r/${subreddit}/api/link_flair_v2.json`,
  );

  return data.map((flair: any) => formatAllowedPostFlair(flair));
}

export function useAllowedPostFlairs(subreddit: string): PostFlair[] {
  const [postFlairs, setPostFlairs] = useState<PostFlair[]>([]);

  const getPostFlairs = async () => {
    const flairs = await getAllowedPostFlairs(subreddit);
    setPostFlairs(flairs.filter((flair) => !flair.modOnly));
  };

  useEffect(() => {
    getPostFlairs();
  }, [subreddit]);

  return postFlairs;
}
