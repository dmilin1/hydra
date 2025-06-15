import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
  Text,
} from "react-native";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { getWiki, Wiki } from "../api/SubredditDetails";
import { URLRoutes } from "../app/stack";
import { useRoute } from "../utils/navigation";
import RenderHtml from "../components/HTML/RenderHTML";

export default function WikiPage() {
  const { params } = useRoute<URLRoutes>();
  const { theme } = useContext(ThemeContext);
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [noWiki, setNoWiki] = useState(false);

  useEffect(() => {
    getWiki(params.url)
      .then(setWiki)
      .catch(() => setNoWiki(true));
  }, [params.url]);

  return (
    <View
      style={[
        styles.wikiContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {noWiki ? (
        <Text style={{ color: theme.text }}>No wiki found</Text>
      ) : wiki ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.wikiContentContainer}>
            <RenderHtml html={wiki.contentHTML} />
          </View>
        </ScrollView>
      ) : (
        <ActivityIndicator color={theme.text} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wikiContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  wikiContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
});
