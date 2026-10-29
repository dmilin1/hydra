import { describe, expect, test } from "bun:test";
import {
  adjustedScore,
  createOptimisticVoteController,
  displayOptimisticVote,
  nextVote,
  type VoteValue,
} from "../utils/optimisticVote";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const waitForRollback = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  await flush();
};

describe("optimistic voting", () => {
  test("toggling a selected vote removes it", () => {
    expect(nextVote(1, 1)).toBe(0);
    expect(nextVote(-1, -1)).toBe(0);
    expect(nextVote(1, -1)).toBe(-1);
  });

  test("score adjusts relative to the original vote", () => {
    expect(adjustedScore(42, 0, 1)).toBe(43);
    expect(adjustedScore(42, 1, -1)).toBe(40);
    expect(adjustedScore(42, -1, 0)).toBe(43);
  });

  test("shows an optimistic upvote against unchanged incoming data", () => {
    expect(displayOptimisticVote(42, 0, 1)).toEqual({
      score: 43,
      vote: 1,
    });
  });

  test("does not double-adjust when incoming data already reflects the vote", () => {
    expect(displayOptimisticVote(43, 1, 1)).toEqual({
      score: 43,
      vote: 1,
    });
  });

  test("preserves a locally confirmed vote against stale incoming data", () => {
    expect(displayOptimisticVote(42, 0, 1)).toEqual({
      score: 43,
      vote: 1,
    });
  });

  test("uses incoming data when no local override exists", () => {
    expect(displayOptimisticVote(50, -1, null)).toEqual({
      score: 50,
      vote: -1,
    });
  });

  test("switches directly between opposite votes", () => {
    expect(displayOptimisticVote(43, 1, -1)).toEqual({
      score: 41,
      vote: -1,
    });
  });

  test("does not treat a confirmation callback error as a vote failure", async () => {
    const errors: unknown[] = [];
    const displayed: VoteValue[] = [];
    const callbackError = new Error("Confirmation callback failed");
    let requests = 0;

    const originalConsoleError = console.error;
    const loggedErrors: unknown[][] = [];

    console.error = (...args: unknown[]) => {
      loggedErrors.push(args);
    };

    try {
      const controller = createOptimisticVoteController(
        0,
        async () => {
          requests++;
        },
        (vote) => displayed.push(vote),
        (error) => errors.push(error),
        () => {
          throw callbackError;
        },
      );

      controller.press(1);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(requests).toBe(1);
      expect(controller.getConfirmedVote()).toBe(1);
      expect(controller.getDesiredVote()).toBe(1);
      expect(displayed).toEqual([1]);
      expect(errors).toEqual([]);
      expect(loggedErrors.length).toBe(1);
      expect(loggedErrors[0][1]).toBe(callbackError);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test("rolls back to the latest confirmed vote after a later request fails", async () => {
    const requested: VoteValue[] = [];
    const displayed: VoteValue[] = [];
    let rejectDownvote: (error: Error) => void = () => {};

    const controller = createOptimisticVoteController(
      0,
      async (_confirmed, next) => {
        requested.push(next);

        if (next === -1) {
          await new Promise<void>((_resolve, reject) => {
            rejectDownvote = reject;
          });
        }
      },
      (vote) => displayed.push(vote),
      () => {},
    );

    controller.press(1);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(controller.getConfirmedVote()).toBe(1);

    controller.press(-1);
    rejectDownvote(new Error("Request failed"));

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(requested).toEqual([1, -1]);
    expect(controller.getConfirmedVote()).toBe(1);
    expect(controller.getDesiredVote()).toBe(1);
    expect(displayed).toEqual([1, -1, 1]);
  });

  test("rapid taps coalesce without extra requests", async () => {
    const requests: VoteValue[] = [];
    const callbacks: (() => void)[] = [];

    const controller = createOptimisticVoteController(
      0,
      (_confirmed, next) => {
        requests.push(next);
        return new Promise<void>((resolve) => callbacks.push(resolve));
      },
      () => {},
      () => {},
    );

    controller.press(1);
    controller.press(-1);
    controller.press(1);

    expect(requests).toEqual([1]);

    callbacks[0]();
    await flush();

    expect(requests).toEqual([1]);
    expect(controller.getConfirmedVote()).toBe(1);
  });

  test("tapping the same vote twice restores the original display", async () => {
    const requests: VoteValue[] = [];
    const callbacks: (() => void)[] = [];
    let displayed: VoteValue = 0;

    const controller = createOptimisticVoteController(
      0,
      (_confirmed, next) => {
        requests.push(next);
        return new Promise<void>((resolve) => callbacks.push(resolve));
      },
      (vote) => {
        displayed = vote;
      },
      () => {},
    );

    controller.press(1);
    expect(displayed).toBe(1);

    controller.press(1);
    expect(displayed).toBe(0);

    // The first request was already sent.
    expect(requests).toEqual([1]);

    callbacks[0]();
    await flush();

    // The controller must send the final desired vote.
    expect(requests).toEqual([1, 0]);

    callbacks[1]();
    await flush();

    expect(displayed).toBe(0);
    expect(controller.getConfirmedVote()).toBe(0);
    expect(controller.getDesiredVote()).toBe(0);
  });

  test("failed requests restore the confirmed vote", async () => {
    let displayed: VoteValue = 0;
    let errors = 0;

    const controller = createOptimisticVoteController(
      0,
      async () => {
        throw new Error("Vote failed");
      },
      (vote) => {
        displayed = vote;
      },
      () => {
        errors++;
      },
    );

    controller.press(1);
    await waitForRollback();

    expect(displayed).toBe(0);
    expect(errors).toBe(1);
    expect(controller.getConfirmedVote()).toBe(0);
  });
});

test("sequentially sends only the latest desired vote", async () => {
  const requests: VoteValue[] = [];
  const callbacks: (() => void)[] = [];

  const controller = createOptimisticVoteController(
    0,
    (_confirmed, next) => {
      requests.push(next);
      return new Promise<void>((resolve) => callbacks.push(resolve));
    },
    () => {},
    () => {},
  );

  controller.press(1);
  controller.press(-1);

  expect(requests).toEqual([1]);

  callbacks[0]();
  await flush();

  expect(requests).toEqual([1, -1]);

  callbacks[1]();
  await flush();

  expect(controller.getConfirmedVote()).toBe(-1);
  expect(controller.getDesiredVote()).toBe(-1);
});

test("failed votes do not trigger automatic retries", async () => {
  let requests = 0;
  let displayed: VoteValue = 0;
  let errors = 0;

  const controller = createOptimisticVoteController(
    0,
    async () => {
      requests++;
      throw new Error("Network failure");
    },
    (vote) => {
      displayed = vote;
    },
    () => {
      errors++;
    },
  );

  controller.press(1);
  await waitForRollback();

  expect(requests).toBe(1);
  expect(displayed).toBe(0);
  expect(controller.getConfirmedVote()).toBe(0);
  expect(errors).toBe(1);
});

test("failure during rapid taps stops further requests", async () => {
  const callbacks: ((error: Error) => void)[] = [];
  const requests: VoteValue[] = [];
  let displayed: VoteValue = 0;
  let errors = 0;

  const controller = createOptimisticVoteController(
    0,
    (_confirmed, next) => {
      requests.push(next);
      return new Promise<void>((_resolve, reject) => callbacks.push(reject));
    },
    (vote) => {
      displayed = vote;
    },
    () => {
      errors++;
    },
  );

  controller.press(1);
  controller.press(-1);

  expect(displayed).toBe(-1);
  expect(requests).toEqual([1]);

  callbacks[0](new Error("Network failure"));
  await waitForRollback();

  expect(requests).toEqual([1]);
  expect(displayed).toBe(0);
  expect(controller.getConfirmedVote()).toBe(0);
  expect(controller.getDesiredVote()).toBe(0);
  expect(errors).toBe(1);
});

test("invalidated controllers ignore additional votes", async () => {
  const requests: VoteValue[] = [];

  const controller = createOptimisticVoteController(
    0,
    async (_confirmed, next) => {
      requests.push(next);
    },
    () => {},
    () => {},
  );

  controller.invalidate();
  controller.press(1);

  await flush();

  expect(requests).toEqual([]);
  expect(controller.getDesiredVote()).toBe(0);
});

test("invalidation prevents queued follow-up requests", async () => {
  const requests: VoteValue[] = [];
  let completeFirstRequest: (() => void) | undefined;
  let errors = 0;

  const controller = createOptimisticVoteController(
    0,
    (_confirmed, next) => {
      requests.push(next);

      return new Promise<void>((resolve) => {
        completeFirstRequest = resolve;
      });
    },
    () => {},
    () => {
      errors++;
    },
  );

  controller.press(1);
  controller.press(-1);

  expect(requests).toEqual([1]);

  controller.invalidate();
  completeFirstRequest?.();

  await flush();

  expect(requests).toEqual([1]);
  expect(errors).toBe(0);
});

test("confirms votes only after successful requests", async () => {
  const confirmations: VoteValue[] = [];
  let resolveRequest: (() => void) | undefined;

  const controller = createOptimisticVoteController(
    0,
    () =>
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    () => {},
    () => {},
    (vote) => confirmations.push(vote),
  );

  controller.press(1);

  expect(confirmations).toEqual([]);

  resolveRequest?.();
  await flush();

  expect(confirmations).toEqual([1]);
  expect(controller.getConfirmedVote()).toBe(1);
});

test("keeps a failed vote visible briefly before rollback", async () => {
  let displayed: VoteValue = 0;
  let errors = 0;

  const controller = createOptimisticVoteController(
    0,
    async () => {
      throw new Error("Simulated failure");
    },
    (vote) => {
      displayed = vote;
    },
    () => {
      errors++;
    },
  );

  controller.press(1);

  // The optimistic vote appears immediately.
  expect(displayed).toBe(1);

  // The failure should not cause an instantaneous rollback.
  await flush();
  expect(displayed).toBe(1);
  expect(errors).toBe(0);

  // After the minimum display time, rollback and notify.
  await waitForRollback();
  expect(displayed).toBe(0);
  expect(errors).toBe(1);
});

test("invalidation during rollback delay suppresses stale callbacks", async () => {
  let displayed: VoteValue = 0;
  let errors = 0;

  const controller = createOptimisticVoteController(
    0,
    async () => {
      throw new Error("Simulated failure");
    },
    (vote) => {
      displayed = vote;
    },
    () => {
      errors++;
    },
  );

  controller.press(1);
  await flush();

  expect(displayed).toBe(1);

  // Simulate the post disappearing before the rollback completes.
  controller.invalidate();

  await waitForRollback();

  // The retired controller must not update the UI or show a toast.
  expect(displayed).toBe(1);
  expect(errors).toBe(0);
});
