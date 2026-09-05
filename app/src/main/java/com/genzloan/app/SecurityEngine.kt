package com.genzloan.app

import android.graphics.Bitmap
import android.graphics.Color
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer
import kotlin.math.abs

/**
 * Enterprise-Grade Security Engine for GenZ Loan.
 * Optimized for high speed and strict physicality verification.
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
    private var isSelfieMode = false

    fun setPaperMode(enabled: Boolean) {
        isPaperMode = enabled
    }

    fun setSelfieMode(enabled: Boolean) {
        isSelfieMode = enabled
    }

    /**
     * Analyzes an image frame for professional security clearance.
     * Balanced for high speed and minimal user frustration.
     */
    fun analyzeFrame(image: ImageProxy): SecurityResult {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val data = ByteArray(buffer.remaining())
        buffer.get(data)
        
        var sum = 0L
        var sumSq = 0L
        val step = 8 
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

            if (lastPixel != -1 && abs(pixel - lastPixel) > 30) {
                contrastEdges++
            }
            lastPixel = pixel
        }
        
        val mean = sum.toDouble() / count
        val variance = (sumSq.toDouble() / count) - (mean * mean)
        
        // 1. HARDENED Texture & Entropy Check
        // Selfie mode needs lower edge density than text-heavy documents
        val threshold = if (isSelfieMode) 0.055 else 0.10 
        val hasDetail = contrastEdges > (count * threshold)
        
        // 2. Sharpness
        val isSharp = variance > 120 
        
        // 3. Physicality & Spoof Detection
        val isDigitalScreen = contrastEdges > (count * 0.18) && variance > 480
        
        // Specular Glare (Physical light reflections)
        val hasHotspot = (maxLocalLuma - mean) > 105 
        if (hasHotspot) glareDetectedCount++
        
        // 4. Fast Stability Check
        val lumaDiff = if (lastLuminance < 0) 0.0 else abs(mean - lastLuminance)
        lastLuminance = mean
        if (lumaDiff < 1.5) stabilityFrames++ else stabilityFrames = 0
        
        val isStable = stabilityFrames > 5 // Require ~0.35 seconds of stillness
        
        // Physicality Proof requirement
        // Selfies don't usually have "glare" unless wearing glasses, so we rely on face detection in Activity
        val requiredGlare = if (isSelfieMode) 0 else if (isPaperMode) 2 else 5
        val isPhysical = (glareDetectedCount >= requiredGlare) && !isDigitalScreen && hasDetail

        val objName = if (isSelfieMode) "face" else "document"

        val message = when {
            isDigitalScreen -> "Digital Spoof Detected. Use Real $objName."
            !hasDetail -> "Align $objName in the frame."
            !isSharp -> "Improving focus... Hold steady."
            !isStable -> "Stabilizing... Hold steady."
            !isPhysical && !isSelfieMode -> if (isPaperMode) "Align $objName clearly." else "Security: Tilt $objName slowly."
            else -> "Physical Verification Ready."
        }

        return SecurityResult(
            isSharp = isSharp && hasDetail,
            isStable = isStable,
            isPhysical = isPhysical,
            hasDetail = hasDetail,
            message = message,
            score = if (isDigitalScreen || !hasDetail) 0 else ((variance / 4) + (stabilityFrames * 8)).toInt().coerceIn(0, 100)
        )
    }

    fun reset() {
        glareDetectedCount = 0
        lastLuminance = -1.0
        stabilityFrames = 0
        isPaperMode = false
        isSelfieMode = false
    }
}