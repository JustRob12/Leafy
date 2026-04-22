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

export const syncAllNotifications = async (debts: DebtType[], groceryLists: GroceryListType[]) => {
  try {
    // 1. Cancel all existing notifications to avoid duplicates/stale reminders
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 2. Schedule Debts
    for (const debt of debts) {
      if (!debt.dueDate) continue;
      
      const dueDate = new Date(debt.dueDate);
      dueDate.setHours(9, 0, 0, 0); // Notif at 9:00 AM
      
      // Only schedule if the date is in the future or today
      if (dueDate.getTime() > Date.now()) {
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
    }
    
    // 3. Schedule Grocery Lists
    for (const list of groceryLists) {
      if (!list.scheduledDays || list.scheduledDays.length === 0) continue;
      
      for (const dayIndex of list.scheduledDays) {
          const expoWeekday = dayIndex + 1; 

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
      }
    }
  } catch (error) {
    console.log('Skipping notification sync (environment not supported):', error);
  }
};
