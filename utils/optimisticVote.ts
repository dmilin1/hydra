export type VoteValue = -1 | 0 | 1;

export function nextVote(current: VoteValue, pressed: VoteValue): VoteValue {
  return current === pressed ? 0 : pressed;
}

export function adjustedScore(
  originalScore: number,
  originalVote: VoteValue,
  next: VoteValue,
): number {
  return originalScore - originalVote + next;
}

export function displayOptimisticVote(
  incomingScore: number,
  incomingVote: VoteValue,
  localVote: VoteValue | null,
): { score: number; vote: VoteValue } {
  const vote = localVote ?? incomingVote;

  return {
    score: adjustedScore(incomingScore, incomingVote, vote),
    vote,
  };
}

export function createOptimisticVoteController(
  initialVote: VoteValue,
  sendVote: (confirmedVote: VoteValue, next: VoteValue) => Promise<void>,
  onChange: (vote: VoteValue) => void,
  onError: (error: unknown) => void,
  onConfirmed?: (vote: VoteValue) => void,
) {
  let confirmedVote = initialVote;
  let desiredVote = initialVote;
  let running = false;
  let invalidated = false;
  let lastPressTime = 0;

  async function synchronize() {
    if (running) return;
    running = true;

    try {
      while (!invalidated && confirmedVote !== desiredVote) {
        const requestedVote = desiredVote;

        try {
          await sendVote(confirmedVote, requestedVote);
        } catch (error) {
          if (invalidated) break;

          // Keep the optimistic vote visible briefly on fast failures.
          const remaining = Math.max(0, 250 - (Date.now() - lastPressTime));

          if (remaining > 0) {
            await new Promise<void>((resolve) =>
              setTimeout(resolve, remaining),
            );
          }

          if (invalidated) break;

          desiredVote = confirmedVote;
          onChange(confirmedVote);
          onError(error);
          break;
        }

        // The request succeeded. Don't treat callback errors as API failures.
        confirmedVote = requestedVote;
        if (!invalidated) onConfirmed?.(confirmedVote);
      }
    } finally {
      running = false;
    }
  }

  return {
    invalidate() {
      invalidated = true;
    },
    press(vote: VoteValue) {
      if (invalidated) return;
      const next = nextVote(desiredVote, vote);

      if (next === desiredVote) return;

      desiredVote = next;
      lastPressTime = Date.now();
      onChange(desiredVote);
      void synchronize().catch((error) => {
        console.error(
          "Unexpected optimistic vote synchronization error:",
          error,
        );
      });
    },
    getConfirmedVote: () => confirmedVote,
    getDesiredVote: () => desiredVote,
  };
}
