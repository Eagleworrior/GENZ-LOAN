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
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
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
    private var docName = ""
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

    private val textRecognizer by lazy {
        TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    }

    private val vibrator by lazy { getSystemService(Context.VIBRATOR_SERVICE) as Vibrator }

    private var isSecurityPass = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityKycBinding.inflate(layoutInflater)
        setContentView(binding.root)

        mode = intent.getStringExtra("MODE") ?: "DOCUMENT"
        docName = intent.getStringExtra("DOC_NAME") ?: ""
        
        setupUI()
        startCamera()

        binding.btnCapture.setOnClickListener { 
            if (isSecurityPass) takePhoto() 
            else Toast.makeText(this, "Wait for security verification...", Toast.LENGTH_SHORT).show()
        }
        cameraExecutor = Executors.newSingleThreadExecutor()
    }

    private fun setupUI() {
        binding.overlay.setMode(mode)
        when (mode) {
            "DOCUMENT" -> {
                binding.textTitle.text = "Doc Shield: $docName"
                binding.textInstruction.text = "Scanning for physical material..."
                binding.textChallenge.visibility = View.GONE
                binding.progressBar.visibility = View.VISIBLE
                binding.btnCapture.alpha = 0.5f
            }
            "SELFIE" -> {
                binding.textTitle.text = "Liveness Lock"
                binding.textInstruction.text = "Follow challenges to unlock"
                binding.textChallenge.visibility = View.VISIBLE
                binding.progressBar.visibility = View.VISIBLE
                binding.btnCapture.visibility = View.GONE
                updateChallenge()
            }
        }
    }

    private fun updateChallenge() {
        val challenges = listOf("BLINK", "SMILE", "NOD")
        currentChallenge = challenges.random()
        binding.textChallenge.text = when (currentChallenge) {
            "BLINK" -> "Action: BLINK SLOWLY"
            "SMILE" -> "Action: GIVE A BIG SMILE"
            "NOD" -> "Action: NOD YOUR HEAD"
            else -> ""
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(binding.viewFinder.surfaceProvider)
            }

            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                .build()

            val analyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        analyzeFrame(imageProxy)
                    }
                }

            val cameraSelector = if (mode == "SELFIE") CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture, analyzer)
            } catch (exc: Exception) {
                Log.e("KYC", "Camera launch fail", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun analyzeFrame(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image ?: return
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

        // 1. Security Check (Blur & Material)
        val security = SecurityEngine.analyzeFrame(imageProxy)
        
        runOnUiThread {
            if (!isSecurityPass) {
                binding.textInstruction.text = security.message
            }
            binding.progressBar.progress = security.score
            
            // Update Overlay Color based on security
            val status = if (isSecurityPass) "GREEN" else if (security.score > 40) "YELLOW" else "RED"
            binding.overlay.setStatus(status)
        }

        // 2. Intelligence Processing
        if (mode == "SELFIE") {
            processFace(image, imageProxy)
        } else {
            processDocument(image, imageProxy, security.isSharp)
        }
    }

    private fun processFace(image: InputImage, imageProxy: ImageProxy) {
        faceDetector.process(image)
            .addOnSuccessListener { faces ->
                if (faces.isNotEmpty()) {
                    val face = faces[0]
                    when (currentChallenge) {
                        "BLINK" -> if ((face.leftEyeOpenProbability ?: 1.0f) < 0.2f) handleChallengeSuccess()
                        "SMILE" -> if ((face.smilingProbability ?: 0.0f) > 0.8f) handleChallengeSuccess()
                        "NOD" -> if (Math.abs(face.headEulerAngleX) > 12f) handleChallengeSuccess()
                    }
                }
            }
            .addOnCompleteListener { imageProxy.close() }
    }

    private fun processDocument(image: InputImage, imageProxy: ImageProxy, isSharp: Boolean) {
        textRecognizer.process(image)
            .addOnSuccessListener { visionText ->
                val text = visionText.text.lowercase()
                // Check for document keywords or general text presence
                val hasText = text.length > 10
                
                runOnUiThread {
                    if (isSharp && hasText) {
                        binding.textInstruction.text = "Physical Document Verified. Capture Ready."
                        binding.btnCapture.alpha = 1.0f
                        isSecurityPass = true
                    } else if (!isSharp) {
                        binding.textInstruction.text = "Too blurry. Move to light."
                        isSecurityPass = false
                    } else {
                        binding.textInstruction.text = "Position document inside frame."
                        isSecurityPass = false
                    }
                }
            }
            .addOnCompleteListener { imageProxy.close() }
    }

    private fun handleChallengeSuccess() {
        livenessScore += 5
        runOnUiThread {
            binding.progressBar.progress = livenessScore
            if (livenessScore % 25 == 0) {
                performHaptic()
                updateChallenge()
            }
            if (livenessScore >= requiredLiveness) {
                finishKYC("SELFIE_SUCCESS")
            }
        }
    }

    private fun performHaptic() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(40)
        }
    }

    private fun takePhoto() {
        val imageCapture = imageCapture ?: return
        val photoFile = File(externalCacheDir, "KYC_${step}_${System.currentTimeMillis()}.jpg")
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        imageCapture.takePicture(outputOptions, ContextCompat.getMainExecutor(this), 
            object : ImageCapture.OnImageSavedCallback {
                override fun onError(exc: ImageCaptureException) {
                    Log.e("KYC", "Capture Error: ${exc.message}")
                }

                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    if (mode == "DOCUMENT" && step == "FRONT") {
                        step = "BACK"
                        runOnUiThread {
                            binding.textInstruction.text = "Front Saved. Scan BACK side."
                            isSecurityPass = false
                            binding.btnCapture.alpha = 0.5f
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
        faceDetector.close()
        textRecognizer.close()
    }
}