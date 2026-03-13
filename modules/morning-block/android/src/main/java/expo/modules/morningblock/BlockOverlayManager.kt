package expo.modules.morningblock

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Build
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

class BlockOverlayManager(private val context: Context) {

  private var overlayView: View? = null
  private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

  private val dismissPhrases = listOf(
    "I choose to scroll",
    "I'll scroll instead",
    "Not sitting today",
    "Skip the sit",
    "I'd rather scroll",
    "Scrolling over sitting",
    "More scrolling please",
    "Still in bed",
  )

  fun show(streakCount: Int, dismissMode: String) {
    if (overlayView != null) return // already showing

    val layout = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(Color.parseColor("#0a0a0a"))
      setPadding(80, 0, 80, 0)
    }

    // "Be still." title
    val title = TextView(context).apply {
      text = "Be still."
      setTextColor(Color.parseColor("#e8e4de"))
      textSize = 28f
      gravity = Gravity.CENTER
      typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
    }
    layout.addView(title)

    // Subtitle
    val subtitle = TextView(context).apply {
      text = "Your morning sit\nis waiting"
      setTextColor(0x55e8e4de.toInt())
      textSize = 16f
      gravity = Gravity.CENTER
      setPadding(0, 24, 0, 32)
    }
    layout.addView(subtitle)

    // Streak
    if (streakCount > 0) {
      val streak = TextView(context).apply {
        text = "\u25CF $streakCount day streak"
        setTextColor(0x77e8e4de.toInt())
        textSize = 14f
        gravity = Gravity.CENTER
        setPadding(0, 0, 0, 40)
      }
      layout.addView(streak)
    }

    // "Open Sit" button
    val openBtn = Button(context).apply {
      text = "Open Sit"
      setTextColor(Color.parseColor("#cc8c28"))
      setBackgroundColor(Color.TRANSPARENT)
      textSize = 16f
      setPadding(48, 24, 48, 24)
      setOnClickListener {
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        if (intent != null) {
          intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
          context.startActivity(intent)
        }
        dismiss()
      }
    }
    layout.addView(openBtn)

    // Firm mode: type to dismiss
    if (dismissMode == "firm") {
      val phrase = dismissPhrases.random()

      val firmLabel = TextView(context).apply {
        text = "Or type to dismiss:"
        setTextColor(Color.parseColor("#737373"))
        textSize = 12f
        gravity = Gravity.CENTER
        setPadding(0, 48, 0, 8)
      }
      layout.addView(firmLabel)

      val phraseLabel = TextView(context).apply {
        text = "\"$phrase\""
        setTextColor(Color.parseColor("#737373"))
        textSize = 14f
        gravity = Gravity.CENTER
        setPadding(0, 0, 0, 12)
        typeface = Typeface.create("sans-serif", Typeface.ITALIC)
      }
      layout.addView(phraseLabel)

      val input = EditText(context).apply {
        setTextColor(Color.parseColor("#e8e4de"))
        setHintTextColor(Color.parseColor("#737373"))
        hint = "Type the phrase above..."
        textSize = 14f
        setBackgroundColor(Color.parseColor("#1f1f1f"))
        setPadding(32, 24, 32, 24)
        addTextChangedListener(object : TextWatcher {
          override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
          override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
          override fun afterTextChanged(s: Editable?) {
            if (s?.toString()?.trim()?.equals(phrase, ignoreCase = true) == true) {
              dismiss()
            }
          }
        })
      }
      layout.addView(input)
    } else {
      // Gentle mode: tap anywhere to dismiss
      layout.setOnClickListener { dismiss() }
    }

    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      else
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.OPAQUE
    )

    // For firm mode, we need focusable for the EditText
    if (dismissMode == "firm") {
      params.flags = WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
    }

    overlayView = layout
    windowManager.addView(layout, params)
  }

  fun dismiss() {
    overlayView?.let {
      try {
        windowManager.removeView(it)
      } catch (_: Exception) {}
      overlayView = null
    }
  }
}
