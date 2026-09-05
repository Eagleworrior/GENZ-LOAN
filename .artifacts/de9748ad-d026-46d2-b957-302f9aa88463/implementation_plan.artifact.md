# Extra-Professional AI KYC: Auto-Capture & Deep Cross-Validation

Implement a high-performance, enterprise-grade identity verification system. This update focuses on "Zero-Frustration" auto-capture and surgical data matching between physical documents and user account data.

## User Review Required

> [!IMPORTANT]
> **Dynamic Validation**: The app will now extract **ID Number** and **DOB** (Day/Month/Year) in real-time. Verification will **FAIL** and capture will be **LOCKED** if these do not exactly match the details provided during account creation.

> [!NOTE]
> **Auto-Capture Calibration**: To prevent the "annoying" stability errors, I am implementing a "Stability Window" (0.5s). If the image is clear and data matches, it will capture instantly even with minor tremors.

## Proposed Changes

### 1. The "Extra-Professional" Security Engine (Kotlin)

#### [MODIFY] [SecurityEngine.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/SecurityEngine.kt)
- **Zero-Friction Sharpness**: Recalibrate variance thresholds to favor focus over absolute stillness.
- **Material DNA Check**: Refine glare detection to work faster in indoor lighting.
- **Entropy Shield**: Hard-block any capture that lacks document-like texture (preventing blank wall/paper captures).

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- **Hands-Free Auto-Capture**: Once the "Reality Check" and "Data Match" are green for 500ms, the photo is taken automatically.
- **ID Data Extraction (OCR)**:
    - Use ML Kit to find the 10+ digit ID number.
    - Extract the DOB string and parse Day, Month, and Year.
- **Smart Turn-Around**: Seamless transition from Front to Back capture with a professional haptic (vibration) signal.

---

### 2. High-Integrity Cross-Validation

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Metadata Bridge**: Pass the `idNumber` and `dob` (e.g., "15/08/1995") from the user's stored loan form to the native camera.
- **Upload Resilience**: Allow the user to upload a file as an alternative, but still trigger a "Selfie Match" to prove they own the uploaded doc.

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Ensure the **Home Button** is perfectly integrated into the transition screens for a premium feel.

---

### 3. Visual & Haptic Feedback
- **Neon Pulse**: The capture frame will pulse in `--neon-blue` when scanning and lock into solid `--neon-green` with a checkmark when auto-capturing.
- **Specific Error Guidance**: Instead of "Phone Moving," the app will show professional errors like:
    - *"Focusing... Hold Steady"*
    - *"ID Number Mismatch"*
    - *"Waiting for Glare (Tilt Card)"*

## Verification Plan

### Automated Security Tests
- **Wrong ID Test**: Point at an ID that is perfectly clear but has a different ID number. **Goal**: Capture must remain locked.
- **Blank Test**: Point at a white paper. **Goal**: App must stay on "No document detected."
- **Stability Test**: Perform a steady capture. **Goal**: Must trigger within 1 second of alignment.

### Manual Verification
- Verify the "Upload from Device" flow skips to the liveness check.
- Confirm Home button works on every screen.
