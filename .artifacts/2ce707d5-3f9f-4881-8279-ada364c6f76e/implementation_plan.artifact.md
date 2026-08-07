# Implementation Plan - Paystack Fix & Neon UI Colors

This plan resolves the "Currency Not Supported" error by optimizing Paystack settings for a Kenyan merchant and enhances the UI by applying neon colors to user-inputted text.

## User Review Required

> [!IMPORTANT]
> **Paystack Currency Limitation**: As a Kenyan merchant, Paystack only allows you to charge in **KES** or **USD**. You **cannot** directly charge in NGN, GHS, or ZAR from a Kenyan account.
>
> **How International Payments Work**:
> 1. You charge the user in **KES**.
> 2. The user pays with their local card (e.g., a Nigerian card).
> 3. The user's bank automatically converts their Naira (NGN) to KES.
> 4. You receive the money in KES.
>
> I will update the app to always process payments in **KES** (or **USD**) while allowing the user to select their country for identification purposes. This ensures the payment always works.

## Proposed Changes

### [Component: UI Styling]

We will update the CSS to ensure that the text users type into the input fields matches the neon colors of the icons and labels.

#### [MODIFY] [style.css](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/style.css)
- Apply specific colors to the text within each input field:
    - **Full Name**: Neon Blue
    - **Email**: Neon Pink
    - **Phone**: Neon Yellow
    - **Password**: Neon Orange
    - **Income/Expenses**: Neon Blue/Yellow
- Ensure select menus also use themed text colors.

### [Component: Payment Logic]

We will fix the "Currency Not Supported" error by ensuring the payment currency sent to Paystack is always supported by your Kenyan account.

#### [MODIFY] [app.js](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/app.js)
- Update `PaystackPop.setup` to use `KES` (or `USD`) even if the user is from Nigeria, ensuring the transaction isn't rejected.
- Remove the `channels` restriction to allow Paystack to automatically offer the best payment methods for that currency/country.

#### [MODIFY] [index.html](file:///C:/Users/EAGLE/StudioProjects/GENZ-LOAN/app/src/main/assets/index.html)
- Update the currency selector labels to indicate that payments are processed in KES/USD for global compatibility.

## Verification Plan

### Manual Verification
1.  **Registration**: Type in the registration fields and verify the text is colorful (e.g., Phone text is yellow).
2.  **Payment (Nigeria)**: Select "Nigeria" in the signup, then try to "Disburse" or "Repay". Verify the Paystack modal opens without a "currency not supported" error (it will show KES or USD).
3.  **Dropdowns**: Verify that selecting a value in a dropdown shows the themed color.
