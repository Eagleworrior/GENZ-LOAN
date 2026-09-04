package com.genzloan.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.*
import android.os.*
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.genzloan.app.databinding.ActivityKycBinding
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class KYCActivity : AppCompatActivity() {

    private lateinit var binding: ActivityKycBinding
    private var imageCapture: ImageCapture? = null
    private lateinit var cameraExecutor: ExecutorService
    
    private var mode = "DOCUMENT"
    private var step = "FRONT"
    private var livenessScore = 0
    private val requiredLiveness = 100
    private var currentChallenge = "BLINK"
    
    private val faceDetector by lazy {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .build()
        FaceDetection.getClient(options)
    }

    private val vibrator by lazy { getSystemService(Context.VIBRATOR_SERVICE) as Vibrator }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityKycBinding.inflate(layoutInflater)
        setContentView(binding.root)

        mode = intent.getStringExtra("MODE") ?: "DOCUMENT"
        
        setupUI()
        startCamera()

        binding.btnCapture.setOnClickListener { takePhoto() }
        cameraExecutor = Executors.newSingleThreadExecutor()
    }

    private fun setupUI() {
        binding.overlay.setMode(mode)
        when (mode) {
            "DOCUMENT" -> {
                binding.textTitle.text = "Secure Document Capture"
                binding.textInstruction.text = "Place the FRONT of your ID in the frame"
                binding.textChallenge.visibility = View.GONE
                binding.progressBar.visibility = View.GONE
            }
            "SELFIE" -> {
                binding.textTitle.text = "Live Video Verification"
                binding.textInstruction.text = "Center your face in the circle"
                binding.textChallenge.visibility = View.VISIBLE
                binding.progressBar.visibility = View.VISIBLE
                binding.btnCapture.visibility = View.GONE
                updateChallenge()
            }
        }
    }

    private fun updateChallenge() {
        currentChallenge = if (Math.random() > 0.5) "BLINK" else "SMILE"
        binding.textChallenge.text = when (currentChallenge) {
            "BLINK" -> "Challenge: BLINK YOUR EYES"
            "SMILE" -> "Challenge: SMILE BRIGHTLY"
            else -> ""
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .build()
                .also {
                    it.setSurfaceProvider(binding.viewFinder.surfaceProvider)
                }

            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                .build()

            val faceAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        processImageProxy(imageProxy)
                    }
                }

            val cameraSelector = if (mode == "SELFIE") CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                if (mode == "SELFIE") {
                    cameraProvider.bindToLifecycle(this, cameraSelector, preview, faceAnalyzer)
                } else {
                    cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture)
                }
            } catch (exc: Exception) {
                Log.e("KYC", "Use case binding failed", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun processImageProxy(imageProxy: ImageProxy) {
        if (mode != "SELFIE") {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            faceDetector.process(image)
                .addOnSuccessListener { faces ->
                    if (faces.isNotEmpty()) {
                        val face = faces[0]
                        when (currentChallenge) {
                            "BLINK" -> {
                                if ((face.leftEyeOpenProbability ?: 1.0f) < 0.2f || (face.rightEyeOpenProbability ?: 1.0f) < 0.2f) {
                                    handleChallengeSuccess()
                                }
                            }
                            "SMILE" -> {
                                if ((face.smilingProbability ?: 0.0f) > 0.7f) {
                                    handleChallengeSuccess()
                                }
                            }
                        }
                    }
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    private fun handleChallengeSuccess() {
        livenessScore += 5
        runOnUiThread {
            binding.progressBar.progress = livenessScore
            
            if (livenessScore % 20 == 0) {
                // Haptic Feedback
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    vibrator.vibrate(50)
                }
                updateChallenge()
            }

            if (livenessScore >= requiredLiveness) {
                finishKYC("SELFIE_SUCCESS")
            }
        }
    }

    private fun takePhoto() {
        val imageCapture = imageCapture ?: return

        val photoFile = File(externalCacheDir, "KYC_${step}_${System.currentTimeMillis()}.jpg")

        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        imageCapture.takePicture(
            outputOptions, ContextCompat.getMainExecutor(this), object : ImageCapture.OnImageSavedCallback {
                override fun onError(exc: ImageCaptureException) {
                    Log.e("KYC", "Photo capture failed: ${exc.message}", exc)
                }

                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    if (mode == "DOCUMENT" && step == "FRONT") {
                        step = "BACK"
                        runOnUiThread {
                            binding.textInstruction.text = "Now capture the BACK of your ID"
                            Toast.makeText(baseContext, "Front side captured!", Toast.LENGTH_SHORT).show()
                        }
                        saveResult("FRONT_PATH", photoFile.absolutePath)
                    } else {
                        saveResult("BACK_PATH", photoFile.absolutePath)
                        finishKYC("DOCUMENT_SUCCESS")
                    }
                }
            })
    }

    private val results = mutableMapOf<String, String>()
    private fun saveResult(key: String, value: String) {
        results[key] = value
    }

    private fun finishKYC(status: String) {
        val intent = Intent()
        intent.putExtra("STATUS", status)
        results.forEach { (k, v) -> intent.putExtra(k, v) }
        setResult(Activity.RESULT_OK, intent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
    }
}