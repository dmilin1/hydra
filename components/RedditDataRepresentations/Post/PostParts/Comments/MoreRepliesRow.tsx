import { StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { Theme } from "../../../../../constants/Themes";

type MoreRepliesRowProps = {
  depth: number;
  theme: Theme;
  label: string;
  onPress: () => void;
};

/**
 * Props only, no hooks or context reads — see CommentTopBar. Renders the
 * "N more replies" row used for both unloaded comments and children of
 * comments collapsed in collapse-children-only mode.
 */
export default function MoreRepliesRow({
  depth,
  theme,
  label,
  onPress,
}: MoreRepliesRowProps) {
  return (
    <Touchable
      activeOpacity={0.5}
      animationDuration={{ in: 0, out: 150 }}
      onPress={onPress}
      style={[
        styles.container,
        {
          marginLeft: 10 * (depth + 1),
          borderTopColor: theme.divider,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            borderLeftWidth: depth === -1 ? 0 : 1,
            borderLeftColor:
              theme.commentDepthColors[depth % theme.commentDepthColors.length],
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.iconOrTextButton }]}>
          {label}
        </Text>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  inner: {
    flex: 1,
    paddingLeft: 15,
  },
  label: {
    fontSize: 14,
  },
});
