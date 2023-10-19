import debounce from "../helpers/debounce";
import emitMessage from "../messaging/emitMessage";
import { RemoteFn } from "../messaging/remoteFunction";
import Watcher from "./Watcher";

let lastPlayButtonPressed = null;

export default async function postDetails() {
    Watcher.watch('div[data-testid="post-container"]', () => {
        let postContainer = null;
        if (document.querySelector('#overlayScrollContainer')) {
            postContainer = document.querySelector('#overlayScrollContainer div[data-testid="post-container"]');
        } else {
            postContainer = document.querySelector('div[data-testid="post-container"]');
        }
        
        const title = postContainer?.querySelector('h1')?.innerText;

        if (!title) return;

        // attempt to click video play buttons to open NSFW videos
        const videoPlayButton = document.querySelector('path[d="M33.1 22.2l-11.5-6.7c-.3-.2-.7-.2-1 0-.3.2-.4.5-.4.8v13.4c0 .3.2.7.5.8.1.1.3.1.5.1s.3 0 .5-.1l11.5-6.7c.3-.2.5-.5.5-.8-.1-.3-.3-.6-.6-.8"]')
            ?.parentElement
            ?.parentElement
            ?.parentElement;
        if (postContainer && videoPlayButton && lastPlayButtonPressed !== title) {
            document.querySelector('path[d="M33.1 22.2l-11.5-6.7c-.3-.2-.7-.2-1 0-.3.2-.4.5-.4.8v13.4c0 .3.2.7.5.8.1.1.3.1.5.1s.3 0 .5-.1l11.5-6.7c.3-.2.5-.5.5-.8-.1-.3-.3-.6-.6-.8"]')
                .parentElement
                .parentElement
                .parentElement
                .click();
            lastPlayButtonPressed = title;
        }

        // Keeps gifs in comments from full screening automatically
        document.querySelectorAll('video[autoplay]').forEach(elem => elem.setAttribute('playsInline', true));

        const externalLink = postContainer.querySelector('[data-testid="outbound-link"]')?.href;
        let video = postContainer.querySelector('shreddit-player')?.src;

        if (!video && externalLink?.includes('i.imgur.com')) {
            video = externalLink.replace('.gifv', '.mp4');
        }

        let images = [];
        let mediaContainer = postContainer.querySelector('[data-adclicklocation="title"]').nextElementSibling;
        if (mediaContainer?.attributes['data-click-id']?.value !== 'text') {
            // Only grab the images if it isn't a text post. Otherwise, the images will already be 
            // handled by the text renderer.
            [...mediaContainer.querySelectorAll('img.media-element')].forEach(p => images.push(p.src));
            [...mediaContainer.querySelectorAll('figure img')].forEach(p => images.push(p.src));
            images = images.filter(src => src).map(src => src.replace('https://preview.redd.it', 'https://i.redd.it'));
        }
        
        const postDetails = {
            title,
            subreddit: window.location.href.split('/r/')[1]?.split('/')?.[0],
            images,
            video,
            externalLink,
            bodyHTML: postContainer.querySelector('[data-click-id="text"]')?.innerHTML,
            author: postContainer.querySelector('[data-testid="post_author_link"]')?.innerText?.split('u/')?.[1],
            voteCount: postContainer.querySelector('button[aria-label="upvote"]')?.nextSibling?.innerText,
            commentCount: postContainer.querySelector('.icon-comment')?.nextSibling?.innerText?.split(' ')?.[0],
            timeSincePost: postContainer.querySelector('[data-testid="post_timestamp"]')?.innerText,
        };

        debounce('postDetails', 500, 1500, () => {
            emitMessage('postDetails', { postDetails });
        });
    });
}