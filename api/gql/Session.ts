import { resetInboxState } from "./Inbox";
import { resetUserState } from "./User";

/**
 * Clears in-memory state that belongs to the logged in account. Call it when
 * the account changes. (Subreddit info is already cached per account.)
 */
export function resetGqlSessionState() {
  resetInboxState();
  resetUserState();
}
