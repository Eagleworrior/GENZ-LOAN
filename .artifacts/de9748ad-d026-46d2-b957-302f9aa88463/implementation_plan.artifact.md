# Document DNA AI: Intelligent Physicality & Feature Detection

Restore the advanced AI features that verify the authenticity of the physical card and its structural features, while removing the strict "Account Matching" barriers that cause user frustration.

## User Review Required

> [!IMPORTANT]
> **Document Layout AI**: The system will now look for "Document DNA"—specifically, it will scan for a photo (face) and text density on the card. If you point it at a blank wall or a piece of furniture, it will **NOT** capture, even if the light is green.

> [!TIP]
> **Flexible Validation**: I am removing the hard block on Name/ID/DOB matching. If the details match, it's a bonus, but if the AI can't perfectly read them, it will **STILL** allow the capture as long as the document is real and clear.

## Proposed Changes

### 1. Document DNA AI (Android Native)

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- **Face-on-Card Detection**: In "National ID" mode, use the face detector on the document. A real ID must contain a small photo (a face).
- **Text Block Density**: Verify that the document contains at least 3 distinct blocks of text (Name, Number, Date, etc.) to ensure it's not just a blank paper.
- **Removed Account Barrier**: Account details (`userName`, `userIDNum`) will be checked, but failure to match will **NOT** block the capture. It will only show a "Scanning..." status.

#### [MODIFY] [SecurityEngine.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/SecurityEngine.kt)
- **Hardened Entropy Shield**: Increase the required edge density to 5%. This ensures that even a clear white wall is rejected.
- **Physicality DNA**: Require a shifting glare pattern to prove the document is plastic/paper and not a static image.

---

### 2. High-Speed Auto-Capture (0.3s)

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- **Instant Trigger**: Reduce the sustained pass window to 300ms. As soon as the "Document DNA" is confirmed, the photo is taken.
- **Haptic Signal**: A short pulse when DNA is detected, and a long pulse when captured.

---

### 3. UI & Upload Fixes

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Upload Resilience**: Ensure the upload handler uses a more robust file reader to handle high-res photos from modern device galleries.

## Verification Plan

### The "Reality" Test
1.  **Blank Wall Test**: Point camera at a wall. **Goal**: Must NOT capture.
2.  **Blank Paper Test**: Point at a plain white A4 paper. **Goal**: Must NOT capture (missing text/DNA).
3.  **Real ID Test**: Point at a real card. **Goal**: Must capture in < 0.5s.
4.  **Mismatch Test**: Use a real ID with a different name. **Goal**: Must capture successfully (since barriers are removed).

### Quality Check
- Confirm "Turn Card" prompt appears for ID types.
- Confirm Home button is present on all screens.
