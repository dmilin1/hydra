import simClick from "../helpers/simClick";
import Watcher from "../watchers/Watcher";

export default async function openSubredditList() {
    const subredditBtn = await Watcher.watchOnce('[aria-label="Start typing to filter your communities or use up and down to select."] > button');
    simClick(subredditBtn);
}