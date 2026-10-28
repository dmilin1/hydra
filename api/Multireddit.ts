import { SubredditListItem } from "./Subreddits";

export type Multi = {
  id: string;
  type: "multi";
  name: string;
  iconURL: string;
  url: string;
  subreddits: SubredditListItem[];
};
