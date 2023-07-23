import emitMessage from "../messaging/emitMessage";
import posts from "./Posts";
import subscriptionList from "./SubscriptionList";

export default function watchers() {
    posts();
    subscriptionList();
}