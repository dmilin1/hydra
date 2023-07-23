import emitMessage from "../messaging/emitMessage";
import Watcher from "./Watcher";

export default async function subscriptionList() {
    Watcher.watch('div[role="menu"]', (e) => {
        const menu = document.querySelector('div[role="menu"]');

        const children = menu?.querySelectorAll(':scope > div,a');
        
        if (!children) return;

        const subscriptions = {};
        let currCategory = 'uncategorized';
        for (let child of children) {
            if (child.tagName === 'DIV') {
                currCategory = child.textContent;
                if (!subscriptions[currCategory]) {
                    subscriptions[currCategory] = [];
                }
            } else {
                subscriptions[currCategory].push({
                    subreddit: child.textContent,
                    url: child.getAttribute('href')
                });
            }
        }

        emitMessage('subscriptionList', { subscriptionList: subscriptions });
    });
}