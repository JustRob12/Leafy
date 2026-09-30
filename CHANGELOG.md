# Leafy — Project Change Log & Audit Tracker

This file tracks all modifications, UI/UX updates, bug fixes, and feature additions across the Leafy project. Every update is documented with exact timestamps (Date & Time), affected files, and detailed descriptions.

---

## [2026-10-01 03:03:00 +08:00] Reduced Gap Between Running Quote Marquee and Total Card Carousel on Home Screen
### Summary of Changes:
1. **Compacted Header-to-Card Spacing (`HomeScreen.tsx`)**:
   - Reduced `scrollContent.paddingTop` from `theme.spacing.lg` (24px) to **6px**.
   - Removed the extra `carouselWrapper.paddingTop` (from 8px to **0px**).
   - Reduced `carouselScrollContent.paddingVertical` from 6px to **2px** to preserve card shadow integrity while removing unnecessary vertical dead space.
   - Result: Reduced the total vertical gap between the running quote banner and the total card page from ~38px down to a sleek, compact **~8px**.

### Affected Files:
- `client/src/screens/HomeScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 02:38:00 +08:00] Redesigned Installment, Rent Property, and Subscription Detail Screens with Payment History Timestamps
### Summary of Changes:
1. **Interactive Payment Detail Screens Based on User Reference (`InstallmentDetailScreen.tsx`, `RentDetailScreen.tsx`, `SubscriptionDetailScreen.tsx`)**:
   - Implemented high-fidelity, redesigned detail views inspired by the user's reference mockup, elevated with Leafy's signature aesthetic (glassmorphism, Inter typography, dark mode support, and smooth cards).
   - **Overview Card**:
     - Branded category icon container, product/property/subscription title, and provider/status subtitle.
     - **Segmented Progress Bar**: Visual segments indicating completed cycles, active due cycle, and remaining obligations.
     - **Financial Metrics**: Explicit breakdown of Remaining Balance, Total Cost / Annual Estimate, and Paid-to-date amounts.
     - **Next Payment Action Box**: Highlights next payment amount, due date with countdown/overdue indicators, and a prominent `[ 💳 Pay ]` button.
2. **Exact Payment History & Date/Time Tracking**:
   - Each payment cycle in the **Schedule** section explicitly records and displays **when** it was paid:
     - Includes exact date, time, and wallet used: `✓ Paid on DD MMM YYYY • HH:MM AM/PM • WalletName`.
     - Backward compatible: Pre-existing cycles without history records display `Marked paid before tracking`.
     - Status badges: `✓ Paid` (green), `Due` / `[ 💳 Pay ]` (primary green), `Unpaid` / `Upcoming` (neutral gray), and `🚨 Overdue` (red).
     - Single-tap payment reversal / undo option for the most recent payment with confirmation modal.
3. **Wallet Selection Modal**:
   - Tapping `[ 💳 Pay ]` opens a wallet selection bottom sheet displaying real-time wallet balances, sufficient balance validation, automatic withdrawal logging in History, and an option to record external/cash payments.
4. **Context & State Management (`AppContext.tsx`, `paymentSchedule.ts`)**:
   - Extended `InstallmentType`, `RentType`, and `SubscriptionType` with `paymentHistory?: PaymentHistoryRecord[]`.
   - Added payment execution and reversal handlers: `payInstallmentMonth`, `revertInstallmentMonth`, `payRentMonth`, `revertRentMonth`, `paySubscriptionMonth`, `revertSubscriptionMonth`.
   - Added helper utilities for precise due date projection, schedule date formatting, and payment timestamp formatting.
5. **App Navigation & Seamless Routing (`App.tsx`, `InstallmentScreen.tsx`, `RentScreen.tsx`, `SubscriptionScreen.tsx`, `HomeScreen.tsx`)**:
   - Registered `InstallmentDetail`, `RentDetail`, and `SubscriptionDetail` in the stack navigator.
   - Updated card clicks in `InstallmentScreen`, `RentScreen`, and `SubscriptionScreen` to navigate to their corresponding detail screens.
   - Updated active installment and rent property horizontal cards on the `HomeScreen` dashboard to open their detail views directly.

### Affected Files:
- `client/src/screens/InstallmentDetailScreen.tsx` (New)
- `client/src/screens/RentDetailScreen.tsx` (New)
- `client/src/screens/SubscriptionDetailScreen.tsx` (New)
- `client/src/utils/paymentSchedule.ts` (New)
- `client/src/context/AppContext.tsx` (Modified)
- `client/App.tsx` (Modified)
- `client/src/screens/InstallmentScreen.tsx` (Modified)
- `client/src/screens/RentScreen.tsx` (Modified)
- `client/src/screens/SubscriptionScreen.tsx` (Modified)
- `client/src/screens/HomeScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 02:24:00 +08:00] Mask Installments & Rent Properties on Eye Privacy Toggle
### Summary of Changes:
1. **Global Balance Visibility Synchronization (`AppContext.tsx`)**:
   - Elevated `isBalanceHidden` and `toggleBalanceVisibility` into `AppContext` with persistent `AsyncStorage` (`@isBalanceHidden`).
   - Ensures toggling the eye button from any screen keeps amounts uniformly hidden or revealed across the entire app.
2. **HomeScreen Installments & Rent Properties Masking (`HomeScreen.tsx`)**:
   - Connected active Installment cards (both Urgent and Standard) to `isBalanceHidden`, masking amounts as `${symbol} ****** / mo`.
   - Connected Rent Property cards (both Urgent and Standard) to `isBalanceHidden`, masking monthly rent amounts as `${symbol} ****** / mo`.
3. **Dedicated Installment Screen Privacy (`InstallmentScreen.tsx`)**:
   - Added an Eye visibility toggle button (`Eye` / `EyeOff`) to the header next to the Add button.
   - Masked total monthly obligations, remaining balances, monthly payments, and total plan costs when `isBalanceHidden` is active.
4. **Dedicated Rent Tracker Screen Privacy (`RentScreen.tsx`)**:
   - Added an Eye visibility toggle button (`Eye` / `EyeOff`) to the header next to the Add button.
   - Masked total monthly rent and individual property monthly rent amounts when `isBalanceHidden` is active.
5. **Wallets Screen Synchronization (`WalletsScreen.tsx`)**:
   - Unified wallet balance visibility with the global `isBalanceHidden` state and `toggleBalanceVisibility`.

### Affected Files:
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/screens/HomeScreen.tsx` (Modified)
- `client/src/screens/InstallmentScreen.tsx` (Modified)
- `client/src/screens/RentScreen.tsx` (Modified)
- `client/src/screens/WalletsScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-09-30 20:33:00 +08:00] History Screen Instant Tab Switching Optimization & Transaction 'More' Expansion
### Summary of Changes:
1. **Initial 5 Transactions Display Limit (`HistoryScreen.tsx`)**:
   - Limited the initial render count of monthly transactions to the **first 5 transactions** instead of mounting hundreds of transactions at once.
   - Eliminates UI thread lag and frame drops, making switching to the History tab virtually instantaneous.
2. **Interactive 'More' Expansion Text Button (`HistoryScreen.tsx`)**:
   - Added an ergonomic text button at the bottom of the transaction list when total matching transactions exceed 5 (`More (${remaining})` / `Show Less`).
   - Tapping "More" immediately reveals all remaining transactions for the selected month and filters without re-fetching or reloading.
   - Automatically resets back to 5 items when switching months or applying category/wallet filters to guarantee optimal performance across all views.
3. **Confirmed Diagnosis**:
   - Confirmed user's correct diagnosis that eagerly rendering unbounded transaction lists inside `ScrollView` was the root cause of the tab-switching delay.

### Affected Files:
- `client/src/screens/HistoryScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-09-30 20:25:00 +08:00] Expanded Username Character Limit to 12 Letters
### Summary of Changes:
1. **Onboarding Screen Username Limit (`OnboardingScreen.tsx`)**:
   - Increased the name input limit from 6 characters to **12 characters** (`maxLength={12}`).
   - Accommodates full names comfortably without artificial truncation.
2. **Settings Screen Name Update Limit (`SettingsScreen.tsx`)**:
   - Updated the "Change Name" modal input limit from 6 characters to **12 characters** (`maxLength={12}`).
3. **Uncluttered Header Greeting Space**:
   - Because the dynamic financial quote was relocated to the running marquee below the header, the header greeting (`MainHeader.tsx`) now accommodates longer 12-letter names cleanly without any crowding or truncation.

### Affected Files:
- `client/src/screens/OnboardingScreen.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-09-30 20:23:00 +08:00] Wallet Percent Badge Conflict Fix & Infinite Running Quote Marquee Under Header
### Summary of Changes:
1. **Wallet Card Percent Badge Removal (`WalletsScreen.tsx`)**:
   - Removed the interest rate growth percentage badge (`{wallet.interestRate}%`) from the wallet cards container footer.
   - Fixed the layout conflict/crowding between the interest badge and the QR code action button (`qrActionBtn`).
   - Relaxed the wallet purpose pill width constraint (`maxWidth: 75` removed) so purpose names display clearly and naturally.
2. **Infinite Horizontal Running Marquee Quote Under Header (`MainHeader.tsx`)**:
   - Moved the financial behavior quote/message out of the cramped status bubble in the header greeting row and positioned it directly under the header content as a smooth, infinitely scrolling horizontal marquee ticker moving from right to left.
   - Built with hardware-accelerated `Animated.loop` (`useNativeDriver: true`) with linear velocity (~35-40 px/s) and multi-copy seamless looping to guarantee zero flicker or visual jumps across all screen sizes.
   - Styled with subtle thematic backdrop (`rgba(16, 185, 129, 0.05)` / dark mode equivalent), delicate borders, nature/sparkle icon (`Sparkles`), and soft separators (`✦`).
   - Interactive: tapping the running quote marquee smoothly navigates to `StatusCardScreen` to inspect the user's financial breakdown story.
3. **Preserved Dynamic Money Behavior Logic (`useHeaderAlerts.ts`)**:
   - Retained the complete real-time adaptive message logic responding dynamically to user financial behavior:
     - Overdue debts alerts
     - Low / thin balance warnings (< ₱500)
     - Zero balance / dry garden alerts (≤ ₱0)
     - Spending velocity checks (month expenses > month savings)
     - Goal milestone encouragement (> 80% progress)
     - Booming savings positive reinforcement (> 1.5x expenses)
     - Nature-inspired financial wisdom rotations by day of week.

### Affected Files:
- `client/src/screens/WalletsScreen.tsx` (Modified)
- `client/src/components/MainHeader.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-09-30 20:06:00 +08:00] Preset Layout Reorganization, Settings Preset Management & Audit Tracking
### Summary of Changes:
1. **3-Row Preset Grid with Compact Design**:
   - Reorganized preset chips on both **Income (`DepositScreen.tsx`)** and **Expense (`WithdrawScreen.tsx`)** screens from a single horizontal row into **3 compact rows**.
   - Presets scroll smoothly in sync horizontally while maintaining small, ergonomic chip dimensions (`height: 27`, `paddingHorizontal: 9`, `borderRadius: 14`).
2. **Repositioned Display (`₱0.00`) & Paste Action Above**:
   - Shifted the amount display row and Paste action button upwards directly below the header/currency toggle, eliminating excessive empty vertical space.
   - Refined amount font sizing and spacing for optimal ergonomics.
3. **Recent Incomes & Expenses Positioned Below Presets**:
   - Repositioned the Recent Incomes and Recent Expenses chips directly below the 3-row preset grid, preceding the 4x4 Calculator Keypad.
4. **Preset Management in Settings (`SettingsScreen.tsx`)**:
   - Added a dedicated **Transaction Presets** management section under Settings.
   - Added tab switching between **Income Presets** and **Expense Presets**.
   - Added capabilities to **Edit preset name & icon**, **Delete presets**, **Add new presets**, and **Reset to defaults**.
   - Added shared preset icon constants in `client/src/constants/presetIcons.ts`.
5. **AppContext Extensions (`AppContext.tsx`)**:
   - Added `editIncomePreset`, `editWithdrawPreset`, and `resetPresetsToDefault` methods with persistent AsyncStorage storage.
6. **Project Change Tracker (`CHANGELOG.md`)**:
   - Created this project-level audit log file to record and track all modifications with dates and timestamps.

### Affected Files:
- `CHANGELOG.md` (Created)
- `client/src/constants/presetIcons.ts` (Created)
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `client/src/screens/DepositScreen.tsx` (Modified)
- `client/src/screens/WithdrawScreen.tsx` (Modified)

---

## [2026-09-30 20:02:45 +08:00] Income & Expense Screen Switcher
### Summary of Changes:
1. **Income Screen (`DepositScreen.tsx`)**:
   - Added an **Expense** switch button (`⇄ Expense`) in the top-right header with subtle red styling.
   - Seamlessly transitions to `WithdrawScreen` using `navigation.replace` while preserving typed amounts, calculation formulas, selected wallet, and currency.
2. **Expense Screen (`WithdrawScreen.tsx`)**:
   - Added an **Income** switch button (`⇄ Income`) in the top-right header with subtle green styling.
   - Seamlessly transitions to `DepositScreen` using `navigation.replace` while preserving typed amounts, calculation formulas, selected wallet, and currency.

### Affected Files:
- `client/src/screens/DepositScreen.tsx` (Modified)
- `client/src/screens/WithdrawScreen.tsx` (Modified)
