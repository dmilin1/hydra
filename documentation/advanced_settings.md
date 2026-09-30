===METADATA===
title: Advanced Settings
description: Clear image cache, clear video cache, self-hosted Hydra server, custom server URL, custom server headers, and customer ID
===END METADATA===

# Advanced Settings

Advanced Settings are found in [Settings > Advanced](hydra://settings/advanced). They provide options for cache management, self-hosting, and account identification.

## Clear Image Cache

Hydra caches images locally for faster loading and offline access. The current cache size is displayed on the **Clear Image Cache** button in megabytes.

To free up storage, tap **"Clear Image Cache"** under the **Caching** section. The cache will rebuild automatically as you browse.

## Clear Video Cache

Hydra also caches videos for smoother playback. The current cache size is displayed on the **Clear Video Cache** button in megabytes.

To free up storage, tap **"Clear Video Cache"** under the **Caching** section. The video cache is cleared the next time you restart Hydra.

## Self-Hosted Hydra Server

If you run your own Hydra server, you can point the app to it instead of the default server. Using a custom server also grants access to Pro features.

To connect to a custom server:

1. Go to [Advanced Settings](hydra://settings/advanced)
2. Enable **"Use Custom Server"** under **"Self Hosted Hydra Server"**
3. Enter your server URL in the text field
4. Optionally, enter custom headers (see below)
5. Wait for validation to complete
6. Restart the app for changes to take effect

The app checks your server by contacting its status endpoint. You'll see one of these messages:

- **"Checking server status..."** — Validation in progress.
- **"Custom server URL is not valid or your server is not set up properly."** — The server could not be reached or is not configured correctly.
- **"Success! App must be restarted for changes to take effect."** — The server is valid and the URL has been saved.

The URL is only saved when validation succeeds. You must restart the app after a successful validation for the change to take effect.

### Custom Headers

If your server sits behind an authentication proxy or gateway (for example Cloudflare Access, basic auth, or an API key check), you can have Hydra send extra HTTP headers with every request to it. Enter one header per line in the headers field, in the form `Name: value`:

```
CF-Access-Client-Id: your-client-id
CF-Access-Client-Secret: your-client-secret
```

Headers are sent only to your custom server, including during validation, and never to the official Hydra server. Lines without a colon are ignored. Restart the app after changing headers.

## Customer ID

Your Customer ID is a unique account identifier provided by the app's subscription system. It appears at the bottom of the Advanced Settings page if one is associated with your account. Tap it to copy it to your clipboard.

This ID is useful when requesting support. Do not share it on public forums.

## Troubleshooting

**Cache won't clear:** Try restarting the app and clearing again.

**Custom server not working:** Double-check that the URL is correct, that your server is running, that any required headers are entered correctly, and that the validation status shows success. Remember to restart the app after validation.

**Customer ID not showing:** The Customer ID only appears if one has been assigned to your account. If you believe it should be visible, try restarting the app or contact support.

---

Access advanced settings in [Settings > Advanced](hydra://settings/advanced) or learn about [Troubleshooting](hydra://settings/guide/?doc=troubleshooting).
