# High-Security KYC & Global Document Intelligence Plan

Transform the GenZ Loan verification into a professional-grade, anti-fraud system that detects real physical documents vs. digital spoofs, implements guided video liveness, and supports a comprehensive global document catalog with a beautiful neon UI.

## User Review Required

> [!IMPORTANT]
> **No API Keys Required**: This entire system will run locally on the user's device using **OpenCV** and **ML Kit**. This ensures high privacy and zero recurring costs.

> [!CAUTION]
> **Hardware Requirements**: The anti-spoofing checks (moire detection) require a decent camera. Older devices might struggle with real-time FFT analysis. I will implement a fallback for stability.

## Proposed Changes

### 1. Android Security Core (The "Brain")

#### [MODIFY] [build.gradle](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/build.gradle)
- Add **OpenCV Android SDK** for advanced image processing (Screen & Glare detection).
- Add **ML Kit Text Recognition** for real-time document header verification.

#### [NEW] `SecurityEngine.kt`
- **Moire Shield**: Uses Fourier Transform logic to detect the invisible flickering of digital screens (blocking photos of laptops/tablets).
- **Specular Guard**: Detects real-world light reflections (glare). The app will ask the user to "Tilt the card" to confirm it's a physical object.
- **Blur & Motion Check**: Blocks capture if the phone is shaking or the lens is dirty.

#### [MODIFY] `KYCActivity.kt`
- **Real-Time Guard**: The "Capture" button will be locked behind a "Security Pass" state.
- **Header Matcher**: Before capturing, it will verify that a "Passport" actually says "Passport" in the frame.
- **Video Selfie V2**: Guided 10-second session with randomized challenges (Blink, Smile, Turn Head).

---

### 2. Global Document UI (The "Beautiful" Look)

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html) & [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- **Categorized Document Hub**: A stunning, searchable UI for 30+ document types.
- **Neon-Themed Names**: Each document category will have unique neon glow accents (e.g., Government IDs in `--neon-blue`, Financial in `--neon-yellow`, etc.).
- **Interactive Guides**: SVG animations showing how to "Tilt your document" and "Blink slowly."

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Massive Catalog Data**: Integrated mapping of all document types provided (Military IDs, Tenancy Agreements, etc.).
- **Dynamic Guidance**: Custom instructions for every single document type (e.g., "Ensure signatures are visible on page 3").

---

### 3. Verification & Liveness

- **Face-Document Match**: Extract the photo from the captured ID and compare it *on-device* against the video selfie frames using ML Kit face embeddings.

## Verification Plan

### Automated Security Tests
- **Screen Spoof Test**: Point the camera at a 4K monitor showing an ID. The app must display "Digital Screen Detected" and block capture.
- **Static Face Test**: Hold a photo of a person's face. The liveness check must fail because it detects no blink/smile "life signals."

### Manual Quality Check
- Verify that document names are "beautifully colored" as requested.
- Ensure the "Highest Security" message is prominently displayed to build user trust.
