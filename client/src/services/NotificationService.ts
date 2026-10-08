import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DebtType, GroceryListType, InstallmentType, SubscriptionType, RentType, RecursionType, GoalType, WalletType, MoneySplitPlan } from '../context/AppContext';
import {
  getSubscriptionNextDeadline,
  getRentNextDeadline,
  getInstallmentNextDeadline,
  getRecursionNextDeadline,
  getGroceryNextOccurrence,
  getSplitNextDeadline,
} from '../utils/paymentSchedule';

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Leon Alerts & Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        sound: 'default',
      });
    }
    
    return true;
  } catch (error) {
    console.log('Notifications setup error:', error);
    return false;
  }
};

export const checkNotificationPermissionStatus = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
};

export const sendTestNotification = async (): Promise<boolean> => {
  try {
    await requestNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Leon Alerts",
        body: "Notifications are working! You'll receive alerts 3, 2, 1 days before & on due dates for Rent, Subscriptions, Grocery, Paydays, Installments & Split plans.",
        data: { path: 'Main', screen: 'Home' },
        sound: true,
      },
      trigger: null, // Send immediately
    });
    return true;
  } catch (e) {
    console.log('Failed to send test notification:', e);
    return false;
  }
};

interface MilestoneAlertConfig {
  deadline: Date;
  milestones?: number[];
  getTitle: (daysBefore: number) => string;
  getBody: (daysBefore: number) => string;
  data: Record<string, any>;
  hour?: number;
  minute?: number;
}

/**
 * Helper to schedule milestone alerts:
 * 3 days before, 2 days before, 1 day before, and on the day (0 days).
 * If a milestone falls on today and the scheduled hour has passed, it triggers within 1 minute.
 */
const scheduleMilestoneNotifications = async ({
  deadline,
  milestones = [3, 2, 1, 0],
  getTitle,
  getBody,
  data,
  hour = 9,
  minute = 0,
}: MilestoneAlertConfig) => {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cleanDeadline = new Date(deadline);
  cleanDeadline.setHours(0, 0, 0, 0);

  for (const daysBefore of milestones) {
    const targetDate = new Date(cleanDeadline);
    targetDate.setDate(targetDate.getDate() - daysBefore);
    targetDate.setHours(hour, minute, 0, 0);

    const targetDayStart = new Date(targetDate);
    targetDayStart.setHours(0, 0, 0, 0);

    if (targetDayStart.getTime() === today.getTime()) {
      // Milestone is today!
      let triggerDate = targetDate;
      if (triggerDate.getTime() <= now) {
        // Morning time already passed, fire in 60s
        triggerDate = new Date(now + 60 * 1000);
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getTitle(daysBefore),
          body: getBody(daysBefore),
          data,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    } else if (targetDate.getTime() > now) {
      // Future milestone day
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getTitle(daysBefore),
          body: getBody(daysBefore),
          data,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: targetDate,
        },
      });
    }
  }
};

export const syncAllNotifications = async (
  debts: DebtType[] = [],
  groceryLists: GroceryListType[] = [],
  installments: InstallmentType[] = [],
  subscriptions: SubscriptionType[] = [],
  rents: RentType[] = [],
  recursions: RecursionType[] = [],
  goals: GoalType[] = [],
  splitsOrIsEnabled: MoneySplitPlan[] | boolean = true,
  isEnabledParam?: boolean
) => {
  try {
    // 1. Cancel existing scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Resolve flexible parameters (supporting legacy 8-arg and 9-arg calls)
    let splits: MoneySplitPlan[] = [];
    let isEnabled = true;
    if (Array.isArray(splitsOrIsEnabled)) {
      splits = splitsOrIsEnabled;
      isEnabled = isEnabledParam !== undefined ? isEnabledParam : true;
    } else if (typeof splitsOrIsEnabled === 'boolean') {
      isEnabled = splitsOrIsEnabled;
      splits = [];
    }

    // 2. If notifications disabled, return immediately
    if (!isEnabled) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ==========================================
    // 3. SUBSCRIPTIONS (3, 2, 1 Days Before & Day of Deadline)
    // ==========================================
    for (const sub of subscriptions) {
      const deadlineInfo = getSubscriptionNextDeadline(sub, today);
      if (!deadlineInfo || !deadlineInfo.nextDueDate) continue;

      const sym = sub.currency === 'USD' ? '$' : '₱';
      await scheduleMilestoneNotifications({
        deadline: deadlineInfo.nextDueDate,
        milestones: [3, 2, 1, 0],
        getTitle: (daysBefore) => {
          if (daysBefore === 3) return "Subscription Due in 3 Days";
          if (daysBefore === 2) return "Subscription Due in 2 Days";
          if (daysBefore === 1) return "Subscription Due Tomorrow";
          return "Subscription Due Today";
        },
        getBody: (daysBefore) => {
          if (daysBefore === 3) return `Your subscription "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due in 3 days.`;
          if (daysBefore === 2) return `Your subscription "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due in 2 days.`;
          if (daysBefore === 1) return `Reminder: "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due tomorrow.`;
          return `Your subscription "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due for payment today.`;
        },
        data: { path: 'Subscription' },
        hour: 9,
        minute: 0,
      });
    }

    // ==========================================
    // 4. RENT PROPERTIES (3, 2, 1 Days Before & Day of Deadline)
    // ==========================================
    for (const rent of rents) {
      const rentDeadline = getRentNextDeadline(rent, today);
      if (!rentDeadline) continue;

      const sym = rent.currency === 'USD' ? '$' : '₱';
      await scheduleMilestoneNotifications({
        deadline: rentDeadline,
        milestones: [3, 2, 1, 0],
        getTitle: (daysBefore) => {
          if (daysBefore === 3) return "Rent Due in 3 Days";
          if (daysBefore === 2) return "Rent Due in 2 Days";
          if (daysBefore === 1) return "Rent Due Tomorrow";
          return "Rent Payment Due Today";
        },
        getBody: (daysBefore) => {
          if (daysBefore === 3) return `Rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due in 3 days.`;
          if (daysBefore === 2) return `Rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due in 2 days.`;
          if (daysBefore === 1) return `Reminder: Rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due tomorrow.`;
          return `Monthly rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due today.`;
        },
        data: { path: 'Rent' },
        hour: 9,
        minute: 0,
      });
    }

    // ==========================================
    // 5. INSTALLMENTS (3, 2, 1 Days Before & Day of Deadline)
    // ==========================================
    for (const item of installments) {
      const instDeadline = getInstallmentNextDeadline(item, today);
      if (!instDeadline) continue;

      const sym = item.currency === 'USD' ? '$' : '₱';
      await scheduleMilestoneNotifications({
        deadline: instDeadline,
        milestones: [3, 2, 1, 0],
        getTitle: (daysBefore) => {
          if (daysBefore === 3) return "Installment Due in 3 Days";
          if (daysBefore === 2) return "Installment Due in 2 Days";
          if (daysBefore === 1) return "Installment Due Tomorrow";
          return "Installment Payment Due Today";
        },
        getBody: (daysBefore) => {
          if (daysBefore === 3) return `Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due in 3 days.`;
          if (daysBefore === 2) return `Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due in 2 days.`;
          if (daysBefore === 1) return `Reminder: Installment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due tomorrow.`;
          return `Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due today.`;
        },
        data: { path: 'Installment' },
        hour: 9,
        minute: 0,
      });
    }

    // ==========================================
    // 6. GROCERY LISTS (3, 2, 1 Days Before & Grocery Day)
    // ==========================================
    for (const list of groceryLists) {
      if (!list.scheduledDays || list.scheduledDays.length === 0) continue;

      for (const dayIndex of list.scheduledDays) {
        const nextOccurrence = getGroceryNextOccurrence(dayIndex, today);

        await scheduleMilestoneNotifications({
          deadline: nextOccurrence,
          milestones: [3, 2, 1, 0],
          getTitle: (daysBefore) => {
            if (daysBefore === 3) return "Grocery Scheduled in 3 Days";
            if (daysBefore === 2) return "Grocery Scheduled in 2 Days";
            if (daysBefore === 1) return "Grocery Scheduled Tomorrow";
            return "Grocery Day";
          },
          getBody: (daysBefore) => {
            if (daysBefore === 3) return `Upcoming grocery shopping in 3 days for: ${list.title}`;
            if (daysBefore === 2) return `Upcoming grocery shopping in 2 days for: ${list.title}`;
            if (daysBefore === 1) return `Reminder: Grocery shopping for "${list.title}" is scheduled for tomorrow.`;
            return `Scheduled grocery shopping today for: ${list.title}`;
          },
          data: { path: 'GroceryDetail', listId: list.id },
          hour: 8,
          minute: 30,
        });

        // If today is the grocery day, also pre-schedule next week's occurrence milestones
        if (nextOccurrence.getTime() === today.getTime()) {
          const nextWeekDate = new Date(nextOccurrence);
          nextWeekDate.setDate(nextWeekDate.getDate() + 7);
          await scheduleMilestoneNotifications({
            deadline: nextWeekDate,
            milestones: [3, 2, 1, 0],
            getTitle: (daysBefore) => {
              if (daysBefore === 3) return "Grocery Scheduled in 3 Days";
              if (daysBefore === 2) return "Grocery Scheduled in 2 Days";
              if (daysBefore === 1) return "Grocery Scheduled Tomorrow";
              return "Grocery Day";
            },
            getBody: (daysBefore) => {
              if (daysBefore === 3) return `Upcoming grocery shopping in 3 days for: ${list.title}`;
              if (daysBefore === 2) return `Upcoming grocery shopping in 2 days for: ${list.title}`;
              if (daysBefore === 1) return `Reminder: Grocery shopping for "${list.title}" is scheduled for tomorrow.`;
              return `Scheduled grocery shopping today for: ${list.title}`;
            },
            data: { path: 'GroceryDetail', listId: list.id },
            hour: 8,
            minute: 30,
          });
        }
      }
    }

    // ==========================================
    // 7. RECURSION (Paydays - 3, 2, 1 Days Before & Payday)
    // ==========================================
    for (const rec of recursions) {
      const paydayDeadline = getRecursionNextDeadline(rec, today);
      if (!paydayDeadline) continue;

      await scheduleMilestoneNotifications({
        deadline: paydayDeadline,
        milestones: [3, 2, 1, 0],
        getTitle: (daysBefore) => {
          if (daysBefore === 3) return "Payday in 3 Days";
          if (daysBefore === 2) return "Payday in 2 Days";
          if (daysBefore === 1) return "Payday Tomorrow";
          return "Payday Alert";
        },
        getBody: (daysBefore) => {
          if (daysBefore === 3) return `Upcoming payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} in 3 days.`;
          if (daysBefore === 2) return `Upcoming payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} in 2 days.`;
          if (daysBefore === 1) return `Reminder: Payday from ${rec.companyName} (₱${rec.amount.toLocaleString()}) is tomorrow!`;
          return `Payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} today.`;
        },
        data: { path: 'Recursion' },
        hour: 8,
        minute: 0,
      });

      // If payday is today, also pre-schedule the next occurrence milestones
      if (paydayDeadline.getTime() === today.getTime()) {
        const followingBase = new Date(today);
        followingBase.setDate(followingBase.getDate() + 1);
        const nextPayday = getRecursionNextDeadline(rec, followingBase);
        if (nextPayday) {
          await scheduleMilestoneNotifications({
            deadline: nextPayday,
            milestones: [3, 2, 1, 0],
            getTitle: (daysBefore) => {
              if (daysBefore === 3) return "Payday in 3 Days";
              if (daysBefore === 2) return "Payday in 2 Days";
              if (daysBefore === 1) return "Payday Tomorrow";
              return "Payday Alert";
            },
            getBody: (daysBefore) => {
              if (daysBefore === 3) return `Upcoming payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} in 3 days.`;
              if (daysBefore === 2) return `Upcoming payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} in 2 days.`;
              if (daysBefore === 1) return `Reminder: Payday from ${rec.companyName} (₱${rec.amount.toLocaleString()}) is tomorrow!`;
              return `Payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} today.`;
            },
            data: { path: 'Recursion' },
            hour: 8,
            minute: 0,
          });
        }
      }
    }

    // ==========================================
    // 8. MONEY SPLIT PLANS (3, 2, 1 Days Before & Day of Distribution)
    // ==========================================
    for (const plan of splits) {
      const splitDeadline = getSplitNextDeadline(plan, today);
      if (!splitDeadline) continue;

      const sym = plan.currency === 'USD' ? '$' : '₱';
      await scheduleMilestoneNotifications({
        deadline: splitDeadline,
        milestones: [3, 2, 1, 0],
        getTitle: (daysBefore) => {
          if (daysBefore === 3) return "Money Split in 3 Days";
          if (daysBefore === 2) return "Money Split in 2 Days";
          if (daysBefore === 1) return "Money Split Tomorrow";
          return "Money Split Due Today";
        },
        getBody: (daysBefore) => {
          if (daysBefore === 3) return `Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled in 3 days.`;
          if (daysBefore === 2) return `Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled in 2 days.`;
          if (daysBefore === 1) return `Reminder: Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled for tomorrow.`;
          return `Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled for distribution today.`;
        },
        data: { path: 'Split', planId: plan.id },
        hour: 9,
        minute: 0,
      });
    }

    // ==========================================
    // 9. DEBTS (3, 2, 1 Days Before & Due Date)
    // ==========================================
    for (const debt of debts) {
      if (!debt.dueDate) continue;

      const parts = debt.dueDate.split('-');
      const debtDueDate = parts.length === 3
        ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        : new Date(debt.dueDate);
      debtDueDate.setHours(0, 0, 0, 0);

      await scheduleMilestoneNotifications({
        deadline: debtDueDate,
        milestones: [3, 2, 1, 0],
        getTitle: (daysBefore) => {
          if (daysBefore === 3) return "Debt Due in 3 Days";
          if (daysBefore === 2) return "Debt Due in 2 Days";
          if (daysBefore === 1) return "Debt Due Tomorrow";
          return "Debt Payment Due Today";
        },
        getBody: (daysBefore) => {
          if (daysBefore === 3) return `Reminder: Debt payment to ${debt.personName} (₱${debt.amount.toLocaleString()}) is due in 3 days.`;
          if (daysBefore === 2) return `Reminder: Debt payment to ${debt.personName} (₱${debt.amount.toLocaleString()}) is due in 2 days.`;
          if (daysBefore === 1) return `Reminder: Debt payment to ${debt.personName} (₱${debt.amount.toLocaleString()}) is due tomorrow.`;
          return `Reminder to pay ${debt.personName}: ₱${debt.amount.toLocaleString()} for ${debt.taskName}.`;
        },
        data: { path: 'Debts' },
        hour: 9,
        minute: 0,
      });
    }
  } catch (error) {
    console.log('Skipping notification sync (environment not supported):', error);
  }
};


export const notifyGoalCompletion = async (goalTitle: string) => {
  try {
    await requestNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Goal Target Reached",
        body: `Congratulations! You've successfully reached 100% of your target for "${goalTitle}"!`,
        data: { path: 'Main', screen: 'Goals' },
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.log('Failed to send goal notification:', error);
  }
};

export const notifyGoalMilestone = async (goalTitle: string, percent: number) => {
  try {
    await requestNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Goal Milestone: ${percent}%`,
        body: `Great progress! You are ${percent}% of the way towards "${goalTitle}".`,
        data: { path: 'Main', screen: 'Goals' },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Failed to send goal milestone notification:', error);
  }
};

export const updateBadgeCount = async (count: number) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Failed to set badge count:', error);
  }
};


