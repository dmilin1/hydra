// @ts-nocheck
import { log } from "./EmitMessage";

function getPosts() {
    'do not compile';
    const postContainer = document.querySelector('.PostsList');
    if (!postContainer) {
        return;
    }
    postContainer.style.display = 'none';
    const postElems = [...postContainer.querySelectorAll(':scope > div')];

    log(postElems[0]);

    return postElems.map(post => ({
        title: post.querySelector('.PostHeader__post-title-line')?.textContent,
        postLink: post.querySelector('.PostHeader__post-title-line')?.getAttribute('href'),

        contentLink: post.querySelector('.PostContent__link-bar')?.getAttribute('href'),

        img: post.querySelector('.PostContent__img')?.getAttribute('src'),

        subreddit: post.querySelector('.PostHeader__subreddit-link')?.getAttribute('href'),
        voteCount: post.querySelector('.VotingBox__score')?.textContent,
        commentCount: post.querySelector('.PostFooter__hit-area')?.textContent,
        timeSincePost: post.querySelector('.HeaderSeparator')?.nextSibling?.textContent,
        upvote: () => post.querySelector('.VotingBox__upvote')?.click(),
        downvote: () => post.querySelector('.VotingBox__downvote')?.click(),
        contextMenu: () => post.querySelector('.PostHeader__overflowMenu')?.click(),
    }));
}

export {
    getPosts,
};