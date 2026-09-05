# Enterprise KYC & Loan Category Overhaul

Address performance issues in document uploading, implement AI-powered validation for uploaded files, and introduce a professional loan category selection screen.

## User Review Required

> [!IMPORTANT]
> **AI Validation for Uploads**: Uploaded files will now be scanned by the AI before being accepted. If you upload a photo of a car or a blank image, the AI will reject it and require a valid document.

> [!TIP]
> **Instant Gallery Access**: The file picker trigger is being optimized to open your phone's gallery immediately upon clicking the button, removing the previous delay.

## Proposed Changes

### 1. Loan Category Selection Screen (Web Layer)

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Add `#loan-category-screen` as the first screen in the loan flow.
- Implement the requested categories (Personal, Business, Education, etc.) with unique neon icons and colors.
- Add a Home button for easy navigation.

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Update navigation logic: Dashboard "Apply" button will now show the Category screen first.
- Save the selected category to `currentUser`.

---

### 2. Instant Upload & AI Validation

#### [MODIFY] [MainActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/MainActivity.kt)
- Optimize `onShowFileChooser` to use a direct Intent, ensuring the gallery opens without delay.
- Add a new bridge method `validateUploadedDoc(base64, docName)` to run AI checks on device files.

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- Export the `processDocumentDNA` logic into a reusable utility that can scan both live camera frames and static Bitmaps (uploads).
- Strictly reject images that lack "Document DNA" (Face photo or Text density).

---

### 3. Liveness Instruction Cleanup

#### [MODIFY] [KYCActivity.kt](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/java/com/genzloan/app/KYCActivity.kt)
- Audit all strings in `SELFIE` mode to ensure "document" is never mentioned.

## Verification Plan

### Manual Verification
- **Upload Test**: Tap "Upload from Device." **Goal**: Gallery must open in < 1 second.
- **AI Fraud Test**: Upload a photo of a dog or a car. **Goal**: System must show "Invalid Document" and block the upload.
- **Category Test**: Start a loan application. **Goal**: The first screen must be the new "Loan Category" selection.
- **Persistence Check**: Complete the flow, close app, reopen. **Goal**: Progress must be remembered.

### Quality Check
- Confirm all neon colors are consistent with the "GenZ Loan" aesthetic.
- Verify Home button functionality on the new screen.
