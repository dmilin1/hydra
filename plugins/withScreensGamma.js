/**
 * Builds react-native-screens with its experimental ("gamma") components.
 * Hydra needs ScrollViewMarker from them: it tells the iOS 26 tab bar which
 * list to watch for minimize-on-scroll. Without the flag the marker is an
 * unregistered stub and rendering it crashes, so the env var has to be set
 * before `pod install` reads RNScreens.podspec.
 */
const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const LINE = "ENV['RNS_GAMMA_ENABLED'] = '1'";

module.exports = function withScreensGamma(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfile = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      const contents = fs.readFileSync(podfile, "utf8");
      if (!contents.includes(LINE)) {
        fs.writeFileSync(podfile, `${LINE}\n${contents}`);
      }
      return config;
    },
  ]);
};
