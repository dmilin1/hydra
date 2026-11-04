import type { WebSession } from "../api/gql/WebToken";
import { createVoteQueue, type Vote } from "./voteQueue";

export type VoteItem = { name: string; userVote: Vote; upvotes: number };
export type VoteChange = { name: string; vote: Vote };

export function applyPostVote<T extends object>(
  item: T,
  change: VoteChange,
): T {
  if (
    !("name" in item) ||
    item.name !== change.name ||
    !("userVote" in item) ||
    typeof item.userVote !== "number" ||
    !("upvotes" in item) ||
    typeof item.upvotes !== "number" ||
    item.userVote === change.vote
  )
    return item;
  return {
    ...item,
    userVote: change.vote,
    upvotes: item.upvotes - item.userVote + change.vote,
  };
}

const sameSession = (a: WebSession, b: WebSession) =>
  a.accountId === b.accountId && a.generation === b.generation;

/** Owns only pending post votes; loaded posts remain in their existing page state. */
export function createPostVotes(
  send: (item: VoteItem, vote: Vote, session: WebSession) => Promise<unknown>,
  isCurrent: (session: WebSession) => boolean,
  failed: (error: unknown) => void,
) {
  const operations = new Map<
    string,
    {
      session: WebSession;
      change: VoteChange;
      queue: ReturnType<typeof createVoteQueue>;
    }
  >();
  const listeners = new Set<{
    session: WebSession;
    update: (change: VoteChange) => void;
  }>();
  const publish = (session: WebSession, change: VoteChange) => {
    if (!isCurrent(session)) return;
    for (const listener of listeners)
      if (sameSession(listener.session, session)) listener.update(change);
  };
  const active = (session: WebSession) =>
    new Map(
      [...operations.values()]
        .filter((op) => sameSession(op.session, session))
        .map((op) => [op.change.name, op.change]),
    );
  const subscribe = (
    session: WebSession,
    update: (change: VoteChange) => void,
  ) => {
    const listener = { session, update };
    listeners.add(listener);
    if (isCurrent(session))
      for (const change of active(session).values()) update(change);
    return () => {
      listeners.delete(listener);
    };
  };
  return {
    press(session: WebSession, item: VoteItem, direction: Vote) {
      if (!isCurrent(session)) return;
      const key = `${session.generation}:${session.accountId}:${item.name}`;
      let operation = operations.get(key);
      if (!operation) {
        const queue = createVoteQueue(
          item.userVote,
          (vote) => send(item, vote, session),
          (vote) => {
            const change = { name: item.name, vote };
            if (operations.get(key) !== operation || !operation) return;
            operation.change = change;
            publish(session, change);
          },
          (error) => {
            if (operations.get(key) === operation && isCurrent(session))
              failed(error);
          },
          () => {
            if (operations.get(key) === operation) operations.delete(key);
          },
        );
        operation = {
          session,
          change: { name: item.name, vote: item.userVote },
          queue,
        };
        operations.set(key, operation);
      }
      operation.queue.press(direction);
    },
    subscribe,
    beginLoad(session: WebSession) {
      // A response started before a vote settled must still adopt its final state.
      // This history belongs only to this load, never to later server refreshes.
      const changes = new Map<string, VoteChange>();
      const finish = subscribe(session, (change) =>
        changes.set(change.name, change),
      );
      return {
        apply<T extends object>(item: T): T {
          if (!("name" in item) || typeof item.name !== "string") return item;
          const change = changes.get(item.name);
          return change && isCurrent(session)
            ? applyPostVote(item, change)
            : item;
        },
        finish,
      };
    },
    clear() {
      const pending = [...operations.values()];
      operations.clear();
      listeners.clear();
      for (const operation of pending) operation.queue.retire();
    },
  };
}
