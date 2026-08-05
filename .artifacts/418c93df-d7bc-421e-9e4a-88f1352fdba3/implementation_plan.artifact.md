# Implementation Plan - Generate Signed Release APK

This plan outlines the steps to create a production-ready, signed APK for the GenZ Loan app.

## User Review Required

> [!WARNING]
> **Keystore Security:** To sign the APK, I need to create a "Keystore" file. This file and its passwords are critical. If you lose the keystore or forget the passwords, you will **NOT** be able to update your app on the Google Play Store in the future.
>
> I will generate a keystore with the following default details (which you can change if you wish):
> - **Alias:** `genz_loan_alias`
> - **Password:** `GenZLoan2026` (I will use this for both the keystore and the key).

## Proposed Changes

### 1. Keystore Generation
- I will use the `keytool` utility to generate a new keystore file named `genz-loan-key.jks` in the project root.

---

### 2. Build Configuration

#### [MODIFY] [app/build.gradle](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/build.gradle)
- Add a `signingConfigs` block with the credentials for the new keystore.
- Update the `release` build type to use this signing configuration.

---

### 3. APK Generation
- Run the `bundleRelease` (for Google Play) and `assembleRelease` (for direct APK install) gradle tasks.

## Verification Plan

### Automated Tests
- **Gradle Build**: I will run the release build task. Success indicates the signing configuration is correct.

### Manual Verification
- **File Location**: I will provide you with the path to the signed APK: `app/build/outputs/apk/release/app-release.apk`.
- **Install Test**: You can try installing this APK on a real device. Unlike the debug version, this one is ready for distribution.
