import { beforeEach, expect, mock, spyOn, test } from "bun:test";
import { createVoteQueue } from "../utils/voteQueue";

let response;
const request = mock(async () => response);
const statistic = mock(() => {});
const cookies = mock();
mock.module("@sentry/react-native", () => ({ addBreadcrumb: () => {} }));
mock.module("../api/UserAgent", () => ({ USER_AGENT: "test" }));
mock.module("../utils/safeFetch", () => ({ default: request }));
mock.module("@preeternal/react-native-cookie-manager", () => ({
  default: { get: cookies },
}));
mock.module("../api/Posts", () => ({
  VoteOption: { UpVote: 1, NoVote: 0, DownVote: -1 },
}));
mock.module("../db/functions/Stats", () => ({
  modifyStat: statistic,
  Stat: {
    POST_UPVOTES: "post-up",
    POST_DOWNVOTES: "post-down",
    COMMENT_UPVOTES: "comment-up",
    COMMENT_DOWNVOTES: "comment-down",
  },
}));

const { setVote, vote } = await import("../api/gql/Vote");
const {
  captureWebSession,
  invalidateWebSession,
  isWebSessionCurrent,
  WebSessionChangedError,
} = await import("../api/gql/WebToken");

const jwt = (claims) => `test.${btoa(JSON.stringify(claims))}.test`;
const cookiesFor = (account, version = 0) => ({
  reddit_session: { value: jwt({ sub: `t2_${account}` }) },
  token_v2: {
    value: jwt({
      lid: `t2_${account}`,
      exp: Date.now() / 1000 + 86400,
      version,
    }),
  },
});
const deferred = () => {
  let resolve;
  const promise = new Promise((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
};

const item = { name: "t3_example", userVote: 1 };
beforeEach(() => {
  invalidateWebSession();
  response = {
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({ data: { updatePostVoteState: { ok: true } } }),
  };
  request.mockClear();
  statistic.mockClear();
  cookies.mockReset();
  cookies.mockResolvedValue(cookiesFor("a"));
});

test("absolute votes preserve the requested state and count successful writes", async () => {
  expect(await setVote(item, 1)).toBe(1);
  const body = JSON.parse(request.mock.calls[0][1].body);
  expect(body.operationName).toBe("UpdatePostVoteState");
  expect(body.variables.input).toEqual({
    postId: "t3_example",
    voteState: "UP",
  });
  expect(statistic).toHaveBeenCalledWith("post-up", 1);
});

test("the existing toggle wrapper removes a selected vote without counting an upvote", async () => {
  expect(await vote(item, 1)).toBe(0);
  expect(
    JSON.parse(request.mock.calls[0][1].body).variables.input.voteState,
  ).toBe("NONE");
  expect(statistic).not.toHaveBeenCalled();
});

test("comment voting retains its separate mutation and statistics", async () => {
  response.text = async () =>
    JSON.stringify({ data: { updateCommentVoteState: { ok: true } } });
  expect(await vote({ name: "t1_comment", userVote: 0 }, -1)).toBe(-1);
  const body = JSON.parse(request.mock.calls[0][1].body);
  expect(body.operationName).toBe("UpdateCommentVoteState");
  expect(body.variables.input).toEqual({
    commentId: "t1_comment",
    voteState: "DOWN",
  });
  expect(statistic).toHaveBeenCalledWith("comment-down", 1);
});

test("Reddit mutation rejection is a failure and preserves its reason", async () => {
  response.text = async () =>
    JSON.stringify({
      data: {
        updatePostVoteState: {
          ok: false,
          fieldErrors: [{ message: "Try again later" }],
        },
      },
    });
  await expect(setVote(item, -1)).rejects.toThrow("Try again later");
  expect(statistic).not.toHaveBeenCalled();
});

test("missing mutation success is not counted as a confirmed vote", async () => {
  response.text = async () => JSON.stringify({ data: {} });
  await expect(setVote(item, 1)).rejects.toThrow("Failed to vote");
  expect(statistic).not.toHaveBeenCalled();
});

test("HTTP failure remains rejected even with a mutation-looking body", async () => {
  response.ok = false;
  response.status = 500;
  await expect(setVote(item, 1)).rejects.toThrow("HTTP 500");
  expect(statistic).not.toHaveBeenCalled();
});

test("invalid JSON cannot confirm a vote", async () => {
  response.text = async () => "not JSON";
  await expect(setVote(item, 1)).rejects.toThrow("Response was not JSON");
  expect(statistic).not.toHaveBeenCalled();
});

test("network failure does not count a successful vote", async () => {
  request.mockRejectedValueOnce(new Error("offline"));
  await expect(setVote(item, 1)).rejects.toThrow("offline");
  expect(statistic).not.toHaveBeenCalled();
});

test("missing authentication prevents the network mutation", async () => {
  cookies.mockResolvedValue({});
  await expect(setVote(item, 1)).rejects.toThrow("requires a logged in user");
  expect(request).not.toHaveBeenCalled();
  expect(statistic).not.toHaveBeenCalled();
});

test("bound votes send normally with their initiating account", async () => {
  expect(await setVote(item, 1, captureWebSession("a"))).toBe(1);
  expect(request).toHaveBeenCalledTimes(1);
  expect(statistic).toHaveBeenCalledTimes(1);
});

test("account switching during token acquisition prevents the mutation", async () => {
  const lookup = deferred();
  cookies.mockReturnValueOnce(lookup.promise);
  const session = captureWebSession("a");
  const operation = setVote(item, 1, session);
  invalidateWebSession();
  lookup.resolve(cookiesFor("b"));
  await expect(operation).rejects.toBeInstanceOf(WebSessionChangedError);
  expect(request).not.toHaveBeenCalled();
  expect(statistic).not.toHaveBeenCalled();
});

test("a stale rendered account cannot send with another account's token", async () => {
  // Cookies have changed, but React has not published the new currentUser yet.
  cookies.mockResolvedValue(cookiesFor("b"));
  await expect(setVote(item, 1, captureWebSession("a"))).rejects.toBeInstanceOf(
    WebSessionChangedError,
  );
  expect(request).not.toHaveBeenCalled();
});

test("A-B-A account transitions do not revive an old operation", async () => {
  const session = captureWebSession("a");
  invalidateWebSession();
  invalidateWebSession();
  expect(isWebSessionCurrent(session)).toBe(false);
  await expect(setVote(item, 1, session)).rejects.toBeInstanceOf(
    WebSessionChangedError,
  );
  expect(cookies).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
  expect(await setVote(item, 1, captureWebSession("a"))).toBe(1);
});

test("same-account token renewal retains the existing single retry", async () => {
  cookies.mockResolvedValueOnce(cookiesFor("a"));
  cookies.mockResolvedValue(cookiesFor("a", 1));
  request.mockResolvedValueOnce({ status: 401 });
  expect(await setVote(item, 1, captureWebSession("t2_a"))).toBe(1);
  expect(request).toHaveBeenCalledTimes(2);
  expect(statistic).toHaveBeenCalledTimes(1);
});

test("account switching during retry token lookup prevents the retry", async () => {
  const lookup = deferred();
  const retryStarted = deferred();
  cookies.mockResolvedValueOnce(cookiesFor("a"));
  cookies.mockImplementationOnce(() => {
    retryStarted.resolve();
    return lookup.promise;
  });
  request.mockResolvedValueOnce({ status: 403 });
  const operation = setVote(item, -1, captureWebSession("a"));
  await retryStarted.promise;
  invalidateWebSession();
  lookup.resolve(cookiesFor("b"));
  await expect(operation).rejects.toBeInstanceOf(WebSessionChangedError);
  expect(request).toHaveBeenCalledTimes(1);
  expect(statistic).not.toHaveBeenCalled();
});

test("a retry cannot use a different account even before React updates", async () => {
  cookies.mockResolvedValueOnce(cookiesFor("a"));
  cookies.mockResolvedValue(cookiesFor("b"));
  request.mockResolvedValueOnce({ status: 403 });
  await expect(setVote(item, 1, captureWebSession("a"))).rejects.toBeInstanceOf(
    WebSessionChangedError,
  );
  expect(request).toHaveBeenCalledTimes(1);
});

test("a queued follow-up cannot send after its account is invalidated", async () => {
  const clock = spyOn(Date, "now").mockReturnValue(0);
  try {
    const first = deferred();
    const started = deferred();
    const settled = deferred();
    const errors = [];
    const session = captureWebSession("a");
    request.mockImplementationOnce(() => {
      started.resolve();
      return first.promise;
    });
    const queue = createVoteQueue(
      0,
      (next) => setVote(item, next, session),
      () => {},
      (error) => errors.push(error),
      settled.resolve,
    );
    queue.press(1);
    queue.press(-1);
    await started.promise;
    invalidateWebSession();
    cookies.mockResolvedValue(cookiesFor("b"));
    clock.mockReturnValue(1000);
    first.resolve(response);
    await settled.promise;
    expect(request).toHaveBeenCalledTimes(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(WebSessionChangedError);
  } finally {
    clock.mockRestore();
  }
});
