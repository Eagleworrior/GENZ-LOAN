package com.genzloan.app

import android.graphics.Bitmap
import android.graphics.Color
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer
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
     * Implements strict "Anti-Blank" and "Digital Shield" logic.
     */
    fun analyzeFrame(image: ImageProxy): SecurityResult {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val data = ByteArray(buffer.remaining())
        buffer.get(data)
        
        var sum = 0L
        var sumSq = 0L
        val step = 6 // Higher resolution for critical analysis
        var count = 0
        
        var maxLocalLuma = 0
        var minLocalLuma = 255
        
        // 1. Text Density & Feature Mapping (Anti-Blank)
        var contrastEdges = 0
        var lastPixel = -1

        for (i in 0 until data.size step step) {
            val pixel = data[i].toInt() and 0xFF
            sum += pixel
            sumSq += (pixel * pixel).toLong()
            count++
            
            if (pixel > maxLocalLuma) maxLocalLuma = pixel
            if (pixel < minLocalLuma) minLocalLuma = pixel

            // Detecting sharp edges characteristic of text and documents
            if (lastPixel != -1 && abs(pixel - lastPixel) > 40) {
                contrastEdges++
            }
            lastPixel = pixel
        }
        
        val mean = sum.toDouble() / count
        val variance = (sumSq.toDouble() / count) - (mean * mean)
        
        // 2. Physicality Checks
        // Digital screens flicker and have high-frequency periodicity
        val isDigitalScreen = contrastEdges > (count * 0.16) && variance > 400
        
        // Specular Glare (Physical light reflections on plastic/paper)
        val hasHotspot = (maxLocalLuma - mean) > 110 
        if (hasHotspot) glareDetectedCount++
        
        // 3. Stability Check (Require 1 second of perfect stillness)
        val lumaDiff = if (lastLuminance < 0) 0.0 else abs(mean - lastLuminance)
        lastLuminance = mean
        if (lumaDiff < 0.4) stabilityFrames++ else stabilityFrames = 0
        
        val isStable = stabilityFrames > 12 // Require ~1 second of zero motion
        val isSharp = variance > 160 // High sharpness threshold
        val hasDetail = contrastEdges > (count * 0.03) // Reject if less than 3% edges (blank surfaces)
        
        // Dynamic physicality requirement
        val requiredGlare = if (isPaperMode) 3 else 10 
        val isPhysical = glareDetectedCount >= requiredGlare && !isDigitalScreen

        val message = when {
            isDigitalScreen -> "Digital Spoof Detected. Use Physical Document."
            !hasDetail -> "No document detected. Avoid blank surfaces."
            !isSharp -> "Too blurry. Improve lighting."
            !isStable -> "Phone moving. Hold steady."
            !isPhysical -> if (isPaperMode) "Scan paper document clearly." else "Security: Tilt card to verify material."
            else -> "Physical Document Verified. Ready."
        }

        return SecurityResult(
            isSharp = isSharp && hasDetail,
            isStable = isStable,
            isPhysical = isPhysical,
            hasDetail = hasDetail,
            message = message,
            score = if (isDigitalScreen || !hasDetail) 0 else ((variance / 4) + (stabilityFrames * 3)).toInt().coerceIn(0, 100)
        )
    }

    fun reset() {
        glareDetectedCount = 0
        lastLuminance = -1.0
        stabilityFrames = 0
        isPaperMode = false
    }
}