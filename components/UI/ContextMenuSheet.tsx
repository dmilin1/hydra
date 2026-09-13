import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@react-native-vector-icons/feather";
import { ActionSheetOptions } from "@expo/react-native-action-sheet";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type Icon = React.ComponentProps<typeof Feather>["name"];
const ACTION_ICONS: [RegExp, Icon][] = [
  [/upvote/i, "arrow-up"],
  [/downvote/i, "arrow-down"],
  [/unread/i, "mail"],
  [/read/i, "check"],
  [/delete|remove/i, "trash-2"],
  [/filter|hide/i, "filter"],
  [/save/i, "bookmark"],
  [/share as image/i, "image"],
  [/share/i, "share-2"],
  [/collapse/i, "chevrons-up"],
  [/expand/i, "chevrons-down"],
  [/select text/i, "type"],
  [/reply/i, "corner-up-left"],
  [/edit|new post/i, "edit-2"],
  [/favorite/i, "star"],
  [/subscribe|follow/i, "user-plus"],
  [/report/i, "flag"],
  [/block/i, "slash"],
  [/hour|day|week|month|year|forever|all/i, "clock"],
  [/hot/i, "trending-up"],
  [/top|best/i, "award"],
  [/search/i, "search"],
  [/browser|chrome|firefox|brave|edge|opera|hydra/i, "globe"],
  [/wiki|sidebar/i, "book-open"],
];

const actionIcon = (label: string): Icon =>
  ACTION_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? "chevron-right";

type MenuRequest = {
  options: ActionSheetOptions;
  resolve: (index?: number) => void;
};

let present: ((request: MenuRequest) => void) | undefined;

export function showContextMenu(options: ActionSheetOptions) {
  return new Promise<number | undefined>((resolve) => {
    if (!present) return resolve(undefined);
    present({ options, resolve });
  });
}

export default function ContextMenuSheet() {
  const { theme } = useContext(ThemeContext);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [request, setRequest] = useState<MenuRequest | null>(null);
  const pending = useRef<MenuRequest | null>(null);

  useEffect(() => {
    present = (next) => {
      pending.current?.resolve(undefined);
      pending.current = next;
      setRequest(next);
    };
    return () => {
      present = undefined;
    };
  }, []);

  const dismiss = (index?: number) => {
    const previous = pending.current;
    pending.current = null;
    setRequest(null);
    requestAnimationFrame(() => previous?.resolve(index));
  };

  const destructive = request?.options.destructiveButtonIndex;
  return (
    <Modal
      visible={!!request}
      transparent
      animationType="none"
      onRequestClose={() => dismiss()}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Dismiss menu"
          onPress={() => dismiss()}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              maxHeight: height * 0.7,
              marginBottom: Math.max(insets.bottom, 12),
              borderColor: theme.divider,
            },
          ]}
        >
          {request?.options.title && (
            <Text style={[styles.heading, { color: theme.text }]}>
              {request.options.title}
            </Text>
          )}
          {request?.options.message && (
            <Text style={[styles.heading, { color: theme.subtleText }]}>
              {request.options.message}
            </Text>
          )}
          <ScrollView style={{ flexGrow: 0 }} bounces={false}>
            {request?.options.options.map((label, index) => {
              const disabled =
                request.options.disabledButtonIndices?.includes(index);
              const color = (
                Array.isArray(destructive)
                  ? destructive.includes(index)
                  : destructive === index
              )
                ? theme.delete
                : theme.text;
              return (
                <Pressable
                  key={`${index}-${label}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !!disabled }}
                  disabled={disabled}
                  onPress={() => dismiss(index)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      opacity: disabled ? 0.4 : 1,
                      backgroundColor: pressed ? theme.tint : theme.background,
                    },
                  ]}
                >
                  <Feather name={actionIcon(label)} size={21} color={color} />
                  <Text style={[styles.label, { color }]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={() => dismiss()}
            style={[
              styles.row,
              {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderColor: theme.divider,
              },
            ]}
          >
            <Feather name="x" size={21} color={theme.iconOrTextButton} />
            <Text style={[styles.label, { color: theme.iconOrTextButton }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    width: "94%",
    maxWidth: 480,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 16,
  },
  label: { flex: 1, fontSize: 16 },
  heading: { padding: 16, fontSize: 16 },
});
