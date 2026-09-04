# High-Security Identity Verification Plan (Liveness & Global Docs)

Upgrade the identity verification system from a basic face scan to a production-grade KYC (Know Your Customer) module featuring guided video selfie liveness, global document selection, and native CameraX security.

## User Review Required

> [!IMPORTANT]
> **Native Transition**: This upgrade moves the actual capture logic from the browser (WebView) to Native Android code. This ensures "highest security" as requested, allowing us to use **Google ML Kit** for real-time liveness checks (blink/smile detection) that cannot be easily spoofed.

> [!WARNING]
> **Backend Integration**: This plan implements the **Client-Side** (App) logic and UI. Full authenticity verification (checking if a document is 100% real) typically requires a specialized backend service (like Onfido or Jumio) as recommended in your request. I will provide the structure to connect to such a service.

## Proposed Changes

### 1. Android Native Layer (Security Foundation)

#### [MODIFY] [build.gradle](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/build.gradle)
- Add **CameraX** dependencies for high-performance capture.
- Add **Google ML Kit Face Detection** for real-time liveness (blink/smile detection).
- Add **Gson** for structured communication between JS and Kotlin.

#### [MODIFY] [AndroidManifest.xml](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/AndroidManifest.xml)
- Add `RECORD_AUDIO` permission for video selfie.
- Register a new `KYCActivity` to handle the secure camera experience.

#### [NEW] `KYCActivity.kt`
- Implement CameraX preview with a circular face overlay and rectangular document guide.
- Integrate ML Kit to monitor for "Liveness Challenges" (e.g., "Blink now", "Smile").
- Capture high-resolution images/videos and save them securely for upload.

#### [MODIFY] [MainActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/MainActivity.kt)
- Add a `JavascriptInterface` bridge (`window.AndroidKYC`) to allow the website to launch the native camera and receive results.

---

### 2. Frontend UI Layer (User Experience)

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- **Document Selector Screen**: Add a searchable country selector and a categorized list of all 30+ document types (Passport, ID, Utility Bills, etc.).
- **Guidance Screen**: Add a per-country capture guide (e.g., "Capture the MRZ on the bottom of your passport").
- **Liveness Challenge UI**: Dynamic overlays for the video selfie phase.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- Advanced scanning overlays (corner guides, pulse animations).
- Searchable dropdown styles for the document catalog.
- "Challenge Prompts" styling for liveness checks.

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Implement the state machine for the new KYC flow: `Selector -> Guidance -> Native Capture -> Processing -> Result`.
- Handle the data payload from the Native Bridge and prepare it for server upload.

---

### 3. Feature Mapping (Based on Your List)
- **Point 1-2**: Searchable catalog and localized guidance implemented in `index.html`.
- **Point 3-5**: High-quality capture and MRZ reading handled by **CameraX** and native processing.
- **Point 7-8**: **Liveness Challenges** (blink/smile) and Face Matching implemented via ML Kit.
- **Point 13-15**: Secure storage and retry flows integrated into the app logic.

## Verification Plan

### Automated Tests
- Validate that the Native Bridge responds correctly to `window.AndroidKYC.startVerification()`.
- Check if ML Kit successfully detects faces in various lighting conditions.

### Manual Verification
- **Challenge Test**: Verify that the video selfie only proceeds when the user actually blinks or smiles as requested.
- **Document Test**: Verify that the correct capture guide appears for "Passport" vs "Utility Bill".
- **Integration Test**: Ensure the final verification result is correctly passed back to the dashboard.
