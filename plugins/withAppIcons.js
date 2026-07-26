/**
 * Generates Hydra's alternate app icons at prebuild time.
 *
 * iOS: writes one <key>.appiconset per icon into the asset catalog and lists the
 * keys in ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES. The catalog names are
 * the icon keys verbatim and must stay that way — see constants/appIcons.js.
 *
 * Android: generates adaptive + legacy launcher assets per DPI, then registers
 * one activity-alias per icon plus a "Default" alias for the stock icon.
 * MainActivity keeps its deep-link and share intent filters and is never
 * disabled; only aliases are toggled at runtime. Disabling MainActivity would
 * disable its intent filters too, which is what breaks hydra:// links and the
 * Android share sheet.
 */
const {
  compositeImagesAsync,
  generateImageAsync,
  jimpAsync,
} = require("@expo/image-utils");
const {
  AndroidConfig,
  IOSConfig,
  withAndroidColors,
  withAndroidManifest,
  withDangerousMod,
  withXcodeProject,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/** Kept in sync with DEFAULT_ALIAS in the native Android module. */
const DEFAULT_ALIAS_SUFFIX = "Default";
const ALTERNATE_APP_ICONS_BUILD_PROPERTY =
  "ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES";
const ANDROID_RES_PATH = "android/app/src/main/res";
const ADAPTIVE_ICON_BASELINE_PX = 108;
const IOS_ICON_PX = 1024;
const DPI_SCALES = {
  mdpi: 1,
  hdpi: 1.5,
  xhdpi: 2,
  xxhdpi: 3,
  xxxhdpi: 4,
};
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

module.exports = function withAppIcons(config, props) {
  const icons = (props && props.icons) || [];

  if (!icons.length) return config;

  validateIcons(config, icons);

  config = withIosAppIconSets(config, icons);
  config = withIosAlternateIconNames(config, icons);
  config = withAndroidIconAssets(config, icons);
  config = withAndroidIconColors(config, icons);
  config = withAndroidActivityAliases(config, icons);

  return config;
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateIcons(config, icons) {
  const projectRoot =
    (config._internal && config._internal.projectRoot) || process.cwd();
  const seen = new Set();

  for (const icon of icons) {
    const label = `app icon "${icon.key}"`;

    if (!/^[a-z][a-z0-9_]*$/.test(icon.key)) {
      throw new Error(
        `Invalid ${label}: keys must be lowercase snake_case so they are valid as both an iOS asset catalog name and an Android resource name.`,
      );
    }
    if (icon.aliasSuffix === DEFAULT_ALIAS_SUFFIX) {
      throw new Error(
        `Invalid ${label}: "${DEFAULT_ALIAS_SUFFIX}" is reserved for the stock icon's activity alias.`,
      );
    }
    if (!/^[A-Z][A-Za-z0-9]*$/.test(icon.aliasSuffix || "")) {
      throw new Error(
        `Invalid ${label}: aliasSuffix must be PascalCase (got "${icon.aliasSuffix}").`,
      );
    }
    if (seen.has(icon.key)) {
      throw new Error(`Duplicate ${label}.`);
    }
    seen.add(icon.key);

    if (
      Boolean(icon.androidBackground) === Boolean(icon.androidBackgroundColor)
    ) {
      throw new Error(
        `Invalid ${label}: set exactly one of androidBackground or androidBackgroundColor.`,
      );
    }

    for (const source of [
      icon.ios,
      icon.androidForeground,
      icon.androidBackground,
    ]) {
      if (source) assertSquarePng(projectRoot, source, label);
    }
  }
}

function assertSquarePng(projectRoot, source, label) {
  const file = path.resolve(projectRoot, source);

  if (!fs.existsSync(file)) {
    throw new Error(`Missing image for ${label}: ${source} does not exist.`);
  }

  const size = readPngSize(file);

  if (!size) {
    throw new Error(`Invalid image for ${label}: ${source} is not a PNG.`);
  }
  if (size.width !== size.height) {
    throw new Error(
      `Invalid image for ${label}: ${source} is ${size.width}x${size.height}, but app icons must be square.`,
    );
  }
}

/** Reads width/height out of a PNG's IHDR chunk without decoding the image. */
function readPngSize(file) {
  const header = Buffer.alloc(24);
  const descriptor = fs.openSync(file, "r");

  try {
    fs.readSync(descriptor, header, 0, header.length, 0);
  } finally {
    fs.closeSync(descriptor);
  }

  if (!header.subarray(0, 8).equals(PNG_SIGNATURE)) return null;

  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

/* -------------------------------------------------------------------------- */
/* iOS                                                                        */
/* -------------------------------------------------------------------------- */

function withIosAppIconSets(config, icons) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const { projectRoot } = config.modRequest;
      const catalogPath = path.join(
        projectRoot,
        "ios",
        IOSConfig.XcodeUtils.getProjectName(projectRoot),
        "Images.xcassets",
      );

      for (const icon of icons) {
        const iconSetPath = path.join(catalogPath, `${icon.key}.appiconset`);
        const filename = path.basename(icon.ios);
        const source = path.join(projectRoot, icon.ios);

        const image = await jimpAsync(
          { input: source, originalInput: source },
          [
            {
              operation: "resize",
              fit: "cover",
              width: IOS_ICON_PX,
              height: IOS_ICON_PX,
            },
          ],
        );

        await fs.promises.mkdir(iconSetPath, { recursive: true });
        await fs.promises.writeFile(path.join(iconSetPath, filename), image);
        await fs.promises.writeFile(
          path.join(iconSetPath, "Contents.json"),
          JSON.stringify(
            {
              images: [
                {
                  filename,
                  idiom: "universal",
                  platform: "ios",
                  size: `${IOS_ICON_PX}x${IOS_ICON_PX}`,
                },
              ],
              info: { author: "expo", version: 1 },
            },
            null,
            2,
          ),
          "utf-8",
        );
      }

      return config;
    },
  ]);
}

function withIosAlternateIconNames(config, icons) {
  return withXcodeProject(config, (config) => {
    config.modResults.updateBuildProperty(
      ALTERNATE_APP_ICONS_BUILD_PROPERTY,
      icons.map((icon) => icon.key),
    );

    return config;
  });
}

/* -------------------------------------------------------------------------- */
/* Android                                                                    */
/* -------------------------------------------------------------------------- */

function withAndroidIconAssets(config, icons) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const { projectRoot } = config.modRequest;

      for (const icon of icons) {
        await generateAndroidIconLayers(projectRoot, icon);
        await writeAdaptiveIconXml(projectRoot, icon);
      }

      return config;
    },
  ]);
}

async function generateAndroidIconLayers(projectRoot, icon) {
  for (const [dpi, scale] of Object.entries(DPI_SCALES)) {
    const size = Math.round(ADAPTIVE_ICON_BASELINE_PX * scale);
    const dpiPath = path.join(projectRoot, ANDROID_RES_PATH, `mipmap-${dpi}`);

    await fs.promises.mkdir(dpiPath, { recursive: true });

    // Adaptive foreground: artwork on transparency, masked by the launcher.
    const foreground = await resizeLayer(projectRoot, {
      src: icon.androidForeground,
      cacheType: `app-icons-foreground-${icon.key}`,
      size,
      backgroundColor: "transparent",
    });
    await fs.promises.writeFile(
      path.join(dpiPath, `ic_launcher_foreground_${icon.key}.png`),
      foreground,
    );

    // Legacy square icon for API 25 and below, which ignores adaptive icons.
    let legacy;

    if (icon.androidBackground) {
      const background = await resizeLayer(projectRoot, {
        src: icon.androidBackground,
        cacheType: `app-icons-background-${icon.key}`,
        size,
        backgroundColor: "transparent",
      });
      await fs.promises.writeFile(
        path.join(dpiPath, `ic_launcher_background_${icon.key}.png`),
        background,
      );
      legacy = await compositeImagesAsync({ foreground, background });
    } else {
      legacy = await resizeLayer(projectRoot, {
        src: icon.androidForeground,
        cacheType: `app-icons-legacy-${icon.key}`,
        size,
        backgroundColor: icon.androidBackgroundColor,
      });
    }

    await fs.promises.writeFile(
      path.join(dpiPath, `ic_launcher_${icon.key}.png`),
      legacy,
    );
  }
}

async function resizeLayer(
  projectRoot,
  { src, cacheType, size, backgroundColor },
) {
  const { source } = await generateImageAsync(
    { projectRoot, cacheType },
    {
      src,
      width: size,
      height: size,
      resizeMode: "cover",
      backgroundColor,
    },
  );

  return source;
}

async function writeAdaptiveIconXml(projectRoot, icon) {
  const anyDpiPath = path.join(
    projectRoot,
    ANDROID_RES_PATH,
    "mipmap-anydpi-v26",
  );
  const background = icon.androidBackground
    ? `@mipmap/ic_launcher_background_${icon.key}`
    : `@color/icon_background_${icon.key}`;

  await fs.promises.mkdir(anyDpiPath, { recursive: true });
  await fs.promises.writeFile(
    path.join(anyDpiPath, `ic_launcher_${icon.key}.xml`),
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="${background}"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground_${icon.key}"/>
</adaptive-icon>
`,
    "utf-8",
  );
}

function withAndroidIconColors(config, icons) {
  const colorBackedIcons = icons.filter((icon) => !icon.androidBackground);

  if (!colorBackedIcons.length) return config;

  return withAndroidColors(config, (config) => {
    for (const icon of colorBackedIcons) {
      config.modResults = AndroidConfig.Colors.assignColorValue(
        config.modResults,
        {
          name: `icon_background_${icon.key}`,
          value: icon.androidBackgroundColor,
        },
      );
    }

    return config;
  });
}

function withAndroidActivityAliases(config, icons) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      config.modResults,
    );

    // Hand the launcher entry over to the aliases. MainActivity keeps every
    // other filter it was given (hydra:// links, expo-sharing's ACTION_SEND) and
    // stays enabled for good, so switching icons can't take them down with it.
    mainActivity["intent-filter"] = (
      mainActivity["intent-filter"] ?? []
    ).filter((intentFilter) => !isLauncherIntentFilter(intentFilter));

    // The stock icon. Enabled in the manifest, so it is the launcher entry on a
    // fresh install; it carries no android:icon so it inherits the application
    // icon. Unlike MainActivity, it is safe to disable.
    upsertActivityAlias(mainApplication, {
      suffix: DEFAULT_ALIAS_SUFFIX,
      enabled: true,
    });

    for (const icon of icons) {
      upsertActivityAlias(mainApplication, {
        suffix: icon.aliasSuffix,
        enabled: false,
        icon: `@mipmap/ic_launcher_${icon.key}`,
      });
    }

    return config;
  });
}

function upsertActivityAlias(mainApplication, { suffix, enabled, icon }) {
  const name = `.MainActivity${suffix}`;
  const activityAlias = {
    $: {
      "android:name": name,
      "android:enabled": String(enabled),
      "android:exported": "true",
      ...(icon ? { "android:icon": icon } : {}),
      "android:targetActivity": ".MainActivity",
    },
    // Launcher entry only. Everything else stays on MainActivity so there is
    // exactly one component resolving each deep link and share intent.
    "intent-filter": [
      {
        action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
        category: [
          { $: { "android:name": "android.intent.category.LAUNCHER" } },
        ],
      },
    ],
  };

  const aliases = mainApplication["activity-alias"] ?? [];
  const existing = aliases.findIndex(
    (alias) => alias.$?.["android:name"] === name,
  );

  if (existing >= 0) aliases[existing] = activityAlias;
  else aliases.push(activityAlias);

  mainApplication["activity-alias"] = aliases;
}

function isLauncherIntentFilter(intentFilter) {
  const isMain = (intentFilter.action ?? []).some(
    (action) => action.$?.["android:name"] === "android.intent.action.MAIN",
  );
  const isLauncher = (intentFilter.category ?? []).some(
    (category) =>
      category.$?.["android:name"] === "android.intent.category.LAUNCHER",
  );

  return isMain && isLauncher;
}
