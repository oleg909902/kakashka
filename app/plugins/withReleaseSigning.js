/**
 * Signs release builds with the upload key instead of the debug key.
 * The key lives outside the repo; its location and passwords come from
 * ~/.gradle/gradle.properties:
 *   FUNNY_POOPS_STORE_FILE=/home/you/keystores/funny-poops-upload.jks
 *   FUNNY_POOPS_STORE_PASSWORD=...
 *   FUNNY_POOPS_KEY_ALIAS=upload
 *   FUNNY_POOPS_KEY_PASSWORD=...
 * Without them the release build falls back to the debug key.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_CONFIG = `
        release {
            if (project.hasProperty('FUNNY_POOPS_STORE_FILE')) {
                storeFile file(FUNNY_POOPS_STORE_FILE)
                storePassword FUNNY_POOPS_STORE_PASSWORD
                keyAlias FUNNY_POOPS_KEY_ALIAS
                keyPassword FUNNY_POOPS_KEY_PASSWORD
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (!gradle.includes('FUNNY_POOPS_STORE_FILE')) {
      // Add a release signing config next to the debug one
      gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${RELEASE_CONFIG}`);
      // Use it in the release build type
      gradle = gradle.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
        "$1signingConfig project.hasProperty('FUNNY_POOPS_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
      );
    }
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
