import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  DocumentationKey,
  DocumentationSearch,
} from "../../utils/DocumentationSearch";
import { useRoute, useURLNavigation } from "../../utils/navigation";
import URL from "../../utils/URL";
import { URLRoutes } from "../../app/stack";
import { DOCUMENTATION } from "../../constants/documentation";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import SearchBar from "../../components/UI/SearchBar";
import List from "../../components/UI/List";
import RenderHtml from "../../components/HTML/RenderHTML";
import * as Snudown from "../../external/snudown";
import { askQuestion } from "../../api/AI";

const categoryData: {
  name: string;
  description: string;
  docs: DocumentationKey[];
}[] = [
  {
    name: "Basics",
    description: "Learn the basics of using Hydra",
    docs: ["getting_started", "accounts_and_login", "navigation_basics"],
  },
  {
    name: "Browsing",
    description: "How to browse posts, comments, and subreddits",
    docs: [
      "browsing_posts",
      "viewing_comments",
      "subreddits",
      "search",
      "gallery_mode",
    ],
  },
  {
    name: "Interactions",
    description: "Voting, saving, sharing, posting, and commenting",
    docs: [
      "voting",
      "saving",
      "sharing",
      "downloading_media",
      "posting",
      "commenting",
    ],
  },
  {
    name: "Gestures",
    description: "Swipe gestures and navigation features",
    docs: ["gestures"],
  },
  {
    name: "Filters",
    description: "Filtering content and organizing your feeds",
    docs: ["text_filters", "ai_filters", "hiding_content", "organizing_feeds"],
  },
  {
    name: "Sorting",
    description: "Sorting options and appearance settings",
    docs: ["sorting", "appearance_settings"],
  },
  {
    name: "Themes",
    description: "Themes, custom themes, and app icons",
    docs: ["themes", "custom_themes", "app_icons"],
  },
  {
    name: "Messages",
    description: "Managing your inbox and private messages",
    docs: ["inbox", "messages", "inbox_alerts"],
  },
  {
    name: "Advanced",
    description: "Power user features and advanced functionality",
    docs: [
      "split_view",
      "stats",
      "ai_summaries",
      "live_text",
      "external_links",
    ],
  },
  {
    name: "Settings",
    description: "Comprehensive guide to all settings",
    docs: [
      "settings_overview",
      "general_settings",
      "data_use_settings",
      "privacy_settings",
      "advanced_settings",
    ],
  },
  {
    name: "Hydra Pro",
    description: "Information about Hydra Pro subscription",
    docs: ["hydra_pro"],
  },
  {
    name: "Troubleshooting",
    description: "Common issues, solutions, and helpful tips",
    docs: ["troubleshooting", "tips_and_tricks"],
  },
];

// Convert markdown hydra links to HTML anchor tags since Snudown doesn't recognize the hydra:// protocol
const fixHydraLinks = (text: string) => {
  return text.replaceAll(
    /\[([^\]]+)\]\(hydra:\/\/([^)]+)\)/g,
    '<a href="hydra://$2">$1</a>',
  );
};

export default function Guide() {
  const { theme } = useContext(ThemeContext);

  const navigation = useURLNavigation();

  const docSearch = useRef(new DocumentationSearch());
  const url = useRoute<URLRoutes>().params.url;
  const search = new URL(url).getQueryParam("search") ?? undefined;
  const category = new URL(url).getQueryParam("category") ?? undefined;
  const docKey = new URL(url).getQueryParam("doc") ?? undefined;

  const doc =
    docKey && docKey in DOCUMENTATION
      ? DOCUMENTATION[docKey as DocumentationKey]
      : docKey
        ? DOCUMENTATION["not_found"]
        : undefined;

  const [answer, setAnswer] = useState<string>();
  const [searchDocKeys, setSearchDocKeys] = useState<DocumentationKey[]>([]);

  const docs = search
    ? searchDocKeys.map((key) => DOCUMENTATION[key])
    : category
      ? (categoryData
          .find((c) => c.name === category)
          ?.docs.map((doc) => DOCUMENTATION[doc]) ?? [])
      : Object.values(DOCUMENTATION);

  const docHTML: string | undefined = doc
    ? fixHydraLinks(Snudown.markdown(doc.text))
    : undefined;

  const answerHTML: string | undefined = answer
    ? fixHydraLinks(Snudown.markdown(answer.trim()))
    : undefined;

  const findResults = async (search: string) => {
    const results = await docSearch.current.find(search, 5);
    setSearchDocKeys(results);
  };

  const handleSearch = (search: string) => {
    if (search) {
      navigation.replaceURL(
        `hydra://settings/guide/?search=${encodeURIComponent(search)}`,
      );
    } else {
      navigation.replaceURL("hydra://settings/guide/");
    }
  };

  const getAnswer = async (search: string) => {
    const docsText = docs.map((doc) => doc.text).slice(0, 3);
    const { markdown } = await askQuestion(search, docsText);
    setAnswer(markdown);
  };

  useEffect(() => {
    if (!search) return;
    findResults(search);
  }, []);

  useEffect(() => {
    if (!search || !docs.length) return;
    getAnswer(search);
  }, [search, docs.length]);

  return (
    <View style={styles.container}>
      <SearchBar
        initialSearch={search}
        onSearch={handleSearch}
        searchOnBlur={true}
      />
      {answerHTML ? (
        <View style={[styles.answerContainer, { backgroundColor: theme.tint }]}>
          <RenderHtml html={answerHTML} />
        </View>
      ) : null}
      {search && searchDocKeys.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={theme.text} />
        </View>
      ) : category || search ? (
        <List
          title={category ?? "Search Results"}
          items={docs.map((doc) => ({
            key: doc.key,
            icon: null,
            text: doc.title,
            onPress: () =>
              navigation.pushURL(
                `hydra://settings/guide/?doc=${encodeURIComponent(doc.key)}`,
              ),
            renderCustomItem: () => (
              <ListItem name={doc.title} description={doc.description} />
            ),
          }))}
        />
      ) : docHTML ? (
        <View style={styles.docContainer}>
          <RenderHtml html={docHTML} />
        </View>
      ) : (
        <List
          title="Categories"
          items={categoryData.map((category) => ({
            key: category.name,
            text: category.description,
            onPress: () =>
              navigation.pushURL(
                `hydra://settings/guide/?category=${encodeURIComponent(category.name)}`,
              ),
            renderCustomItem: () => (
              <ListItem
                name={category.name}
                description={category.description}
              />
            ),
          }))}
        />
      )}
    </View>
  );
}

function ListItem({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const { theme } = useContext(ThemeContext);
  return (
    <View style={styles.docListItemContainer}>
      <Text
        style={[styles.docListItemTitle, { color: theme.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {name}
      </Text>
      <Text
        style={[styles.docListItemDescription, { color: theme.subtleText }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  answerContainer: {
    padding: 15,
    paddingBottom: 5,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
  },
  docListItemContainer: {
    flex: 1,
    gap: 5,
  },
  docListItemTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  docListItemDescription: {
    fontSize: 14,
  },
  docContainer: {
    flex: 1,
    padding: 10,
  },
});
