import fixConsoleLog from "./fixConsoleLog";
import killOpenAppMsg from "./killOpenAppMsg";
import openSubredditList from "./openSubredditList";

export default function initializers() {
    fixConsoleLog();
    killOpenAppMsg();
    openSubredditList();
}