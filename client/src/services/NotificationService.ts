import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DebtType, GroceryListType } from '../context/AppContext';

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

export const syncAllNotifications = async (debts: DebtType[], groceryLists: GroceryListType[], isEnabled: boolean) => {
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
      
      // If it's today and past 9 AM, schedule it for 2 minutes from now
      // This ensures if the user adds a debt "today", they get notified shortly after.
      if (dueDate.getTime() <= now) {
          const todayStr = new Date().toISOString().split('T')[0];
          if (debt.dueDate === todayStr) {
              dueDate = new Date(now + 2 * 60 * 1000); // 2 minutes from now
          } else {
              // It's in the past and NOT today, skip it
              continue;
          }
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💸 Debt Reminder",
          body: `Don't forget to pay ${debt.personName}: ₱${debt.amount.toLocaleString()} for ${debt.taskName}`,
          data: { screen: 'Debts' },
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

          // Standard weekly reminder
          await Notifications.scheduleNotificationAsync({
              content: {
                  title: "🛒 Grocery Day!",
                  body: `Time to buy your items for: ${list.title}`,
                  data: { screen: 'GroceryDetail', listId: list.id },
              },
              trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                  weekday: expoWeekday,
                  hour: 8,
                  minute: 30,
              },
          });

          // If today is grocery day and it's past 8:30 AM, schedule an immediate-ish reminder
          if (dayIndex === todayIndex) {
              const checkTime = new Date();
              checkTime.setHours(8, 30, 0, 0);
              if (now >= checkTime.getTime()) {
                  await Notifications.scheduleNotificationAsync({
                      content: {
                          title: "🛒 Grocery Day (Reminder)",
                          body: `Don't forget your grocery items for: ${list.title}`,
                          data: { screen: 'GroceryDetail', listId: list.id },
                      },
                      trigger: {
                          type: Notifications.SchedulableTriggerInputTypes.DATE,
                          date: new Date(now + 2 * 60 * 1000), // 2 minutes from now
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
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🎯 Goal Reached! 🎉",
                body: `Congratulations! You've successfully reached 100% of your target for: ${goalTitle}`,
                data: { screen: 'Goals' },
                sound: true,
            },
            trigger: null, // Send immediately
        });
    } catch (error) {
        console.log('Failed to send goal notification:', error);
    }
};
