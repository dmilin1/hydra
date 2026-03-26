import { maintainDrafts } from "./Drafts";
import { maintainSeenPosts } from "./SeenPosts";

export async function doDBMaintenance() {
  await maintainSeenPosts();
  await maintainDrafts();
}
