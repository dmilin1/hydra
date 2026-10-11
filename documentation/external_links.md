===METADATA===
title: External Links
description: How links are opened, browser selection, Modify Links scripts for rewriting links, and opening Reddit links in Hydra from other apps
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
- **Default Browser** — Opens links in your system default browser (Safari on iOS, or your chosen default browser on Android).
- **Chrome**
- **Brave**
- **Firefox**
- **Edge**
- **Opera**

If you select a third-party browser that isn't installed, Hydra will offer to open the link in your default browser instead.

## Reader Mode

When **"Open links with"** is set to **"Hydra"**, an additional **"Open in reader mode"** setting becomes available. Enabling this makes the built-in browser automatically open pages in reader mode, which strips away ads, navigation, and other clutter to show a clean, text-focused view of the page content. Reader mode is only available on iOS.

## Modify Links

Modify Links lets you write a small JavaScript script that rewrites external links before Hydra opens them — for example, opening X links with xcancel, removing tracking parameters, or forcing HTTPS.

1. Go to [External Links settings](hydra://settings/general/externalLinks)
2. Tap **"Modify Links"**
3. Write a script, or tap an entry under **"Add an Example"** to insert a ready-made snippet
4. Turn on **"Enable Script"**

Your script receives the link in a `url` variable — change it, or return a new value, and Hydra opens that instead. Links that open inside Hydra, like Reddit posts and subreddits, are not affected.

Use the **"Test Your Script"** section to paste a link and tap **"Run Script On This Link"** to preview the result before enabling the script. If your script has an error or returns something that isn't a link, Hydra opens the original link instead. A script that never finishes will freeze the app until it's restarted, so turn off **"Enable Script"** if a script causes trouble. Never add scripts from the internet that you don't fully understand.

## Open in Hydra

"Open in Hydra" lets you open Reddit links in Hydra from other apps.

Hydra appears directly as an option in your device's share sheet on both iOS and Android. Share a Reddit link from any other app and choose **Hydra** to open it in the app. No setup required.

### Setting Up the Shortcut (iOS only)

On iOS, you can also install an "Open in Hydra" shortcut:

1. Go to [Open in Hydra settings](hydra://settings/general/openInHydra)
2. Tap **"Get Hydra Shortcut"**
3. Install the shortcut in the iOS Shortcuts app

Once installed, an "Open in Hydra" option will appear in the share sheet of other apps. Tap it on any Reddit link to open it directly in Hydra.

### Clipboard Link Detection

Hydra can automatically detect Reddit links copied to your clipboard and prompt you to open them.

1. Go to [Open in Hydra settings](hydra://settings/general/openInHydra)
2. Enable **"Read Links from Clipboard"**

When this is enabled, Hydra checks your clipboard each time you open the app. On iOS, the system will ask for permission each time Hydra reads your clipboard. To disable this repeated prompt, go to **iOS Settings > Hydra** and set **"Paste from Other Apps"** to **"Allow"**. On Android, there is no permission prompt.

## Troubleshooting

- **Links not opening in your chosen browser** — Make sure the browser app is installed. Try switching to a different browser in [External Links settings](hydra://settings/general/externalLinks).
- **Hydra not appearing in the share sheet** — Make sure you're sharing a link rather than an image or file. On iOS, if you're using the "Open in Hydra" shortcut, verify it's installed in the iOS Shortcuts app and try reinstalling it.
- **Clipboard detection not working** — Check that "Read Links from Clipboard" is enabled in [Open in Hydra settings](hydra://settings/general/openInHydra). On iOS, also verify clipboard permissions in the iOS Settings app.
