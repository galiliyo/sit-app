package expo.modules.morningblock

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class BlockAccessibilityService : AccessibilityService() {

  companion object {
    fun isEnabled(context: Context): Boolean {
      val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
      val enabled = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_GENERIC)
      return enabled.any {
        it.resolveInfo.serviceInfo.packageName == context.packageName &&
          it.resolveInfo.serviceInfo.name == BlockAccessibilityService::class.java.name
      }
    }
  }

  private val overlayManager by lazy { BlockOverlayManager(this) }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val packageName = event.packageName?.toString() ?: return

    // Don't block our own app
    if (packageName == applicationContext.packageName) return

    val prefs = getSharedPreferences("morning_block", Context.MODE_PRIVATE)
    if (!prefs.getBoolean("enabled", false)) return
    if (prefs.getBoolean("unlockedToday", false)) return

    // Check time window
    val now = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
    val startTime = prefs.getString("startTime", "06:00") ?: "06:00"
    val endTime = prefs.getString("endTime", "09:00") ?: "09:00"
    if (now < startTime || now >= endTime) return

    // Check if this app is in the blocked list
    val blockedAppsJson = prefs.getString("blockedApps", "[]") ?: "[]"
    val blockedApps = JSONArray(blockedAppsJson)
    val blockedList = (0 until blockedApps.length()).map { blockedApps.getString(it) }
    if (packageName !in blockedList) return

    // Show the overlay
    val streakCount = prefs.getInt("streakCount", 0)
    val dismissMode = prefs.getString("dismissMode", "gentle") ?: "gentle"
    overlayManager.show(streakCount, dismissMode)
  }

  override fun onInterrupt() {}

  override fun onDestroy() {
    overlayManager.dismiss()
    super.onDestroy()
  }
}
