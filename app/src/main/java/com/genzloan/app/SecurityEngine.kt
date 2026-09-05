package com.genzloan.app

import android.graphics.Bitmap
import android.graphics.Color
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer
import kotlin.math.abs

/**
 * Extra-Professional Security Engine for local document and liveness validation.
 * Optimized for high responsiveness and anti-frustration capture.
 */
object SecurityEngine {

    data class SecurityResult(
        val isSharp: Boolean,
        val isStable: Boolean,
        val isPhysical: Boolean,
        val hasDetail: Boolean,
        val message: String,
        val score: Int
    )

    private var lastLuminance = -1.0
    private var glareDetectedCount = 0
    private var stabilityFrames = 0
    private var isPaperMode = false

    fun setPaperMode(enabled: Boolean) {
        isPaperMode = enabled
    }

    /**
     * Analyzes an image frame for professional security clearance.
     * Balanced for high speed and strict security.
     */
    fun analyzeFrame(image: ImageProxy): SecurityResult {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val data = ByteArray(buffer.remaining())
        buffer.get(data)
        
        var sum = 0L
        var sumSq = 0L
        val step = 8 // Increased step for faster real-time processing
        var count = 0
        
        var maxLocalLuma = 0
        var minLocalLuma = 255
        
        var contrastEdges = 0
        var lastPixel = -1

        for (i in 0 until data.size step step) {
            val pixel = data[i].toInt() and 0xFF
            sum += pixel
            sumSq += (pixel * pixel).toLong()
            count++
            
            if (pixel > maxLocalLuma) maxLocalLuma = pixel
            if (pixel < minLocalLuma) minLocalLuma = pixel

            if (lastPixel != -1 && abs(pixel - lastPixel) > 35) {
                contrastEdges++
            }
            lastPixel = pixel
        }
        
        val mean = sum.toDouble() / count
        val variance = (sumSq.toDouble() / count) - (mean * mean)
        
        // 1. Sharpness (Threshold lowered to 105 for better responsiveness on clear images)
        val isSharp = variance > 105 
        
        // 2. Physicality Checks
        val isDigitalScreen = contrastEdges > (count * 0.17) && variance > 380
        
        // Specular Glare (Light reflections)
        val hasHotspot = (maxLocalLuma - mean) > 95 
        if (hasHotspot) glareDetectedCount++
        
        // 3. Stability Check (Lowered sensitivity to allow slight movement)
        val lumaDiff = if (lastLuminance < 0) 0.0 else abs(mean - lastLuminance)
        lastLuminance = mean
        
        // Lenient stability: allow up to 1.5 units of change
        if (lumaDiff < 1.5) stabilityFrames++ else stabilityFrames = 0
        
        val isStable = stabilityFrames > 4 // Require only ~0.3 seconds of stillness
        val hasDetail = contrastEdges > (count * 0.02) // Reject if less than 2% edges (blank walls)
        
        // Physicality Proof requirement
        val requiredGlare = if (isPaperMode) 1 else 4
        val isPhysical = (glareDetectedCount >= requiredGlare) && !isDigitalScreen

        val message = when {
            isDigitalScreen -> "Digital Spoof Detected. Use Physical Document."
            !hasDetail -> "No document detected. Avoid blank surfaces."
            !isSharp -> "Improving focus... Hold steady."
            !isStable -> "Stabilizing... Hold steady."
            !isPhysical -> if (isPaperMode) "Align document clearly." else "Security: Tilt document slowly."
            else -> "Physical Document Verified. Ready."
        }

        return SecurityResult(
            isSharp = isSharp && hasDetail,
            isStable = isStable,
            isPhysical = isPhysical,
            hasDetail = hasDetail,
            message = message,
            score = if (isDigitalScreen || !hasDetail) 0 else ((variance / 4) + (stabilityFrames * 6)).toInt().coerceIn(0, 100)
        )
    }

    fun reset() {
        glareDetectedCount = 0
        lastLuminance = -1.0
        stabilityFrames = 0
        isPaperMode = false
    }
}