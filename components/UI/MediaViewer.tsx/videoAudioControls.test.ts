import assert from "node:assert/strict";
import test from "node:test";
import { isMediaVolumeIncrease } from "./videoAudioControls.ts";

test("detects iOS and Android media volume increases", () => {
  assert.equal(isMediaVolumeIncrease(0.25, 0.5), true);
  assert.equal(isMediaVolumeIncrease(0.25, 0.5, "music"), true);
});

test("ignores the initial reading, decreases, and unchanged volume", () => {
  assert.equal(isMediaVolumeIncrease(null, 0.5), false);
  assert.equal(isMediaVolumeIncrease(0.5, 0.25), false);
  assert.equal(isMediaVolumeIncrease(0.5, 0.5), false);
});

test("ignores unrelated Android volume streams", () => {
  assert.equal(isMediaVolumeIncrease(0.25, 0.5, "ring"), false);
});
