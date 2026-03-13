package expo.modules.morningblock

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class MorningBlockModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MorningBlock")

    Function("configure") { configJson: String ->
      val context = appContext.reactContext ?: return@Function
      val config = JSONObject(configJson)
      val prefs = context.getSharedPreferences("morning_block", Context.MODE_PRIVATE)
      prefs.edit()
        .putBoolean("enabled", config.optBoolean("enabled", false))
        .putString("startTime", config.optString("startTime", "06:00"))
        .putString("endTime", config.optString("endTime", "09:00"))
        .putString("dismissMode", config.optString("dismissMode", "gentle"))
        .putString("blockedApps", config.optJSONArray("blockedApps")?.toString() ?: "[]")
        .putBoolean("unlockedToday", config.optBoolean("unlockedToday", false))
        .putInt("streakCount", config.optInt("streakCount", 0))
        .apply()
    }

    Function("unlockForToday") {
      val context = appContext.reactContext ?: return@Function
      val prefs = context.getSharedPreferences("morning_block", Context.MODE_PRIVATE)
      prefs.edit().putBoolean("unlockedToday", true).apply()
    }

    AsyncFunction("isAccessibilityEnabled") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      BlockAccessibilityService.isEnabled(context)
    }

    Function("openAccessibilitySettings") {
      val context = appContext.reactContext ?: return@Function
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
      context.startActivity(intent)
    }

    AsyncFunction("isOverlayEnabled") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Settings.canDrawOverlays(context)
      } else {
        true
      }
    }

    Function("requestOverlayPermission") {
      val context = appContext.reactContext ?: return@Function
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val intent = Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:${context.packageName}")
        )
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(intent)
      }
    }
  }
}
