package `fun`.upup.musicfree.lyricUtil

import android.animation.ValueAnimator
import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.graphics.PixelFormat
import android.graphics.drawable.ColorDrawable
import android.hardware.SensorManager
import android.os.Build
import android.text.TextUtils
import android.text.TextPaint
import android.util.DisplayMetrics
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.OrientationEventListener
import android.view.View
import android.view.WindowManager
import android.view.animation.LinearInterpolator
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.HorizontalScrollView
import com.facebook.react.bridge.ReactContext

class LyricView(private val reactContext: ReactContext) : Activity(), View.OnTouchListener {

    private var windowManager: WindowManager? = null
    private var orientationEventListener: OrientationEventListener? = null
    private var layoutParams: WindowManager.LayoutParams? = null
    private var container: FrameLayout? = null
    private var tv: TextView? = null
    private var scrollAnimator: ValueAnimator? = null
    private var xPadding = 24
    private var yPadding = 12
    private var text = ""
    private var duration: Double = 0.0
    // 窗口信息
    private var windowWidth = 0.0
    private var windowHeight = 0.0
    private var widthPercent = 0.0
    private var leftPercent = 0.0
    private var topPercent = 0.0

    override fun onTouch(view: View, motionEvent: MotionEvent): Boolean {
        Log.d("touch", "Desktop Touch")
        return false
    }

    // 展示歌词窗口
    fun showLyricWindow(initText: String?, options: Map<String, Any>) {
        try {
            if (windowManager == null) {
                windowManager = reactContext.getSystemService(WINDOW_SERVICE) as WindowManager
                layoutParams = WindowManager.LayoutParams()

                val outMetrics = DisplayMetrics()
                windowManager?.defaultDisplay?.getMetrics(outMetrics)
                windowWidth = outMetrics.widthPixels.toDouble()
                windowHeight = outMetrics.heightPixels.toDouble()

                layoutParams?.type = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O)
                    WindowManager.LayoutParams.TYPE_SYSTEM_ALERT
                else
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY

                val topPercent = options["topPercent"]
                val leftPercent = options["leftPercent"]
                val align = options["align"]
                val color = options["color"]
                val backgroundColor = options["backgroundColor"]
                val widthPercent = options["widthPercent"]
                val fontSize = options["fontSize"]?.toString()?.toFloat() ?: 14f
                xPadding = fontSize.toInt() * 2
                yPadding = fontSize.toInt() / 2;
                this.widthPercent = widthPercent?.toString()?.toDouble() ?: 0.5

                layoutParams?.width = (this.widthPercent * windowWidth).toInt()
                layoutParams?.height = WindowManager.LayoutParams.WRAP_CONTENT
                layoutParams?.gravity = Gravity.TOP or Gravity.START

                this.leftPercent = leftPercent?.toString()?.toDouble() ?: 0.5
                layoutParams?.x = (this.leftPercent * (windowWidth - layoutParams!!.width)).toInt()
                layoutParams?.y = 0

                layoutParams?.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE

                layoutParams?.format = PixelFormat.TRANSPARENT


                tv = TextView(reactContext).apply {
                    text = initText ?: ""
                    textSize = fontSize?.toString()?.toFloat() ?: 14f
                    setTextColor(Color.parseColor(rgba2argb(color?.toString() ?: "#FFE9D2")))
                    setSingleLine(true)
                    gravity = align?.toString()?.toInt() ?: Gravity.CENTER

                    // layout_width = WRAP_CONTENT,实现TextView宽度与文本宽度一致
                    layoutParams = FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        gravity = Gravity.START // 为实现从左往右滚动，文本在TextView需要居左
                    }
                }

                container = HorizontalScrollView(reactContext).apply {
                    isHorizontalScrollBarEnabled = false  // 隐藏滚动条，美观
                    overScrollMode = View.OVER_SCROLL_NEVER  // 避免边缘弹性

                    val radius = 16f * resources.displayMetrics.density  // 转成像素，16dp

                    val shape = GradientDrawable().apply {
                        shape = GradientDrawable.RECTANGLE
                        setColor(Color.parseColor(rgba2argb(backgroundColor?.toString() ?: "#84888153")))
                        cornerRadius = 9999f // 最大圆角
                    }

                    background = shape
                    setPadding(xPadding, yPadding, xPadding, yPadding)
//                    setGravity(Gravity.START)
                    // 允许子 View 超出边界绘制（不裁剪）
//                    clipChildren = false
//                    clipToPadding = false  // 顺便关掉 padding 裁剪（如果有 padding 的话）

                    addView(tv)
                }

                windowManager?.addView(container, layoutParams)

                topPercent?.toString()?.toDouble()?.let { setTopPercent(it) }

                setText(initText ?: "", 0.0)
                listenOrientationChange()
            }
        } catch (e: Exception) {
            hideLyricWindow()
            throw e
        }
    }

    private var lastOrientation = -1
    private val ORIENTATION_PORTRAIT = 0
    private val ORIENTATION_LANDSCAPE = 1

    private fun listenOrientationChange() {
        if (windowManager == null) return

        if (orientationEventListener == null) {
            orientationEventListener = object : OrientationEventListener(reactContext, SensorManager.SENSOR_DELAY_NORMAL) {
                override fun onOrientationChanged(orientation: Int) {
                    if (windowManager == null) {
                        return
                    }
                    val currentOrientation = if (orientation in 45..135 || orientation in 225..315) {
                        ORIENTATION_LANDSCAPE
                    } else {
                        ORIENTATION_PORTRAIT
                    }
                    if (currentOrientation == lastOrientation) return
                    lastOrientation = currentOrientation

                    val outMetrics = DisplayMetrics()
                    windowManager?.defaultDisplay?.getMetrics(outMetrics)
                    val newWindowWidth = outMetrics.widthPixels.toDouble()
                    val newWindowHeight = outMetrics.heightPixels.toDouble()
                    if (newWindowWidth == windowWidth && newWindowHeight == windowHeight) return
                    windowWidth = newWindowWidth
                    windowHeight = newWindowHeight

                    layoutParams?.width = (widthPercent * windowWidth).toInt()
                    layoutParams?.x = (leftPercent * (windowWidth - layoutParams!!.width)).toInt()
                    layoutParams?.y = (topPercent * (windowHeight - (tv?.height ?: 0))).toInt()
                    windowManager?.updateViewLayout(container, layoutParams)
                }
            }
        }

        if (orientationEventListener?.canDetectOrientation() == true) {
            orientationEventListener?.enable()
        }
    }

    private fun unlistenOrientationChange() {
        orientationEventListener?.disable()
    }

    private fun rgba2argb(color: String): String {
        return if (color.length == 9) {
            color[0] + color.substring(7, 9) + color.substring(1, 7)
        } else {
            color
        }
    }

    fun hideLyricWindow() {
        scrollAnimator?.cancel()
        scrollAnimator = null

        if (windowManager != null) {
            container?.let {
                try {
                    windowManager?.removeView(it)
                } catch (e: Exception) {
                    // ignore
                }
            }
            container = null
            tv = null
            windowManager = null
            layoutParams = null
            unlistenOrientationChange()
        }
    }

    fun setText(text: String, duration: Double) {
        tv?.text = text
        this.text = text
        this.duration = duration
        scrollAnimator?.cancel()
        tv?.translationX = 0f

        tv?.post {
            val tvWidth = tv?.measuredWidth ?: 0
            val containerWidth = (container?.measuredWidth ?: 0) - 2 * xPadding
            tv?.minimumWidth = containerWidth // 必要，不然无法实现居中/居左

            val lp = tv?.layoutParams as? FrameLayout.LayoutParams ?: return@post

            if (tvWidth <= containerWidth || duration <= 0) {
                return@post
            }
            val scrollDistance = (tvWidth - containerWidth).toFloat()
            Log.d("LyricScroll", "启动滚动，距离=$scrollDistance, 时长=$duration s")

            var startEndDelay = 800L
            scrollAnimator = ValueAnimator.ofFloat(0f, -scrollDistance).apply {
                var animDuration = (duration * 1000 - 2 * startEndDelay).toLong().coerceIn(200L, 60000L)
                this.duration = animDuration
                interpolator = LinearInterpolator()

                startDelay = startEndDelay

                addUpdateListener { animation ->
                    tv?.translationX = animation.animatedValue as Float
                }
            }
            scrollAnimator?.start()
        }
    }

    fun setAlign(gravity: Int) {
        tv?.gravity = gravity
    }

    fun setTopPercent(pct: Double) {
        var percent = pct
        if (percent < 0.0) percent = 0.0
        if (percent > 1.0) percent = 1.0

        tv?.let {
            layoutParams?.y = (percent * (windowHeight - it.height)).toInt()
            windowManager?.updateViewLayout(container, layoutParams)
        }
        this.topPercent = percent
    }

    fun setLeftPercent(pct: Double) {
        var percent = pct
        if (percent < 0.0) percent = 0.0
        if (percent > 1.0) percent = 1.0

        tv?.let {
            layoutParams?.x = (percent * (windowWidth - layoutParams!!.width)).toInt()
            windowManager?.updateViewLayout(container, layoutParams)
        }
        this.leftPercent = percent
    }

    fun setColors(textColor: String?, backgroundColor: String?) {
        tv?.let {
            textColor?.let { color -> it.setTextColor(Color.parseColor(rgba2argb(color))) }
        }
        container?.background?.let { drawable ->
            backgroundColor?.let { colorStr ->
                if (drawable is GradientDrawable) {
                    val argb = Color.parseColor(rgba2argb(colorStr))
                    drawable.setColor(argb)
                }
            }
        }
    }

    fun setWidth(pct: Double) {
        var percent = pct
        if (percent < 0.3) percent = 0.3
        if (percent > 1.0) percent = 1.0

        tv?.let {
            val width = (percent * windowWidth).toInt()
            val originalWidth = layoutParams?.width ?: 0

            var newX = if (width <= originalWidth) {
                layoutParams!!.x + (originalWidth - width) / 2
            } else {
                layoutParams!!.x - (width - originalWidth) / 2
            }

            val maxX = (windowWidth - width).toInt()
            if (newX < 0) newX = 0
            if (newX > maxX) newX = maxX

            layoutParams?.x = newX
            layoutParams?.width = width
            windowManager?.updateViewLayout(container, layoutParams)
        }
        this.widthPercent = percent
        this.setText(this.text, this.duration)
    }

    fun setFontSize(fontSize: Float) {
        tv?.textSize = fontSize
        xPadding = fontSize.toInt() * 2
        yPadding = fontSize.toInt() / 2;
        container?.let {
            it.setPadding(xPadding, yPadding, xPadding, yPadding)
        }
    }
}
