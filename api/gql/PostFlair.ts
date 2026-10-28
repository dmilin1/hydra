import { useEffect, useState } from "react";

import { defineOperation, gql } from "./GqlApi";
import { getSubredditInfo } from "./SubredditAccess";
import { PostFlair } from "../PostFlair";

const GetPostFlairs = defineOperation(
  "GetPostFlairs",
  "06e921b63ee516eb478e1e298bc4d248ab07c26062bef08631a1acc967eaac0f",
);

const GetPostFlairSettings = defineOperation(
  "GetPostFlairSettings",
  "1a95d8e48fc3fef3fb1eb105254e148bdcd5ff9d0604751a0905f8b28b381cd3",
);

/**
 * The post flairs the user can pick in a subreddit: none when post flair is
 * off, or when only moderators assign it and the user can't.
 */
export async function getAllowedPostFlairs(
  subreddit: string,
): Promise<PostFlair[]> {
  const [info, settingsData] = await Promise.all([
    getSubredditInfo(subreddit),
    gql(GetPostFlairSettings, { subredditName: subreddit }),
  ]);
  const settings = settingsData.subredditInfoByName?.postFlairSettings;
  const canEditFlair =
    !!info?.modPermissions?.isAllAllowed ||
    !!info?.modPermissions?.isFlairEditingAllowed;
  if (
    !info?.id ||
    !settings?.isEnabled ||
    !(settings.isSelfAssignable || canEditFlair)
  ) {
    return [];
  }
  const data = await gql(GetPostFlairs, { subredditId: info.id });
  const templates = data.subredditInfoById?.postFlairTemplates ?? [];
  return templates
    .filter((template: any) => canEditFlair || !template.isModOnly)
    .map((template: any) => ({
      id: template.id,
      text: template.text ?? "",
    }));
}

export function useAllowedPostFlairs(subreddit: string): PostFlair[] {
  const [postFlairs, setPostFlairs] = useState<PostFlair[]>([]);

  const getPostFlairs = async () => {
    setPostFlairs(await getAllowedPostFlairs(subreddit));
  };

  useEffect(() => {
    getPostFlairs();
  }, [subreddit]);

  return postFlairs;
}
