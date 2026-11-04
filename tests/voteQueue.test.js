import { afterEach, expect, spyOn, test } from "bun:test";
import { createVoteQueue } from "../utils/voteQueue";

const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
afterEach(() => {
  Date.now.mockRestore?.();
  globalThis.setTimeout.mockRestore?.();
});

function setup(initial = 0, settled = () => {}) {
  const requests = [],
    displayed = [],
    errors = [],
    completed = [];
  const queue = createVoteQueue(
    initial,
    (vote) => {
      const request = { vote, ...deferred() };
      requests.push(request);
      return request.promise;
    },
    (vote) => displayed.push(vote),
    () => errors.push("failed"),
    () => {
      completed.push(true);
      settled();
    },
  );
  return { queue, requests, displayed, errors, completed };
}

test("first tap is immediate; up-down-up coalesces without concurrent requests", async () => {
  const state = setup();
  state.queue.press(1);
  expect(state.displayed).toEqual([1]);
  state.queue.press(-1);
  state.queue.press(1);
  expect(state.requests.map((r) => r.vote)).toEqual([1]);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1]);
  expect(state.displayed.at(-1)).toBe(1);
  expect(state.completed).toHaveLength(1);
});

test("opposite vote waits for the active request and uses only the latest intent", async () => {
  const state = setup();
  state.queue.press(1);
  state.queue.press(1);
  state.queue.press(-1);
  expect(state.requests.map((r) => r.vote)).toEqual([1]);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1]);
  expect(state.completed).toHaveLength(0);
  state.requests[1].resolve();
  await flush();
  expect(state.displayed.at(-1)).toBe(-1);
  expect(state.completed).toHaveLength(1);
});

test("tapping a selected vote removes it, including while pending", async () => {
  const state = setup();
  state.queue.press(1);
  state.queue.press(1);
  expect(state.displayed).toEqual([1, 0]);
  state.requests[0].resolve();
  await flush();
  expect(state.requests.map((r) => r.vote)).toEqual([1, 0]);
  state.requests[1].resolve();
  await flush();
  expect(state.displayed.at(-1)).toBe(0);
});

test("failure briefly preserves feedback, restores the latest confirmation, and drops queued intent", async () => {
  const clock = spyOn(Date, "now").mockReturnValue(1000);
  const timers = [];
  spyOn(globalThis, "setTimeout").mockImplementation((callback, delay) => {
    timers.push({ callback, delay });
    return 1;
  });
  const state = setup();
  state.queue.press(1);
  state.requests[0].resolve();
  await flush();
  state.queue.press(-1);
  state.queue.press(-1);
  clock.mockReturnValue(1010);
  state.requests[1].reject(new Error("offline"));
  await flush();
  expect(state.displayed.at(-1)).toBe(0);
  expect(state.errors).toHaveLength(0);
  expect(timers.map((t) => t.delay)).toEqual([240]);
  timers[0].callback();
  await flush();
  expect(state.displayed.at(-1)).toBe(1);
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1]);
  expect(state.errors).toHaveLength(1);
  state.queue.press(-1);
  expect(state.requests.map((r) => r.vote)).toEqual([1, -1, -1]);
  state.requests[2].resolve();
  await flush();
  expect(state.displayed.at(-1)).toBe(-1);
});

test("slow failure has no additional display delay and does not retry", async () => {
  const clock = spyOn(Date, "now").mockReturnValue(0);
  const timer = spyOn(globalThis, "setTimeout");
  const state = setup();
  state.queue.press(1);
  state.queue.press(-1);
  clock.mockReturnValue(1000);
  state.requests[0].reject(new Error("offline"));
  await flush();
  expect(timer).not.toHaveBeenCalled();
  expect(state.displayed.at(-1)).toBe(0);
  expect(state.errors).toHaveLength(1);
  expect(state.requests).toHaveLength(1);
});

test("retirement reconciles the active success and drops unsent votes", async () => {
  const state = setup();
  state.queue.press(1);
  state.queue.press(-1);
  state.queue.retire();
  expect(state.displayed.at(-1)).toBe(0);
  state.requests[0].resolve();
  await flush();
  expect(state.displayed.at(-1)).toBe(1);
  expect(state.requests).toHaveLength(1);
  expect(state.errors).toHaveLength(0);
  state.queue.press(-1);
  expect(state.requests).toHaveLength(1);
});

test("retired failures restore confirmation without delay or stale feedback", async () => {
  const state = setup(1);
  state.queue.press(-1);
  state.queue.retire();
  state.requests[0].reject(new Error("offline"));
  await flush();
  expect(state.displayed.at(-1)).toBe(1);
  expect(state.errors).toHaveLength(0);
  expect(state.completed).toHaveLength(1);
});
