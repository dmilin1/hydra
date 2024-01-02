import 'react-native-url-polyfill/auto'
import { decode } from 'html-entities';
import { api } from "./RedditApi";
import Time from '../utils/Time';
import { Poll } from './Posts';
import RedditURL from '../utils/RedditURL';

export type Comment = {
    id: string,
    depth: number,
    path: number[],
    author: string,
    isOP: boolean,
    upvotes: number,
    html: string,
    comments: Comment[],
    loadMore: undefined|{
        depth: number,
        childIds: string[],
    }
    createdAt: number,
    timeSince: string,
}

export type PostDetail = Comment & {
    title: string,
    subreddit: string,
    commentCount: number,
    link: string,
    images: string[],
    video: string|undefined,
    poll: Poll|undefined,
    externalLink: string|undefined,
    after: string,
}

type GetPostOptions = {
    
}

function formatComments(comments: any, commentPath: number[] = [], childStartIndex = 0): Comment[] {
    let formattedComments: Comment[] = [];
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.kind === 'more') continue;
        const childCommentPath = [...commentPath, i + childStartIndex];
        const loadMoreChild = comment.data.replies?.data?.children.find((child: any) => child.kind === 'more');
        formattedComments.push({
            id: comment.data.id,
            depth: commentPath.length,
            path: childCommentPath,
            author: comment.data.author,
            isOP: comment.data.is_submitter,
            upvotes: comment.data.ups,
            html: decode(comment.data.body_html),
            comments: comment.data.replies ? formatComments(comment.data.replies.data.children, childCommentPath) : [],
            loadMore: loadMoreChild ? {
                depth: loadMoreChild.data.depth,
                childIds: loadMoreChild.data.children,
            } : undefined,
            createdAt: comment.data.created,
            timeSince: new Time(comment.data.created * 1000).prettyTimeSince() + ' ago',
        });
    };
    return formattedComments;
}

export async function getPostsDetail(url: string, options: GetPostOptions = {}): Promise<PostDetail> {
    const response = await api(new RedditURL(url).jsonify().toString());
    const post = response[0].data.children[0].data;
    const comments = response[1].data.children;
    let externalLink = undefined;
    const hostname = (new URL(post.url)).host;
    if (!hostname.includes('reddit.com') && !hostname.includes('redd.it')) {
        externalLink = post.url;
    }
    let images = Object.values(post.media_metadata ?? {}).map((data : any) => 
        data.s.u.replace(/&amp;/g, '&')
    );
    if (images.length === 0 && post.post_hint === 'image') {
        images = [post.url];
    }
    let poll = undefined;
    if (post.poll_data) {
        poll = {
            voteCount: post.poll_data.total_vote_count,
            options: post.poll_data.options,
        }
    }
    const formattedComments = formatComments(comments);
    const loadMoreChild = comments.find((child: any) => child.kind === 'more');
    return {
        id: post.id,
        depth: -1,
        path: [],
        title: post.title,
        author: post.author,
        isOP: post.is_submitter,
        upvotes: post.ups,
        subreddit: post.subreddit,
        html: decode(post.selftext_html) ?? '',
        commentCount: post.num_comments,
        link: post.permalink,
        images,
        video: post.media?.reddit_video?.fallback_url,
        poll: poll,
        comments: formattedComments,
        loadMore: loadMoreChild ? {
            depth: loadMoreChild.data.depth,
            childIds: loadMoreChild.data.children,
        } : undefined,
        externalLink,
        createdAt: post.created,
        timeSince: new Time(post.created * 1000).prettyTimeSince() + ' ago',
        after: post.name,
    }
}


export async function loadMoreComments(
    subreddit: string,
    postId: string, 
    commentIds: string[],
    commentPath: number[],
    childStartIndex: number
): Promise<Comment[]> {
    const responses = await Promise.all(commentIds.map(commentId =>
        api(`https://www.reddit.com/r/${subreddit}/comments/${postId}/comment/${commentId}/.json`
    )));
    const formattedComments = formatComments(
        responses.map(response => response[1]?.data?.children?.[0]).filter(comment => comment !== undefined),
        commentPath,
        childStartIndex,
    );
    return formattedComments;
}