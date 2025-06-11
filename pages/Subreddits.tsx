import { FontAwesome5, Feather } from "@expo/vector-icons";
import React, { useContext, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";

import MultiredditLink from "../components/RedditDataRepresentations/Multireddit/MultiredditLink";
import SubredditCompactLink from "../components/RedditDataRepresentations/Subreddit/SubredditCompactLink";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../contexts/SubredditContext";
import { useURLNavigation } from "../utils/navigation";

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

export default function Subreddits() {
  const { theme } = useContext(ThemeContext);
  const { subreddits, multis } = useContext(SubredditContext);
  const scrollViewRef = useRef<ScrollView>(null);
  const letterPositionsRef = useRef<{ [key: string]: number }>({});

  const { pushURL } = useURLNavigation();

  const sliderSubreddits = subreddits["subscriber"].length
    ? subreddits["subscriber"]
    : subreddits["trending"];

  const handleSubredditLayout = (index: number, event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    const previousSubredditLetter = sliderSubreddits?.[index - 1]?.name
      .charAt(0)
      .toUpperCase();
    const subredditLetter = sliderSubreddits?.[index]?.name
      .charAt(0)
      .toUpperCase();
    if (previousSubredditLetter !== subredditLetter) {
      letterPositionsRef.current[subredditLetter] = y;
    }
  };

  const scrollToLetter = (letter: string) => {
    const position = letterPositionsRef.current[letter];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position, animated: false });
    }
  };

  return (
    <View style={styles.subredditsContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.scrollView,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        {[
          {
            title: "Home",
            path: "https://www.reddit.com/",
            description: "Posts from subscriptions",
            icon: <FontAwesome5 name="home" size={24} color={theme.text} />,
            color: "#fa045e",
          },
          {
            title: "Popular",
            path: "https://www.reddit.com/r/popular",
            description: "Most popular posts across Reddit",
            icon: <Feather name="trending-up" size={24} color={theme.text} />,
            color: "#008ffe",
          },
          {
            title: "All",
            path: "https://www.reddit.com/r/all",
            description: "Posts across all subreddits",
            icon: (
              <FontAwesome5
                name="sort-amount-up-alt"
                size={24}
                color={theme.text}
              />
            ),
            color: "#02d82b",
          },
        ].map((link) => (
          <TouchableOpacity
            key={link.title}
            onPress={() => pushURL(link.path)}
            activeOpacity={0.5}
            style={[
              styles.bigButtonContainer,
              {
                borderBottomColor: theme.tint,
              },
            ]}
          >
            <View
              key={link.path}
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
                    backgroundColor: link.color,
                  },
                ]}
              >
                {link.icon}
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
                  {link.title}
                </Text>
                <Text
                  style={[
                    styles.subredditDescription,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {link.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {subreddits["favorites"].length > 0 && (
          <>
            <SectionHeading title="favorites" />
            {subreddits["favorites"].map((sub) => (
              <SubredditCompactLink key={sub.name} subreddit={sub} />
            ))}
          </>
        )}
        {multis.length > 0 && (
          <>
            <SectionHeading title="multireddits" />
            {multis.map((multi) => (
              <MultiredditLink key={multi.name} multi={multi} />
            ))}
          </>
        )}
        {subreddits["moderator"].length > 0 && (
          <>
            <SectionHeading title="moderator" />
            {subreddits["moderator"].map((sub) => (
              <SubredditCompactLink key={sub.name} subreddit={sub} />
            ))}
          </>
        )}
        {subreddits["subscriber"].length > 0 && (
          <>
            <SectionHeading title="subscriber" />
            {subreddits["subscriber"].map((sub, index) => (
              <View
                key={sub.name}
                onLayout={(event) => handleSubredditLayout(index, event)}
              >
                <SubredditCompactLink subreddit={sub} />
              </View>
            ))}
          </>
        )}
        {subreddits["trending"].length > 0 && (
          <>
            <SectionHeading title="trending" />
            {subreddits["trending"].map((sub, index) => (
              <View
                key={sub.name}
                onLayout={(event) => handleSubredditLayout(index, event)}
              >
                <SubredditCompactLink key={sub.name} subreddit={sub} />
              </View>
            ))}
          </>
        )}
      </ScrollView>
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
