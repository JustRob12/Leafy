# Leafy — Project Change Log & Audit Tracker

This file tracks all modifications, UI/UX updates, bug fixes, and feature additions across the Leafy project. Every update is documented with exact timestamps (Date & Time), affected files, and detailed descriptions.

## [2026-10-09 05:07:00 +08:00] Fixed Rent Calendar Connection & Removed Artificial Card Side Bars
### Summary of Changes:
1. **Removed Left Accent Border Bars on Calendar Cards (`CalendarScreen.tsx`)**:
   - Removed `borderLeftWidth: 3.5` and `borderLeftColor` from `upcomingItemCardUnpaid`.
   - Removed `borderLeftWidth: 4` and `borderLeftColor` from both `agendaCardUnpaid` and `agendaCardPaid`.
   - Replaced artificial side stripe bars with clean, subtle border and background highlighting that preserves consistent card geometry and looks natural.
2. **Fixed Rent Payment Status Calculation in Calendar (`CalendarScreen.tsx`)**:
   - Corrected rent cycle mapping: Month 1 is the lease start month (`startDate`), Month 2 is +1 month, etc.
   - Tied payment status directly to whether `paidCycles` covers the viewed month's cycle number (`cycleNumber <= paidCycles`).
   - Eliminated the buggy `paidDate` timestamp check that falsely marked October as paid if any payment had been recorded during October.
   - Eliminated the buggy `isBeforeDueMonth` assumption that incorrectly marked months as paid.
   - Prevented phantom rent events from appearing for months prior to the tenancy start date (`monthsSinceStart < 0`).
3. **Dedicated Rent Due Date Calculation (`AppContext.tsx`, `paymentSchedule.ts`)**:
   - Introduced and exported `calculateRentDueDate(startDateStr, paidCycles)`:
     - With 0 cycles paid, the first rent payment is due on `startDate` itself (not shifted into next month).
     - With 1 cycle paid, the next rent payment is due 1 month after `startDate`.
   - Updated `addRent`, `editRent`, `payRentMonth`, and `revertRentMonth` in `AppContext.tsx` to use `calculateRentDueDate`.
   - Added automatic due date normalization on app startup in `AppContext.tsx` for stored rents.
   - Updated `AddRentScreen.tsx` and `RentDetailScreen.tsx` to use the accurate rent cycle helpers.

### Affected Files:
- `client/src/screens/CalendarScreen.tsx` (Modified)
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/utils/paymentSchedule.ts` (Modified)
- `client/src/screens/AddRentScreen.tsx` (Modified)
- `client/src/screens/RentDetailScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 04:36:00 +08:00] Removed QR Code Widget (QuickCardsWidget)
### Summary of Changes:
1. **Removed Android Native Widget Configuration (`app.json`)**:
   - Removed `QuickCardsWidget` from the Android native widgets array in `app.json`.
   - Maintained `TotalBalanceWidget` (4x2 home screen balance & expense widget) and `TotalExpenseWidget` (2x1 compact expense widget).
2. **Cleaned Up Widget Task Handler (`widget-task-handler.tsx`)**:
   - Removed `QuickCardsWidget` import and background click handler logic for card cycling.
3. **Streamlined Widget Service (`WidgetService.ts`)**:
   - Removed `QuickCardsWidget` import and update requests from `syncWidgetBalance`.
   - Removed `requestPinQuickCardsWidget()` helper function.
4. **Updated Settings Screen UI (`SettingsScreen.tsx`)**:
   - Removed the Quick Cards widget live preview and the "Add Cards Widget to Phone Screen" pinning button.
   - Retained the live preview and launcher pinning for the Total Balance & Expenses widget.
5. **Deleted Unused Widget Component (`QuickCardsWidget.tsx`)**:
   - Removed `src/widgets/QuickCardsWidget.tsx` from the codebase.

### Affected Files:
- `client/app.json` (Modified)
- `client/src/widgets/widget-task-handler.tsx` (Modified)
- `client/src/services/WidgetService.ts` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `client/src/widgets/QuickCardsWidget.tsx` (Deleted)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 04:06:00 +08:00] Fixed Widget Card Layout, Typography Wrapping & Horizontal Credit Card Proportions
### Summary of Changes:
1. **Resolved Category Badge & Title Text Wrapping Bug (`QuickCardsWidget.tsx`)**:
   - Fixed the issue visible in phone testing where `"E-WALLET"` wrapped into two lines (`E-WALL \n ET`) and `"Maya (PayMaya)"` was truncated as `"Maya \n (PayMa"`.
   - Category Badge: Scaled to `fontSize: 8.5dp` with `maxLines={1}` and compact padding, preventing text wrap.
   - Card Counter: Simplified counter to compact format (e.g., `1/3 ❯`), preventing it from pushing the category badge off-screen.
   - Dynamic Responsive Title Sizing: Added intelligent title sizing based on name length (`>22 chars: 11.5dp`, `>12 chars: 13.5dp`, `<=12 chars: 16dp`), allowing long titles like `"Maya (PayMaya)"` to gracefully fit on two lines without truncation.
   - Cardholder & Flip Pill: Constrained cardholder name (`maxLines={1}`) and formatted flip hint (`TAP TO FLIP`, 7.5dp), ensuring both elements stay properly aligned without overflow.
2. **Balanced QR Code Dimensions (`QuickCardsWidget.tsx`)**:
   - Balanced QR code container to **102x102dp** with **90x90dp** image, maintaining instant camera scannability while freeing up **24dp of extra horizontal width** for the text details on the right.
3. **Optimized Launcher Dimensions (`app.json`)**:
   - Configured `QuickCardsWidget` to `targetCellHeight: 2`, `targetCellWidth: 4`, `minHeight: 120dp`, and `minWidth: 280dp` so Android launchers place it as an authentic 4x2 horizontal credit card rather than a squished square.
4. **Settings Screen Live Preview Synchronization (`SettingsScreen.tsx`)**:
   - Updated the live preview in Settings to match the 102x102dp QR container, dynamic typography sizing, and compact header layout.

### Affected Files:
- `client/src/widgets/QuickCardsWidget.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `client/app.json` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 03:35:00 +08:00] Fixed Widget QR Code Image Fetching & Enlarged to Home Page Proportions
### Summary of Changes:
1. **Integrated Native `ImageWidget` for Wallet QR Codes (`QuickCardsWidget.tsx`)**:
   - Fixed the issue where the widget only showed fallback mockup finder squares instead of fetching the wallet's actual uploaded QR code.
   - Imported `ImageWidget` from `react-native-android-widget` and wired it to render `activeWallet?.qrCodeImage` directly inside the white QR container.
   - Normalized local filesystem paths (ensured `file://` scheme prefix) so Android's native `BitmapFactory.decodeFile` seamlessly loads images from the app's document directory.
   - Retained the high-resolution vector QR matrix as a clean fallback when a wallet does not have an uploaded QR code.
2. **Enlarged Widget Dimensions to Match Home Page Display (`QuickCardsWidget.tsx`, `app.json`)**:
   - Updated `app.json` for `QuickCardsWidget` to `minHeight: "180dp"` with `targetCellHeight: 3` and `targetCellWidth: 4` (standard 4x3 Android home screen cell grid), giving it the spacious, authentic card proportions of the home page stack.
   - Enlarged the white QR code container from 82dp to **124x124dp** with an inner image size of **108x108dp**, making the QR code crystal clear and immediately scannable right from the phone's home screen.
   - Scaled typography and card layout:
     - Wallet name: bold **19dp** font with `-0.4` letter spacing supporting up to 2 lines.
     - Category badge: styled pill with 9.5dp bold text.
     - Card counter: 10dp with prominent ` ❯` arrow.
     - Cardholder information: 7.5dp `CARDHOLDER` label + 11.5dp bold embossed uppercase cardholder name.
3. **Synchronized QR Filtering and Next-Card Cycling (`WidgetService.ts`, `widget-task-handler.tsx`)**:
   - Added `getDisplayWallets()` to prioritize and cycle wallets that have QR code images (matching `WalletQrStack.tsx` on the home page) with graceful fallback to all wallets.
   - Ensured `widget-task-handler.tsx` computes `nextCardIndex` using `displayWallets.length` so tapping anywhere on the card cycles through all available QR cards seamlessly.
4. **Enhanced Settings Live Preview (`SettingsScreen.tsx`)**:
   - Updated the live preview in Settings to use `getDisplayWallets` and enlarged dimensions (108x108dp QR box, 18dp title, 16dp padding) matching the updated widget layout.

### Affected Files:
- `client/src/widgets/QuickCardsWidget.tsx` (Modified)
- `client/src/services/WidgetService.ts` (Modified)
- `client/src/widgets/widget-task-handler.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `client/app.json` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 03:08:00 +08:00] Separated into 2 Distinct Widgets: Total Balance & Quick Cards
### Summary of Changes:
1. **Created Dedicated Quick Cards Widget (`QuickCardsWidget.tsx`)**:
   - Built a standalone Android widget strictly dedicated to payment cards with full card canvas proportions (minHeight 130dp, 4x2 cell grid).
   - Features authentic ATM / Visa card aesthetic: brand gradient to crisp white, authentic 82x82dp white QR code box with high-resolution corner finder squares and data matrix clusters, category badge, card counter (`Card 1/3 ❯`), bold 16.5dp wallet name, monospaced uppercase cardholder name, and `TAP TO FLIP` pill.
   - Interactive full-card tap-to-cycle action (`clickAction="NEXT_CARD"`) with automatic index cycling across all user wallets.
2. **Streamlined Total Balance & Expenses Widget (`TotalBalanceWidget.tsx`)**:
   - Refactored `TotalBalanceWidget` to focus purely on balance and expense overview (minHeight 110dp, 4x2 cell grid) without card clutter.
   - Retained custom title, `TOTAL BALANCE`, Show/Hide privacy toggle button (`clickAction="TOGGLE_PRIVACY"`), active wallet count, and bottom total expense pill.
3. **Registered Both Widgets in Android System (`app.json`)**:
   - `TotalBalanceWidget`: Target 4x2 cell grid, label *"Total Balance & Expenses"*.
   - `QuickCardsWidget`: Target 4x2 cell grid, label *"Quick Cards (Wallet Stack)"*.
4. **Unified Widget Task Handler & Service Sync (`widget-task-handler.tsx`, `WidgetService.ts`)**:
   - Updated background widget task handler with dedicated branches for both widgets.
   - Added `requestPinQuickCardsWidget()` alongside `requestPinTotalBalanceWidget()`.
   - Updated `syncWidgetBalance` to synchronously update all widgets (`TotalBalanceWidget`, `QuickCardsWidget`, and `TotalExpenseWidget`).
5. **Enhanced Settings Previews & Pinning (`SettingsScreen.tsx`)**:
   - Separated the in-app previews into two live displays:
     - *Live Preview 1: Total Balance & Expenses*
     - *Live Preview 2: Quick Cards (Tap to Cycle)*
   - Added dedicated pin buttons: **"Add Balance Widget to Phone Screen"** and **"Add Cards Widget to Phone Screen"**.
   - Updated onboarding instructions detailing how both widgets can be placed and used independently on Android home screens.

### Affected Files:
- `client/src/widgets/QuickCardsWidget.tsx` (Created)
- `client/src/widgets/TotalBalanceWidget.tsx` (Modified)
- `client/src/widgets/widget-task-handler.tsx` (Modified)
- `client/src/services/WidgetService.ts` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `client/app.json` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 02:56:00 +08:00] Extended Widget Height & Scaled Actual-Card Proportions
### Summary of Changes:
1. **Extended Widget Dimensions (`app.json`)**:
   - Increased `minHeight` from `180dp` to `230dp` and `targetCellHeight` from `3` to `4` (4x4 standard cell grid), providing generous vertical space for the widget on the phone home screen without feeling oversized.
2. **Scaled Actual-Card Proportions (`TotalBalanceWidget.tsx`)**:
   - Transformed the bottom payment card from a thin ribbon into a well-proportioned, authentic credit-card format (~96dp height).
   - **QR Code Container**: Scaled from 48x48dp to **72x72dp** with precision-scaled corner finder squares (21x21dp with 7x7dp inner dots), timing dots, and data matrix cluster.
   - **Card Details & Typography**: Scaled height to **72dp** with 12dp spacing:
     - Category badge pill: Scaled padding and bold 8.5dp typography.
     - Card counter: Scaled font (8.5dp) with prominent arrow indicator (` ❯`).
     - Wallet Name: Increased to bold **15dp** font (`letterSpacing: -0.3`) for high visibility.
     - Cardholder Information: Monospaced `CARDHOLDER` label (6.5dp) + uppercase cardholder name (**9.5dp** bold).
     - Action pill: `TAP TO FLIP` pill with 7.5dp bold text.
3. **Settings Live Preview Alignment (`SettingsScreen.tsx`)**:
   - Matched the in-app live preview in Settings to the new 72dp card proportions, typography, and layout.

### Affected Files:
- `client/app.json` (Modified)
- `client/src/widgets/TotalBalanceWidget.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 02:42:00 +08:00] Fixed Calendar Grid Alignment and 7-Column Layout
### Summary of Changes:
1. **Resolved 6-Column Wrap & Empty Saturday Bug (`CalendarScreen.tsx`, `LeonDatePicker.tsx`)**:
   - Fixed the calculation bug where fixed-width columns in a `flexWrap: 'wrap'` container caused rows to wrap at 6 days instead of 7 days on standard mobile viewport widths, leaving the Saturday column empty and shifting every subsequent row by 1 weekday.
   - Refactored the month grid layout to structured **7-Day Week Rows** (`gridWeekRow`), where both the weekday headers (`dayHeader`) and the day cells (`dayCell`) utilize `flex: 1` inside row containers (`flexDirection: 'row'`).
   - Mathematically guarantees that every week row contains exactly 7 columns that align 100% under Sunday through Saturday without subpixel wrapping bugs across any screen dimension.
2. **Google Calendar Style Trailing & Leading Days**:
   - Trailing days from the previous month and leading days from the next month are now rendered in subtle, elegant muted typography (`otherMonthDayText`).
   - Tapping trailing or leading days smoothly transitions the calendar to that month and selects the respective date.
3. **Year Boundary & Navigation Safety**:
   - Upgraded `prevMonth()` and `nextMonth()` to compute dates and maximum days directly from Date objects, eliminating month-offset edge cases across year boundaries.
   - Preserved all financial status badges (paid = green, unpaid = light red, overdue = red) and event dots.

### Affected Files:
- `client/src/screens/CalendarScreen.tsx` (Modified)
- `client/src/components/LeonDatePicker.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 02:30:00 +08:00] Authentic Home Screen Card Design on Widget Matching Home Page Display
### Summary of Changes:
1. **Authentic Home Page ATM / Payment Card Design on Widget (`TotalBalanceWidget.tsx`)**:
   - Replicated the authentic ATM / Visa card design from `WalletQrStack.tsx` directly inside the Android Home Screen Widget.
   - **Gradient Background**: Smooth transition from the active wallet's brand color (`activeWallet.color` or theme preview color) fading down to pure white (`#ffffff`).
   - **Crisp QR Code Box (Left)**: Dedicated white square box with 3 precision QR finder squares (top-left, top-right, bottom-left with inner dots) and data matrix timing tracks rendered natively via RemoteViews.
   - **Card Details (Right)**:
     - Top row: Category badge pill (e.g. `E-WALLET`, `BANK`, `CRYPTO`, `WALLET`) with subtle slate background and uppercase typography, plus live card indicator (`Card 1/4 ❯`).
     - Middle row: Bold high-contrast wallet name (`#0f172a`).
     - Bottom row: Monospaced `CARDHOLDER` label + uppercase cardholder name (`username.toUpperCase()` or `'VALUED CLIENT'`) matching the embossed ATM look, paired with a `TAP TO FLIP` action pill.
   - **Clean Payment Card Aesthetic**: Excludes balance amounts from the card face (matching home screen `WalletQrStack` design and preserving financial confidentiality).
   - **Tap to Cycle (`clickAction="NEXT_CARD"`)**: Tapping anywhere on the card cycles to the next card in the stack seamlessly.
2. **Widget Synchronization with User Data (`WidgetService.ts`, `AppContext.tsx`, `widget-task-handler.tsx`)**:
   - Added caching for `@leon_widget_username` and forwarded `username` across all background tasks and widget lifecycle events (`WIDGET_ADDED`, `WIDGET_UPDATE`, `WIDGET_RESIZED`, `TOGGLE_PRIVACY`, and `NEXT_CARD`).
   - Connected `AppContext.tsx` (`setUsername`, data import, and live balance/wallet effect) to ensure instant synchronization of user profile name and card order to the widget.
3. **Settings Screen Live Preview Update (`SettingsScreen.tsx`)**:
   - Updated the in-app interactive widget live preview in Settings to reflect the authentic payment card design (gradient fade to white, white QR box with actual image preview, category badge, cardholder name, and tap-to-cycle preview).

### Affected Files:
- `client/src/widgets/TotalBalanceWidget.tsx` (Modified)
- `client/src/services/WidgetService.ts` (Modified)
- `client/src/widgets/widget-task-handler.tsx` (Modified)
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 02:20:00 +08:00] Financial Calendar Paid / Not Paid Connection with Light Red Styling
### Summary of Changes:
1. **Dynamic Paid / Not Paid Status Connection (`CalendarScreen.tsx`)**:
   - **Subscriptions**: Connected to cycle tracking (`lastPaidCycle === currentCycleKey` or `paymentHistory.cycleKey === currentCycleKey`). Paid cycles show `Paid ✓` with green accents; unpaid cycles are marked as `Not Paid` (with overdue/due today contextual tags).
   - **Installments**: Connected to installment cycle index (`k <= paidMonths`). Installment months within `paidMonths` show `Month k/N Paid ✓` (green); unpaid months (`k > paidMonths`) show `Month k/N • Not Paid` (light red).
   - **Rent**: Connected to rent cycle tracking (`paymentHistory.cycleKey`, `paidCycles`, and `dueDate`). Fulfilled rent months show `Rent Paid ✓` (green); unfulfilled or pending rent months show `Rent Not Paid` (light red).
2. **Light Red Visual Display on Calendar for Unpaid Obligations (`CalendarScreen.tsx`)**:
   - **Month Grid Day Cells**: Days containing unpaid obligations display with a light red circular badge (`rgba(239, 68, 68, 0.16)` in dark mode, `#fee2e2` in light mode) and high-contrast red day numbers. Days with unpaid obligations also include a light red top-right corner indicator.
   - **Calendar Grid Event Dots**: Event dots on the calendar grid dynamically render in light red (`#f87171` / `#ef4444`) for all unpaid items, and emerald green (`#10b981`) for paid items.
   - **Agenda Section**: Unpaid agenda cards feature a distinct light red 4px left accent border (`#f87171`), light red category pills, and light red status chips (`rgba(239, 68, 68, 0.16)` badge with Clock icon and red text). Paid cards feature emerald green borders, badges, and `CheckCircle2` icons.
   - **Immediate Pay Now Action**: The "Pay Now" action button on unpaid agenda items immediately executes payments, deducts the chosen wallet balance, writes the cycle payment record, and instantly flips the calendar display from light red to green.
   - **Monthly Obligation Progress Bar**: Displays dual live metrics: `Paid: ₱X,XXX` (green) and `Not Paid: ₱X,XXX` (light red) with a reactive progress bar.
   - **Calendar Legend**: Updated to clearly denote `Paid` (green dot) and `Not Paid` (light red dot) alongside item types.
3. **Cycle Key Persistence on Rent & Installments (`AppContext.tsx`)**:
   - Updated `payRentMonth` and `payInstallmentMonth` to automatically derive and attach `cycleKey` (e.g., `"May 2026"`) to each `PaymentHistoryRecord`, ensuring instant bidirectional matching across both calendar views and detail screens.

### Affected Files:
- `client/src/screens/CalendarScreen.tsx` (Modified)
- `client/src/context/AppContext.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 02:04:00 +08:00] Expanded Home Screen Widget with Interactive Card Carousel Below Total Expense
### Summary of Changes:
1. **Expanded Widget Dimensions (`app.json`)**:
   - Expanded `TotalBalanceWidget` height from `110dp` to `180dp` with `targetCellHeight: 3` (4x3 home screen grid cell size) and horizontal|vertical resizing support.
   - Updated label to `"Total Balance & Quick Cards"` with rich description.
2. **Interactive Quick Card at Bottom of Total Expense (`TotalBalanceWidget.tsx`)**:
   - Added an interactive card directly underneath the Total Expense section displaying the active wallet's Category badge (`E-WALLET`, `BANK`, etc.), Card counter & cycle indicator (`Card 1/4 ❯`), Wallet Name (e.g. `GCash`, `Maya`, `BDO`), and Card Balance.
   - Respects the privacy toggle state (`••••••` when hidden).
   - Configured `clickAction="NEXT_CARD"` so tapping anywhere on the card cycles to the next card.
3. **Widget Click Action & State Cycling Handler (`widget-task-handler.tsx`)**:
   - Added `NEXT_CARD` click action handler that reads cached widget data and active card index, calculates `(activeCardIndex + 1) % wallets.length`, persists the new index via `saveWidgetActiveCardIndex`, and re-renders the widget with the next card.
4. **Widget Service & Wallet Cache Engine (`WidgetService.ts`)**:
   - Added `WidgetWalletItem` interface and caching for `STORAGE_KEY_WALLETS` and `STORAGE_KEY_ACTIVE_CARD_INDEX`.
   - Updated `syncWidgetBalance` to store wallets and trigger native widget updates with active card index.
5. **App Sync & Settings Preview (`AppContext.tsx`, `SettingsScreen.tsx`)**:
   - In `AppContext.tsx`, automatically synchronizes wallet card data to the widget engine upon wallet additions, edits, reordering, and balance updates.
   - In `SettingsScreen.tsx`, updated the live widget preview to render the interactive bottom card, allowing in-app tap-to-cycle preview testing.

### Affected Files:
- `client/app.json` (Modified)
- `client/src/widgets/TotalBalanceWidget.tsx` (Modified)
- `client/src/widgets/widget-task-handler.tsx` (Modified)
- `client/src/services/WidgetService.ts` (Modified)
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/screens/SettingsScreen.tsx` (Modified)
- `CHANGELOG.md` (Modified)

---

## [2026-10-09 00:57:00 +08:00] Multi-Milestone Phone Notifications & In-App Alerts (3, 2, 1 Days Before & Day-Of)
### Summary of Changes:
1. **Multi-Milestone Phone Notifications (`NotificationService.ts`)**:
   - Implemented automated multi-milestone scheduling using `expo-notifications` for **3 days before, 2 days before, 1 day before, and day-of (0 days / when the date is hit)**.
   - Fully covers all requested categories:
     - **Subscriptions**: Next billing deadline at 3d, 2d, 1d, and 0d (morning 9:00 AM).
     - **Rent**: Rent due date at 3d, 2d, 1d, and 0d (morning 9:00 AM).
     - **Grocery**: Next scheduled shopping days at 3d, 2d, 1d, and 0d (morning 8:30 AM), plus rolling ahead to the next cycle.
     - **Recursion (Paydays)**: Upcoming paydays (monthly, weekly, bi-monthly 15th/end of month) at 3d, 2d, 1d, and 0d (morning 8:00 AM).
     - **Installments**: Next installment due date at 3d, 2d, 1d, and 0d (morning 9:00 AM).
     - **Split (Money Split Plans)**: Next split execution date (once, monthly, weekly, semi-monthly, yearly) at 3d, 2d, 1d, and 0d (morning 9:00 AM).
     - **Debts**: Retained and upgraded to 3d, 2d, 1d, and 0d deadline reminders.
   - If a milestone falls on the current day and the morning time has already passed, it automatically triggers within 60 seconds so the user is immediately notified on their phone.
2. **Context Synchronization (`AppContext.tsx`)**:
   - Updated `syncAllNotifications` calls in `setupNotifications` and `useEffect` to pass `splits` alongside `debts`, `groceryLists`, `installments`, `subscriptions`, `rents`, `recursions`, and `goals`.
   - Included `splits` in effect dependency arrays for automatic rescheduling whenever split plans are created, updated, or deleted.
   - Passed `importedSplits` to `syncAllNotifications` on backup data restore.
3. **In-App Notification Center Sync (`useHeaderAlerts.ts`)**:
   - Expanded the notification dropdown bell alerts to display badges and messages 3 days, 2 days, 1 day before deadlines, and on the day for Subscriptions, Rent, Installments, Grocery, Paydays, Money Split plans, and Debts.
   - Added `GitFork` icon and routing for Money Split plans.
4. **Centralized Payment Schedule Engine (`paymentSchedule.ts`)**:
   - Added robust deadline calculators: `getRentNextDeadline`, `getInstallmentNextDeadline`, `getRecursionNextDeadline`, `getGroceryNextOccurrence`, and `getSplitNextDeadline`.

### Affected Files:
- `client/src/services/NotificationService.ts` (Modified)
- `client/src/context/AppContext.tsx` (Modified)
- `client/src/hooks/useHeaderAlerts.ts` (Modified)
- `client/src/utils/paymentSchedule.ts` (Modified)
- `CHANGELOG.md` (Modified)

---

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
