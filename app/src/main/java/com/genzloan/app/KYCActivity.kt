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
    private var userName = ""
    private var userCountry = ""
    private var userIDNum = ""
    private var userDOB = ""
    private var localMarkers = listOf<String>()
    
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
    private var autoCaptureStartTime = 0L
    private var isCapturing = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityKycBinding.inflate(layoutInflater)
        setContentView(binding.root)

        mode = intent.getStringExtra("MODE") ?: "DOCUMENT"
        docName = intent.getStringExtra("DOC_NAME") ?: ""
        userName = intent.getStringExtra("USER_NAME") ?: ""
        userCountry = intent.getStringExtra("USER_COUNTRY") ?: ""
        localMarkers = intent.getStringExtra("LOCAL_MARKERS")?.split(",") ?: listOf()
        userIDNum = intent.getStringExtra("ID_NUMBER") ?: ""
        userDOB = intent.getStringExtra("DOB") ?: ""
        
        SecurityEngine.reset()
        
        val paperKeywords = listOf("bill", "statement", "tax", "agreement", "payslip")
        SecurityEngine.setPaperMode(paperKeywords.any { docName.lowercase().contains(it) })
        
        binding.overlay.setDocType(docName)
        setupUI()
        
        cameraExecutor = Executors.newSingleThreadExecutor()
        startCamera()

        binding.btnCapture.visibility = View.GONE // Fully autonomous
    }

    private fun setupUI() {
        binding.overlay.setMode(mode)
        when (mode) {
            "DOCUMENT" -> {
                binding.textTitle.text = "Document Feature AI"
                binding.textTitle.setTextColor(Color.parseColor("#00ff88"))
                binding.textInstruction.text = "Initializing Scanner..."
                binding.textChallenge.visibility = View.GONE
                binding.progressBar.visibility = View.VISIBLE
            }
            "SELFIE" -> {
                binding.textTitle.text = "Live Identity Verification"
                binding.textTitle.setTextColor(Color.parseColor("#f3ff00"))
                binding.textInstruction.text = "Follow prompts clearly"
                binding.textChallenge.visibility = View.VISIBLE
                binding.progressBar.visibility = View.VISIBLE
                updateChallenge()
            }
        }
    }

    private fun updateChallenge() {
        val challenges = listOf("BLINK", "SMILE", "NOD")
        currentChallenge = challenges.random()
        binding.textChallenge.text = when (currentChallenge) {
            "BLINK" -> "Action: BLINK BOTH EYES"
            "SMILE" -> "Action: GIVE A BIG SMILE"
            "NOD" -> "Action: NOD YOUR HEAD SLIGHTLY"
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
                Log.e("KYC", "Hardware link failed", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun analyzeFrame(imageProxy: ImageProxy) {
        if (isCapturing) {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image ?: return
        val inputImage = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

        // 1. Security Check
        val security = SecurityEngine.analyzeFrame(imageProxy)
        
        runOnUiThread {
            if (!isSecurityPass) {
                binding.textInstruction.text = security.message
                binding.textInstruction.setTextColor(Color.WHITE)
            }
            binding.progressBar.progress = security.score
            
            val status = if (isSecurityPass) "GREEN" else if (security.score > 25) "YELLOW" else "RED"
            binding.overlay.setStatus(status)
        }

        // 2. Intelligence Processing
        if (mode == "SELFIE") {
            processFace(inputImage, imageProxy)
        } else {
            processDocumentDNA(inputImage, imageProxy, security)
        }
    }

    private fun processFace(image: InputImage, imageProxy: ImageProxy) {
        faceDetector.process(image)
            .addOnSuccessListener { faces ->
                if (faces.isNotEmpty()) {
                    val face = faces[0]
                    when (currentChallenge) {
                        "BLINK" -> if ((face.leftEyeOpenProbability ?: 1.0f) < 0.15f) handleChallengeSuccess()
                        "SMILE" -> if ((face.smilingProbability ?: 0.0f) > 0.85f) handleChallengeSuccess()
                        "NOD" -> if (Math.abs(face.headEulerAngleX) > 15f) handleChallengeSuccess()
                    }
                }
            }
            .addOnCompleteListener { imageProxy.close() }
    }

    private fun processDocumentDNA(image: InputImage, imageProxy: ImageProxy, security: SecurityEngine.SecurityResult) {
        // Run Face Detection (Small Photo on ID) and Text Recognition in parallel
        faceDetector.process(image).addOnSuccessListener { faces ->
            textRecognizer.process(image).addOnSuccessListener { visionText ->
                val text = visionText.text.lowercase()
                
                // RESTORED: DNA Feature Checks
                val hasPhoto = faces.isNotEmpty() || !docName.lowercase().contains("id") // Required for IDs
                val hasTextDensity = visionText.textBlocks.size >= 2
                
                // USER-FRIENDLY: Optional matching (Bonus only)
                val accountNames = userName.lowercase().split(" ").filter { it.length > 2 }
                val isNameMatch = if (accountNames.isEmpty()) true else accountNames.all { text.contains(it) }
                
                runOnUiThread {
                    if (security.isSharp && security.isPhysical && hasTextDensity && hasPhoto) {
                        binding.textInstruction.text = if (isNameMatch) "Identity Verified. Capturing..." else "Document Verified. Capturing..."
                        binding.textInstruction.setTextColor(Color.parseColor("#00ff88"))
                        isSecurityPass = true
                        
                        // Extra-Snappy trigger (0.3s)
                        if (autoCaptureStartTime == 0L) {
                            autoCaptureStartTime = System.currentTimeMillis()
                        } else if (System.currentTimeMillis() - autoCaptureStartTime > 300) {
                            takePhoto()
                        }
                    } else {
                        isSecurityPass = false
                        autoCaptureStartTime = 0L
                        if (!hasTextDensity && security.score > 20) {
                            binding.textInstruction.text = "Align document features in frame."
                        } else if (!hasPhoto && docName.lowercase().contains("id") && security.score > 30) {
                            binding.textInstruction.text = "Ensure ID photo is visible."
                        }
                    }
                }
            }.addOnCompleteListener { imageProxy.close() }
        }
    }

    private fun handleChallengeSuccess() {
        livenessScore += 5
        runOnUiThread {
            binding.progressBar.progress = livenessScore
            if (livenessScore % 20 == 0) {
                performHaptic(40)
                updateChallenge()
            }
            if (livenessScore >= requiredLiveness) {
                finishKYC("SELFIE_SUCCESS")
            }
        }
    }

    private fun performHaptic(duration: Long) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(duration)
        }
    }

    private fun takePhoto() {
        if (isCapturing) return
        isCapturing = true
        
        val imageCapture = imageCapture ?: return
        val photoFile = File(externalCacheDir, "SECURE_${step}_${System.currentTimeMillis()}.jpg")
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        imageCapture.takePicture(outputOptions, ContextCompat.getMainExecutor(this), 
            object : ImageCapture.OnImageSavedCallback {
                override fun onError(exc: ImageCaptureException) {
                    Log.e("KYC", "Capture Error: ${exc.message}")
                    isCapturing = false
                }

                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    performHaptic(80) 
                    if (mode == "DOCUMENT" && step == "FRONT") {
                        step = "BACK"
                        runOnUiThread {
                            binding.textInstruction.text = "Front Saved. TURN CARD & scan BACK side."
                            binding.textInstruction.setTextColor(Color.WHITE)
                            isSecurityPass = false
                            isCapturing = false
                            autoCaptureStartTime = 0L
                            SecurityEngine.reset()
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