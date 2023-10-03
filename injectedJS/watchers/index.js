import comments from "./Comments";
import postDetails from "./PostDetails";
import posts from "./Posts";
import subscriptionList from "./SubscriptionList";

export default function watchers() {
    posts();
    subscriptionList();
    comments();
    postDetails();
}