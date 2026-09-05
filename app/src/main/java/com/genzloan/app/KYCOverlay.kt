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
    private var status = "RED" // RED, YELLOW, GREEN

    fun setMode(mode: String) {
        this.mode = mode
        invalidate()
    }

    fun setStatus(status: String) {
        this.status = status
        borderPaint.color = when(status) {
            "GREEN" -> Color.parseColor("#00ff88")
            "YELLOW" -> Color.parseColor("#f3ff00")
            else -> Color.parseColor("#ff00ff")
        }
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
            val radius = width * 0.38f
            val centerX = width / 2
            val centerY = height / 2.2f
            
            val path = Path().apply {
                addCircle(centerX, centerY, radius, Path.Direction.CW)
            }
            canvas.drawPath(path, Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR) })
            
            // Draw dotted/scanning ring
            canvas.drawCircle(centerX, centerY, radius, borderPaint)
            
            // Add a "Secure scanning" pulse if yellow
            if (status == "YELLOW") {
                val pulsePaint = Paint(borderPaint).apply { alpha = 100; strokeWidth = 2f }
                canvas.drawCircle(centerX, centerY, radius + 20f, pulsePaint)
            }
        } else {
            // Draw Rectangle for document
            val rectWidth = width * 0.90f
            val rectHeight = rectWidth * 0.64f
            val left = (width - rectWidth) / 2
            val top = (height - rectHeight) / 2.2f
            val rect = RectF(left, top, left + rectWidth, top + rectHeight)
            
            canvas.drawRect(rect, Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR) })
            canvas.drawRoundRect(rect, 30f, 30f, borderPaint)
        }
        
        setLayerType(LAYER_TYPE_SOFTWARE, null)
    }
}