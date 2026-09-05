package com.genzloan.app

import android.graphics.Bitmap
import android.graphics.Color
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer
import kotlin.math.abs

/**
 * Enterprise-Grade Security Engine for local document and liveness validation.
 * Implements physicality analysis to detect digital screens vs. real cards.
 */
object SecurityEngine {

    data class SecurityResult(
        val isSharp: Boolean,
        val isStable: Boolean,
        val isPhysical: Boolean,
        val hasText: Boolean,
        val message: String,
        val score: Int
    )

    private var lastLuminance = -1.0
    private var glareDetectedCount = 0
    private var stabilityFrames = 0

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
        val step = 6 // Higher resolution for high-security analysis
        var count = 0
        
        var maxLocalLuma = 0
        var minLocalLuma = 255
        
        // 1. Calculate Statistics & "Noise" (Moire detection)
        // Digital screens have high-frequency periodicity (moire)
        var moireSignals = 0
        var lastPixel = -1

        for (i in 0 until data.size step step) {
            val pixel = data[i].toInt() and 0xFF
            sum += pixel
            sumSq += (pixel * pixel).toLong()
            count++
            
            if (pixel > maxLocalLuma) maxLocalLuma = pixel
            if (pixel < minLocalLuma) minLocalLuma = pixel

            // Detecting artificial edges (pixel grids)
            if (lastPixel != -1 && abs(pixel - lastPixel) > 40) {
                moireSignals++
            }
            lastPixel = pixel
        }
        
        val mean = sum.toDouble() / count
        val variance = (sumSq.toDouble() / count) - (mean * mean)
        
        // 2. Physicality Heuristics
        // A digital screen has very regular grid noise. Physical material has natural texture.
        val isDigitalScreen = moireSignals > (count * 0.15) && variance > 300
        
        // Specular Glare Detection: Looking for "hotspots" (light reflections)
        val hasHotspot = (maxLocalLuma - mean) > 100 
        if (hasHotspot) glareDetectedCount++
        
        // 3. Stability Check (Require 1 second of zero motion)
        val lumaDiff = if (lastLuminance < 0) 0.0 else abs(mean - lastLuminance)
        lastLuminance = mean
        
        if (lumaDiff < 0.5) stabilityFrames++ else stabilityFrames = 0
        
        val isStable = stabilityFrames > 12 // Approx 1 second at 12fps analysis
        val isSharp = variance > 160
        val isPhysical = glareDetectedCount > 10 && !isDigitalScreen

        val message = when {
            isDigitalScreen -> "Digital Spoof Detected. Use Physical ID."
            !isSharp -> "Too blurry. Improve lighting."
            !isStable -> "Phone moving. Hold steady."
            !isPhysical -> "Security: Tilt document slowly to verify material."
            else -> "Material Verified. Ready."
        }

        return SecurityResult(
            isSharp = isSharp,
            isStable = isStable,
            isPhysical = isPhysical,
            hasText = moireSignals > (count * 0.02), // At least some contrast details
            message = message,
            score = if (isDigitalScreen) 0 else ((variance / 4) + (stabilityFrames * 4)).toInt().coerceIn(0, 100)
        )
    }

    fun reset() {
        glareDetectedCount = 0
        lastLuminance = -1.0
        stabilityFrames = 0
    }
}