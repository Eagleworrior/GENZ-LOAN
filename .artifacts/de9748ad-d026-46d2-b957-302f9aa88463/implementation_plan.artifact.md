# UI Fix and Signed APK Generation

The user reported that the "Approved" text on the dispersal (result) page is not centered on top of the captured image. It is currently positioned to one side in the header. Additionally, a signed APK named "Genz Loan" needs to be generated and moved to the Downloads folder.

## Proposed Changes

### UI Fix: Center "Approved" Text on Image

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Move the `<h2>Approved</h2>` from the `result-screen` header to the `#captured-photo-container`.
- Assign a new class `approved-overlay` to this element.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- Add styling for `.approved-overlay` to position it absolutely at the top center of the captured photo.
- Style it to be clearly visible against the image (green text, possibly with a subtle background or shadow).

### Build: Generate Signed APK

#### Build Signed APK
- Execute the Gradle task `:app:assembleRelease` to generate a signed APK using the existing signing configuration in `app/build.gradle`.

#### Rename and Move APK
- Locate the output APK: `app/build/outputs/apk/release/app-release.apk`.
- Copy and rename it to `C:\Users\EAGLE\Downloads\Genz Loan.apk`.

## Verification Plan

### Manual Verification
- Deploy the app to a device/emulator.
- Navigate to the result screen (after loan approval/photo capture).
- Verify that the "Approved" text is centered at the top of the captured photo.
- Verify that the home button remains accessible in the header.
- Check the `C:\Users\EAGLE\Downloads` folder for the "Genz Loan.apk" file.

### Automated Tests
- Run `./gradlew test` to ensure no regressions in build logic (though none are expected).
