import { maintainSeenPosts } from "./SeenPosts";
import { maintainMessageDrafts } from "../../components/Modals/NewMessage";

export async function doDBMaintenance() {
  await maintainSeenPosts();
  await maintainMessageDrafts();
}
