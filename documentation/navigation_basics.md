===METADATA===
title: Navigation Basics
description: Basic navigation, tabs, back button, URL scheme, and navigation patterns
===END METADATA===

# Navigation Basics

## Tab Navigation

The tab bar contains five sections: **Posts** (your feed and subreddit browsing), **Inbox** (replies and messages), **Account** (your profile and saved content), **Search** (find subreddits, posts, and users), and **Settings** (app preferences). Tapping the current tab goes back one level. Long pressing the Search tab opens quick subreddit search.

## Basic Navigation Actions

Navigate back by swiping right from the left screen edge, or tapping the back button. Tap posts, comments, subreddit names, or usernames to open them. Long press posts and comments for quick actions like voting, saving, sharing, and more. When viewing a subreddit or user profile, tap the "..." button for additional options like subscribing, sharing, and viewing the sidebar.

## URL Scheme

Hydra uses `hydra://` URLs for deep linking. Common patterns include `hydra://settings`, `hydra://settings/general/gestures`, and `hydra://accounts`. Regular Reddit URLs also work automatically.

## Navigation Gestures

Configure swipe gestures on posts and comments for quick actions. Enable "Swipe Anywhere to Navigate" in [Gestures settings](hydra://settings/general/gestures) to swipe right from anywhere on the screen to go back. Pull down to refresh feeds, swipe down to dismiss modals. See the [Gestures guide](hydra://settings/guide/?doc=gestures) for configuration details.

## Scrolling and Loading

Feeds use infinite scrolling. Content loads automatically as you scroll. Pull down at the top to refresh. Activity indicators show loading state.

## Split View (iPad)

Enable split view in [Appearance settings](hydra://settings/appearance) to show posts side-by-side with your feed. See the [Split View guide](hydra://settings/guide/?doc=split_view) for details.

## Troubleshooting

If navigation feels slow, check your network connection, restart the app, or clear the image cache in [Advanced settings](hydra://settings/advanced).

---

For more advanced navigation features, see the [Gestures guide](hydra://settings/guide/?doc=gestures) or explore [Settings](hydra://settings).
