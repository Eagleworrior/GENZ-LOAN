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
    private var docType = "ID"

    fun setMode(mode: String) {
        this.mode = mode
        invalidate()
    }

    fun setDocType(docName: String) {
        // Detect if the document is a card or a full page document
        val cardKeywords = listOf("id", "passport", "licence", "permit", "alien", "card")
        docType = if (cardKeywords.any { docName.lowercase().contains(it) }) "ID" else "PAPER"
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
            // Circle for face
            val radius = width * 0.38f
            val centerX = width / 2
            val centerY = height / 2.2f
            
            val path = Path().apply {
                addCircle(centerX, centerY, radius, Path.Direction.CW)
            }
            canvas.drawPath(path, Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR) })
            canvas.drawCircle(centerX, centerY, radius, borderPaint)
        } else {
            // Dynamic Rectangle for document
            val rectWidth: Float
            val rectHeight: Float
            
            if (docType == "ID") {
                // Card Ratio (standard ID card)
                rectWidth = width * 0.88f
                rectHeight = rectWidth * 0.63f
            } else {
                // Paper Ratio (Utility bill / Bank Statement - Taller box)
                rectWidth = width * 0.85f
                rectHeight = rectWidth * 1.25f 
            }

            val left = (width - rectWidth) / 2
            val top = (height - rectHeight) / 2.2f
            val rect = RectF(left, top, left + rectWidth, top + rectHeight)
            
            canvas.drawRect(rect, Paint().apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR) })
            canvas.drawRoundRect(rect, 30f, 30f, borderPaint)
            
            // Professional Corner Brackets
            drawCornerBrackets(canvas, rect)
        }
        
        setLayerType(LAYER_TYPE_SOFTWARE, null)
    }

    private fun drawCornerBrackets(canvas: Canvas, rect: RectF) {
        val length = 60f
        val p = Paint(borderPaint).apply { strokeWidth = 14f }
        
        // Top Left
        canvas.drawLine(rect.left, rect.top, rect.left + length, rect.top, p)
        canvas.drawLine(rect.left, rect.top, rect.left, rect.top + length, p)
        
        // Top Right
        canvas.drawLine(rect.right, rect.top, rect.right - length, rect.top, p)
        canvas.drawLine(rect.right, rect.top, rect.right, rect.top + length, p)
        
        // Bottom Left
        canvas.drawLine(rect.left, rect.bottom, rect.left + length, rect.bottom, p)
        canvas.drawLine(rect.left, rect.bottom, rect.left, rect.bottom - length, p)
        
        // Bottom Right
        canvas.drawLine(rect.right, rect.bottom, rect.right - length, rect.bottom, p)
        canvas.drawLine(rect.right, rect.bottom, rect.right, rect.bottom - length, p)
    }
}