import 'react-native-url-polyfill/auto'
import { decode } from 'html-entities';
import { api } from "./RedditApi";
import Time from '../utils/Time';
import { Poll, Post, formatPostData } from './Posts';
import RedditURL from '../utils/RedditURL';
import { UserContent } from './User';

export type Comment = {
    id: string,
    name: string,
    type: 'comment',
    depth: number,
    path: number[],
    author: string,
    isOP: boolean,
    upvotes: number,
    userVote: VoteOption,
    link: string,
    postTitle: string,
    postLink: string,
    subreddit: string,
    html: string,
    comments: Comment[],
    loadMore: undefined|{
        depth: number,
        childIds: string[],
    }
    after: string,
    createdAt: number,
    timeSince: string,
}

export type PostDetail = Omit<Comment, 'type'> & Omit<Post, 'type'> & {
    type: 'postDetail',
}

export enum VoteOption {
    UpVote = 1,
    NoVote = 0,
    DownVote = -1,
}

export function formatComments(comments: any, commentPath: number[] = [], childStartIndex = 0): Comment[] {
    let formattedComments: Comment[] = [];
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.kind === 'more') continue;
        const childCommentPath = [...commentPath, i + childStartIndex];
        const loadMoreChild = comment.data.replies?.data?.children.find((child: any) => child.kind === 'more');
        let userVote = VoteOption.NoVote;
        if (comment.data.likes === true) {
            userVote = VoteOption.UpVote;
        } else if (comment.data.likes === false) {
            userVote = VoteOption.DownVote;
        }
        formattedComments.push({
            id: comment.data.id,
            name: comment.data.name,
            type: 'comment',
            depth: commentPath.length,
            path: childCommentPath,
            author: comment.data.author,
            isOP: comment.data.is_submitter,
            upvotes: comment.data.ups,
            userVote,
            link: comment.data.permalink,
            postTitle: comment.data.link_title,
            postLink: comment.data.link_permalink,
            subreddit: comment.data.subreddit,
            html: decode(comment.data.body_html),
            comments: comment.data.replies ? formatComments(comment.data.replies.data.children, childCommentPath) : [],
            loadMore: loadMoreChild ? {
                depth: loadMoreChild.data.depth,
                childIds: loadMoreChild.data.children,
            } : undefined,
            after: comment.data.name,
            createdAt: comment.data.created,
            timeSince: new Time(comment.data.created * 1000).prettyTimeSince() + ' ago',
        });
    };
    return formattedComments;
}

export async function getPostsDetail(url: string): Promise<PostDetail> {
    const response = await api(new RedditURL(url).jsonify().toString());
    const postData = response[0].data.children[0];
    const post = await formatPostData(postData);
    const comments = response[1].data.children;
    const formattedComments = formatComments(comments);
    const loadMoreChild = comments.find((child: any) => child.kind === 'more');
    return {
        ...post,
        type: 'postDetail',
        depth: -1,
        path: [],
        isOP: postData.data.is_submitter,
        postTitle: postData.data.link_title,
        postLink: postData.data.link_permalink,
        comments: formattedComments,
        loadMore: loadMoreChild ? {
            depth: loadMoreChild.data.depth,
            childIds: loadMoreChild.data.children,
        } : undefined,
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

export async function vote(item: UserContent, voteOption: VoteOption): Promise<VoteOption> {
    const dir = item.userVote === voteOption ? VoteOption.NoVote : voteOption;
    await api('https://www.reddit.com/api/vote', {
        method: 'POST',
    }, {
        requireAuth: true,
        body: {
            id: item.name,
            dir,
        },
    });
    return dir;
}