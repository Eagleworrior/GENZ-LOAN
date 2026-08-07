# Implementation Plan - Manual Date Selection and Colorful UI Overhaul

The user wants to replace the problematic native date picker with a manual selection method (dropdowns) and transform the UI from a predominantly green theme to a vibrant, multi-colored, "beautiful" experience.

## User Review Required

> [!IMPORTANT]
> I will replace the Date of Birth field with three separate dropdowns: **Day**, **Month**, and **Year**. This gives users total manual control and eliminates issues with native system pickers.
> The UI will undergo a major color transformation. Instead of the green/blue theme, each screen and component will use a diverse palette of neons, gradients, and contrasting colors (Pink, Purple, Cyan, Gold, Emerald).

## Proposed Changes

### Assets (WebView UI)

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Replace `input[type="date"]` with three `<select>` elements for Day, Month, and Year.
- Wrap these in a new `manual-date-group` container.
- Update labels and icons to use more descriptive classes for diverse coloring.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- Define a new, broader color palette in `:root`.
- Apply unique color schemes to each major card (e.g., Balance card in Gold/Purple, History in Pink/Cyan).
- Style the new manual date dropdowns to look like premium UI components.
- Enhance typography with more color variety and text shadows.
- Update the `bg-animation` to be more colorful and dynamic.

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Update the validation logic to check the three new date dropdowns.
- Add a helper to combine the three values into a single DOB string if needed for backend/state storage.
- Update UI update functions to reflect the new color associations (e.g., status messages in different colors based on state).

## Verification Plan

### Manual Verification
1.  **Manual Date Entry**:
    - Open the Loan Application.
    - Verify that Day, Month, and Year can be selected independently from dropdowns.
    - Confirm the "Next Step" button validates that all three are selected.
2.  **UI Aesthetics**:
    - Check the Login screen for new colors.
    - Verify the Dashboard features a "beautiful" variety of colors (not just green).
    - Ensure each of the 6 steps in the application has a distinct, vibrant color identity.
3.  **Consistency**:
    - Ensure icons and text are legible against the new colorful backgrounds.

---

**Please approve this plan to proceed with the manual date selection and the UI color overhaul.**
