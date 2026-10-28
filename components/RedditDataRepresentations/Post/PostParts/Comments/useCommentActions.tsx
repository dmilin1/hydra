import { useContext } from "react";
import { Alert } from "react-native";

import { Comment, PostDetail } from "../../../../../api/PostDetail";
import { deleteUserContent } from "../../../../../api/gql/UserContent";
import { vote } from "../../../../../api/gql/Vote";
import { reloadComment } from "../../../../../api/gql/PostDetail";
import { VoteOption } from "../../../../../api/Posts";
import { saveItem } from "../../../../../api/gql/Save";
import { AccountContext } from "../../../../../contexts/AccountContext";
import { ModalContext } from "../../../../../contexts/ModalContext";
import RedditURL from "../../../../../utils/RedditURL";
import { shareURL } from "../../../../../utils/sharing";
import useContextMenu from "../../../../../utils/useContextMenu";
import EditComment from "../../../../Modals/EditComment";
import NewComment from "../../../../Modals/NewComment";
import SelectText from "../../../../Modals/SelectText";
import ShareAsImage from "../../../../Modals/ShareAsImage/ShareAsImage";
import useWriteWithToast from "../../../../../utils/useWriteWithToast";

type UseCommentActionsParams = {
  comment: PostDetail | Comment;
  changeComment: (comment: Comment) => void;
  deleteComment: (comment: Comment) => void;
  collapseThread?: (comment: Comment) => void;
  interactionDisabledStatus?: PostDetail["interactionDisabledStatus"];
  displayInList?: boolean;
  postDetail?: PostDetail;
};

export default function useCommentActions({
  comment,
  changeComment,
  deleteComment,
  collapseThread,
  interactionDisabledStatus,
  displayInList,
  postDetail,
}: UseCommentActionsParams) {
  const { setModal } = useContext(ModalContext);
  const { currentUser } = useContext(AccountContext);
  const runWrite = useWriteWithToast();
  const showContextMenu = useContextMenu();

  const toggleCollapse = () => {
    if (comment.type !== "comment") return;
    changeComment({ ...comment, collapsed: !comment.collapsed });
  };

  const voteOnComment = async (voteOption: VoteOption) => {
    if (comment.type !== "comment") return;
    const result = await runWrite("vote", () => vote(comment, voteOption));
    if (result === undefined) return;
    changeComment({
      ...comment,
      userVote: result,
      upvotes: comment.upvotes - comment.userVote + result,
    });
  };

  const saveComment = async () => {
    if (comment.type !== "comment") return;
    const saved = await runWrite(comment.saved ? "unsave" : "save", () =>
      saveItem(comment, !comment.saved),
    );
    if (saved) changeComment({ ...comment, saved: !comment.saved });
  };

  // The post's own reply button opens NewComment itself.
  const replyToComment = () => {
    if (comment.type !== "comment") return;
    if (interactionDisabledStatus) {
      Alert.alert(`This post has been ${interactionDisabledStatus}`);
      return;
    }
    setModal(
      <NewComment
        parent={comment}
        contentSent={() =>
          setTimeout(async () => {
            changeComment(await reloadComment(comment));
          }, 5_000)
        }
      />,
    );
  };

  const editComment = () => {
    if (comment.type !== "comment") return;
    if (interactionDisabledStatus) {
      Alert.alert(`This post has been ${interactionDisabledStatus}`);
      return;
    }
    setModal(
      <EditComment
        edit={comment}
        contentSent={async () => {
          changeComment(await reloadComment(comment));
        }}
      />,
    );
  };

  const confirmDeleteComment = () => {
    if (comment.type !== "comment") return;
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserContent(comment);
              deleteComment(comment);
            } catch (e) {
              Alert.alert(
                "Failed to delete comment",
                e instanceof Error ? e.message : undefined,
              );
            }
          },
        },
      ],
    );
  };

  const collapseCommentThread = () => {
    if (comment.type !== "comment") return;
    collapseThread?.(comment);
  };

  const shareComment = () => {
    shareURL(new RedditURL(comment.link).toString());
  };

  const shareCommentAsImage = () => {
    if (comment.type !== "comment" || !postDetail) return;
    setModal(<ShareAsImage comment={comment} postDetail={postDetail} />);
  };

  const showCommentOptions = async () => {
    const options = [
      "Upvote",
      "Downvote",
      ...(displayInList ? [] : comment.collapsed ? ["Expand"] : ["Collapse"]),
      ...(displayInList ? [] : ["Collapse Thread"]),
      "Select Text",
      "Reply",
      ...(comment.saved ? ["Unsave"] : ["Save"]),
      ...(currentUser?.userName === comment.author ? ["Edit", "Delete"] : []),
      "Share as Image",
      "Share",
    ];
    const result = await showContextMenu({ options });

    if (result === "Upvote") {
      await voteOnComment(VoteOption.UpVote);
    } else if (result === "Downvote") {
      await voteOnComment(VoteOption.DownVote);
    } else if (result === "Collapse" || result === "Expand") {
      toggleCollapse();
    } else if (result === "Collapse Thread") {
      collapseCommentThread();
    } else if (result === "Reply") {
      replyToComment();
    } else if (result === "Save" || result === "Unsave") {
      saveComment();
    } else if (result === "Edit") {
      editComment();
    } else if (result === "Delete") {
      confirmDeleteComment();
    } else if (result === "Select Text") {
      setModal(<SelectText text={comment.text} />);
    } else if (result === "Share") {
      shareComment();
    } else if (result === "Share as Image") {
      shareCommentAsImage();
    }
  };

  return {
    toggleCollapse,
    voteOnComment,
    saveComment,
    replyToComment,
    collapseCommentThread,
    shareComment,
    showCommentOptions,
  };
}
