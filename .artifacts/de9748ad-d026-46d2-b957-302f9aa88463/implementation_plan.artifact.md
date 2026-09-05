# Critical KYC Fixes: Functional Upload & Reliable Liveness

Address the issues where the device upload is non-responsive and the video selfie fails to complete, while hardening the auto-capture to prevent false triggers.

## User Review Required

> [!IMPORTANT]
> **WebView File Access**: I am adding the `onShowFileChooser` handler to the Android `MainActivity`. This is a system-level requirement for the "Upload from Device" button to actually open the phone's gallery.

> [!TIP]
> **Liveness Calibration**: I am slightly relaxing the facial expression thresholds (blink/smile) to ensure the AI detects them more easily, and I'm ensuring the capture happens instantly when the score is reached.

## Proposed Changes

### 1. Functional Device Upload (Android Native)

#### [MODIFY] [MainActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/MainActivity.kt)
- Implement `onShowFileChooser` in the `WebChromeClient`.
- Add an `ActivityResultLauncher` to handle the file selection result from the system gallery.
- Return the file URI back to the WebView so `app.js` can process it.

---

### 2. Reliable Video Selfie (Android Native)

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- **Refined Face AI**:
    - Relax BLINK threshold to `< 0.25` (was 0.15).
    - Relax SMILE threshold to `> 0.7` (was 0.85).
- **Harden Analyzer**: Ensure `imageProxy` is closed in *every* code path (Success, Failure, and Completion) to prevent the camera from freezing.
- **DNA Protection**: Increase the required "Edge Density" in document mode to strictly block blank surfaces/walls.

#### [MODIFY] [SecurityEngine.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/SecurityEngine.kt)
- **Entropy Harden**: Increase `hasDetail` threshold to `0.06` (6%) to ensure blank walls never trigger a "Green" state.

---

### 3. UI & UX Polish (Web Layer)

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Ensure the upload handler specifically handles the `change` event for the file input.
- Add a loading spinner when a file is being processed.

## Verification Plan

### Manual Verification
- **Upload Test**: Press "Upload from Device." **Goal**: The system file picker must open, allow selecting an image, and proceed to liveness.
- **Selfie Test**: Follow blink/smile prompts. **Goal**: The progress bar must fill up and finish automatically.
- **Blank Test**: Point at a white wall. **Goal**: The frame must stay RED or YELLOW and never auto-capture.

### Quality Check
- Confirm Home button works on every screen.
- Confirm the app doesn't freeze after a few seconds of use.
