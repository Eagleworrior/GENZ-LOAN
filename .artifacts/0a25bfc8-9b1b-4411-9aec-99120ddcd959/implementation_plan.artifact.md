# Implementation Plan - UI Refinement & Human Detail Biometrics

This plan refines the navigation layout and implements a professional "Human Detail Detector" for biometrics, ensuring the app distinguishes between a real person and an empty/covered lens.

## User Review Required

> [!IMPORTANT]
> **Human Detail Detection**: To ensure the app only captures real people (regardless of skin tone):
> 1. We will implement **Variance Analysis**: The app will check for "Visual Detail" (eyes, facial features, contrast). A black screen or a covered lens has "Zero Detail" and will be rejected.
> 2. **Anti-Blur Logic**: The app will wait for the image to be stable. If the user is moving too fast or the camera is shaking, it will show: *"Hold still for verification"*.

> [!TIP]
> **Vertical Navigation**: The Home button will be moved **directly above** the Back button in a vertical column. I will also add the Home button to the "Loan Approved" and "Loan Agreement" screens so users can always go back to the main menu.

## Proposed Changes

### [UI / UX Components]

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- **Navigation Stack**: Wrap Home and Back buttons in a `.nav-stack` container in the `apply-screen`.
- **Global Home Access**: Add a header with the Home button to the `result-screen` and `agreement-screen`.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- Create `.nav-stack` class: `display: flex; flex-direction: column; gap: 8px;`.
- Add a new "Lens Pulse" animation: The scanner will glow **Blue** when it detects a human face and **Orange** when it sees nothing.

### [Core Logic & Biometrics]

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Refined Clarity Engine**:
    - **Detail Check**: Analyze the "Pixel Variance" to ensure a human face is actually in front of the camera.
    - **No-Capture Zone**: If the camera is covered (black screen), it will show *"Center face in the lens"* and stay locked.
    - Capture will only trigger when high detail and stability are detected.

### [Build & Delivery]

#### [Task] [APK Update]
- Increment version to **1.3.1**.
- Regenerate the signed APK and deliver to the Downloads folder as **"Genz loan.apk"**.

## Verification Plan

### Manual Verification
1. **Vertical Nav**: Verify Home is on top of Back in all application screens.
2. **Human Detail Test**: Point the camera at a wall or cover it with your thumb. Verify it **refuses** to capture.
3. **Real Face Test**: Point the camera at a person. Verify the "Clarity Bar" fills up and captures normally.
4. **Dispersal Page**: Verify the Home button is available after the loan is approved.
