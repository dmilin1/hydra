===METADATA===
title: External Links
description: How links are opened, browser selection, and opening Reddit links in Hydra from other apps
===END METADATA===

# External Links

Hydra provides flexible options for how links are handled. Reddit links are always opened within Hydra, while links to external websites open in a browser of your choice.

## Browser Selection

You can choose which browser Hydra uses to open external links.

1. Go to [External Links settings](hydra://settings/general/externalLinks)
2. Tap **"Open links with"**
3. Choose your preferred browser

The available browsers are:

- **Hydra** (default) — Opens links in a built-in browser within the app, so you don't need to switch away from Hydra.
- **Default Browser** — Opens links in your system default browser (usually Safari).
- **Chrome**
- **Brave**
- **Firefox**
- **Edge**
- **Opera**

If you select a third-party browser that isn't installed, Hydra will offer to open the link in your default browser instead.

## Reader Mode

When **"Open links with"** is set to **"Hydra"**, an additional **"Open in reader mode"** setting becomes available. Enabling this makes the built-in browser automatically open pages in reader mode, which strips away ads, navigation, and other clutter to show a clean, text-focused view of the page content.

## Open in Hydra

"Open in Hydra" lets you open Reddit links in Hydra from other apps using the iOS share sheet.

### Setting Up the Shortcut

1. Go to [Open in Hydra settings](hydra://settings/general/openInHydra)
2. Tap **"Get Hydra Shortcut"**
3. Install the shortcut in the iOS Shortcuts app

Once installed, an "Open in Hydra" option will appear in the share sheet of other apps. Tap it on any Reddit link to open it directly in Hydra.

### Clipboard Link Detection

Hydra can automatically detect Reddit links copied to your clipboard and prompt you to open them.

1. Go to [Open in Hydra settings](hydra://settings/general/openInHydra)
2. Enable **"Read Links from Clipboard"**

When this is enabled, iOS will ask for permission each time Hydra reads your clipboard. To disable this repeated prompt, go to **iOS Settings > Hydra** and set **"Paste from Other Apps"** to **"Allow"**.

## Troubleshooting

- **Links not opening in your chosen browser** — Make sure the browser app is installed. Try switching to a different browser in [External Links settings](hydra://settings/general/externalLinks).
- **"Open in Hydra" not appearing in the share sheet** — Verify the shortcut is installed in the iOS Shortcuts app. Try reinstalling the shortcut.
- **Clipboard detection not working** — Check that "Read Links from Clipboard" is enabled in [Open in Hydra settings](hydra://settings/general/openInHydra), and verify clipboard permissions in iOS Settings.
