import ErrorPage from "./ErrorPage";
import PostDetails from "./PostDetails";
import Posts from "./Posts";
import SettingsPage from "./SettingsPage";
import Subreddits from "./Subreddits";

type Page = typeof Posts | typeof PostDetails | typeof Subreddits | typeof ErrorPage | typeof SettingsPage;

export default Page;