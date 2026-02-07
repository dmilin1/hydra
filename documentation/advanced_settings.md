===METADATA===
title: Advanced Settings
description: Clear image cache, self-hosted Hydra server, custom server URL, and customer ID
===END METADATA===

# Advanced Settings

Advanced Settings are found in [Settings > Advanced](hydra://settings/advanced). They provide options for cache management, self-hosting, and account identification.

## Clear Image Cache

Hydra caches images locally for faster loading and offline access. The current cache size is displayed on the **Clear Image Cache** button in megabytes.

To free up storage, tap **"Clear Image Cache"** under the **Caching** section. The cache will rebuild automatically as you browse.

## Self-Hosted Hydra Server

If you run your own Hydra server, you can point the app to it instead of the default server. Using a custom server also grants access to Pro features.

To connect to a custom server:

1. Go to [Advanced Settings](hydra://settings/advanced)
2. Enable **"Use Custom Server"** under **"Self Hosted Hydra Server"**
3. Enter your server URL in the text field
4. Wait for validation to complete
5. Restart the app for changes to take effect

The app checks your server by contacting its status endpoint. You'll see one of these messages:

- **"Checking server status..."** — Validation in progress.
- **"Custom server URL is not valid or your server is not set up properly."** — The server could not be reached or is not configured correctly.
- **"Success! App must be restarted for changes to take effect."** — The server is valid and the URL has been saved.

The URL is only saved when validation succeeds. You must restart the app after a successful validation for the change to take effect.

## Customer ID

Your Customer ID is a unique account identifier provided by the app's subscription system. It appears at the bottom of the Advanced Settings page if one is associated with your account. Tap it to copy it to your clipboard.

This ID is useful when requesting support. Do not share it on public forums.

## Troubleshooting

**Cache won't clear:** Try restarting the app and clearing again.

**Custom server not working:** Double-check that the URL is correct, that your server is running, and that the validation status shows success. Remember to restart the app after validation.

**Customer ID not showing:** The Customer ID only appears if one has been assigned to your account. If you believe it should be visible, try restarting the app or contact support.

---

Access advanced settings in [Settings > Advanced](hydra://settings/advanced) or learn about [Troubleshooting](hydra://settings/guide/?doc=troubleshooting).
