/* eslint-disable @typescript-eslint/no-require-imports -- Expo loads config plugins as CommonJS. */
const { withXcodeProject } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const TARGET_NAME = "OpenInHydra";
const BUNDLE_ID_SUFFIX = "open-in-hydra";
const EXTENSION_FILES = [
  "links.js",
  "content.js",
  "SafariWebExtensionHandler.swift",
  "Info.plist",
];
const RESOURCE_FILES = ["manifest.json", "links.js", "content.js", "config.js"];

module.exports = function withOpenInHydra(config, options = {}) {
  const host = String(options?.host || "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/.test(host)) {
    throw new Error(
      "Open in Hydra requires a DNS hostname without scheme, port or path.",
    );
  }
  config.ios ??= {};
  const bundleIdentifier = config.ios.bundleIdentifier;
  if (!bundleIdentifier) {
    throw new Error("Open in Hydra requires an iOS bundle identifier.");
  }
  config.ios.associatedDomains = [
    ...new Set([...(config.ios.associatedDomains || []), `applinks:${host}`]),
  ];
  config.extra = { ...config.extra, hydraLinkHost: host };
  // Declare signing metadata before prebuild, as Expo's share extension does.
  const eas = (config.extra.eas ??= {});
  const build = (eas.build ??= {});
  const experimental = (build.experimental ??= {});
  const ios = (experimental.ios ??= {});
  ios.appExtensions = [
    ...(ios.appExtensions || []).filter(
      (extension) => extension.targetName !== TARGET_NAME,
    ),
    {
      targetName: TARGET_NAME,
      bundleIdentifier: `${bundleIdentifier}.${BUNDLE_ID_SUFFIX}`,
      entitlements: {},
    },
  ];
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const root = mod.modRequest.projectRoot;
    const destination = path.join(
      mod.modRequest.platformProjectRoot,
      TARGET_NAME,
    );
    fs.mkdirSync(destination, { recursive: true });
    for (const file of EXTENSION_FILES) {
      fs.copyFileSync(
        path.join(root, "extensions/open-in-hydra", file),
        path.join(destination, file),
      );
    }
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "extensions/open-in-hydra/manifest.json"),
        "utf8",
      ),
    );
    for (const script of manifest.content_scripts) {
      script.exclude_matches = [`https://${host}/*`];
    }
    manifest.version = config.version || manifest.version;
    fs.writeFileSync(
      path.join(destination, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    fs.writeFileSync(
      path.join(destination, "config.js"),
      `const HYDRA_LINK_HOST = ${JSON.stringify(host)};\n`,
    );
    const targets = project.pbxNativeTargetSection();
    let uuid = Object.keys(targets).find(
      (key) => targets[key]?.name?.replace(/"/g, "") === TARGET_NAME,
    );
    if (!uuid) {
      uuid = project.addTarget(
        TARGET_NAME,
        "app_extension",
        TARGET_NAME,
        `${bundleIdentifier}.${BUNDLE_ID_SUFFIX}`,
      ).uuid;
      project.addBuildPhase(
        [`${TARGET_NAME}/SafariWebExtensionHandler.swift`],
        "PBXSourcesBuildPhase",
        "Sources",
        uuid,
      );
      const resources = RESOURCE_FILES.map((file) => `${TARGET_NAME}/${file}`);
      project.addBuildPhase(
        resources,
        "PBXResourcesBuildPhase",
        "Resources",
        uuid,
      );
      project.addBuildPhase([], "PBXFrameworksBuildPhase", "Frameworks", uuid);
      const group = project.addPbxGroup(
        [
          `${TARGET_NAME}/SafariWebExtensionHandler.swift`,
          `${TARGET_NAME}/Info.plist`,
          ...resources,
        ],
        TARGET_NAME,
      );
      // File references are relative to ios/, not a nested group directory.
      delete group.pbxGroup.path;
      project.addToPbxGroup(
        { fileRef: group.uuid, basename: TARGET_NAME },
        project.getFirstProject().firstProject.mainGroup,
      );
    }
    const target = targets[uuid];
    const list =
      project.pbxXCConfigurationList()[target.buildConfigurationList];
    const hostTarget = project.getFirstTarget().firstTarget;
    const hostList =
      project.pbxXCConfigurationList()[hostTarget.buildConfigurationList];
    for (const item of list.buildConfigurations) {
      const build = project.pbxXCBuildConfigurationSection()[item.value];
      const parent = hostList.buildConfigurations
        .map((ref) => project.pbxXCBuildConfigurationSection()[ref.value])
        .find((value) => value.name === build.name)?.buildSettings;
      Object.assign(build.buildSettings, {
        INFOPLIST_FILE: `${TARGET_NAME}/Info.plist`,
        PRODUCT_BUNDLE_IDENTIFIER: `"${bundleIdentifier}.${BUNDLE_ID_SUFFIX}"`,
        SWIFT_VERSION: "5.0",
        IPHONEOS_DEPLOYMENT_TARGET:
          parent?.IPHONEOS_DEPLOYMENT_TARGET || "15.1",
        TARGETED_DEVICE_FAMILY: '"1,2"',
        SDKROOT: "iphoneos",
        APPLICATION_EXTENSION_API_ONLY: "YES",
        CODE_SIGN_STYLE: "Automatic",
        MARKETING_VERSION: config.version || parent?.MARKETING_VERSION || "1.0",
        CURRENT_PROJECT_VERSION:
          config.ios.buildNumber || parent?.CURRENT_PROJECT_VERSION || "1",
        GENERATE_INFOPLIST_FILE: "NO",
      });
      if (parent?.DEVELOPMENT_TEAM)
        build.buildSettings.DEVELOPMENT_TEAM = parent.DEVELOPMENT_TEAM;
    }
    return mod;
  });
};
