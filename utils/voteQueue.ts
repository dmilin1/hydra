export type Vote = -1 | 0 | 1;

export function createVoteQueue(
  initial: Vote,
  send: (vote: Vote) => Promise<unknown>,
  update: (vote: Vote) => void,
  failed: (error: unknown) => void,
  settled: () => void,
) {
  let confirmed = initial;
  let desired = initial;
  let running = false;
  let retired = false;
  let lastTap = 0;

  async function synchronize() {
    running = true;
    try {
      while (!retired && confirmed !== desired) {
        const requested = desired;
        await send(requested);
        confirmed = requested;
      }
    } catch (error) {
      // Avoid flashing back immediately on fast failures; do not retry queued votes.
      const delay = Math.max(0, 250 - (Date.now() - lastTap));
      if (!retired && delay)
        await new Promise((resolve) => setTimeout(resolve, delay));
      if (!retired) failed(error);
    } finally {
      desired = confirmed;
      update(confirmed);
      running = false;
      settled();
    }
  }

  return {
    press(direction: Vote) {
      if (retired) return;
      desired = desired === direction ? 0 : direction;
      lastTap = Date.now();
      update(desired);
      if (!running) void synchronize();
    },
    retire() {
      retired = true;
      // The current request may still succeed, but unsent choices must not linger.
      update(confirmed);
    },
  };
}
