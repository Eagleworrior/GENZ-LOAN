# Zero-Friction AI KYC: Seamless Auto-Capture & Flexible Verification

This plan optimizes the identity verification system by removing strict data matching that causes user frustration, moving to a fully autonomous auto-capture model, and relocating the device upload option for better visibility and functionality.

## User Review Required

> [!WARNING]
> **Security Simplification**: As requested, I am **removing** the strict real-time matching of Name, ID Number, and Date of Birth during the camera scan. The AI will now focus purely on verifying that a clear, physical document is present.

> [!IMPORTANT]
> **Autonomous Capture**: The manual capture button will be removed. The app will automatically take the photo once the document is clear and stable, ensuring a hands-free, professional experience.

## Proposed Changes

### 1. Zero-Friction AI Core (Android Native)

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- **Remove Matching Logic**: Delete the code that checks for Name, ID, and DOB overlaps.
- **Hide Capture Button**: Set `btnCapture` visibility to `GONE`.
- **Haptic Turnaround**: Implement a clear "Front Captured - Turn Card" vibration and message.
- **Reliable Auto-Capture**: Recalibrate the timer to capture the moment the security score is high enough.

#### [MODIFY] [SecurityEngine.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/SecurityEngine.kt)
- **Relax Stability Threshold**: Further loosen the "Phone Moving" check to allow for natural hand tremors.
- **Focus on Physicality**: Keep the "Digital Screen" protection but make it less sensitive to movement.

---

### 2. High-Visibility UI (Web Layer)

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- **Move Upload Button**: Relocate the "Upload from Device" option from the selector screen to the **Guidance Screen**.
- **Dual Options**: Display "Start Secure Capture" and "Upload Document" together on the same screen after a document type is selected.

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Fix Upload Logic**: Ensure the file picker opens correctly and triggers the transition to the next step immediately.
- **Update Guidance**: Add a clear instruction about the auto-capture feature so the user knows they don't need to press a button.

---

### 3. Visual Feedback
- **Neon "Green-Go"**: The frame will turn green and pulse when the AI is about to auto-capture.
- **Instruction Update**: "Hold steady... Capturing in 3, 2, 1" countdown text.

## Verification Plan

### Manual Verification
- **Auto-Capture Test**: Hold an ID card to the camera. Verify it captures automatically without pressing any button.
- **Turnaround Test**: Verify the app prompts for the "BACK" side immediately after the front is taken.
- **Upload Test**: Go to the guidance screen, click "Upload from Device," and verify it accepts the file and proceeds.
- **Friction Test**: Verify that mismatched details no longer block the capture.

### Quality Check
- Confirm the Home button is present on the guidance screen.
- Confirm the app is much faster and doesn't get stuck on "Phone moving."
