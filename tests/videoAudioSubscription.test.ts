import { expect, test } from "bun:test";
import { subscribeToVideoUnmute } from "../components/UI/MediaViewer.tsx/videoAudioControls";

function fixture() {
  let resolve!: (value: { volume: number }) => void;
  let reject!: (error: Error) => void;
  const initial = new Promise<{ volume: number }>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  let intent = () => {};
  let emitVolume = (_event: { volume: number; type?: string }) => {};
  let active = true;
  const calls: string[] = [];
  const stop = subscribeToVideoUnmute({
    volume: {
      getVolume: () => initial,
      addVolumeListener: (callback) => {
        calls.push("volume subscribed");
        emitVolume = callback;
        return { remove: () => calls.push("volume removed") };
      },
    },
    watchIntent: (callback) => {
      intent = callback;
      return () => calls.push("intent released");
    },
    isActive: () => active,
    onUnmute: () => calls.push("unmute"),
  });
  return {
    calls,
    stop,
    resolve,
    reject,
    intent: () => intent(),
    volume: (volume: number, type?: string) => emitVolume({ volume, type }),
    background: () => {
      active = false;
    },
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

test("native intent at maximum releases the lease before one unmute request", async () => {
  const f = fixture();
  f.resolve({ volume: 1 });
  await flush();
  f.volume(1);
  expect(f.calls).toEqual(["volume subscribed"]);
  f.intent();
  f.intent();
  f.volume(0.95);
  f.stop();
  expect(f.calls).toEqual([
    "volume subscribed",
    "volume removed",
    "intent released",
    "unmute",
  ]);
});

test("both media volume directions unmute once, including leaving a limit", async () => {
  for (const [initial, next] of [
    [0, 0.1],
    [1, 0.9],
  ]) {
    const f = fixture();
    f.resolve({ volume: initial });
    await flush();
    f.volume(next, "music");
    f.intent();
    expect(f.calls.filter((call) => call === "unmute").length).toBe(1);
    f.stop();
  }
});

test("non-music streams cannot change the media baseline", async () => {
  const f = fixture();
  f.resolve({ volume: 0.5 });
  await flush();
  f.volume(1, "ring");
  f.volume(0.5, "music");
  expect(f.calls).toEqual(["volume subscribed"]);
  f.stop();
});

test("blur/unmount before initialization prevents subscription and stale intent", async () => {
  const f = fixture();
  f.stop();
  f.resolve({ volume: 1 });
  await flush();
  f.intent();
  expect(f.calls).toEqual(["intent released"]);
});

test("callbacks retained after cleanup cannot unmute", async () => {
  const f = fixture();
  f.resolve({ volume: 0.5 });
  await flush();
  f.stop();
  f.volume(1);
  f.intent();
  expect(f.calls.includes("unmute")).toBe(false);
});

test("background callbacks cannot unmute even before effect cleanup", async () => {
  const f = fixture();
  f.resolve({ volume: 0.5 });
  await flush();
  f.background();
  f.volume(1);
  f.intent();
  expect(f.calls.includes("unmute")).toBe(false);
  f.stop();
});

test("intent still works when volume initialization rejects", async () => {
  const f = fixture();
  f.reject(new Error("volume unavailable"));
  await flush();
  f.intent();
  expect(f.calls).toEqual(["intent released", "unmute"]);
});

test("intent before volume initialization prevents a late volume subscription", async () => {
  const f = fixture();
  f.intent();
  f.resolve({ volume: 1 });
  await flush();
  expect(f.calls).toEqual(["intent released", "unmute"]);
});

test("an unavailable native intent capability retains volume-change fallback", async () => {
  let callback = (_event: { volume: number; type?: string }) => {};
  let unmuted = false;
  const stop = subscribeToVideoUnmute({
    volume: {
      getVolume: async () => ({ volume: 1 }),
      addVolumeListener: (listener) => {
        callback = listener;
        return { remove() {} };
      },
    },
    watchIntent: () => {
      throw new Error("native unavailable");
    },
    isActive: () => true,
    onUnmute: () => {
      unmuted = true;
    },
  });
  await flush();
  callback({ volume: 0.9 });
  expect(unmuted).toBe(true);
  stop();
});
