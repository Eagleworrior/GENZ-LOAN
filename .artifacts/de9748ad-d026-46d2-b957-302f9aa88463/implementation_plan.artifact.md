# High-Security AI KYC & Cross-Validation Plan

Implement a professional-grade, multi-stage AI verification system that detects physical material, validates document structure, and cross-references user metadata with local context intelligence.

## User Review Required

> [!IMPORTANT]
> **Contextual AI**: For documents that don't explicitly list a "Country Name" (like utility bills), the AI will look for "Local Markers" such as specific utility provider names, local addresses, and regional currency symbols to verify the document's origin.

## Proposed Changes

### 1. Security Intelligence (Android Native)

#### [MODIFY] `SecurityEngine.kt`
- **Material Verification (FFT analysis)**: Use Fourier analysis to detect the pixel frequency of digital screens. If a user points at a laptop, the app will show **"Digital Spoof Detected"**.
- **Strict Motion-Lock**: Require a "Zero Motion" state for 1 second before security analysis begins.
- **Physicality Proof**: Require a detected light reflection (glare) that shifts position, proving the object is physical plastic/paper and not a static photo.

#### [MODIFY] `KYCActivity.kt`
- **Multi-Stage Matcher**:
    - **Stage 1 (Identity)**: Token-based name matching. Account "John Doe" matches ID "John Philip Doe" by verifying core name overlap.
    - **Stage 2 (Geography)**: Scan for country keywords OR regional context markers (e.g., specific city names/utilities for the selected country).
    - **Stage 3 (Structure)**: Ensure the document type selected (e.g., "Passport") has the correct visual structure (e.g., an MRZ zone).
- **Liveness Fix**: Re-initialize the CameraX lifecycle on "SELFIE" mode entry to ensure the front camera always starts.

---

### 2. UI & Navigation (Web Layer)

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Add the **Neon Blue Home Button** to the top-left header of:
    - `kyc-selector-screen`
    - `kyc-guidance-screen`
    - `kyc-liveness-screen`
- Ensure consistent spacing and professional neon header alignment.

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Build a **Context Catalog**: Mapping countries to their local markers (e.g., Kenya -> "Nairobi," "KES," "KPLC").
- Update bridge calls to pass full user metadata (`userName`, `userCountry`).

---

### 3. Visual Polish
- Implement **Glowing Feedback Overlays**:
    - `RED`: No Document / Fake detected.
    - `YELLOW`: Scanning / Tilt needed.
    - `GREEN`: Identity Verified.

## Verification Plan

### The "Fraud Resistance" Test
1.  **Digital Screen Test**: Point camera at a high-res photo of an ID on a tablet. **Goal**: App must block capture.
2.  **Wrong Name Test**: Use a real ID with a different name. **Goal**: App must show "Name Mismatch."
3.  **Blank Paper Test**: Point at a white paper. **Goal**: App must show "Scanning for document..." and never turn green.

### Manual Quality Check
- Confirm the Home button is present and returns the user to the dashboard correctly.
- Verify liveness check (blink/smile) triggers 100% of the time.
