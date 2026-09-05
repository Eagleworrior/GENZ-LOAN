# Strict Identity Verification & Cross-Validation Plan

Address bugs in the KYC flow and implement high-security cross-validation between user account data and physical documents.

## User Review Required

> [!IMPORTANT]
> **Strict Verification**: The app will now block any document that doesn't contain the user's name or doesn't match the selected document type/country. This is much more restrictive and may require better lighting from the user.

## Proposed Changes

### 1. Security & Intelligence (Android Native)

#### [MODIFY] `SecurityEngine.kt`
- **Strict Blank Detection**: Increase the variance threshold and implement a "text density" check.
- **Enhanced Physicality**: Require more "glare cycles" to confirm physical material.
- **Anti-Blur V2**: Block capture if the image stability score is below 95%.

#### [MODIFY] `KYCActivity.kt`
- **Account Cross-Validation**: Receive `USER_NAME` and `USER_COUNTRY` from the bridge.
- **Name Matching Engine**:
    - Verify that the account names are present on the document.
    - Support "subset matching" (e.g., if account is "John Doe" and ID is "John Philip Doe", it passes).
- **Country Enforcement**: Verify keywords related to the selected country are present on the document.
- **Liveness Fix**: Ensure "SELFIE" mode correctly initializes and transitions.

#### [MODIFY] `MainActivity.kt`
- Update `KYCBridge` to pass `userName` and `userCountry` to `KYCActivity`.

---

### 2. UI & User Experience (Web Layer)

#### [MODIFY] `index.html`
- Add **Home Button** to the top-left of:
    - `kyc-selector-screen`
    - `kyc-guidance-screen`
    - `kyc-liveness-screen`
- Ensure consistent neon styling for these buttons.

#### [MODIFY] `app.js`
- Update `launchNativeKYC` and `launchNativeLiveness` to pass `currentUser.name` and `currentUser.country`.
- Fix the logic for the "Start Video Selfie" button to ensure it triggers correctly.

## Verification Plan

### Automated Security Tests
- **Wrong Name Test**: Point at an ID with a different name. **Goal**: App must show "Name Mismatch" and block capture.
- **Blank Image Test**: Point at a white paper. **Goal**: App must show "No document detected" and block capture.
- **Liveness Trigger Test**: Click "Start Video Selfie". **Goal**: Native camera must launch in front-facing mode.

### Manual Quality Check
- Verify the "Home" button is present and functional on all new KYC screens.
- Test the "3 names on ID vs 2 names on account" scenario.
