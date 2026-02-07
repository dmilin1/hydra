===METADATA===
title: Troubleshooting
description: Common problems and solutions, known limitations and workarounds, performance tips, when settings are hidden, getting help
===END METADATA===

# Troubleshooting

This guide covers common issues and their solutions. If your problem isn't listed here, check the [Getting Help](#getting-help) section at the bottom.

## Common Problems

### App Won't Start or Crashes

Force-quit the app and reopen it. If the problem persists, check that your device has available storage and that both iOS and Hydra are up to date. As a last resort, delete the app, restart your device, and reinstall the app.

### Posts or Comments Not Loading

Check your internet connection and pull down to refresh. If your feed appears empty, your [filters](hydra://settings/general/filters) may be too restrictive — try disabling them temporarily. You can also try changing the sort option or clearing the image cache in [Advanced settings](hydra://settings/advanced).

### Can't Log In

Make sure your username and password are correct. If you have two-factor authentication enabled, complete the 2FA prompt. Try logging in at [reddit.com](https://www.reddit.com) first to confirm your account works. For more details, see the [Accounts and Login guide](hydra://settings/guide/?doc=accounts_and_login).

### Slow Performance

Filters are the most common cause of slowdowns — each post is checked against every active filter, and AI filters require additional processing. Reduce the number of active filters or shorten AI filter descriptions to improve speed. Turning off video auto-play and clearing the image cache in [Advanced settings](hydra://settings/advanced) can also help. See [Performance Tips](#performance-tips) below for more.

### Pro Features Not Working

If Pro features aren't available after subscribing, verify your subscription is active in the App Store, then restart the app. Check your subscription status on the [Hydra Pro page](hydra://settings/hydraPro). For billing issues, contact Apple Support.

## Hidden Settings

Some settings only appear under certain conditions.

**Pro features** — [AI Filters](hydra://settings/guide/?doc=ai_filters), [Stats](hydra://settings/guide/?doc=stats), [Post & Comment Summaries](hydra://settings/guide/?doc=ai_summaries), [Custom Theme saving](hydra://settings/guide/?doc=custom_themes), and [Inbox Alerts](hydra://settings/guide/?doc=inbox_alerts) require a [Hydra Pro](hydra://settings/hydraPro) subscription. The settings for these features are visible but disabled until you subscribe.

**Device-specific features** — [Split View](hydra://settings/guide/?doc=split_view) only appears on iPad. [App Icon](hydra://settings/guide/?doc=app_icons) only appears on devices that support alternate icons. These settings show up automatically when the device supports them.

## Known Limitations

**Search** — Reddit's search finds posts, not individual comments. Deleted or removed posts won't appear in results. User search is limited to one page of results. For more, see the [Search guide](hydra://settings/guide/?doc=search).

**Filters** — Text filters use literal whole-word matching and can't understand context or scan images. Filters apply to home and subreddit feeds but not to search results or user profiles. For smarter filtering, use [AI Filters](hydra://settings/guide/?doc=ai_filters) (Pro).

## Getting Help

If you can't find a solution here, reach out through these channels:

- **Reddit** — [r/HydraApp](https://www.reddit.com/r/HydraApp)
- **Discord** — [Hydra Discord](https://discord.gg/ypaD4KYJ3R)
- **GitHub** — [Report issues](https://github.com/dmilin1/hydra)

When reporting an issue, include your device model, iOS version, Hydra version, and steps to reproduce the problem. Screenshots and error messages are helpful.

---

Find more help in the [Tips and Tricks guide](hydra://settings/guide/?doc=tips_and_tricks) or search [Documentation](hydra://settings/guide).
