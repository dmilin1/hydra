import { assertOk, defineOperation, gql } from "./GqlApi";
import { getCurrentUserId } from "./WebToken";
import KeyStore from "../../utils/KeyStore";

/**
 * Reddit account preferences Hydra needs, by UpdateAccountPreferences input
 * name. Applied to every account that doesn't already match. Bump the
 * version in applyDefaultAccountSettings' key when changing these.
 */
const DEFAULT_ACCOUNT_SETTINGS = {
  // Reddit leaves NSFW posts, subreddits and search results out entirely for
  // accounts with NSFW turned off (an NSFW subreddit's feed is just empty).
  // Hydra has its own NSFW setting for blurring or hiding them.
  isNsfwEnabled: true,
  isNsfwSearchEnabled: true,
  isNsfwMediaBlocked: false,
  // Accounts outside Reddit's For You / Following split with this off get a
  // home feed of subscriptions only, so For You looks the same as Classic.
  isFeedRecommendationsEnabled: true,
};

// GetAccountPreferences names that differ from the input names above.
const READ_NAMES: Partial<
  Record<keyof typeof DEFAULT_ACCOUNT_SETTINGS, string>
> = {
  isNsfwEnabled: "isNsfwContentShown",
};

const GetAccountPreferences = defineOperation(
  "GetAccountPreferences",
  "dab05e88583988e98f4abbc9c93076fb7ae1babd0f641d6f9c03702ac6258425",
);

const UpdateAccountPreferences = defineOperation(
  "UpdateAccountPreferences",
  "069f69c3d25b6d4e8db147d8dce550c7bbd300141ba8736fad1b2334ffd0d367",
);

/**
 * Bump the version whenever DEFAULT_ACCOUNT_SETTINGS changes,
 * so accounts don't wait out the 30 days.
 */
const LAST_APPLIED_ACCOUNT_SETTINGS_KEY = "lastFixedAccountSettings:v2";
const MIN_TIME_BETWEEN_ATTEMPTS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function applyDefaultAccountSettings() {
  // Per account, so an account added later still gets them
  const userId = await getCurrentUserId();
  const key = `${LAST_APPLIED_ACCOUNT_SETTINGS_KEY}:${userId}`;
  // Each request uses whichever account is logged in when it's sent, so stop
  // if the user switched meanwhile (this runs in the background).
  const switched = async () => (await getCurrentUserId()) !== userId;
  const lastApplied = KeyStore.getNumber(key) ?? 0;
  if (lastApplied > Date.now() - MIN_TIME_BETWEEN_ATTEMPTS) {
    return;
  }
  const data = await gql(GetAccountPreferences, {
    includePremium: false,
    includePreferencesState: false,
    includeAdsOffReddit: false,
  });
  const preferences = data.identity?.preferences;
  if (!preferences || (await switched())) return;
  const changes = Object.fromEntries(
    Object.entries(DEFAULT_ACCOUNT_SETTINGS).filter(
      ([name, value]) =>
        preferences[READ_NAMES[name as keyof typeof READ_NAMES] ?? name] !==
        value,
    ),
  );
  if (Object.keys(changes).length) {
    const updated = await gql(UpdateAccountPreferences, { input: changes });
    assertOk(
      updated.updateAccountPreferences,
      "Failed to update account settings",
    );
    if (await switched()) return;
  }
  KeyStore.set(key, Date.now());
}
