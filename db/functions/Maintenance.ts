import ImageCache from "../../utils/ImageCache";
import { maintainDrafts } from "./Drafts";
import { maintainSeenPosts } from "./SeenPosts";

export async function doDBMaintenance() {
  await maintainSeenPosts();
  await maintainDrafts();
  await ImageCache.doMaintenance();
}
