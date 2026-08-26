# Implementation Plan - Advanced Intelligence, Security & UX Overhaul

This plan upgrades the GenZ Loan app with high-intelligence biometric verification, strict connectivity enforcement, a professional terms gateway, and a robust application resume system.

## User Review Required

> [!IMPORTANT]
> **Intelligent Biometrics**: The face scan will now actively verify image clarity using canvas analysis. It will guide the user through a 3-point capture (Center, Left, Right) and will *refuse* to capture if the environment is too dark or the image is blurry.
>
> **Strict Continuity**: All application progress will be saved in real-time. If a user closes the app at Step 4, they will return exactly to Step 4 with their data preserved and "locked" for that session.
>
> **Forced Online State**: To protect financial integrity, the app will monitor the connection every second. If the internet drops, the UI will be instantly replaced by a "No Connection" lock screen.

## Proposed Changes

### [UI / UX Components]

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- **Home Navigation**: Add a "Home" icon button (`fa-house`) in the header of all application steps.
- **Terms Gateway**: Refine the Terms screen to be the first mandatory stop for new users.
- **Advanced Scan UI**: Enhance the `#scan-screen` with clear indicators for "Front, Left, Right" stages and a clarity meter.
- **Mobile Payout**: Add an editable phone input in Step 7 that defaults to the user's registration number.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- **Centered Toasts**: Update toast styles to be perfectly centered with a professional neon-pink/green glow.
- **Home Menu Button**: Style the new navigation button for a glassmorphism feel.
- **Biometric Lenses**: Add "Digital Lens" overlays and scanning animations for the camera.

### [Core Logic & Brain]

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Resume System**:
    - Save `currentUser.loanStep` and `currentUser.loanFormData` to `localStorage` on every "Next" click.
    - Update `showScreen('apply-screen')` to automatically load the last saved step.
- **Smart Connectivity**:
    - Implement a `setInterval` that force-checks `navigator.onLine` every 1000ms.
- **Clarity-Driven Scan**:
    - Use a hidden canvas to analyze pixel brightness and variance before allowing a capture.
    - Implement the guided "Turn Left/Right" logic with mandatory clarity thresholds.
- **Anti-Spam Toasts**:
    - Implement a cooldown/duplicate check in `showToast` to prevent multiple messages from appearing simultaneously.

## Verification Plan

### Manual Verification
1. **Resume Test**: Start a loan, reach Step 3, go to Home, click Apply again. Verify you land on Step 3 with data intact.
2. **Clarity Test**: Try to perform a face scan in a completely dark room or with the camera covered. Verify the app waits for a clear face.
3. **Spam Test**: Repeatedly click "Next" on an empty field and verify only ONE centered toast appears.
4. **Offline Test**: Disable Wi-Fi. Verify the app locks instantly and cannot be used until the connection is restored.
5. **Payout Test**: Verify the mobile payout field shows your signup number but allows editing.
