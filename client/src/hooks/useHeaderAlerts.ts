import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, getWalletTotalBalanceInPhp } from '../context/AppContext';
import { Coins, Calendar, CreditCard, Home, Target, Receipt, AlertCircle, ShoppingCart } from 'lucide-react-native';

export interface HeaderAlertItem {
  id: string;
  title: string;
  message: string;
  icon: any;
  color: string;
  screen: string;
}

export function useHeaderAlerts() {
  const {
    goals,
    wallets,
    debts,
    groceryLists,
    subscriptions,
    installments,
    rents,
    recursions,
    totalBalance,
    transactions,
    usdToPhpRate,
    colors,
  } = useAppContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadDismissed = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dismissedNotifications');
        if (stored) setDismissedIds(JSON.parse(stored));
      } catch (e) {}
    };
    loadDismissed();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const markAllAsRead = async () => {
    const currentNotifIds = notifications.map(n => n.id);
    const newDismissed = [...new Set([...dismissedIds, ...currentNotifIds])];
    setDismissedIds(newDismissed);
    try {
      await AsyncStorage.setItem('@dismissedNotifications', JSON.stringify(newDismissed));
    } catch (e) {}
  };

  const notifications = useMemo(() => {
    const list: HeaderAlertItem[] = [];
    const todayStr = currentDate.toISOString().split('T')[0];
    const todayDateNumber = currentDate.getDate();
    const todayDayOfWeek = currentDate.getDay();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // 1. Paydays & Recurring Income Scheduled Today
    if (recursions && recursions.length > 0) {
      recursions.forEach(rec => {
        let isPaydayToday = false;
        if (rec.frequency === 'monthly' && rec.dayOfMonth === todayDateNumber) {
          isPaydayToday = true;
        } else if (rec.frequency === 'weekly' && rec.dayOfWeek === todayDayOfWeek) {
          isPaydayToday = true;
        } else if (rec.frequency === 'bi-monthly' && (todayDateNumber === 15 || todayDateNumber === lastDayOfMonth)) {
          isPaydayToday = true;
        }

        if (isPaydayToday) {
          list.push({
            id: `payday-${rec.id}-${todayStr}`,
            title: 'Payday Alert',
            message: `Payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} today.`,
            icon: Coins,
            color: '#10b981',
            screen: 'Recursion'
          });
        }
      });
    }

    // 2. Subscriptions Due Today
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach(sub => {
        if (sub.dayOfMonth === todayDateNumber) {
          list.push({
            id: `sub-${sub.id}-${todayStr}`,
            title: 'Subscription Due Today',
            message: `Your subscription "${sub.title}" (₱${sub.amount.toLocaleString()}) is due today.`,
            icon: Calendar,
            color: '#10b981',
            screen: 'Subscription'
          });
        }
      });
    }

    // 3. Installments Due Today
    if (installments && installments.length > 0) {
      installments.forEach(item => {
        if (item.dueDate && item.dueDate === todayStr && item.paidMonths < item.monthsToPay) {
          list.push({
            id: `installment-${item.id}-${todayStr}`,
            title: 'Installment Due Today',
            message: `Payment for "${item.productName}" (${item.currency === 'USD' ? '$' : '₱'}${item.monthlyAmount.toLocaleString()}) is due today.`,
            icon: CreditCard,
            color: '#10b981',
            screen: 'Installment'
          });
        }
      });
    }

    // 4. Rent Properties Due Today
    if (rents && rents.length > 0) {
      rents.forEach(rent => {
        if (rent.dueDate && rent.dueDate === todayStr) {
          list.push({
            id: `rent-${rent.id}-${todayStr}`,
            title: 'Rent Payment Due Today',
            message: `Monthly rent for "${rent.propertyName}" (${rent.currency === 'USD' ? '$' : '₱'}${rent.monthlyAmount.toLocaleString()}) is due today.`,
            icon: Home,
            color: '#10b981',
            screen: 'Rent'
          });
        }
      });
    }

    // 5. Goals Reached 100% Target
    if (goals && wallets) {
      goals.forEach(g => {
        const isLinkedToAll = g.walletId === 'ALL' || g.walletId === 'all';
        const currentBal = isLinkedToAll
          ? wallets.reduce((sum, w) => sum + getWalletTotalBalanceInPhp(w, usdToPhpRate), 0)
          : (() => {
              const wallet = wallets.find(w => w.id === g.walletId);
              return wallet ? getWalletTotalBalanceInPhp(wallet, usdToPhpRate) : 0;
            })();
        if (g.targetAmount > 0 && currentBal >= g.targetAmount) {
          list.push({
            id: `goal-${g.id}-complete`,
            title: 'Goal Target Reached',
            message: `Congratulations! Your goal "${g.title}" has reached 100% target!`,
            icon: Target,
            color: '#10b981',
            screen: 'Goals'
          });
        }
      });
    }

    // 6. Active Debts (Due Today or Overdue)
    if (debts && debts.length > 0) {
      const dueToday = debts.filter(d => d.dueDate && d.dueDate === todayStr);
      const overdue = debts.filter(d => d.dueDate && d.dueDate < todayStr);

      dueToday.forEach(d => {
        list.push({
          id: `debt-due-${d.id}-${todayStr}`,
          title: 'Debt Payment Due Today',
          message: `Don't forget to pay ${d.personName}: ₱${d.amount.toLocaleString()} for ${d.taskName}.`,
          icon: Receipt,
          color: '#10b981',
          screen: 'Debts'
        });
      });

      if (overdue.length > 0 && dueToday.length === 0) {
        list.push({
          id: `debt-overdue-${todayStr}-${overdue.length}`,
          title: 'Overdue Debt Reminder',
          message: `You have ${overdue.length} overdue debt${overdue.length > 1 ? 's' : ''} to settle.`,
          icon: AlertCircle,
          color: colors.danger,
          screen: 'Debts'
        });
      }
    }

    // 7. Grocery Lists Scheduled Today
    if (groceryLists && groceryLists.length > 0) {
      const scheduledToday = groceryLists.filter(l => l.scheduledDays?.includes(todayDayOfWeek));
      scheduledToday.forEach(l => {
        list.push({
          id: `grocery-${l.id}-${todayStr}`,
          title: 'Grocery Day',
          message: `Scheduled grocery shopping today for: ${l.title}`,
          icon: ShoppingCart,
          color: '#10b981',
          screen: 'Grocery'
        });
      });
    }

    return list.filter(n => !dismissedIds.includes(n.id));
  }, [goals, wallets, debts, groceryLists, subscriptions, installments, rents, recursions, colors, dismissedIds, currentDate]);

  const statusMessage = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const monthSavings = transactions
      .filter(t => t.type === 'deposit' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const monthSpent = transactions
      .filter(t => t.type === 'withdrawal' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 1. Critical Debt Check
    const overdueDebts = debts.filter(d => d.dueDate && d.dueDate < today.toISOString().split('T')[0]).length;
    if (overdueDebts > 0) return "Hey, I noticed a few overdue debts. Shall we clear those first? ";

    // 2. Low Balance Check
    if (totalBalance < 500 && totalBalance > 0) return "Your balance is looking a bit thin! Time for some fresh seeds? ";
    if (totalBalance <= 0 && wallets.length > 0) return "Your garden is a bit dry! Let's add some water to those wallets. ";

    // 3. Spending Check
    if (monthSpent > monthSavings && monthSpent > 0) return "Whoa, you're spending a bit fast! Let's be extra careful today, okay?";

    // 4. Goal Encouragement
    const nearGoal = goals.find(g => {
      const isLinkedToAll = g.walletId === 'ALL' || g.walletId === 'all';
      const currentBal = isLinkedToAll
        ? wallets.reduce((sum, w) => sum + getWalletTotalBalanceInPhp(w, usdToPhpRate), 0)
        : (() => {
            const wallet = wallets.find(w => w.id === g.walletId);
            return wallet ? getWalletTotalBalanceInPhp(wallet, usdToPhpRate) : 0;
          })();
      const progress = g.targetAmount > 0 ? (currentBal / g.targetAmount) : 0;
      return progress > 0.8 && progress < 1;
    });
    if (nearGoal) return `You're so close! Just a little more and "${nearGoal.title}" will be fully blooming.`;

    // 5. Positive Reinforcement
    if (monthSavings > monthSpent * 1.5 && monthSavings > 0) return "Wow, your savings are booming! You're really good at this. Keep it up!";

    // Default Nature Wisdom
    const wisdom = [
      "Every small saving is a leaf on your tree of wealth. You're doing great!",
      "I love how you're nurturing your garden today. Keep it up!",
      "Ready for another day of growth? Let's make it count!",
      "Patience is the key! Just like a tree, your wealth grows slowly but surely.",
      "Your financial forest is looking beautiful today. Any new plans?",
      "Grow your wealth, one leaf at a time. I'm here to help!",
      "Did you know? Consistent savings are the best fertilizer for goals!"
    ];
    return wisdom[today.getDay() % wisdom.length];
  }, [totalBalance, transactions, debts, goals, wallets, colors]);

  const fullDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return {
    notifications,
    statusMessage,
    currentDate,
    fullDate,
    dismissedIds,
    markAllAsRead,
  };
}
