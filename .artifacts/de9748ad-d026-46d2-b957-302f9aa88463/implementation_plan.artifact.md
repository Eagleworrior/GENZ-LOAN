# KYC Optimization: Dynamic Frames & Smart Thresholds

Improve the user experience of the verification system by making the capture frame adapt to document shapes and refining security thresholds for smoother, more reliable detection.

## User Review Required

> [!IMPORTANT]
> **Dynamic Framing**: The capture box will now automatically resize. Government IDs will use a card-shaped frame, while utility bills and statements will use a larger, document-shaped frame.

> [!TIP]
> **Adaptive Security**: Security checks will now be "Document-Aware." Physicality checks (glare/tilt) will be strict for plastic cards but slightly relaxed for paper documents (like utility bills) to prevent user frustration.

## Proposed Changes

### 1. Adaptive UI (Android Native)

#### [MODIFY] [KYCOverlay.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCOverlay.kt)
- Add `setDocType(type: String)` to adjust the aspect ratio of the capture box.
- Card documents (Passport, ID, License) -> 1.58:1 ratio.
- Paper documents (Utility, Bank Statement, Tax) -> 1:1.41 (A4) ratio.

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- Pass the `docName` to the overlay during initialization.
- Implement specialized instructions for each category (e.g., "Scanning for Paper Document" vs "Scanning for Plastic Card").

---

### 2. Security Engine Calibration

#### [MODIFY] [SecurityEngine.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/SecurityEngine.kt)
- **Calibrated Glare**: Reduce the required glare cycles from 10 to 6 for faster verification.
- **Sharpness Triage**: Slightly lower the variance threshold to 140 (from 160) while maintaining strict text-density checks.
- **Material Intelligence**: Add a `isPaper` flag to relax light-reflection checks for non-plastic documents.

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- Refine name matching to be case-insensitive and trim extra spaces.
- If a name is missing, show exactly which name part was not found to help the user.

---

### 3. UX & Feedback

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Ensure the **Home Button** is prominent and correctly aligned on all transition screens.

## Verification Plan

### Manual Verification
- **Card Test**: Select "National ID." Verify the box is card-shaped. Verify it requires a tilt to turn green.
- **Page Test**: Select "Bank Statement." Verify the box is taller/larger. Verify it turns green more easily without needing intense glare.
- **Mismatch Test**: Use an ID with a completely different name. Verify the specific error *"Name [Part] not found"* appears.

### Quality Check
- Confirm that the capture button alpha transitions smoothly from 0.5 to 1.0.
- Confirm all neon colors are consistent.
