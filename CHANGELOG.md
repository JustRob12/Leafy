# Leafy — Project Change Log & Audit Tracker

This file tracks all modifications, UI/UX updates, bug fixes, and feature additions across the Leafy project. Every update is documented with exact timestamps (Date & Time), affected files, and detailed descriptions.

## [2026-10-01 03:52:00 +08:00] Removed Calculator from More Actions Modal on Home Screen
### Summary of Changes:
1. **Removed Calculator Action (`HomeScreen.tsx`)**:
   - Removed the Calculator shortcut button from the `moreActionsGrid` inside the **"More Actions"** modal.
   - Restores a symmetrical 12-item grid (3x4 or 4x3) encompassing: Pending, Debt, Grocery, Travel, Recursion, Calendar, Converter, Story, Subscription, Installment, Rent, and Split.

### Affected Files:
- `client/src/screens/HomeScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 03:51:00 +08:00] Money Split Allocation Feature in More Actions & Non-Clickable Header Scrolling Message
### Summary of Changes:
1. **Non-Clickable Header Running Marquee Quote (`MainHeader.tsx`)**:
   - Replaced `<TouchableOpacity onPress={() => navigation.navigate('StatusCard')} ...>` wrapping the scrolling quote ticker under the header with a non-interactive `<View style={styles.marqueeContainer}>`.
   - Clicking on the ticker no longer navigates to the Story (`StatusCard`) page.
2. **Money Split Allocation Engine & State (`AppContext.tsx`)**:
   - Added `SplitScheduleType`, `SplitItem`, and `MoneySplitPlan` type definitions.
   - Added `splits` state and methods: `addSplit`, `editSplit`, `deleteSplit`, and `executeSplit` with full persistence to `@money_splits` in `AsyncStorage`.
   - **Transaction & Balance Integration**: When a split plan executes, paired transfer transactions (withdrawals from source wallet and deposits into destination wallets) are automatically recorded in `transactions`, and balances are deducted from the source wallet and added to target accounts.
3. **Money Split Hub Screen (`SplitScreen.tsx`)**:
   - Built a dedicated Money Split dashboard featuring an active volume hero card, plan list, source wallet indicators, schedule badges, multi-colored segmented breakdown bars, and destination account pills (GCash, GoTyme, etc.) showing amounts and remaining source wallet funds.
   - Integrated a 1-tap **"Execute Split Now"** button with a confirmation dialog that prompts the user with the exact deduction and destination breakdown before running.
   - Added edit (pencil) and delete (trash with confirm) actions, and a prominent "+ New" split header action.
4. **Interactive Create/Edit Split Plan Screen (`AddSplitScreen.tsx`)**:
   - **Source Wallet & Budget Configuration**: Source account picker with live balance indicators, formatted total amount input, and quick allocation chips.
   - **Rich Timing & Frequency Controls**:
     - *Once*: Custom date picker with quick `Today`, `Tomorrow`, and `Next 15th` chips.
     - *Weekly*: Choice of `Weekdays (Mon - Fri)`, `Weekends (Sat - Sun)`, or specific day pills (Mon–Sun).
     - *Every 15th*: Options for `Every 15th of the Month` and `15th & 30th (Payday Cycle)`.
     - *Monthly*: Horizontal 1–31 day-of-month picker.
     - *Yearly*: Month (Jan–Dec) and day (1–31) selectors.
   - **Destination Splits Builder**: Dynamic destination items with destination wallet picker (excluding source account), individual amount input, and optional purpose notes.
   - **Live Allocation Visualizer**: Real-time progress bar showing total budget, allocated sum, remaining funds in source wallet, and error banner if allocation exceeds the total budget.
   - **Dual Action Handlers**: "⚡ Save & Execute Split Now" (immediate transfer & transaction logging) and "💾 Save Split Plan Only" (saved for future/recurring execution).
5. **More Actions Integration (`HomeScreen.tsx`, `App.tsx`)**:
   - Added **Split** with `GitFork` icon and active plan count badge to the "More Actions" modal on the Home screen.
   - Registered `Split` and `AddSplit` screens in the root navigation stack.

### Affected Files:
- `client/src/components/MainHeader.tsx` (Modified)
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/screens/HomeScreen.tsx` (Modified)
- `client/src/screens/SplitScreen.tsx` (Created)
- `client/src/screens/AddSplitScreen.tsx` (Created)
- `client/App.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 03:41:00 +08:00] Expanded Readable Preset Cards & Smooth Vertical Scrolling in Presets Modal on Expense & Income Screens
### Summary of Changes:
1. **Expanded Preset Cards with Enhanced Readability (`WithdrawScreen.tsx`, `DepositScreen.tsx`)**:
   - Replaced cramped 3-column preset cards with spacious, full-width expanded cards (`presetCardItem`, `width: '100%'`, `minHeight: 52px`).
   - Expanded text space: preset category names now have generous breathing room (`fontSize: rf(14.5)`, `theme.fonts.semiBold`), ensuring longer words (such as "Bills & Utilities", "Transportation", "Entertainment", "Health & Fitness", "Rental Income") never get squished, clipped, or truncated.
   - Upgraded icon containers to rounded 38x38 boxes with 18px icons and high-contrast color theming.
   - Added active selection checkmarks: selected presets display an emerald/primary checkmark badge (`Check` icon) on the right side.
   - For custom presets, integrated a dedicated delete trash button (`Trash2`) on the right side of the card with active hitSlop for easy deletion.
2. **Smooth Vertical Scrolling Up & Down (`WithdrawScreen.tsx`, `DepositScreen.tsx`)**:
   - Expanded modal scroll view height (`maxHeight: 460px`, `maxHeight: '85%'` on modal sheet) with comfortable padding (`paddingBottom: 16px`).
   - Enabled native vertical scroll indicator (`showsVerticalScrollIndicator={true}`) with adaptive theme indicator styling (`indicatorStyle={isDarkMode ? 'white' : 'black'}`) so users can clearly see and scroll through all presets up and down.
   - Enabled `nestedScrollEnabled={true}` for fluid touch responsiveness on iOS and Android.

### Affected Files:
- `client/src/screens/WithdrawScreen.tsx` (Modified)
- `client/src/screens/DepositScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 03:36:00 +08:00] Exact Payment Date Recording and Comprehensive Paid Timestamp Display for Subscriptions
### Summary of Changes:
1. **Exact Payment Date & Timestamp Recording (`AppContext.tsx`)**:
   - Updated `paySubscriptionMonth` to explicitly record the exact ISO payment date and time in each `PaymentHistoryRecord` (`paidDate`), and persist `lastPaidDate`, `lastPaidCycle`, and `lastPaidWalletName` on `SubscriptionType`.
   - Handled wallet attribution: tracks wallet name when paid via wallet, or attributes to `External / Card` when paid without wallet deduction.
   - Updated `revertSubscriptionMonth` to accurately roll back `lastPaidDate` to the preceding historical payment record.
2. **Subscription Detail Screen Paid Displays (`SubscriptionDetailScreen.tsx`)**:
   - **Overview Card Last Payment Banner**: Added a dedicated green-tinted banner displaying `✓ Last Paid: Paid on DD MMM YYYY • hh:mm AM/PM` with billing cycle and wallet information.
   - **Intelligent Next Renewal Box**: When the current billing month is paid, displays `✓ Current Cycle Paid` and automatically advances the next renewal date and action button to the next upcoming unpaid cycle (`Pay Next`) instead of prompting to re-pay the already paid cycle.
   - **Schedule Item Paid Badges**: Enhanced paid cycle cards with high-contrast emerald containers displaying `✓ Paid on DD MMM YYYY • hh:mm AM/PM • WalletName`.
   - **Confirmation Modal Timestamp Notice**: In the renewal modal, added a live notice displaying the exact payment timestamp being recorded.
3. **Subscriptions List Screen Status & Timestamp (`SubscriptionScreen.tsx`)**:
   - Each subscription card now displays the exact date and time it was paid: `✓ Paid on DD MMM YYYY • hh:mm AM/PM`.
   - Status badge transitions from countdown days to a clean emerald `✓ Paid` badge when paid for the current cycle.
4. **Dashboard Subscriptions Widget (`HomeScreen.tsx`)**:
   - Subscriptions that are already paid for the current billing cycle are excluded from the pending/due count and display `✓ Paid on DD MMM` on the Home screen.

### Affected Files:
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/screens/SubscriptionDetailScreen.tsx` (Modified)
- `client/src/screens/SubscriptionScreen.tsx` (Modified)
- `client/src/screens/HomeScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 03:30:00 +08:00] Static Picked Wallet Display Pill & Relocated Paste Button to Bottom of Wallet on Expense & Income Screens
### Summary of Changes:
1. **Static Picked Wallet Display Pill (`WithdrawScreen.tsx`, `DepositScreen.tsx`)**:
   - Converted the picked wallet balance indicator directly below the entered amount from an interactive dropdown into a clean, static display pill (`<View style={styles.walletDisplayBadge}>`).
   - Removed the `ChevronDown` arrow icon so it purely serves as a visual indicator of the currently selected deduction/deposit wallet and its live balance.
   - Account switching is preserved in the primary bottom action bar wallet picker (`BottomWalletBar`).
2. **Relocated Paste Button & Active Preset Below Wallet Display**:
   - Moved the `Paste` action pill and active preset badge directly underneath the picked wallet balance pill rather than sharing the same horizontal row.
   - Creates a balanced, clean vertical hierarchy:
     1. Large centered entered amount (`₱ 0.00` / `$ 0.00`).
     2. Picked wallet balance pill (`[ ● WalletName • ₱Balance ]`).
     3. Centered quick action pills (`[ 📋 Paste ]` and `[ Active Preset ]`).

### Affected Files:
- `client/src/screens/WithdrawScreen.tsx` (Modified)
- `client/src/screens/DepositScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 03:28:00 +08:00] Neatly Arranged Presets Grid, "Others" Presets Modal, and Direct "Add Preset" Workflow on Expense & Income Screens
### Summary of Changes:
1. **Symmetrical 4x3 Presets Grid Layout (`WithdrawScreen.tsx`, `DepositScreen.tsx`)**:
   - Re-architected preset chips layout on both Expense and Income screens into an exact **4-column x 3-row grid** (12 chips total).
   - Display items consist of the top 11 presets plus the interactive **"Others"** chip in the bottom-right corner.
   - Styled the "Others" chip with a distinct subtle green badge styling and bold text to clearly communicate its interactive expandable behavior.
2. **"Others" Presets Modal Sheet (`WithdrawScreen.tsx`, `DepositScreen.tsx`)**:
   - Tapping the **"Others"** chip now opens a dedicated presets modal (`AllPresetsModal`) displaying all categories.
   - Includes a scrollable categorized view of **Custom Presets** (with individual delete trash action buttons) and **All Standard Presets**.
   - Tapping any preset from the modal immediately selects that category, updates the screen's active preset badge, and smoothly closes the modal.
3. **Integrated "Add Preset" Option**:
   - Added a prominent dashed action button `[ ＋ Add New Preset ]` at the top of the "Others" modal.
   - Triggers the custom preset creation modal where users can enter a custom reason/category name and choose from the available icon gallery.
   - On creation, the new preset is persisted to `AsyncStorage` via `AppContext`, auto-selected for the pending transaction, and both modals close cleanly.

### Affected Files:
- `client/src/screens/WithdrawScreen.tsx` (Modified)
- `client/src/screens/DepositScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-01 03:21:00 +08:00] Centered Amount Display & Relocated Wallet Display Pill to Bottom of Enter Amount on Expense & Income Screens
### Summary of Changes:
1. **Centered Amount Display (`WithdrawScreen.tsx`, `DepositScreen.tsx`)**:
   - Set `textAlign: 'center'` on `amountText`, `width: '100%'` and `justifyContent: 'center'` on `amountDisplayRow`, and `alignItems: 'center'` on `displaySection`.
   - Ensures the entered amount and currency prefix (`₱` / `$`) are squarely and symmetrically centered on both portrait and landscape orientations.
   - Kept the USD real-time rate conversion hint centered directly underneath the amount on Income screen.
2. **Relocated Display Wallet Pill to Bottom of Enter Amount**:
   - Removed the wallet display badge from the top header bar, restoring clean, centered screen titles ("Expense" and "Income") between the Back button and Switch button.
   - Moved the interactive display wallet pill (`[ ● WalletName • ₱Balance ▾ ]`) directly below the enter amount display, sitting neatly alongside the Paste button and preset badge.
   - Tapping the wallet pill immediately opens the wallet picker bottom sheet to quickly change deduction/deposit accounts.

### Affected Files:
- `client/src/screens/WithdrawScreen.tsx` (Modified)
- `client/src/screens/DepositScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

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
