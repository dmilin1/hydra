import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
  Text,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { Rule, Sidebar } from "../api/SubredditDetails";
import { getRules, getSidebar } from "../api/gql/SubredditDetails";
import { URLRoutes } from "../app/stack";
import { useRoute } from "../utils/navigation";
import RedditURL from "../utils/RedditURL";
import RenderHtml from "../components/HTML/RenderHTML";
import Numbers from "../utils/Numbers";
import AccessFailureComponent from "../components/UI/AccessFailureComponent";

export default function SidebarPage() {
  const { params } = useRoute<URLRoutes>();
  const { theme } = useContext(ThemeContext);
  const [sidebar, setSidebar] = useState<Sidebar | null>(null);
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const subreddit = new RedditURL(params.url).getSubreddit();

  useEffect(() => {
    Promise.all([getSidebar(subreddit), getRules(subreddit)])
      .then(([sidebar, rules]) => {
        setSidebar(sidebar);
        setRules(rules);
      })
      .catch((e) =>
        setLoadError(e instanceof Error ? e : new Error(String(e))),
      );
  }, [subreddit]);

  const toggleRule = (ruleName: string) => {
    setExpandedRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ruleName)) {
        newSet.delete(ruleName);
      } else {
        newSet.add(ruleName);
      }
      return newSet;
    });
  };

  return (
    <View
      style={[
        styles.sidebarContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {sidebar && rules ? (
        <ScrollView style={styles.scrollView}>
          <View
            style={[
              styles.statsContainer,
              {
                backgroundColor: theme.tint,
              },
            ]}
          >
            {[
              { label: "Subscribers", value: sidebar.subscribers },
              { label: "Weekly Visitors", value: sidebar.weeklyVisitors },
              {
                label: "Weekly Contributions",
                value: sidebar.weeklyContributions,
              },
            ]
              .filter((stat) => stat.value !== undefined)
              .map((stat) => ({
                ...stat,
                value: new Numbers(stat.value ?? 0).prettyNum(),
              }))
              .map((stat) => (
                <View style={styles.statItem} key={stat.label}>
                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={[
                      styles.statText,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {stat.value}
                  </Text>
                </View>
              ))}
          </View>
          <View style={styles.rulesContainer}>
            <Text
              style={[
                styles.rulesHeader,
                {
                  color: theme.text,
                },
              ]}
            >
              Rules
            </Text>
            {rules.map((rule, i) => (
              <Touchable
                key={rule.name}
                style={[
                  styles.ruleItem,
                  {
                    borderBottomColor: theme.divider,
                  },
                ]}
                onPress={() => toggleRule(rule.name)}
                activeOpacity={0.8}
                animationDuration={{ in: 0, out: 150 }}
              >
                <View style={styles.ruleHeader}>
                  <Text
                    style={[
                      styles.ruleName,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {i + 1}. {rule.name}
                  </Text>
                  <Text
                    style={[
                      styles.expandIcon,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    {expandedRules.has(rule.name) ? "−" : "+"}
                  </Text>
                </View>
                {expandedRules.has(rule.name) && (
                  <View style={styles.ruleDescription}>
                    <RenderHtml html={rule.descriptionHTML} />
                  </View>
                )}
              </Touchable>
            ))}
          </View>
          <View style={styles.descriptionContainer}>
            <RenderHtml html={sidebar.descriptionHTML} />
          </View>
        </ScrollView>
      ) : loadError ? (
        <AccessFailureComponent
          accessFailure={loadError}
          contentName={subreddit}
        />
      ) : (
        <ActivityIndicator color={theme.text} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  statsContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  statLabel: {
    fontSize: 13,
    textAlign: "center",
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  rulesContainer: {
    marginBottom: 20,
  },
  rulesHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  ruleItem: {
    marginBottom: 5,
    borderBottomWidth: 1,
  },
  ruleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  ruleDescription: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  descriptionContainer: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
});
