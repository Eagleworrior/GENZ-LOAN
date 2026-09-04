package com.genzloan.app

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View

class KYCOverlay(context: Context, attrs: AttributeSet?) : View(context, attrs) {

    private val maskPaint = Paint().apply {
        color = Color.parseColor("#99000000") // Semi-transparent black
        style = Paint.Style.FILL
    }

    private val borderPaint = Paint().apply {
        color = Color.parseColor("#00ff88") // Accent color
        style = Paint.Style.STROKE
        strokeWidth = 8f
        isAntiAlias = true
    }

    private var mode = "DOCUMENT"

    fun setMode(mode: String) {
        this.mode = mode
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val width = width.toFloat()
        val height = height.toFloat()

        // Full screen mask
        canvas.drawRect(0f, 0f, width, height, maskPaint)

        if (mode == "SELFIE") {
            // Draw Circle for face
            val radius = width * 0.35f
            val centerX = width / 2
            val centerY = height / 2.2f
            
            val path = Path().apply {
                addCircle(centerX, centerY, radius, Path.Direction.CW)
            }
            canvas.drawPath(path, Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR) })
            canvas.drawCircle(centerX, centerY, radius, borderPaint)
        } else {
            // Draw Rectangle for document
            val rectWidth = width * 0.85f
            val rectHeight = rectWidth * 0.63f // ID Card ratio
            val left = (width - rectWidth) / 2
            val top = (height - rectHeight) / 2.2f
            val rect = RectF(left, top, left + rectWidth, top + rectHeight)
            
            canvas.drawRect(rect, Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR) })
            canvas.drawRoundRect(rect, 20f, 20f, borderPaint)
        }
        
        // Important: Hardware acceleration might need to be enabled for CLEAR mode to work correctly on some versions
        setLayerType(LAYER_TYPE_SOFTWARE, null)
    }
}