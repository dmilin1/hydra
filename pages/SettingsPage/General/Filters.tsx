import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";

import List from "../../../components/UI/List";
import SectionTitle from "../../../components/UI/SectionTitle";
import TextInput from "../../../components/UI/TextInput";
import { FiltersContext } from "../../../contexts/SettingsContexts/FiltersContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../../utils/navigation";

const noPolitics = `
Don't show posts about the following:
- Politics
- Economics referred to in a political way
- Companies referred to negatively
- Billionaires
- Political sounding subreddits
- Government agencies
- Notable government figures
- Government buildings
- Hot political topics like abortion, gun control, etc.
- Negative about the environment, climate change, or sustainability
- About ethnicity, gender, race, or religion`.trim();

const noNegativity = `
Don't show the following kinds of posts:
- Negative or critical of a person, company, or product.
- Have words like "hate", "dislike", "bad", "worst", etc.
- Angry rants or complaints.
- Overly dramatic or emotional
- Negative about the environment, climate change, or sustainability
- Attempt to incite anger or outrage
`.trim();

const noGraphicContent = `
Don't show posts containing:
- Violence, fights, or physical harm
- Blood, injuries, or medical procedures
- Death, corpses, or crime scenes
- War, combat, or disaster footage
- Animal cruelty, dead animals, or hunting content
- Explicit sexual content or nudity
- Psychological horror or disturbing content
- True crime details or crime scene photos
- Medical emergencies or graphic medical conditions
- Paranormal or supernatural content
`.trim();

const noGamblingTriggers = `
Don't show posts containing:
- Gambling, betting, or wagering of any kind
- Sports betting, fantasy sports, or casino games
- Lottery, scratch cards, or gambling promotions
- Gambling-related communities, success stories, or ads
- Stock market trading, crypto trading, or day trading
- Trading-related communities like WallStreetBets
- Market speculation, predictions, or volatility
- Trading terminology like "moon", "hodl", "diamond hands"
`.trim();

const noDrugsAndAlcohol = `
Don't show posts containing:
- Illegal drugs, drug use, or drug culture
- Drug names, slang, preparation, or acquisition
- Alcohol brands, drinking stories, or drinking games
- Prescription drug abuse or misuse
- Drug-related communities, memes, or media
- Drug-related news, policy, or legalization
- Drug-related locations, events, or gatherings
- Recovery stories, addiction, or withdrawal
`.trim();

const noFluff = `
Don't show posts containing:
- Celebrity news, gossip, or entertainment drama
- Clickbait or sensational headlines
- Low-effort content like memes or reposts
- Posts with poor formatting or minimal effort
- Made-up stories or exaggerated narratives
- Personal drama or attention-seeking posts
- Story-based subreddits with common templates
`.trim();

const aiFilterPresets = [
  {
    key: "noPolitics",
    text: "No Politics",
    description: noPolitics,
  },
  {
    key: "noNegativity",
    text: "No Negativity",
    description: noNegativity,
  },
  {
    key: "noGraphicContent",
    text: "No Graphic Content",
    description: noGraphicContent,
  },
  {
    key: "noGamblingTriggers",
    text: "No Gambling Triggers",
    description: noGamblingTriggers,
  },
  {
    key: "noDrugsAndAlcohol",
    text: "No Drugs and Alcohol",
    description: noDrugsAndAlcohol,
  },
  {
    key: "noFluff",
    text: "No Fluff",
    description: noFluff,
  },
];

export default function Filters() {
  const { theme } = useContext(ThemeContext);
  const {
    filterSeenPosts,
    toggleFilterSeenPosts,
    hideSeenURLs,
    autoMarkAsSeen,
    toggleAutoMarkAsSeen,
    filterText,
    setFilterText,
    aiFilterText,
    setAiFilterText,
    hideFilteredSubreddits,
    toggleFilterSubreddit: toggleHideSubreddit,
  } = useContext(FiltersContext);

  const { isPro } = useContext(SubscriptionsContext);
  const { pushURL } = useURLNavigation();

  const hideSeenURLOverrides = Object.entries(hideSeenURLs)
    .filter(([_, setting]) => setting !== filterSeenPosts)
    .map(([url]) => url);

  const showProAlert = () => {
    Alert.alert(
      "Hydra Pro Feature",
      "This feature is only available to Hydra Pro subscribers.",
      [
        {
          text: "Get Hydra Pro",
          isPreferred: true,
          onPress: () => {
            pushURL("hydra://settings/hydraPro");
          },
        },
        {
          text: "Maybe Later",
          style: "cancel",
        },
      ]
    );
  };

  const filteredSubreddits = Object.keys(hideFilteredSubreddits);

  return (
    <>
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        Filters only apply to items in the main feeds and subreddits. They do
        not apply to search results or user profiles. Excessive filtering may
        make load times slower because more items have to be loaded before
        showing results.
      </Text>
      <List
        title="Post Settings"
        items={[
          {
            key: "filterSeenPosts",
            icon: (
              <MaterialCommunityIcons
                name="view-compact-outline"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={filterSeenPosts}
                onValueChange={() => toggleFilterSeenPosts()}
              />
            ),
            text: "Hide Seen Posts",
            onPress: () => toggleFilterSeenPosts(),
          },
          {
            key: "autoMarkAsSeen",
            icon: (
              <MaterialCommunityIcons
                name="view-compact-outline"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={autoMarkAsSeen}
                onValueChange={() => toggleAutoMarkAsSeen()}
              />
            ),
            text: "Mark as Seen On Scroll",
            onPress: () => toggleAutoMarkAsSeen(),
          },
        ]}
      />
      {hideSeenURLOverrides.length > 0 && (
        <View style={styles.hideSeenURLsContainer}>
          <Text
            style={{
              color: theme.text,
            }}
          >
            You have set manual overrides to {filterSeenPosts ? "show" : "hide"}{" "}
            seen posts on the following URLs:
          </Text>
          {hideSeenURLOverrides.map((url) => (
            <Text
              key={url}
              style={{
                color: theme.text,
              }}
            >
              {url}
            </Text>
          ))}
        </View>
      )}
      <SectionTitle text="Text Filter List" />
      <TextInput
        style={[
          styles.filterText,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
            color: theme.text,
          },
        ]}
        multiline
        value={filterText}
        onChangeText={(text) => setFilterText(text)}
      />
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        Words or phrases can be seperated by commas or new lines. If a post or
        comment contains items on this list, it will be hidden from view. Post
        filter text includes the title, author username, post text, poll
        options, link titles, and link descriptions. Comment filter text
        includes the comment text, and author username. Text filtering is case
        insensitive and won't match subwords. For example, "cat" won't match
        "caterpillar".
      </Text>
      <SectionTitle text="Smart Post Filter" />
      <TextInput
        style={[
          styles.filterText,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
            color: theme.text,
          },
        ]}
        multiline
        value={aiFilterText}
        onChangeText={(text) => setAiFilterText(text)}
        editable={isPro}
        onPress={() => {
          if (!isPro) {
            showProAlert();
          }
        }}
      />
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        Write a description of the kinds of posts you want to have hidden. Posts
        that match this description will be hidden from view. Or, you can use
        one of the presets below. Smart filters do a much better job of catching
        unwanted content than text filters, but only apply to posts.
        Additionally, smart filters are unable to scan post images, so they may
        miss some unwanted content if the unwanted material is not alluded to in
        the title or text of a post.
      </Text>
      <List
        title="Smart Post Filter Presets"
        items={aiFilterPresets.map((preset) => ({
          key: preset.key,
          text: preset.text,
          icon: (
            <MaterialCommunityIcons
              name="view-compact-outline"
              size={24}
              color={theme.text}
            />
          ),
          rightIcon:
            aiFilterText === preset.description ? (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={theme.text}
              />
            ) : (
              <></>
            ),
          onPress: () => {
            if (isPro) {
              setAiFilterText(preset.description);
            } else {
              showProAlert();
            }
          },
        }))}
      />
      <SectionTitle text="Filtered subreddits" />
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        You can filter subreddits by long-pressing posts on subreddits such as
        /r/all or multireddits. Once filtered, subreddits will apear here.
        Delete the filter to begin seeing posts from this subreddit again.
      </Text>
      {filteredSubreddits.length > 0 && (
        <List
          title="Subreddits"
          items={filteredSubreddits.map((subreddit) => ({
            key: subreddit,
            text: subreddit,
            icon: (
              <MaterialCommunityIcons
                name="view-compact-outline"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: (
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color={theme.text}
              />
            ),
            onPress: () => {
              Alert.alert(`Remove ${subreddit} from filter?`, "", [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => {
                    toggleHideSubreddit(subreddit);
                  },
                },
              ]);
            },
          }))}
        />
      )}
      <View style={{ marginBottom: 50 }} />
    </>
  );
}

const styles = StyleSheet.create({
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
  hideSeenURLsContainer: {
    margin: 15,
    gap: 5,
  },
  filterText: {
    marginHorizontal: 15,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
  },
});
