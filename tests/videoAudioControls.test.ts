import { expect, test } from "bun:test";
import { isMediaVolumeChange } from "../components/UI/MediaViewer.tsx/videoAudioControls";

test("detects both directions of iOS and Android media volume changes", () => {
  expect(isMediaVolumeChange(0.25, 0.5)).toBe(true);
  expect(isMediaVolumeChange(0.25, 0.5, "music")).toBe(true);
  expect(isMediaVolumeChange(0.5, 0.25)).toBe(true);
  expect(isMediaVolumeChange(0.5, 0.25, "music")).toBe(true);
});

test("ignores the initial reading and unchanged volume", () => {
  expect(isMediaVolumeChange(null, 0.5)).toBe(false);
  expect(isMediaVolumeChange(0.5, 0.5)).toBe(false);
});

test("ignores unrelated Android volume streams", () => {
  expect(isMediaVolumeChange(0.25, 0.5, "ring")).toBe(false);
});

test("detects an increase reaching maximum, but never infers intent at maximum", () => {
  for (const type of [undefined, "music"]) {
    expect(isMediaVolumeChange(null, 1, type)).toBe(false);
    expect(isMediaVolumeChange(0.9375, 1, type)).toBe(true);
    expect(isMediaVolumeChange(1, 1, type)).toBe(false);
    expect(isMediaVolumeChange(1, 0.9375, type)).toBe(true);
  }
});

test("duplicate maximum readings do not count as volume changes", () => {
  const readings = [0.9375, 1, 1, 1, 0.9375];
  const changes = readings
    .slice(1)
    .filter((volume, index) =>
      isMediaVolumeChange(readings[index], volume, "music"),
    );
  expect(changes).toEqual([1, 0.9375]);
});

test("ignores non-music streams even when they reach maximum", () => {
  for (const type of [
    "ring",
    "system",
    "alarm",
    "notification",
    "voice_call",
  ]) {
    expect(isMediaVolumeChange(0.9375, 1, type)).toBe(false);
  }
});
