import debounce from "../helpers/debounce";
import emitMessage from "../messaging/emitMessage";
import { RemoteFn } from "../messaging/remoteFunction";
import Watcher from "./Watcher";

let commentData = [];

const addComment = (path, comment) => {
    let current = commentData;
    path.forEach((index, i) => {
        if (i === path.length - 1) {
            current[index] = comment;
        } else {
            current = current[index].children;
        }
    });
}

const getComment = (path) => {
    let current = commentData;
    for (let i = 0; i < path.length; i++) {
        let index = path[i];
        if (i === path.length - 1) {
            return current[index];
        } else {
            current = current[index].children;
        }
    };
}


export default async function comments() {
    Watcher.watch('[data-scroller-first]', () => {
        const commentContainerElems = [...[...document.querySelectorAll('[data-scroller-first]')]
            .slice(-1)[0]
            .parentElement
            .children];

        // Click to open all collapsed elements
        [...document.querySelectorAll('.Comment .icon-expand')].filter(icn => getComputedStyle(icn.parentNode).opacity === '1').forEach(icn => icn.click());

        commentData = [];

        let currentPath = [];
        commentContainerElems.forEach((commentContainer) => {
            let loadMoreElem = commentContainer?.children[0]?.children[0];
            const commentElem = commentContainer?.children[0]?.children[0]?.children[0];

            let depth = null;
            let elemType = null;
            if (loadMoreElem?.id?.startsWith('moreComments')) {
                elemType = 'loadMore';
                depth = loadMoreElem?.children?.[0]?.children?.length;
            } else if (commentElem?.children?.[1]?.className?.startsWith('Comment')) {
                elemType = 'comment';
                depth = Math.max(0, commentElem?.children[0].children.length - 1);
            } 

            let prevDepth = currentPath.length - 1;
            if (depth > prevDepth) {
                currentPath.push(0);
            } else if (depth === prevDepth) {
                currentPath[currentPath.length - 1] += 1;
            } else {
                currentPath = currentPath.slice(0, depth + 1);
                currentPath[currentPath.length - 1] += 1;
            }

            if (elemType === 'loadMore') {
                let parentPath = currentPath.slice(0, depth);
                let parentComment = getComment(parentPath);
                addComment(parentPath, {
                    ...parentComment,
                    loadMoreText: loadMoreElem.innerText,
                    loadMore: new RemoteFn('commentLoadMore-' + currentPath.toString(), () => {
                        loadMoreElem.querySelector('p').click();
                    }),
                });
            } else if (elemType === 'comment') {
                let didUpvote = commentElem.querySelector('[data-click-id="upvote"][aria-pressed="true"]');
                let didDownvote = commentElem.querySelector('[data-click-id="downvote"][aria-pressed="true"]');
                addComment(currentPath, {
                    id: currentPath.join('-'),
                    depth,
                    text: [...commentElem.querySelectorAll('[data-testid="comment"] p')]?.map(p => p.innerText)?.join('\\n\\n'),
                    author: commentElem.querySelector('[data-testid="comment_author_link"]')?.innerText,
                    timeSinceComment: commentElem.querySelector('[data-testid="comment_timestamp"]')?.innerText,
                    voteCount: commentElem.querySelector('[data-click-id="upvote"]')?.nextSibling?.innerText,
                    upVote: new RemoteFn('commentUpVote-' + currentPath.toString(), () => {
                        commentElem.querySelector('[data-click-id="upvote"]')?.click()
                    }),
                    downVote: new RemoteFn('commentDownVote-' + currentPath.toString(), () => {
                        commentElem.querySelector('[data-click-id="downvote"]')?.click()
                    }),
                    currentVote: (didUpvote ? 1 : 0) + (didDownvote ? -1 : 0),
                    children: [],
                });
            }
        });

        debounce('comments', 500, 1500, () => {
            emitMessage('comments', { comments: commentData });
        });
    });
}