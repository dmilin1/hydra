# Video audio controls

The viewer uses one unmute path for volume changes in either direction and
native unmute intent. The local Expo module adds only native intent; the existing
volume-manager subscription provides the media-volume-change fallback. Neither
path writes device volume, suppresses the HUD, or consumes hardware keys.

- iOS 26+: temporarily owns audio-session output mute while the focused viewer
  is muted. Either volume direction can express unmute intent, including volume-up
  at maximum.
- Older iOS: observed media-volume changes in either direction unmute. Duplicate
  readings at a limit do not establish intent.
- Android: observes initial up/down key-downs delivered to the foreground
  Activity and leaves normal dispatch intact. This is not global interception;
  windows such as native dialogs can bypass Activity key handling. Media-volume
  changes remain the fallback.

`watchUnmuteIntent` creates an owner token per subscription. Native events carry
that token so a late event cannot act on the next viewer. Cleanup releases the
owned session mute before requesting the shared `setIsMuted(false)` change.
The hook subscribes only for a focused, foreground, muted viewer. Cleanup,
background callbacks, duplicate events and rejected volume initialization are
covered by the subscription tests.

On iOS, Expo keeps control of session category, mode and activation. The module
changes only output mute, and refuses to claim an already-muted session. Hydra's
inline players are muted and the full-screen viewer is its audible video owner;
future features introducing other simultaneous app audio must coordinate with
this session-wide mute. Native resign-active, interruption and media-service
reset handlers release the lease independently of JS. If release fails, ownership
is retained for retry at the next start or activation and the error is logged.
