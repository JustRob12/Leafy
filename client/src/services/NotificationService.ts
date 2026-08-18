import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DebtType, GroceryListType, InstallmentType, SubscriptionType, RentType, RecursionType, GoalType, WalletType } from '../context/AppContext';

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
        name: 'Leapon Alerts & Reminders',
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
        title: "Leapon Alerts",
        body: "Notifications are working! You'll receive alerts for Paydays, Goals, Subscriptions, Installments & Rent.",
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

export const syncAllNotifications = async (
  debts: DebtType[] = [],
  groceryLists: GroceryListType[] = [],
  installments: InstallmentType[] = [],
  subscriptions: SubscriptionType[] = [],
  rents: RentType[] = [],
  recursions: RecursionType[] = [],
  goals: GoalType[] = [],
  isEnabled: boolean = true
) => {
  try {
    // 1. Cancel existing scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 2. If notifications disabled, return immediately
    if (!isEnabled) return;
    
    const now = Date.now();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDateNumber = today.getDate(); // 1 - 31
    const todayDayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

    // ==========================================
    // 3. SUBSCRIPTIONS (Day of Payment Reminder)
    // ==========================================
    for (const sub of subscriptions) {
      if (!sub.dayOfMonth) continue;

      // Scheduled for the next occurrence of dayOfMonth at 9:00 AM
      let subTarget = new Date();
      subTarget.setDate(sub.dayOfMonth);
      subTarget.setHours(9, 0, 0, 0);

      // If already past today, schedule for next month
      if (subTarget.getTime() <= now) {
        if (todayDateNumber === sub.dayOfMonth) {
          // It's today! Schedule reminder in 1 minute if not past evening
          subTarget = new Date(now + 60 * 1000);
        } else {
          subTarget.setMonth(subTarget.getMonth() + 1);
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Subscription Due Today",
          body: `Your subscription "${sub.title}" (₱${sub.amount.toLocaleString()}) is due for payment today.`,
          data: { path: 'Subscription' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: subTarget,
        },
      });
    }

    // ==========================================
    // 4. INSTALLMENTS (Day of Payment / Due Date)
    // ==========================================
    for (const item of installments) {
      if (!item.dueDate || item.paidMonths >= item.monthsToPay) continue;

      let due = new Date(item.dueDate);
      due.setHours(9, 0, 0, 0);

      if (due.getTime() <= now) {
        if (item.dueDate === todayStr) {
          due = new Date(now + 60 * 1000); // 1 minute from now
        } else {
          continue; // Past due date
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Installment Payment Due Today",
          body: `Payment for "${item.productName}" (${item.currency === 'USD' ? '$' : '₱'}${item.monthlyAmount.toLocaleString()}) is due today.`,
          data: { path: 'Installment' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: due,
        },
      });
    }

    // ==========================================
    // 5. RENT PROPERTIES (Day of Rent Payment)
    // ==========================================
    for (const rent of rents) {
      if (!rent.dueDate) continue;

      let rentDue = new Date(rent.dueDate);
      rentDue.setHours(9, 0, 0, 0);

      if (rentDue.getTime() <= now) {
        if (rent.dueDate === todayStr) {
          rentDue = new Date(now + 60 * 1000);
        } else {
          continue;
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rent Payment Due Today",
          body: `Monthly rent for "${rent.propertyName}" (${rent.currency === 'USD' ? '$' : '₱'}${rent.monthlyAmount.toLocaleString()}) is due today.`,
          data: { path: 'Rent' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: rentDue,
        },
      });
    }

    // ==========================================
    // 6. PAYDAY NOTIFICATIONS (Recurring Incomes)
    // ==========================================
    for (const rec of recursions) {
      if (rec.frequency === 'monthly' && rec.dayOfMonth) {
        let payday = new Date();
        payday.setDate(rec.dayOfMonth);
        payday.setHours(8, 0, 0, 0);

        if (payday.getTime() <= now) {
          if (todayDateNumber === rec.dayOfMonth) {
            payday = new Date(now + 60 * 1000);
          } else {
            payday.setMonth(payday.getMonth() + 1);
          }
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Payday Alert",
            body: `Payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} today.`,
            data: { path: 'Recursion' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: payday,
          },
        });
      } else if (rec.frequency === 'weekly' && rec.dayOfWeek !== undefined) {
        const expoWeekday = rec.dayOfWeek + 1;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Weekly Payday Alert",
            body: `Payday from ${rec.companyName}: ₱${rec.amount.toLocaleString()} scheduled today.`,
            data: { path: 'Recursion' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: expoWeekday,
            hour: 8,
            minute: 0,
          },
        });
      } else if (rec.frequency === 'bi-monthly') {
        // 15th & Last day of month
        const isToday15 = todayDateNumber === 15;
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const isTodayLast = todayDateNumber === lastDayOfMonth;

        if (isToday15 || isTodayLast) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Payday Alert",
              body: `Payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} today.`,
              data: { path: 'Recursion' },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(now + 60 * 1000),
            },
          });
        }
      }
    }

    // ==========================================
    // 7. DEBTS (Due Date Reminder)
    // ==========================================
    for (const debt of debts) {
      if (!debt.dueDate) continue;
      
      let dueDate = new Date(debt.dueDate);
      dueDate.setHours(9, 0, 0, 0); // 9:00 AM
      
      if (dueDate.getTime() <= now) {
        if (debt.dueDate === todayStr) {
          dueDate = new Date(now + 60 * 1000);
        } else {
          continue;
        }
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Debt Payment Reminder",
          body: `Reminder to pay ${debt.personName}: ₱${debt.amount.toLocaleString()} for ${debt.taskName}.`,
          data: { path: 'Debts' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate,
        },
      });
    }
    
    // ==========================================
    // 8. GROCERY LISTS (Weekly / Day Schedule)
    // ==========================================
    const todayIndex = new Date().getDay();
    for (const list of groceryLists) {
      if (!list.scheduledDays || list.scheduledDays.length === 0) continue;
      
      for (const dayIndex of list.scheduledDays) {
        const expoWeekday = dayIndex + 1; 

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Grocery Day",
            body: `Scheduled grocery shopping for: ${list.title}`,
            data: { path: 'GroceryDetail', listId: list.id },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: expoWeekday,
            hour: 8,
            minute: 30,
          },
        });

        if (dayIndex === todayIndex) {
          const checkTime = new Date();
          checkTime.setHours(8, 30, 0, 0);
          if (now >= checkTime.getTime()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Grocery Day Reminder",
                body: `Don't forget your grocery items for: ${list.title}`,
                data: { path: 'GroceryDetail', listId: list.id },
                sound: true,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(now + 60 * 1000),
              },
            });
          }
        }
      }
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


