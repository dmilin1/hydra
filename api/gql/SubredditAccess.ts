import { Alert } from "react-native";

import { assertOk, defineOperation, gql } from "./GqlApi";
import { getCurrentUserId } from "./WebToken";
import {
  BannedSubredditError,
  PrivateSubredditError,
  SubredditDoesNotExistError,
} from "../Posts";

/**
 * Reddit's GraphQL feeds return banned, private and quarantined subreddits as
 * empty feeds, and gated subreddits as normal feeds with no warning.
 * SubredditInfoByName says which, like it does for Reddit's app when it opens
 * a subreddit.
 */

const SubredditInfoByName = defineOperation(
  "SubredditInfoByName",
  "8c1815b07b762aee3c086cc84306f14b3907018e9ee152046c8e4d08ad4c7b88",
);

// The variables Reddit's app sends with SubredditInfoByName.
const SUBREDDIT_INFO_VARIABLES = {
  loggedOutIsOptedIn: false,
  filterGated: true,
  includeRecapFields: false,
  includeWelcomePage: true,
  includeDevvitData: true,
  includeFeatureVariants: false,
  includeManualFeatureVariants: false,
  includeCommunityGuidanceChecklist: false,
};

const UpdateOptInToQuarantinedSubreddit = defineOperation(
  "UpdateOptInToQuarantinedSubreddit",
  "48f2a98b4df9e6ebb67451c25b35be3f6bd597391a1e13984e0c68680dbdf84a",
);

const UpdateOptInToGatedSubreddit = defineOperation(
  "UpdateOptInToGatedSubreddit",
  "2f5d960d89de68ea1ce9fcac9cbacfd1161c78e990c8bf79668cf03555bd5678",
);

function promptOptIn(
  warning: string | undefined,
  optIn: () => Promise<{ ok: boolean; errors?: { message: string }[] }>,
): Promise<SubredditAccess> {
  return new Promise((resolve, reject) => {
    Alert.alert("Warning", warning ?? "", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => resolve("declined"),
      },
      {
        text: "Proceed",
        onPress: async () => {
          try {
            assertOk(await optIn(), "Failed to opt in to subreddit");
            resolve("optedIn");
          } catch (e) {
            reject(e);
          }
        },
      },
    ]);
  });
}

export type SubredditAccess = "available" | "optedIn" | "declined";

/**
 * Subreddit statuses (SubredditInfoByName's subredditInfoByName, or null when
 * the subreddit doesn't exist), kept in memory for the session so opening a
 * subreddit's posts doesn't check it again. Keyed by user, since opt-ins and
 * private subreddit access belong to the account. Holds the in-flight request
 * so simultaneous checks share it; failed requests aren't kept.
 */
const statusCache = new Map<string, Promise<any>>();

// Opt-in prompts being shown, so simultaneous checks share one prompt.
const pendingPrompts = new Map<string, Promise<SubredditAccess>>();

function getStatus(key: string, subreddit: string): Promise<any> {
  let status = statusCache.get(key);
  if (!status) {
    status = gql(SubredditInfoByName, {
      ...SUBREDDIT_INFO_VARIABLES,
      subredditName: subreddit,
    }).then((data) => data.subredditInfoByName ?? null);
    statusCache.set(key, status);
    status.catch(() => {
      if (statusCache.get(key) === status) statusCache.delete(key);
    });
  }
  return status;
}

function sharedPrompt(
  key: string,
  prompt: () => Promise<SubredditAccess>,
): Promise<SubredditAccess> {
  let pending = pendingPrompts.get(key);
  if (!pending) {
    pending = prompt()
      .then((access) => {
        // Reddit now serves the subreddit to this user, so fetch its real
        // info (id, settings) next time instead of the unavailable stub.
        if (access === "optedIn") statusCache.delete(key);
        return access;
      })
      .finally(() => pendingPrompts.delete(key));
    pendingPrompts.set(key, pending);
  }
  return pending;
}

const statusKey = async (subreddit: string) =>
  `${await getCurrentUserId()}:${subreddit.toLowerCase()}`;

/**
 * The subreddit's SubredditInfoByName data (id, settings...), or null when it
 * doesn't exist. Cached like checkSubredditAccess().
 */
export async function getSubredditInfo(subreddit: string): Promise<any> {
  return await getStatus(await statusKey(subreddit), subreddit);
}

/**
 * getSubredditInfo() for writes that need a usable subreddit. Throws for
 * banned, private, or quarantined/gated subreddits the user hasn't opted into
 * (UnavailableSubreddit).
 */
export async function getAvailableSubreddit(subreddit: string): Promise<any> {
  const info = await getSubredditInfo(subreddit);
  if (info?.__typename !== "Subreddit") {
    throw new Error(
      info ? `r/${subreddit} isn't available` : `r/${subreddit} does not exist`,
    );
  }
  return info;
}

/**
 * Checks whether a subreddit's posts can be shown. Throws BannedSubredditError
 * or PrivateSubredditError when the subreddit is unavailable, and asks the
 * user to opt in to quarantined and gated subreddits (every time until they
 * do, like Reddit's old API).
 *
 * "optedIn" means the user just opted in, so the feed should be loaded again.
 */
export async function checkSubredditAccess(
  subreddit: string,
): Promise<SubredditAccess> {
  const key = await statusKey(subreddit);
  const info = await getStatus(key, subreddit);
  if (!info) {
    throw new SubredditDoesNotExistError();
  }
  switch (info.forbiddenReason) {
    case "BANNED":
      throw new BannedSubredditError();
    case "PRIVATE":
    case "GOLD_ONLY":
      throw new PrivateSubredditError();
    case "QUARANTINED":
      return await sharedPrompt(key, () =>
        promptOptIn(info.quarantineMessage?.markdown, async () => {
          const result = await gql(UpdateOptInToQuarantinedSubreddit, {
            input: { subredditId: info.id, optInState: "OPTED_IN" },
          });
          return result.updateSubredditQuarantineOptInState;
        }),
      );
    case "GATED":
      return await sharedPrompt(key, () =>
        promptOptIn(info.interstitialWarningMessage?.markdown, async () => {
          const result = await gql(UpdateOptInToGatedSubreddit, {
            input: { subredditName: subreddit },
          });
          return result.optInToGatedSubreddit;
        }),
      );
    default:
      return "available";
  }
}
