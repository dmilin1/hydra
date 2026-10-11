===METADATA===
title: General Settings
description: Startup settings (initial tab, startup URL), Open in Hydra (shortcut setup, clipboard detection), External Links (browser selection, Modify Links custom link scripts), Gestures, Sorting, Filters
===END METADATA===

# General Settings

## Startup Settings

**Start Hydra on This Tab**: Choose which tab opens on launch. Options: Posts (default), Inbox, Account, Search, Settings. Configure in [Startup settings](hydra://settings/general/startup).

**Startup URL**: Open to a specific Reddit page on launch. Enter any valid Reddit URL (e.g., `https://www.reddit.com/r/technology`, `https://www.reddit.com/r/all/hot`). This overrides the initial tab setting. Invalid URLs display an error and are ignored. Configure in [Startup settings](hydra://settings/general/startup).

## Open in Hydra Settings

**Hydra Shortcut** (iOS only): Adds "Open in Hydra" to iOS share sheets. Tap "Get Hydra Shortcut" in [Open in Hydra settings](hydra://settings/general/openInHydra) to install via the iOS Shortcuts app. Once installed, "Open in Hydra" appears in share menus from any app. Hydra also appears directly as a share option when sharing links from other apps on both iOS and Android — no setup required.

**Read Links from Clipboard**: Automatically detects Reddit links in your clipboard when the app opens and offers to open them. On iOS, to avoid repeated permission prompts, go to iOS Settings > Hydra > "Paste from Other Apps" and set to "Allow". On Android, Hydra reads your clipboard each time you open the app without prompting.

Learn more in the [External Links guide](hydra://settings/guide/?doc=external_links).

## Legal Documents

Legal documents can be found on the main Settings page. Access Privacy Policy and End User License Agreement (EULA) links in [Legal](hydra://settings/general/legal).

## External Links Settings

**Open Links With**: Choose which browser opens external links. Options: Hydra (built-in browser), Default Browser (your device's default), Chrome, Brave, Firefox, Edge, Opera. Third-party browsers must be installed on your device. Configure in [External Links settings](hydra://settings/general/externalLinks).

**Open in Reader Mode**: When "Open links with" is set to "Hydra", this toggle appears and makes the built-in browser automatically open pages in reader mode for a cleaner reading experience. This setting is only visible when using Hydra's built-in browser, and reader mode is only available on iOS.

**Modify Links**: Write your own JavaScript to change how Hydra opens web links. Tap **"Modify Links"** in [External Links settings](hydra://settings/general/externalLinks) to write a script, add ready-made examples (like removing tracking parameters or always using HTTPS), and test it on a link before enabling it. Links that open inside Hydra, like Reddit posts and subreddits, are left alone. If your script has an error, the original link opens instead.

Learn more in the [External Links guide](hydra://settings/guide/?doc=external_links).

## Other General Settings

- [Gestures](hydra://settings/general/gestures) - Swipe actions and navigation. See the [Gestures guide](hydra://settings/guide/?doc=gestures).
- [Post & Comment Sorting](hydra://settings/general/sorting) - Default sorts and per-subreddit memory. See the [Sorting guide](hydra://settings/guide/?doc=sorting).
- [Filters](hydra://settings/general/filters) - Text filters, AI filters (Pro), hide seen posts. See the [AI Filters guide](hydra://settings/guide/?doc=ai_filters) and [Text Filters guide](hydra://settings/guide/?doc=text_filters).

---

Configure general settings in [General settings](hydra://settings/general).
