# Implementation Plan - Splash Screen & Offline Strictness

This plan implements a professional startup sequence and a strict "No Internet" screen to ensure Paystack and Firebase operations remain secure and reliable.

## User Review Required

> [!IMPORTANT]
> **Strict Offline Mode**: The app will now monitor the user's connection in real-time. If the internet is lost, a beautiful "Connection Lost" screen will automatically cover the app and block any further actions until the connection is restored.

> [!TIP]
> **Premium Startup Sequence**: We are adding a high-end Splash Screen with an animated glowing logo and a "pulsing" loader that reflects the app's professional neon branding.

## Proposed Changes

### [UI / UX Components]

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- **Splash Screen**: Add `#splash-screen` as the top-most layer.
    - Features: Animated logo, "GenZ" text, and a circular gradient loader.
- **Offline Screen**: Add `#offline-screen`.
    - Features: "No Signal" neon icon, professional error message, and a "Retry Connection" button.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- Create styles for the Splash Screen (centered logo, fade-out animation).
- Create styles for the Offline Screen (glassmorphism overlay, pulsing red glow for the "No Connection" icon).
- Add a professional "Loader" animation using CSS keyframes.

### [Core Logic]

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- **Connectivity Engine**:
    - Implement `checkConnectivity()` to show/hide the offline screen based on `navigator.onLine`.
    - Add real-time listeners for `online` and `offline` events.
- **Startup Sequence**:
    - On load:
        1. Show Splash Screen.
        2. Wait 2.5 seconds (for branding impact).
        3. Check Connectivity.
        4. If Online: Show Auth/Dashboard and hide Splash.
        5. If Offline: Show Offline Screen.

## Verification Plan

### Manual Verification
1. **Startup Check**: Launch the app and verify the Splash Screen appears with a beautiful animation before anything else.
2. **Offline Mode Test**:
    - Turn off the device's internet. Verify the "No Connection" screen appears instantly.
    - Verify that no other screens can be accessed while offline.
3. **Re-connection Test**: Turn internet back on. Verify the app automatically dismisses the offline screen and returns to the previous state.
4. **Retry Button**: Click the "Retry" button on the offline screen to verify it correctly triggers a re-check.
