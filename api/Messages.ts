import "react-native-url-polyfill/auto";
import { decode } from "html-entities";

import { VoteOption } from "./Posts";
import { api } from "./RedditApi";
import { User } from "./User";
import RedditURL from "../utils/RedditURL";
import Time from "../utils/Time";

export type CommentReply = {
  id: string;
  name: string;
  type: "commentReply";
  author: string;
  upvotes: number;
  userVote: VoteOption;
  new: boolean;
  postTitle: string;
  contextLink: string;
  subreddit: string;
  html: string;
  after: string;
  createdAt: number;
  timeSince: string;
};

export type Message = {
  id: string;
  name: string;
  type: "message";
  author: string;
  subject: string;
  new: boolean;
  html: string;
  after: string;
  createdAt: number;
  timeSince: string;
};

export type InboxItem = CommentReply | Message;

export function formatCommentReply(data: any): CommentReply {
  let userVote = VoteOption.NoVote;
  if (data.likes === true) {
    userVote = VoteOption.UpVote;
  } else if (data.likes === false) {
    userVote = VoteOption.DownVote;
  }
  return {
    id: data.id,
    name: data.name,
    type: "commentReply",
    author: data.author,
    upvotes: data.score,
    userVote,
    new: data.new,
    postTitle: data.link_title,
    contextLink: data.context,
    subreddit: data.subreddit,
    html: decode(data.body_html),
    after: data.name,
    createdAt: data.created,
    timeSince: new Time(data.created * 1000).prettyTimeSince() + " ago",
  };
}

export function formatMessage(data: any): Message {
  return {
    id: data.id,
    name: data.name,
    type: "message",
    author: data.author,
    subject: data.subject,
    new: data.new,
    html: decode(data.body_html),
    after: data.name,
    createdAt: data.created,
    timeSince: new Time(data.created * 1000).prettyTimeSince() + " ago",
  };
}

type MessagesOptions = {
  sort?: string;
  limit?: string;
  after?: string;
};

export async function getInboxItems(
  options: MessagesOptions = {},
): Promise<InboxItem[]> {
  const redditURL = new RedditURL("https://www.reddit.com/message/inbox");
  redditURL.setQueryParams({
    ...options,
  });
  redditURL.jsonify();
  const response = await api(redditURL.toString(), {}, { requireAuth: true });
  return response.data.children
    .filter((child: any) => ["t1", "t4"].includes(child.kind))
    .map((child: any) => {
      if (child.kind === "t1") {
        return formatCommentReply(child.data);
      } else {
        return formatMessage(child.data);
      }
    });
}

export async function setInboxItemNewStatus(
  message: InboxItem,
  isNew: boolean,
): Promise<void> {
  await api(
    `https://www.reddit.com/api/${isNew ? "unread_message" : "read_message"}`,
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        id: message.name,
      },
    },
  );
}

export async function getConversationMessages(
  messageId: string,
): Promise<Message[]> {
  const redditURL = new RedditURL(
    `https://www.reddit.com/message/messages/${messageId}`,
  );
  redditURL.jsonify();
  const response = await api(redditURL.toString(), {}, { requireAuth: true });
  const messages = [];
  const firstMsgData = response.data.children[0].data;
  messages.push(formatMessage(firstMsgData));
  firstMsgData.replies.data.children.forEach((child: any) =>
    messages.push(formatMessage(child.data)),
  );
  return messages;
}

export async function sendMessage(
  recipient: User,
  subject: string,
  text: string,
): Promise<boolean> {
  const response = await api(
    "https://www.reddit.com/api/compose?api_type=json",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        to: recipient.userName,
        subject,
        text,
      },
    },
  );
  const errors = response?.json?.errors;
  return Array.isArray(errors) && errors.length === 0;
}

export async function replyToMessage(
  previousMsg: Message,
  text: string,
): Promise<boolean> {
  const response = await api(
    /* Yes this is the same endpoint to send a message as to post as a regular comment. Wtf Reddit... */
    "https://www.reddit.com/api/comment?api_type=json",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        thing_id: previousMsg.name,
        text,
      },
    },
  );
  const errors = response?.json?.errors;
  return Array.isArray(errors) && errors.length === 0;
}
