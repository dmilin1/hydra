import { assertOk, defineOperation, gql } from "./GqlApi";
import { getCurrentUserId } from "./WebToken";
import KeyStore from "../../utils/KeyStore";

/**
 * Reddit leaves NSFW posts, subreddits and search results out entirely for
 * accounts with NSFW turned off (an NSFW subreddit's feed is just empty).
 * Hydra has its own NSFW setting for blurring or hiding them, so it turns
 * Reddit's on.
 */

const GetAccountPreferences = defineOperation(
  "GetAccountPreferences",
  "dab05e88583988e98f4abbc9c93076fb7ae1babd0f641d6f9c03702ac6258425",
);

const UpdateAccountPreferences = defineOperation(
  "UpdateAccountPreferences",
  "069f69c3d25b6d4e8db147d8dce550c7bbd300141ba8736fad1b2334ffd0d367",
);

const LAST_FIXED_ACCOUNT_SETTINGS_KEY = "lastFixedAccountSettings";
const MIN_TIME_BETWEEN_FIX_ATTEMPTS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function fixIncompatibleAccountSettings() {
  // Per account, so an account added later still gets fixed.
  const userId = await getCurrentUserId();
  const key = `${LAST_FIXED_ACCOUNT_SETTINGS_KEY}:${userId}`;
  // Each request uses whichever account is logged in when it's sent, so stop
  // if the user switched meanwhile (this runs in the background).
  const switched = async () => (await getCurrentUserId()) !== userId;
  const lastFixedAccountSettings = KeyStore.getNumber(key) ?? 0;
  if (lastFixedAccountSettings > Date.now() - MIN_TIME_BETWEEN_FIX_ATTEMPTS) {
    return;
  }
  const data = await gql(GetAccountPreferences, {
    includePremium: false,
    includePreferencesState: false,
    includeAdsOffReddit: false,
  });
  const preferences = data.identity?.preferences;
  if (!preferences || (await switched())) return;
  if (
    preferences.isNsfwContentShown &&
    preferences.isNsfwSearchEnabled &&
    !preferences.isNsfwMediaBlocked
  ) {
    KeyStore.set(key, Date.now());
    return;
  }
  const updated = await gql(UpdateAccountPreferences, {
    input: {
      isNsfwEnabled: true,
      isNsfwSearchEnabled: true,
      isNsfwMediaBlocked: false,
    },
  });
  assertOk(
    updated.updateAccountPreferences,
    "Failed to update account settings",
  );
  if (await switched()) return;
  KeyStore.set(key, Date.now());
}
