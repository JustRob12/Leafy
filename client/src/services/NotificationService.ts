import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DebtType, GroceryListType, InstallmentType } from '../context/AppContext';

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  } catch (error) {
    console.log('Notifications not supported in this environment (likely Expo Go Android):', error);
    return false;
  }
};

export const syncAllNotifications = async (
  debts: DebtType[],
  groceryLists: GroceryListType[],
  installments: InstallmentType[] = [],
  isEnabled: boolean = true
) => {
  try {
    // 1. Always cancel all to start clean
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 2. If disabled, stop here
    if (!isEnabled) return;
    
    const now = Date.now();

    // 3. Schedule Debts
    for (const debt of debts) {
      if (!debt.dueDate) continue;
      
      let dueDate = new Date(debt.dueDate);
      dueDate.setHours(9, 0, 0, 0); // Notif at 9:00 AM
      
      if (dueDate.getTime() <= now) {
          const todayStr = new Date().toISOString().split('T')[0];
          if (debt.dueDate === todayStr) {
              dueDate = new Date(now + 2 * 60 * 1000); // 2 minutes from now
          } else {
              continue;
          }
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💸 Debt Reminder",
          body: `Don't forget to pay ${debt.personName}: ₱${debt.amount.toLocaleString()} for ${debt.taskName}`,
          data: { path: 'Debts' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate,
        },
      });
    }
    
    // 4. Schedule Grocery Lists
    const todayIndex = new Date().getDay(); // 0 is Sunday
    for (const list of groceryLists) {
      if (!list.scheduledDays || list.scheduledDays.length === 0) continue;
      
      for (const dayIndex of list.scheduledDays) {
          const expoWeekday = dayIndex + 1; 

          await Notifications.scheduleNotificationAsync({
              content: {
                  title: "🛒 Grocery Day!",
                  body: `Time to buy your items for: ${list.title}`,
                  data: { path: 'GroceryDetail', listId: list.id },
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
                          title: "🛒 Grocery Day (Reminder)",
                          body: `Don't forget your grocery items for: ${list.title}`,
                          data: { path: 'GroceryDetail', listId: list.id },
                      },
                      trigger: {
                          type: Notifications.SchedulableTriggerInputTypes.DATE,
                          date: new Date(now + 2 * 60 * 1000),
                      },
                  });
              }
          }
      }
    }

    // 5. Schedule Installments (Notifies when 3 days near deadline)
    for (const item of installments) {
      if (!item.dueDate || item.paidMonths >= item.monthsToPay) continue;

      const due = new Date(item.dueDate);
      due.setHours(9, 0, 0, 0); // 9:00 AM

      // 3 days prior reminder date
      const reminderDate = new Date(due.getTime() - 3 * 24 * 60 * 60 * 1000);
      reminderDate.setHours(9, 0, 0, 0);

      const targetTriggerDate = reminderDate.getTime() > now ? reminderDate : due;

      if (targetTriggerDate.getTime() > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💳 Installment Payment Reminder",
            body: `Your installment payment for "${item.productName}" (${item.currency === 'USD' ? '$' : '₱'}${item.monthlyAmount.toLocaleString()}) is due on ${item.dueDate}!`,
            data: { path: 'Installment' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetTriggerDate,
          },
        });
      }
    }
  } catch (error) {
    console.log('Skipping notification sync (environment not supported):', error);
  }
};

export const notifyGoalCompletion = async (goalTitle: string) => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🎯 Goal Reached! 🎉",
                body: `Congratulations! You've successfully reached 100% of your target for: ${goalTitle}`,
                data: { path: 'Main', params: { screen: 'Goals' } },
                sound: true,
            },
            trigger: null, // Send immediately
        });
    } catch (error) {
        console.log('Failed to send goal notification:', error);
    }
};

export const updateBadgeCount = async (count: number) => {
    try {
        await Notifications.setBadgeCountAsync(count);
    } catch (error) {
        console.log('Failed to set badge count:', error);
    }
};

