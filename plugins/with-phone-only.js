const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Restrict the Android app to phones only — the Android counterpart to
 * `ios.supportsTablet: false`.
 *
 * There is no Expo config flag for this. Google Play uses
 * `android.hardware.telephony` as an install filter, so declaring it as a
 * required feature hides the app from / blocks install on Wi-Fi-only tablets
 * and other devices without telephony hardware.
 *
 * Caveat: this is a hardware filter, not a strict form-factor filter — a tablet
 * that does have cellular/telephony hardware can still install, and Wi-Fi-only
 * phones (rare) are excluded. For exact device control, also use Play Console's
 * device-catalog exclusions.
 */
const TELEPHONY = 'android.hardware.telephony';

const withPhoneOnly = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] || [];

    const exists = manifest['uses-feature'].some(
      (f) => f.$ && f.$['android:name'] === TELEPHONY
    );
    if (!exists) {
      manifest['uses-feature'].push({
        $: {
          'android:name': TELEPHONY,
          'android:required': 'true',
        },
      });
    }
    return cfg;
  });

module.exports = withPhoneOnly;
