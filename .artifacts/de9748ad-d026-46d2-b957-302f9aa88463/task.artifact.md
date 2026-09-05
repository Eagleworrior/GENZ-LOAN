# Task: KYC Persistence & Liveness Stability Overhaul

Ensuring progress is saved, UI text is accurate, and liveness detection is unhackable.

- `[/]` Phase 1: Persistence Logic Hardening
    - `[ ]` Update `app.js` to save KYC flags in `localStorage`.
    - `[ ]` Update `processLoanApplication` for smart step skipping.
- `[ ]` Phase 2: Liveness Hardening (Native)
    - `[ ]` Remove "document" text from `SELFIE` mode in `KYCActivity.kt`.
    - `[ ]` Implement 3D "Head Turn" requirement for anti-simulation.
    - `[ ]` Ensure auto-capture trigger on liveness finish.
- `[ ]` Phase 3: Final Bridge & Upload Polish
    - `[ ]` Verify `onShowFileChooser` in `MainActivity.kt`.
    - `[ ]` Update `index.html` guidance text.
- `[ ]` Phase 4: Final Verification
    - `[ ]` Test Persistence (Close/Reopen).
    - `[ ]` Test Anti-Spoof (Photo test).
    - `[ ]` Final push.
