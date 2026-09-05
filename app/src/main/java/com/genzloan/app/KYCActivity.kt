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
        
        // AI: Determine if paper or plastic based on doc name
        val paperKeywords = listOf("bill", "statement", "tax", "agreement", "payslip")
        SecurityEngine.setPaperMode(paperKeywords.any { docName.lowercase().contains(it) })
        
        binding.overlay.setDocType(docName)
        setupUI()
        
        cameraExecutor = Executors.newSingleThreadExecutor()
        startCamera()

        binding.btnCapture.setOnClickListener { 
            if (isSecurityPass) takePhoto() 
            else Toast.makeText(this, "Wait for document to clear...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupUI() {
        binding.overlay.setMode(mode)
        when (mode) {
            "DOCUMENT" -> {
                binding.textTitle.text = "Strict AI Verify: $docName"
                binding.textTitle.setTextColor(Color.parseColor("#00d2ff"))
                binding.textInstruction.text = "Scanning for physical document..."
                binding.textChallenge.visibility = View.GONE
                binding.progressBar.visibility = View.VISIBLE
                binding.btnCapture.alpha = 0.5f
            }
            "SELFIE" -> {
                binding.textTitle.text = "Live Identity Proof"
                binding.textTitle.setTextColor(Color.parseColor("#f3ff00"))
                binding.textInstruction.text = "Center face and follow prompts"
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
                Log.e("KYC", "Camera launch fail", exc)
                runOnUiThread { Toast.makeText(this, "Camera Error. Please restart.", Toast.LENGTH_LONG).show() }
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
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

        // 1. Security Check (Moire, Blur, Glare)
        val security = SecurityEngine.analyzeFrame(imageProxy)
        
        runOnUiThread {
            if (!isSecurityPass) {
                binding.textInstruction.text = security.message
                binding.textInstruction.setTextColor(Color.WHITE)
            }
            binding.progressBar.progress = security.score
            
            val overlayStatus = if (isSecurityPass) "GREEN" else if (security.score > 20) "YELLOW" else "RED"
            binding.overlay.setStatus(overlayStatus)
        }

        // 2. Intelligence Processing
        if (mode == "SELFIE") {
            processFace(image, imageProxy)
        } else {
            processDocument(image, imageProxy, security)
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

    private fun processDocument(image: InputImage, imageProxy: ImageProxy, security: SecurityEngine.SecurityResult) {
        textRecognizer.process(image)
            .addOnSuccessListener { visionText ->
                val text = visionText.text.lowercase()
                
                // Smart Name Matcher
                val accountNameParts = userName.lowercase().split(" ").filter { it.length > 2 }
                val nameMatch = if (accountNameParts.isEmpty()) true else accountNameParts.all { text.contains(it) }
                
                // Geography Matcher
                val geographyMatch = text.contains(userCountry.lowercase()) || 
                                     localMarkers.any { it.isNotEmpty() && text.contains(it.lowercase()) }

                // National ID Specific: Extract ID Number and DOB
                var idNumMatch = true
                var dobMatch = true
                if (docName.lowercase().contains("id")) {
                    if (userIDNum.isNotEmpty()) idNumMatch = text.contains(userIDNum.lowercase())
                    if (userDOB.isNotEmpty()) {
                        val dobParts = userDOB.split("/").filter { it.isNotEmpty() }
                        dobMatch = dobParts.all { text.contains(it.lowercase()) }
                    }
                }
                
                runOnUiThread {
                    if (security.isSharp && security.isPhysical && security.hasDetail) {
                        if (nameMatch && geographyMatch && idNumMatch && dobMatch) {
                            binding.textInstruction.text = "Document Verified. Auto-capturing..."
                            binding.textInstruction.setTextColor(Color.parseColor("#00ff88"))
                            binding.btnCapture.alpha = 1.0f
                            isSecurityPass = true
                            
                            // Extra-Snappy Auto-Capture: 0.4 seconds
                            if (autoCaptureStartTime == 0L) {
                                autoCaptureStartTime = System.currentTimeMillis()
                            } else if (System.currentTimeMillis() - autoCaptureStartTime > 400) {
                                takePhoto()
                            }
                        } else {
                            binding.textInstruction.setTextColor(Color.parseColor("#ff00ff"))
                            autoCaptureStartTime = 0L
                            if (!nameMatch) binding.textInstruction.text = "Name mismatch. Use your own ID."
                            else if (!geographyMatch) binding.textInstruction.text = "Region mismatch."
                            else if (!idNumMatch) binding.textInstruction.text = "ID Number mismatch."
                            else if (!dobMatch) binding.textInstruction.text = "DOB mismatch. Hold steady."
                            
                            isSecurityPass = false
                            binding.btnCapture.alpha = 0.5f
                        }
                    } else {
                        isSecurityPass = false
                        autoCaptureStartTime = 0L
                        binding.btnCapture.alpha = 0.5f
                    }
                }
            }
            .addOnCompleteListener { imageProxy.close() }
    }

    private fun handleChallengeSuccess() {
        livenessScore += 5
        runOnUiThread {
            binding.progressBar.progress = livenessScore
            if (livenessScore % 20 == 0) {
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
            vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(50)
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
                    performHaptic()
                    if (mode == "DOCUMENT" && step == "FRONT") {
                        step = "BACK"
                        runOnUiThread {
                            binding.textInstruction.text = "Front Verified. TURN CARD & Scan BACK."
                            binding.textInstruction.setTextColor(Color.WHITE)
                            isSecurityPass = false
                            isCapturing = false
                            binding.btnCapture.alpha = 0.5f
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