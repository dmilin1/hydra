import ErrorPage from "./ErrorPage";
import PostDetails from "./PostDetails";
import PostsPage from "./PostsPage";
import SettingsPage from "./SettingsPage";
import Subreddits from "./Subreddits";

type Page =
  | typeof PostsPage
  | typeof PostDetails
  | typeof Subreddits
  | typeof ErrorPage
  | typeof SettingsPage;

export default Page;
