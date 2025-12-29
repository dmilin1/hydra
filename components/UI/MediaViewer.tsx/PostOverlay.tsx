import { Text, TouchableOpacity, View } from "react-native";
import { Post } from "../../../api/Posts";
import { useURLNavigation } from "../../../utils/navigation";

export default function PostOverlay({
  post,
  closeViewer,
}: {
  post: Post;
  closeViewer: () => void;
}) {
  const { pushURL } = useURLNavigation();

  const openLink = (link: string) => {
    pushURL(link);
    closeViewer();
  };

  return (
    <View
      style={{
        padding: 10,
        margin: 10,
        borderRadius: 10,
        backgroundColor: "rgba(50, 50, 50, 0.65)",
      }}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <TouchableOpacity
        style={{ gap: 5 }}
        onPress={() => openLink(post.link)}
        activeOpacity={0.7}
      >
        <Text
          style={{ color: "white", fontSize: 16, fontWeight: 500 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {post.title}
        </Text>
        {post.text && (
          <Text
            style={{ color: "white" }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {post.text}
          </Text>
        )}
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: "white", fontSize: 12 }}> in </Text>
          <TouchableOpacity onPress={() => openLink(`/r/${post.subreddit}`)}>
            <Text style={{ color: "white", fontSize: 12 }}>
              /r/{post.subreddit}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 12 }}> by </Text>
          <TouchableOpacity onPress={() => openLink(`/user/${post.author}`)}>
            <Text style={{ color: "white", fontSize: 12 }}>{post.author}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}
