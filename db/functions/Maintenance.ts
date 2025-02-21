import { maintainSeenPosts } from "./SeenPosts";

export async function doDBMaintenance() {
  await maintainSeenPosts();
}
