const { withAndroidManifest } = require("expo/config-plugins");

function withMorningBlock(config) {
  config = withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    // Add SYSTEM_ALERT_WINDOW permission
    const permissions = manifest.manifest["uses-permission"] || [];
    if (!permissions.find((p) => p.$?.["android:name"] === "android.permission.SYSTEM_ALERT_WINDOW")) {
      permissions.push({
        $: { "android:name": "android.permission.SYSTEM_ALERT_WINDOW" },
      });
    }
    manifest.manifest["uses-permission"] = permissions;

    // Declare the AccessibilityService
    const services = app.service || [];
    const serviceName = "expo.modules.morningblock.BlockAccessibilityService";
    if (!services.find((s) => s.$?.["android:name"] === serviceName)) {
      services.push({
        $: {
          "android:name": serviceName,
          "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
          "android:exported": "false",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.accessibilityservice.AccessibilityService" } },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.accessibilityservice",
              "android:resource": "@xml/accessibility_service_config",
            },
          },
        ],
      });
    }
    app.service = services;

    return config;
  });

  return config;
}

module.exports = withMorningBlock;
