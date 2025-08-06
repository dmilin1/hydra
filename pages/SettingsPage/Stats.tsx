import {
  AntDesign,
  Feather,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import * as Application from "expo-application";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import SectionTitle from "../../components/UI/SectionTitle";
import {
  getStats,
  getSubredditVisitCounts,
  Stat,
} from "../../db/functions/Stats";
import Time from "../../utils/Time";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../utils/navigation";

type StatCardData = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
};

type UsageStat = {
  title: string;
  value: string;
  icon: React.ReactNode;
  show: boolean;
};

type Achievement = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function Stats() {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();

  const [installTime, setInstallTime] = useState<number | null>(null);

  const startedTrackingTime = Math.max(
    installTime ?? 0,
    new Date("2025-08-05").getTime(),
  );

  const stats = getStats();
  const subredditVisits = getSubredditVisitCounts();

  const postsCreated = stats[Stat.POSTS_CREATED] ?? 0;
  const commentsCreated = stats[Stat.COMMENTS_CREATED] ?? 0;
  const totalContentCreated =
    (stats[Stat.POSTS_CREATED] ?? 0) + (stats[Stat.COMMENTS_CREATED] ?? 0);

  const totalVotes =
    (stats[Stat.POST_UPVOTES] ?? 0) +
    (stats[Stat.POST_DOWNVOTES] ?? 0) +
    (stats[Stat.COMMENT_UPVOTES] ?? 0) +
    (stats[Stat.COMMENT_DOWNVOTES] ?? 0);

  const positiveVotes =
    (stats[Stat.POST_UPVOTES] ?? 0) + (stats[Stat.COMMENT_UPVOTES] ?? 0);

  const negativeVotes =
    (stats[Stat.POST_DOWNVOTES] ?? 0) + (stats[Stat.COMMENT_DOWNVOTES] ?? 0);

  const positivityRatio =
    totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 0;

  const postVotes =
    (stats[Stat.POST_UPVOTES] ?? 0) + (stats[Stat.POST_DOWNVOTES] ?? 0);

  const commentVotes =
    (stats[Stat.COMMENT_UPVOTES] ?? 0) + (stats[Stat.COMMENT_DOWNVOTES] ?? 0);

  /**
   * The scroll distance is stored in density independent pixels. All devices attempt
   * to have a density near 160 dpi after accounting for scaling, so dividing by 160
   * gives us the distance in inches, or at least close enough for most devices.
   */
  const scrollDistanceInches = (stats[Stat.SCROLL_DISTANCE] ?? 0) / 160;
  const scrollDistanceKm = scrollDistanceInches * 0.0000254;

  const uniqueSubreddits = Object.keys(subredditVisits).length;

  const topSubreddits = Object.entries(subredditVisits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const maxVisits = topSubreddits.length > 0 ? topSubreddits[0][1] : 1;

  const obfuscateNumber = (text: string) =>
    isPro ? text : text.replace(/\d/g, "*");
  const obfuscateText = (text: string) =>
    isPro ? text : text.replace(/\w/g, "*");

  const prettyNum = (
    value: number,
    precision: number,
    unit?: string,
    pluralUnit?: string,
  ) => {
    let result = value.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    if (unit && pluralUnit) {
      if (parseFloat(value.toFixed(precision)) === 1) {
        result += ` ${unit}`;
      } else {
        result += ` ${pluralUnit}`;
      }
    }
    result = obfuscateNumber(result);
    return result;
  };

  const prettyDistance = (inches: number) => {
    const meters = inches * 0.0254;
    if (meters < 1000) {
      return `${prettyNum(inches / 12, 0)}ft / ${prettyNum(meters, 0)}m`;
    }
    const miles = inches / 63360;
    const kilometers = meters / 1000;
    return `${prettyNum(miles, 1)}mi / ${prettyNum(kilometers, 1)}km`;
  };

  const statCardData: StatCardData[] = [
    {
      title: "Posts Explored",
      value: prettyNum(stats[Stat.POSTS_VIEWED] ?? 0, 0),
      subtitle: "Knowledge acquired",
      icon: (
        <MaterialIcons name="explore" size={24} color={theme.iconPrimary} />
      ),
    },
    {
      title: "Distance Scrolled",
      value: prettyDistance(scrollDistanceInches),
      subtitle: `That's about ${prettyNum(scrollDistanceInches / 6.5, 0, "banana", "bananas")}!`,
      icon: (
        <MaterialCommunityIcons
          name="gesture-swipe-vertical"
          size={24}
          color={theme.iconPrimary}
        />
      ),
    },
    {
      title: "Upvotes Given",
      value: prettyNum(positiveVotes, 0),
      subtitle: `${prettyNum(stats[Stat.POST_UPVOTES] ?? 0, 0, "post", "posts")}, ${prettyNum(stats[Stat.COMMENT_UPVOTES] ?? 0, 0, "comment", "comments")}`,
      icon: <AntDesign name="like1" size={24} color={theme.iconPrimary} />,
    },
    {
      title: "Downvotes Given",
      value: prettyNum(negativeVotes, 0),
      subtitle: `${prettyNum(stats[Stat.POST_DOWNVOTES] ?? 0, 0, "post", "posts")}, ${prettyNum(stats[Stat.COMMENT_DOWNVOTES] ?? 0, 0, "comment", "comments")}`,
      icon: <AntDesign name="dislike1" size={24} color={theme.iconPrimary} />,
    },
    {
      title: "Content Created",
      value: prettyNum(totalContentCreated, 0),
      subtitle: `${prettyNum(stats[Stat.POSTS_CREATED] ?? 0, 0, "post", "posts")}, ${prettyNum(stats[Stat.COMMENTS_CREATED] ?? 0, 0, "comment", "comments")}`,
      icon: <Feather name="edit-3" size={24} color={theme.iconPrimary} />,
    },
  ];

  const usageStats: UsageStat[] = [
    {
      title: "App Launches",
      value: prettyNum(stats[Stat.APP_LAUNCHES] ?? 0, 0),
      icon: <FontAwesome5 name="rocket" size={20} color={theme.iconPrimary} />,
      show: true,
    },
    {
      title: "Opens per Day",
      value: prettyNum(
        (stats[Stat.APP_FOREGROUNDS] ?? 0) /
          ((new Date().getTime() - startedTrackingTime) /
            (1000 * 60 * 60 * 24)),
        2,
      ),
      icon: (
        <FontAwesome6 name="calendar-day" size={20} color={theme.iconPrimary} />
      ),
      show: true,
    },
    {
      title: "Total Opens",
      value: prettyNum(stats[Stat.APP_FOREGROUNDS] ?? 0, 0),
      icon: (
        <MaterialIcons name="refresh" size={20} color={theme.iconPrimary} />
      ),
      show: true,
    },
    {
      title: "Upvote Ratio",
      value: `${prettyNum(positivityRatio, 0)}%`,
      icon: <Feather name="thumbs-up" size={20} color={theme.iconPrimary} />,
      show: positivityRatio > 0,
    },
  ];

  const achievements: Achievement[] = [];
  if ((stats[Stat.APP_LAUNCHES] ?? 0) >= 50) {
    achievements.push({
      title: "Dedicated User",
      description: `Launched Hydra ${prettyNum(stats[Stat.APP_LAUNCHES] ?? 0, 0)} times`,
      icon: <Feather name="star" size={16} color={theme.iconPrimary} />,
    });
  }
  if (scrollDistanceKm >= 5) {
    achievements.push({
      title: "Scroll Master",
      description: `Scrolled ${prettyNum(scrollDistanceKm, 2)}km`,
      icon: <Feather name="trending-up" size={16} color={theme.iconPrimary} />,
    });
  }
  if (positivityRatio >= 80 && totalVotes >= 10) {
    achievements.push({
      title: "Positive Vibes",
      description: `${prettyNum(positivityRatio, 0)}% of your votes are upvotes`,
      icon: <Feather name="thumbs-up" size={16} color={theme.iconPrimary} />,
    });
  }
  if (postsCreated >= 10) {
    achievements.push({
      title: "Content Creator",
      description: `Created ${prettyNum(postsCreated, 0)} posts`,
      icon: <Feather name="edit" size={16} color={theme.iconPrimary} />,
    });
  }
  if (commentsCreated >= 10) {
    achievements.push({
      title: "Commentary Master",
      description: `Created ${prettyNum(commentsCreated, 0)} comments`,
      icon: (
        <Feather name="message-circle" size={16} color={theme.iconPrimary} />
      ),
    });
  }
  if (uniqueSubreddits >= 10) {
    achievements.push({
      title: "Explorer",
      description: `Visited ${prettyNum(uniqueSubreddits, 0)} communities`,
      icon: <Feather name="compass" size={16} color={theme.iconPrimary} />,
    });
  }
  if ((stats[Stat.POSTS_VIEWED] ?? 0) >= 100) {
    achievements.push({
      title: "Knowledge Seeker",
      description: `Viewed ${prettyNum(stats[Stat.POSTS_VIEWED] ?? 0, 0)} posts`,
      icon: <Feather name="book-open" size={16} color={theme.iconPrimary} />,
    });
  }

  const funFacts: string[] = [];
  if (scrollDistanceKm) {
    funFacts.push(
      `🌙 You've scrolled ${prettyNum((scrollDistanceKm / 384_400) * 100, 7)}% of the way to the moon`,
    );
  }
  if (scrollDistanceKm > 0) {
    funFacts.push(
      `🏃‍♂️ You've scrolled ${prettyNum(scrollDistanceKm / 42.195, 5)} marathons`,
    );
  }
  if (stats[Stat.APP_FOREGROUNDS] > stats[Stat.APP_LAUNCHES]) {
    funFacts.push(
      `🔄 You return to Hydra ${prettyNum(stats[Stat.APP_FOREGROUNDS] / stats[Stat.APP_LAUNCHES], 1)}x per session on average`,
    );
  }
  if (stats[Stat.POSTS_VIEWED] > 0 && stats[Stat.POSTS_CREATED] > 0) {
    funFacts.push(
      `📰 You read ${prettyNum(stats[Stat.POSTS_VIEWED] / stats[Stat.POSTS_CREATED], 1)} posts for every one you created`,
    );
  }
  if (scrollDistanceKm > 0 && stats[Stat.POSTS_VIEWED] > 0) {
    funFacts.push(
      `👀 You view ${prettyNum(stats[Stat.POSTS_VIEWED] / (scrollDistanceInches / 12), 2)} posts for every foot you scroll`,
    );
  }
  if (stats[Stat.POSTS_VIEWED] > 0 && stats[Stat.APP_FOREGROUNDS] > 0) {
    funFacts.push(
      `📃 You click on ${prettyNum(stats[Stat.POSTS_VIEWED] / stats[Stat.APP_FOREGROUNDS], 2)} posts each time you open Hydra`,
    );
  }
  if (positiveVotes > 0 && negativeVotes > 0) {
    funFacts.push(
      `👍 You upvote ${prettyNum(positiveVotes / negativeVotes, 2)}x more than you downvote`,
    );
  }
  if (postVotes > 0 && commentVotes > 0) {
    funFacts.push(
      `💬 You vote on ${prettyNum(commentVotes / postVotes, 2)}x comments for every post you vote on`,
    );
  }

  [
    {
      stat: Stat.POSTS_VIEWED,
      text: (num: number) => `viewed ${num} posts`,
    },
    {
      stat: Stat.POSTS_CREATED,
      text: (num: number) => `created ${num} posts`,
    },
    {
      stat: Stat.APP_FOREGROUNDS,
      text: (num: number) => `opened Hydra ${num} times`,
    },
    {
      stat: Stat.APP_LAUNCHES,
      text: (num: number) => `launched Hydra ${num} times`,
    },
    {
      stat: Stat.COMMENTS_CREATED,
      text: (num: number) => `created ${num} comments`,
    },
    {
      stat: Stat.POST_UPVOTES,
      text: (num: number) => `upvoted ${num} posts`,
    },
    {
      stat: Stat.POST_DOWNVOTES,
      text: (num: number) => `downvoted ${num} posts`,
    },
    {
      stat: Stat.COMMENT_UPVOTES,
      text: (num: number) => `upvoted ${num} comments`,
    },
    {
      stat: Stat.COMMENT_DOWNVOTES,
      text: (num: number) => `downvoted ${num} comments`,
    },
  ].forEach(({ stat, text }) => {
    [
      {
        funnyNumber: 34,
        emoji: "🍆",
        description: "There should be a rule about this.",
      },
      {
        funnyNumber: 69,
        emoji: "😏",
        description: "Nice.",
      },
      {
        funnyNumber: 420,
        emoji: "🌿",
        description: "Blaze it.",
      },
      {
        funnyNumber: 80085,
        emoji: "🍒",
        description: "You're a pro!",
      },
      {
        funnyNumber: 1337,
        emoji: "🤖",
        description: "You're elite.",
      },
      {
        funnyNumber: 31337,
        emoji: "🤖",
        description: "You're elite.",
      },
      {
        funnyNumber: 1000,
        emoji: "🎉",
        description: "You're a pro!",
      },
      {
        funnyNumber: 10000,
        emoji: "🎉",
        description: "You're a pro!",
      },
      {
        funnyNumber: 100000,
        emoji: "🎉",
        description: "You're a pro!",
      },
    ].forEach(({ funnyNumber, emoji, description }) => {
      if (stats[stat] === funnyNumber) {
        funFacts.push(`${emoji} You've ${text(stats[stat])} - ${description}`);
      }
    });
  });

  const getDaysSinceInstall = async () => {
    const installDate = await Application.getInstallationTimeAsync();
    setInstallTime(installDate.getTime());
  };

  useEffect(() => {
    getDaysSinceInstall();
  }, []);

  useEffect(() => {
    if (!isPro) {
      Alert.alert(
        "Hydra Pro Feature",
        "Stats are only available to Hydra Pro subscribers, but you can check out this page anyway to see what stats you can unlock.",
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
        ],
      );
    }
  }, [isPro]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <Text style={[styles.heroTitle, { color: theme.text }]}>
          Your Hydra Journey
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.subtleText }]}>
          {`You've been using Hydra for ${new Time(installTime ?? 0).prettyTimeSince()}!`}
        </Text>
      </View>

      <SectionTitle text="Your Reddit Activity" />
      <View style={styles.statsGrid}>
        {statCardData.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </View>

      <SectionTitle text="Your Usage Patterns" />
      <View style={[styles.usageCard, { backgroundColor: theme.tint }]}>
        {usageStats
          .filter((stat) => stat.show)
          .map((stat) => (
            <View key={stat.title} style={styles.usageRow}>
              <View style={styles.usageIconContainer}>{stat.icon}</View>
              <Text style={[styles.usageText, { color: theme.text }]}>
                {stat.title}
              </Text>
              <Text style={[styles.usageValue, { color: theme.text }]}>
                {stat.value}
              </Text>
            </View>
          ))}
      </View>

      {topSubreddits.length > 0 && (
        <>
          <SectionTitle text="Your Favorite Communities" />
          <View
            style={[styles.subredditSection, { backgroundColor: theme.tint }]}
          >
            {topSubreddits.map(([subreddit, visits], index) => (
              <View key={subreddit} style={styles.subredditRow}>
                <View style={styles.subredditInfo}>
                  <Text
                    style={[styles.subredditRank, { color: theme.subtleText }]}
                  >
                    #{index + 1}
                  </Text>
                  <Text style={[styles.subredditName, { color: theme.text }]}>
                    r/{obfuscateText(subreddit)}
                  </Text>
                </View>
                <View style={styles.subredditStats}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: theme.divider },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: theme.iconPrimary,
                          width: `${(visits / maxVisits) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.subredditVisits,
                      { color: theme.subtleText },
                    ]}
                  >
                    {prettyNum(visits, 0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {achievements.length > 0 && (
        <>
          <SectionTitle text="Achievements Unlocked" />
          <View style={styles.achievementsSection}>
            {achievements.map((achievement, index) => (
              <AchievementBadge key={index} achievement={achievement} />
            ))}
          </View>
        </>
      )}

      <SectionTitle text="Fun Facts" />
      <View style={[styles.funFactsSection, { backgroundColor: theme.tint }]}>
        {funFacts.map((fact) => (
          <Text
            key={fact}
            style={[styles.funFact, { color: theme.subtleText }]}
          >
            {fact}
          </Text>
        ))}
      </View>

      <SectionTitle text="Serious Facts" />
      <View style={[styles.funFactsSection, { backgroundColor: theme.tint }]}>
        {[
          "🔒 All these stats are stored locally on your device. They are not sent to any servers.",
          "❤️ I am incredibly grateful to those of you who have chosen to subscribe to Hydra Pro. I build Hydra in my spare time as a passion project, but as it grows in popularity, it becomes more and more expensive to keep running. Your ongoing support is what keeps Hydra alive.",
        ].map((fact) => (
          <Text
            key={fact}
            style={[styles.funFact, { color: theme.subtleText }]}
          >
            {fact}
          </Text>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function StatCard({ title, value, subtitle, icon }: StatCardData) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.tint, borderColor: theme.divider },
      ]}
    >
      <View
        style={[
          styles.statIconContainer,
          { backgroundColor: theme.iconPrimary.toString() + "20" },
        ]}
      >
        {icon}
      </View>
      <View style={styles.statTextContainer}>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: theme.subtleText }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.achievementBadge,
        {
          backgroundColor: theme.tint,
          borderColor: String(theme.iconPrimary) + "40",
        },
      ]}
    >
      <View
        style={[
          styles.achievementIcon,
          { backgroundColor: String(theme.iconPrimary) + "20" },
        ]}
      >
        {achievement.icon}
      </View>
      <View style={styles.achievementText}>
        <Text style={[styles.achievementTitle, { color: theme.text }]}>
          {achievement.title}
        </Text>
        <Text style={[styles.achievementDesc, { color: theme.subtleText }]}>
          {achievement.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  statsGrid: {
    paddingHorizontal: 15,
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 13,
    lineHeight: 16,
  },
  usageCard: {
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  usageIconContainer: {
    width: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  usageText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  subredditSection: {
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  subredditRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  subredditInfo: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  subredditRank: {
    fontSize: 14,
    fontWeight: "600",
    width: 30,
  },
  subredditName: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 0,
  },
  subredditStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  progressBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    marginRight: 8,
    maxWidth: 60,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  subredditVisits: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
  achievementsSection: {
    paddingHorizontal: 15,
    gap: 8,
  },
  achievementBadge: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 4,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 13,
    lineHeight: 16,
  },
  funFactsSection: {
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 8,
  },
  funFact: {
    fontSize: 15,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
