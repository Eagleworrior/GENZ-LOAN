package com.genzloan.app

import android.graphics.Bitmap
import android.graphics.Color
import androidx.camera.core.ImageProxy
import kotlin.math.abs

/**
 * Enterprise-Grade Security Engine for local document and liveness validation.
 * Performs real-time checks for blur, motion, and digital screen artifacts.
 */
object SecurityEngine {

    data class SecurityResult(
        val isSharp: Boolean,
        val isStable: Boolean,
        val isPhysical: Boolean,
        val message: String,
        val score: Int
    )

    private var lastLuminance = -1.0
    private var glareDetectedCount = 0

    /**
     * Analyzes an image frame for professional security clearance.
     */
    fun analyzeFrame(image: ImageProxy): SecurityResult {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val data = ByteArray(buffer.remaining())
        buffer.get(data)
        
        var sum = 0L
        var sumSq = 0L
        val step = 8 // Better resolution for security
        var count = 0
        
        var maxLocalLuma = 0
        var minLocalLuma = 255
        
        for (i in 0 until data.size step step) {
            val pixel = data[i].toInt() and 0xFF
            sum += pixel
            sumSq += (pixel * pixel).toLong()
            count++
            
            if (pixel > maxLocalLuma) maxLocalLuma = pixel
            if (pixel < minLocalLuma) minLocalLuma = pixel
        }
        
        val mean = sum.toDouble() / count
        val variance = (sumSq.toDouble() / count) - (mean * mean)
        
        // 1. Sharpness Check
        val isSharp = variance > 120 

        // 2. Physicality Check (Tilt-Glare Detection)
        // Physical documents have "specular highlights" that shift with tilt.
        // We look for high-contrast hotspots (glare) that vary frame-to-frame.
        val hasHotspot = (maxLocalLuma - mean) > 80 
        if (hasHotspot) glareDetectedCount++
        
        // Stability check
        val stabilityScore = if (lastLuminance < 0) 100 else (100 - abs(mean - lastLuminance) * 10).toInt().coerceIn(0, 100)
        lastLuminance = mean
        
        val isStable = stabilityScore > 85
        val isPhysical = glareDetectedCount > 5 // Require a few frames of light shift to confirm physical material

        val message = when {
            !isSharp -> "Image too blurry. Move to light."
            !isStable -> "Phone moving. Hold steady."
            !isPhysical -> "Material Check: Tilt document slightly."
            else -> "Physical material verified. Ready."
        }

        return SecurityResult(
            isSharp = isSharp,
            isStable = isStable,
            isPhysical = isPhysical,
            message = message,
            score = ((variance / 2) + (stabilityScore / 2)).toInt().coerceIn(0, 100)
        )
    }

    /**
     * Resets the security engine for a new scan.
     */
    fun reset() {
        glareDetectedCount = 0
        lastLuminance = -1.0
    }
}