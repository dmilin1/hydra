/**
 * Single source of truth for Hydra's alternate app icons. Consumed by
 * app.config.ts (which feeds plugins/withAppIcons.js), by the settings UI, and
 * by utils/appIcons.ts at runtime.
 *
 * TO ADD AN ICON:
 *   1. Drop square 1024x1024 PNGs into assets/images/custom_icons/:
 *        <key>.png                    — iOS icon, no transparency
 *        <key>_android.png            — Android adaptive foreground. Must be
 *                                       transparent, with the artwork inside the
 *                                       middle ~64%; launchers mask the outer
 *                                       ~18% on every edge.
 *        <key>_android_background.png — full-bleed background layer (or set
 *                                       androidBackgroundColor instead)
 *   2. Add an entry to APP_ICON_SOURCES below.
 *   3. Add the matching require() to ICON_PREVIEWS in
 *      pages/SettingsPage/General/AppIcon/AppIcon.tsx. If you forget, the App
 *      Icon settings page throws in development and tells you which key is
 *      missing.
 *   4. Rebuild: npx expo prebuild --clean && npm run android (or ios). Every
 *      native asset, activity alias and asset-catalog entry is generated from
 *      this file — there is no separate generation step to remember.
 *
 * NEVER RENAME AN EXISTING key. It is the iOS asset-catalog name, and iOS has
 * persisted it on every device where someone picked that icon, so renaming
 * silently resets those users to the default icon on their next update. Adding
 * and removing keys is safe; renaming is not.
 *
 * This file is CommonJS rather than TypeScript on purpose: app.config.ts is
 * loaded in plain Node, and Expo transpiles that one file in isolation without
 * being able to resolve local .ts imports. The JSDoc types below give the app
 * the same checking a .ts file would.
 */

/** @typedef {"dmilin" | "batjake" | "boxsitter"} AppIconAuthorId */

/**
 * @typedef {object} AppIconAuthor
 * @property {string} redditUsername
 * @property {string} [website]
 * @property {string} [instagram]
 * @property {string} bio
 */

/**
 * @typedef {object} AppIconSource
 * @property {string} key iOS asset-catalog name and Android resource suffix.
 *   Lowercase snake_case, since it has to be valid as both. Never rename.
 * @property {string} prettyName
 * @property {AppIconAuthorId} author
 * @property {string} ios 1024x1024 iOS icon.
 * @property {string} androidForeground 1024x1024 adaptive-icon foreground.
 * @property {string} [androidBackground] Full-bleed 1024x1024 background layer.
 * @property {string} [androidBackgroundColor] Solid background, used when
 *   androidBackground is omitted. Set exactly one of the two.
 */

/** @type {Record<AppIconAuthorId, AppIconAuthor>} */
const APP_ICON_AUTHORS = {
  dmilin: {
    redditUsername: "u/dmilin",
    website: "https://github.com/dmilin1/hydra",
    bio: "Hi, I'm Dimitrie, the developer of Hydra. I'm a software engineer and have been building apps for almost 2 decades. I built Hydra to craft the best possible Reddit experience for myself and others.",
  },
  batjake: {
    redditUsername: "u/batjake",
    website: "http://brokendiamonddesign.com/",
    instagram: "@bdiamonddesigns",
    bio: "Hi, I'm Jake, a graphic designer with 10+ years of experience creating bold logos, striking album art, and brand visuals that resonate. I specialize in helping businesses and musicians stand out with designs that capture essence, tell stories, and leave lasting impressions.",
  },
  boxsitter: {
    redditUsername: "u/boxsitter",
    bio: "Hi, I'm Boxsitter, a hobbyist designer who wanted to create something special for this app. Because I run the open-source server myself, I designed this icon as a way to support the project in lieu of a subscription. I hope you enjoy this reminder that if you cut off one head, two more shall take its place. Hail Hydra!",
  },
};

/** @type {AppIconSource[]} */
const APP_ICON_SOURCES = [
  {
    key: "cerberus",
    prettyName: "Cerberus",
    author: "batjake",
    ios: "./assets/images/custom_icons/cerberus.png",
    androidForeground: "./assets/images/custom_icons/cerberus_android.png",
    androidBackground:
      "./assets/images/custom_icons/cerberus_android_background.png",
  },
  {
    key: "hail_hydra",
    prettyName: "Hail Hydra!",
    author: "boxsitter",
    ios: "./assets/images/custom_icons/hail_hydra.png",
    androidForeground: "./assets/images/custom_icons/hail_hydra_android.png",
    androidBackground:
      "./assets/images/custom_icons/hail_hydra_android_background.png",
  },
  {
    key: "hail_hydra_dark",
    prettyName: "Hail Hydra! (Dark)",
    author: "boxsitter",
    ios: "./assets/images/custom_icons/hail_hydra_dark.png",
    androidForeground:
      "./assets/images/custom_icons/hail_hydra_dark_android.png",
    androidBackgroundColor: "#000000",
  },
];

/**
 * Android activity-alias suffix for an icon key: `hail_hydra` -> `HailHydra`.
 * Java class names can't be snake_case, so the alias is PascalCased while the
 * drawable resources keep the raw key. This is the only place that conversion
 * happens — the config plugin is handed the result rather than recomputing it,
 * so the manifest and the runtime can't drift apart.
 *
 * @param {string} key
 * @returns {string}
 */
function androidAliasSuffix(key) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Maps whatever the native module reports back to an icon key. iOS reports the
 * asset-catalog name (the key itself); Android reports the alias suffix. Keys
 * are lowercase and suffixes are PascalCase, so the two can't collide.
 *
 * @param {string} nativeName
 * @returns {string | null}
 */
function appIconKeyFromNativeName(nativeName) {
  const match = APP_ICON_SOURCES.find(
    (icon) =>
      icon.key === nativeName || androidAliasSuffix(icon.key) === nativeName,
  );

  return match ? match.key : null;
}

/** Props handed to plugins/withAppIcons.js from app.config.ts. */
const APP_ICON_PLUGIN_ICONS = APP_ICON_SOURCES.map((icon) => ({
  key: icon.key,
  aliasSuffix: androidAliasSuffix(icon.key),
  ios: icon.ios,
  androidForeground: icon.androidForeground,
  androidBackground: icon.androidBackground,
  androidBackgroundColor: icon.androidBackgroundColor,
}));

module.exports = {
  APP_ICON_AUTHORS,
  APP_ICON_SOURCES,
  APP_ICON_PLUGIN_ICONS,
  androidAliasSuffix,
  appIconKeyFromNativeName,
};
