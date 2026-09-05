# KYC Stability & Persistence Final Overhaul

This plan ensures that Identity and Liveness results are permanently saved, fixes misleading UI text during face scans, and hardens the "Real Human" verification to prevent simulations.

## User Review Required

> [!IMPORTANT]
> **State Memory**: I am implementing a robust state recovery system. If a user completes their ID scan and closes the app, they will return directly to the Liveness check. If both are done, they go straight to the Loan Agreement.

> [!NOTE]
> **Pure Face Scan**: All references to "documents" or "scanners" have been removed from the Selfie mode. The instructions now focus strictly on proving identity through head movements.

## Proposed Changes

### 1. Robust Verification Persistence (Web Layer)

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Update `onKYCResult` to save `kycFront`, `kycBack`, and `kycCompleted` flags to `localStorage` immediately upon success.
- Update `processLoanApplication()` to intelligently skip steps based on saved data.
- Fix the `doc-upload` listener to ensure it triggers correctly on all Android versions.

### 2. "Real-Human" Liveness Hardening (Android Native)

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- **UI Text Cleanup**: Remove "restoring" and "document" text in `SELFIE` mode.
- **3D Depth Check**: Require a specific head turn (Euler Angle Y) combined with a blink to prove 3D presence and prevent photo/video spoofing.
- **Auto-Capture Sequence**: Ensure the camera takes the final selfie photo automatically once the liveness challenges are met.

#### [MODIFY] [MainActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/MainActivity.kt)
- Final verification of the `onShowFileChooser` logic to ensure the "Upload" button consistently opens the phone's gallery.

---

### 3. Visual & Instruction Sync

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Synchronize guidance text to mention "Autonomous Auto-Capture" so users know they don't need to press a button.

## Verification Plan

### Persistence Verification
1.  Scan the front and back of an ID.
2.  Close the app completely.
3.  Open the app and go to "Apply Loan."
4.  **Goal**: User must see the "Liveness" screen immediately, skipping the ID selection and scan.

### Liveness Verification
1.  Point at a high-res photo of a face.
2.  **Goal**: Challenges like "Turn Head" must fail, preventing capture.
3.  Perform real head turns and blinks.
4.  **Goal**: System must auto-capture and succeed.

### Upload Verification
1.  Click "Upload from Device."
2.  **Goal**: System file picker must open.
