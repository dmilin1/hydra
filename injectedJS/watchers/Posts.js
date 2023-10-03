import debounce from "../helpers/debounce";
import emitMessage from "../messaging/emitMessage";
import { RemoteFn } from "../messaging/remoteFunction";
import Watcher from "./Watcher";

export default async function posts() {
    Watcher.watch('[data-scroller-first]', () => {
        const postList = [...document.querySelectorAll('[data-scroller-first]')]
            .slice(-1)[0]
            .parentElement;

        const postElems = [...postList.querySelectorAll('[data-testid="post-container"]')];

        // Trigger multi image posts to load all images
        document.querySelectorAll('a[title="Next"]').forEach(a => a.click());

        const postData = postElems.map((post, i) => {
            const externalLink = post.querySelector('[data-testid="outbound-link"]')?.href;
            let video = post.querySelector('shreddit-player')?.src;

            if (!video && externalLink?.includes('i.imgur.com')) {
                video = externalLink.replace('.gifv', '.mp4');
            }
            
            return {
                title: post.querySelector('h3')?.innerText,
                postLink: [...post.querySelectorAll('a')].find(a => a.href.includes('/comments/'))?.href?.split('.com')?.[1],
                subredditImg: post.querySelector('a > img')?.src,
                subreddit: [...post.querySelectorAll('a')].find(a => a.href.includes('/r/'))?.href?.split('/r/')?.[1]?.split('/')?.[0],
                images: [
                    ...[...post.querySelectorAll('img.media-element')].map(p => p.src),
                    ...[...post.querySelectorAll('figure img')].map(p => p.src),
                ].filter(src => src).map(src => src.replace('https://preview.redd.it', 'https://i.redd.it')),
                bodyHTML: [...post.querySelectorAll('p')].map(e => e?.innerText)?.join('\\n'),
                video,
                externalLink,
                author: post.querySelector('[data-testid="post_author_link"]')?.innerText?.split('u/')?.[1],
                voteCount: post.querySelector('button[aria-label="upvote"]')?.nextSibling?.innerText,
                commentCount: post.querySelector('.icon-comment')?.nextSibling?.innerText?.split(' ')?.[0],
                timeSincePost: post.querySelector('[data-testid="post_timestamp"]')?.innerText,
                isAd: !!post.querySelector('[data-adclicklocation="top_bar"]')?.innerText?.includes('promoted'),

                scrollTo: new RemoteFn('postScrollTo-' + i, () => {
                    // Change this to a loadMore which just scrolls to the bottom of the current page
                    // window.scrollTo(0, document.body.scrollHeight);
                    const elemPos = post.getBoundingClientRect().bottom + window.scrollY;
                    window.scrollTo(0, elemPos - 300);
                }),
                upvote: () => post.querySelector('.VotingBox__upvote')?.click(),
                downvote: () => post.querySelector('.VotingBox__downvote')?.click(),
                contextMenu: () => post.querySelector('.PostHeader__overflowMenu')?.click(),
            }
        });
        debounce('posts', 500, 1500, () => {
            emitMessage('posts', { posts: postData });
        });
    });
}