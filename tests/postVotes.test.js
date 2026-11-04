import { afterEach, expect, spyOn, test } from "bun:test";
import { applyPostVote, createPostVotes } from "../utils/postVotes";

const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const post = (name = "t3_post", userVote = 0) => ({
  name,
  userVote,
  upvotes: 10 + userVote,
  saved: false,
});
function setup() {
  let generation = 0;
  const requests = [],
    errors = [];
  const session = { accountId: "t2_a", generation };
  const votes = createPostVotes(
    (item, vote, credentials) => {
      if (credentials.generation !== generation)
        return Promise.reject(new Error("Changed session"));
      const request = { name: item.name, vote, ...deferred() };
      requests.push(request);
      return request.promise;
    },
    (credentials) => credentials.generation === generation,
    (error) => errors.push(error),
  );
  const owner = (initial = post(), credentials = session) => {
    let item = initial;
    const detach = votes.subscribe(credentials, (change) => {
      item = applyPostVote(item, change);
    });
    return {
      get item() {
        return item;
      },
      set(value) {
        item = value;
      },
      detach,
      press(direction) {
        votes.press(credentials, item, direction);
      },
    };
  };
  return {
    votes,
    session,
    owner,
    requests,
    errors,
    switchAccount() {
      generation++;
      return { accountId: "t2_b", generation };
    },
  };
}
afterEach(() => {
  Date.now.mockRestore?.();
});

test("feed and detail share immediate votes and serialize alternating requests", async () => {
  const state = setup(),
    feed = state.owner(),
    detail = state.owner();
  feed.press(1);
  expect(detail.item.userVote).toBe(1);
  detail.press(-1);
  expect(feed.item.userVote).toBe(-1);
  expect(state.requests.map((r) => r.vote)).toEqual([1]);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1]);
  state.requests[1].resolve();
  await flush();
  expect(feed.item).toEqual(detail.item);
  feed.press(1);
  expect(detail.item.userVote).toBe(1);
  state.requests[2].resolve();
  await flush();
});

test("a newly mounted detail adopts a pending vote and coalesces its next choice", async () => {
  const state = setup(),
    feed = state.owner();
  feed.press(1);
  const detail = state.owner();
  expect(detail.item.userVote).toBe(1);
  detail.press(-1);
  feed.press(1);
  state.requests[0].resolve();
  await flush();
  expect(state.requests).toHaveLength(1);
  expect(feed.item.userVote).toBe(1);
  expect(detail.item.userVote).toBe(1);
});

test("removing a selected vote works from either screen", async () => {
  const state = setup(),
    feed = state.owner(post("t3_post", 1)),
    detail = state.owner(post("t3_post", 1));
  detail.press(1);
  expect(feed.item.userVote).toBe(0);
  expect(state.requests[0].vote).toBe(0);
  state.requests[0].resolve();
  await flush();
});

test("screen detachment and remount preserve the latest accepted intent", async () => {
  const state = setup(),
    feed = state.owner(),
    detail = state.owner();
  feed.press(1);
  detail.press(-1);
  detail.detach();
  const remounted = state.owner();
  expect(remounted.item.userVote).toBe(-1);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1]);
  state.requests[1].resolve();
  await flush();
  expect(feed.item.userVote).toBe(-1);
  expect(remounted.item.userVote).toBe(-1);
});

test("accepted intent finishes even if all views detach", async () => {
  const state = setup(),
    feed = state.owner();
  feed.press(1);
  feed.press(-1);
  feed.detach();
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1]);
  state.requests[1].resolve();
  await flush();
});

test("failure rolls both owners back once, preserves saves, and permits retry", async () => {
  const clock = spyOn(Date, "now").mockReturnValue(0);
  const state = setup(),
    feed = state.owner(),
    detail = state.owner();
  feed.press(1);
  state.requests[0].resolve();
  await flush();
  detail.press(-1);
  feed.set({ ...feed.item, saved: true });
  clock.mockReturnValue(1000);
  state.requests[1].reject(new Error("Offline"));
  await flush();
  expect(feed.item.userVote).toBe(1);
  expect(detail.item.userVote).toBe(1);
  expect(feed.item.upvotes).toBe(11);
  expect(feed.item.saved).toBe(true);
  expect(state.errors).toHaveLength(1);
  detail.press(-1);
  state.requests[2].resolve();
  await flush();
  expect(feed.item.userVote).toBe(-1);
});

test("an old session neither publishes nor sends a queued follow-up", async () => {
  const clock = spyOn(Date, "now").mockReturnValue(0);
  const state = setup(),
    old = state.owner();
  old.press(1);
  old.press(-1);
  const nextSession = state.switchAccount(),
    next = state.owner(post(), nextSession);
  clock.mockReturnValue(1000);
  state.requests[0].resolve();
  await flush();
  expect(state.requests).toHaveLength(1);
  expect(next.item.userVote).toBe(0);
  expect(state.errors).toHaveLength(0);
  old.press(1);
  expect(state.requests).toHaveLength(1);
  next.press(1);
  expect(state.requests).toHaveLength(2);
  state.requests[1].resolve();
  await flush();
});

test("refresh adopts pending intent so the next selected tap removes it", async () => {
  const state = setup(),
    feed = state.owner();
  feed.press(1);
  const load = state.votes.beginLoad(state.session);
  feed.set(load.apply(post()));
  load.finish();
  expect(feed.item.userVote).toBe(1);
  feed.press(1);
  expect(feed.item.userVote).toBe(0);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, 0]);
  state.requests[1].resolve();
  await flush();
});

test("a response started before settlement keeps the final vote without masking later refreshes", async () => {
  const state = setup(),
    feed = state.owner();
  const load = state.votes.beginLoad(state.session);
  feed.press(1);
  state.requests[0].resolve();
  await flush();
  const result = load.apply({ ...post(), saved: true, title: "fresh title" });
  load.finish();
  feed.set(result);
  expect(feed.item).toMatchObject({
    userVote: 1,
    upvotes: 11,
    saved: true,
    title: "fresh title",
  });
  const later = state.votes.beginLoad(state.session);
  expect(later.apply(post()).userVote).toBe(0);
  later.finish();
  const cleanOwner = state.owner(post());
  expect(cleanOwner.item.userVote).toBe(0);
});

test("loads begun during an operation retain rollback after it settles", async () => {
  const clock = spyOn(Date, "now").mockReturnValue(0);
  const state = setup(),
    feed = state.owner();
  feed.press(1);
  const load = state.votes.beginLoad(state.session);
  clock.mockReturnValue(1000);
  state.requests[0].reject(new Error("Offline"));
  await flush();
  expect(load.apply(post("t3_post", 1)).userVote).toBe(0);
  load.finish();
});

test("finishing a load preserves its snapshot without collecting later votes", async () => {
  const state = setup(),
    feed = state.owner();
  feed.press(1);
  const load = state.votes.beginLoad(state.session);
  load.finish();
  feed.press(-1);
  state.requests[0].resolve();
  await flush();
  state.requests[1].resolve();
  await flush();
  expect(feed.item.userVote).toBe(-1);
  expect(load.apply(post()).userVote).toBe(1);
});

test("other posts and non-post records retain their fields", async () => {
  const state = setup(),
    one = state.owner(),
    other = state.owner(post("t3_other"));
  const otherBefore = other.item;
  one.press(1);
  expect(other.item).toBe(otherBefore);
  expect(other.item).toEqual(post("t3_other"));
  const user = { name: "someone", upvotes: 2 };
  expect(applyPostVote(user, { name: "t3_post", vote: 1 })).toBe(user);
  state.requests[0].resolve();
  await flush();
});

test("provider cleanup cancels old work without breaking effect replay or replacement queues", async () => {
  const state = setup(),
    old = state.owner();
  old.press(1);
  old.press(-1);
  state.votes.clear();
  const next = state.owner();
  next.press(-1);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1]);
  expect(next.item.userVote).toBe(-1);
  const returned = state.owner();
  expect(returned.item.userVote).toBe(-1);
  state.requests[1].resolve();
  await flush();
});

test("confirmed unchanged votes preserve the existing post object", async () => {
  const state = setup(),
    feed = state.owner();
  feed.press(1);
  const optimistic = feed.item;
  expect(applyPostVote(optimistic, { name: optimistic.name, vote: 1 })).toBe(
    optimistic,
  );
  state.requests[0].resolve();
  await flush();
  expect(feed.item).toBe(optimistic);
});
