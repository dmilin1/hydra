# Volume button detector

`onVolumeButtonPressed(listener)` calls the listener on each hardware volume
button press and returns an unsubscribe function. Native detection is armed
when the first listener is added and released when the last is removed.

- **iOS 26+**: claims the audio session's output mute and observes the system's
  unmute-intent notification. Fires even when volume is already at maximum.
- **Older iOS**: observes `outputVolume` changes. A press at the limit is
  invisible; there is no button API.
- **Android**: observes volume key-up on the Activity without consuming it.
  Key-up because a React Native `Modal` forwards only key-up to the Activity.

The iOS paths need an active audio session. The module activates it as a
mixable playback session, matching what expo-video configures for Hydra, so
other apps' audio keeps playing. The output mute is per-app.

Known gaps: an audio interruption (call, another app's non-mixable playback)
deactivates the session and silences detection until something reactivates it.
Whether the iOS 26 notification fires for volume-down as well as volume-up
needs a device check.
