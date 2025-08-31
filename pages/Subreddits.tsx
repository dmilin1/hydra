import { FontAwesome5, Feather } from "@expo/vector-icons";
import React, { useContext, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";

import MultiredditLink from "../components/RedditDataRepresentations/Multireddit/MultiredditLink";
import SubredditCompactLink from "../components/RedditDataRepresentations/Subreddit/SubredditCompactLink";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../contexts/SubredditContext";
import { useURLNavigation } from "../utils/navigation";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { Subreddit } from "../api/Subreddits";
import { Multi } from "../api/Multireddit";

type TopButtonItem = {
  type: "topButton";
  title: string;
  path: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

type SectionDividerItem = {
  type: "sectionDivider";
  title: string;
};

type SubredditItem = {
  type: "subreddit";
  subreddit: Subreddit;
  category: string;
};

type MultiItem = {
  type: "multireddit";
  multi: Multi;
};

type ScrollItem =
  | TopButtonItem
  | SectionDividerItem
  | SubredditItem
  | MultiItem;

function SectionHeading({ title }: { title: string }) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.categoryTitleContainer,
        {
          backgroundColor: theme.tint,
        },
      ]}
    >
      <Text
        style={[
          styles.categoryTitle,
          {
            color: theme.subtleText,
          },
        ]}
      >
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function AlphabetScroller({
  onLetterPress,
}: {
  onLetterPress: (letter: string) => void;
}) {
  const { theme } = useContext(ThemeContext);

  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  const containerHeight = useRef(0);

  const handleTouch = (event: GestureResponderEvent) => {
    if (containerHeight.current === 0) return;

    const { locationY } = event.nativeEvent;
    const letterHeight = containerHeight.current / ALPHABET.length;
    const letterIndex = Math.floor(locationY / letterHeight);
    const letter = ALPHABET[letterIndex];

    if (
      letterIndex >= 0 &&
      letterIndex < ALPHABET.length &&
      letter !== hoveredLetter
    ) {
      onLetterPress(letter);
      setHoveredLetter(letter);
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    containerHeight.current = height;
  };

  return (
    <>
      <View
        style={[
          styles.alphabetScrollerContainer,
          {
            backgroundColor: theme.tint,
          },
        ]}
        onLayout={handleLayout}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={() => {
          setHoveredLetter(null);
        }}
      >
        {ALPHABET.map((letter) => (
          <View
            key={letter}
            style={[styles.alphabetItem]}
            pointerEvents="none" // Ensures the parent is used for locationY calculations
          >
            <Text
              style={[styles.alphabetText, { color: theme.iconOrTextButton }]}
            >
              {letter}
            </Text>
          </View>
        ))}
      </View>
      {!!hoveredLetter && (
        <View
          style={[
            styles.letterPreview,
            {
              backgroundColor: theme.tint,
            },
          ]}
        >
          <Text
            style={[
              styles.letterPreviewText,
              { color: theme.iconOrTextButton },
            ]}
          >
            {hoveredLetter}
          </Text>
        </View>
      )}
    </>
  );
}

function TopButton({ item }: { item: TopButtonItem }) {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();
  return (
    <TouchableOpacity
      onPress={() => pushURL(item.path)}
      activeOpacity={0.5}
      style={[
        styles.bigButtonContainer,
        {
          borderBottomColor: theme.tint,
        },
      ]}
    >
      <View
        key={item.path}
        style={[
          styles.bigButtonSubContainer,
          {
            borderBottomColor: theme.tint,
          },
        ]}
      >
        <View
          style={[
            styles.bigButtonIconContainer,
            {
              backgroundColor: item.color,
            },
          ]}
        >
          {item.icon}
        </View>
        <View>
          <Text
            style={[
              styles.subredditText,
              {
                color: theme.text,
              },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.subredditDescription,
              {
                color: theme.subtleText,
              },
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Subreddits() {
  const { theme } = useContext(ThemeContext);
  const { subreddits, multis } = useContext(SubredditContext);
  const flashListRef = useRef<FlashListRef<ScrollItem>>(null);

  const scrollItems: ScrollItem[] = [
    {
      type: "topButton",
      title: "Home",
      path: "https://www.reddit.com/",
      description: "Posts from subscriptions",
      icon: <FontAwesome5 name="home" size={24} color={theme.text} />,
      color: "#fa045e",
    },
    {
      type: "topButton",
      title: "Popular",
      path: "https://www.reddit.com/r/popular",
      description: "Most popular posts across Reddit",
      icon: <Feather name="trending-up" size={24} color={theme.text} />,
      color: "#008ffe",
    },
    {
      type: "topButton",
      title: "All",
      path: "https://www.reddit.com/r/all",
      description: "Posts across all subreddits",
      icon: (
        <FontAwesome5 name="sort-amount-up-alt" size={24} color={theme.text} />
      ),
      color: "#02d82b",
    },
  ];

  if (subreddits["favorites"].length > 0) {
    scrollItems.push({
      type: "sectionDivider",
      title: "favorites",
    });
    scrollItems.push(
      ...subreddits["favorites"].map((sub) => ({
        type: "subreddit" as const,
        subreddit: sub,
        category: "favorites",
      })),
    );
  }

  if (multis.length > 0) {
    scrollItems.push({
      type: "sectionDivider",
      title: "multireddits",
    });
    scrollItems.push(
      ...multis.map((multi) => ({
        type: "multireddit" as const,
        multi: multi,
      })),
    );
  }

  if (subreddits["moderator"].length > 0) {
    scrollItems.push({
      type: "sectionDivider",
      title: "moderator",
    });
    scrollItems.push(
      ...subreddits["moderator"].map((sub) => ({
        type: "subreddit" as const,
        subreddit: sub,
        category: "moderator",
      })),
    );
  }

  if (subreddits["subscriber"].length > 0) {
    scrollItems.push({
      type: "sectionDivider",
      title: "subscriber",
    });
    scrollItems.push(
      ...subreddits["subscriber"].map((sub) => ({
        type: "subreddit" as const,
        subreddit: sub,
        category: "subscriber",
      })),
    );
  }

  if (subreddits["trending"].length > 0) {
    scrollItems.push({
      type: "sectionDivider",
      title: "trending",
    });
    scrollItems.push(
      ...subreddits["trending"].map((sub) => ({
        type: "subreddit" as const,
        subreddit: sub,
        category: "trending",
      })),
    );
  }

  const letterMap = "abcdefghijklmnopqrstuvwxyz".split("").reduce(
    (acc, letter) => {
      acc[letter] = scrollItems.findIndex(
        (item) =>
          item.type === "subreddit" &&
          ["subscriber", "trending"].includes(item.category) &&
          item.subreddit.name.charAt(0).toLowerCase() === letter,
      );
      return acc;
    },
    {} as { [key: string]: number },
  );

  const scrollToLetter = (letter: string) => {
    const targetItem = letterMap[letter.toLowerCase()];
    if (targetItem) {
      flashListRef.current?.scrollToIndex({
        index: targetItem,
        animated: false,
      });
    }
  };

  return (
    <View style={styles.subredditsContainer}>
      <FlashList
        ref={flashListRef}
        data={scrollItems}
        renderItem={({ item }) =>
          item.type === "topButton" ? (
            <TopButton item={item} />
          ) : item.type === "sectionDivider" ? (
            <SectionHeading title={item.title} />
          ) : item.type === "subreddit" ? (
            <SubredditCompactLink subreddit={item.subreddit} />
          ) : item.type === "multireddit" ? (
            <MultiredditLink multi={item.multi} />
          ) : null
        }
        getItemType={(item) => item.type}
        keyExtractor={(item) => {
          if (item.type === "topButton") {
            return item.title;
          } else if (item.type === "sectionDivider") {
            return item.title;
          } else if (item.type === "subreddit") {
            return item.subreddit.name;
          } else if (item.type === "multireddit") {
            return item.multi.name;
          }
          return "";
        }}
      />
      <AlphabetScroller onLetterPress={scrollToLetter} />
    </View>
  );
}

const styles = StyleSheet.create({
  bigButtonContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
  },
  bigButtonSubContainer: {
    flex: 1,
    flexDirection: "row",
  },
  bigButtonIconContainer: {
    width: 40,
    height: 40,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  subredditsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {},
  categoryTitleContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  categoryTitle: {
    marginVertical: 2,
    fontWeight: "500",
  },
  subredditDescription: {
    fontSize: 12,
    marginTop: 5,
  },
  subredditText: {
    fontSize: 16,
  },
  // A-Z scroller styles
  alphabetScrollerContainer: {
    position: "absolute",
    right: 0,
    height: "80%",
    top: "10%",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  alphabetItem: {
    width: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 1,
  },
  alphabetText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  letterPreview: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  letterPreviewText: {
    fontSize: 40,
    fontWeight: "bold",
  },
});
