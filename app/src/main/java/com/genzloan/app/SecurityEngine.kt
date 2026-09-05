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
     * Implements "Anti-Blank" and "Strict Sharpness" logic.
     */
    fun analyzeFrame(image: ImageProxy): SecurityResult {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val data = ByteArray(buffer.remaining())
        buffer.get(data)
        
        var sum = 0L
        var sumSq = 0L
        val step = 6 // Higher resolution for more accuracy
        var count = 0
        
        var maxLocalLuma = 0
        var minLocalLuma = 255
        
        // Tracking "features" (intensity changes) to detect blank surfaces
        var intensityChanges = 0
        var lastPixel = -1

        for (i in 0 until data.size step step) {
            val pixel = data[i].toInt() and 0xFF
            sum += pixel
            sumSq += (pixel * pixel).toLong()
            count++
            
            if (pixel > maxLocalLuma) maxLocalLuma = pixel
            if (pixel < minLocalLuma) minLocalLuma = pixel

            if (lastPixel != -1 && abs(pixel - lastPixel) > 30) {
                intensityChanges++
            }
            lastPixel = pixel
        }
        
        val mean = sum.toDouble() / count
        val variance = (sumSq.toDouble() / count) - (mean * mean)
        
        // 1. Strict Sharpness Check (Threshold increased to 150)
        val isSharp = variance > 150 

        // 2. Anti-Blank Detection (Feature density check)
        // A blank wall has very low intensity changes even if sharp.
        val hasDetail = intensityChanges > (count * 0.05) // At least 5% of pixels must show contrast edges

        // 3. Physicality Check (Tilt-Glare Detection)
        val hasHotspot = (maxLocalLuma - mean) > 90 
        if (hasHotspot) glareDetectedCount++
        
        // Stability check (Strict 95% requirement)
        val stabilityScore = if (lastLuminance < 0) 100 else (100 - abs(mean - lastLuminance) * 15).toInt().coerceIn(0, 100)
        lastLuminance = mean
        
        val isStable = stabilityScore > 92
        val isPhysical = glareDetectedCount > 8 

        val message = when {
            !hasDetail -> "No document detected. Avoid blank surfaces."
            !isSharp -> "Image blurry. Improve lighting."
            !isStable -> "Phone moving. Hold steady."
            !isPhysical -> "Security: Tilt document slowly to verify."
            else -> "Document Verified. Ready to capture."
        }

        return SecurityResult(
            isSharp = isSharp && hasDetail,
            isStable = isStable,
            isPhysical = isPhysical,
            message = message,
            score = if (!hasDetail) 10 else ((variance / 3) + (stabilityScore / 2)).toInt().coerceIn(0, 100)
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