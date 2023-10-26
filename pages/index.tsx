import ErrorPage from "./ErrorPage";
import PostDetails from "./PostDetails";
import Posts from "./Posts";
import Subreddits from "./Subreddits";

type Page = typeof Posts | typeof PostDetails | typeof Subreddits | typeof ErrorPage;

export default Page;