# TODO: High-Security Identity Verification Integration

Implementing a professional, native-backed KYC system with video liveness and global document support while maintaining the neon aesthetic.

- `[x]` **Phase 1: Build System & Permissions**
    - `[x]` Update `app/build.gradle` with CameraX and ML Kit dependencies.
    - `[x]` Update `AndroidManifest.xml` with camera, audio, and storage permissions.
- `[x]` **Phase 2: Android Native Layer**
    - `[x]` Create `KYCActivity.kt` for secure capture.
    - `[x]` Implement ML Kit liveness detection (blink/smile).
    - `[x]` Create `KYCBridge.kt` for JS-Native communication.
    - `[x]` Register bridge in `MainActivity.kt`.
- `[x]` **Phase 3: Global Document UI (Web)**
    - `[x]` Design searchable document selector in `index.html`.
    - `[x]` Add country-specific guidance screen.
    - `[x]` Update `style.css` with professional neon overlays and animations.
- `[x]` **Phase 4: Logic & Integration**
    - `[x]` Implement state machine in `app.js` to drive the new KYC flow.
    - `[x]` Handle native results and prepare for "Verification Success" flow.
- `[/]` **Phase 5: Verification & Polish**
    - `[ ]` Test liveness detection reliability.
    - `[ ]` Verify UI consistency (neon colors).
    - `[x]` Final build and walkthrough.
