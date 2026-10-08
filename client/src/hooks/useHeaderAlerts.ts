import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, getWalletTotalBalanceInPhp } from '../context/AppContext';
import { Coins, Calendar, CreditCard, Home, Target, Receipt, AlertCircle, ShoppingCart, GitFork } from 'lucide-react-native';
import {
  getSubscriptionNextDeadline,
  getRentNextDeadline,
  getInstallmentNextDeadline,
  getRecursionNextDeadline,
  getGroceryNextOccurrence,
  getSplitNextDeadline,
} from '../utils/paymentSchedule';

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
    splits,
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

    const getDaysDiff = (target: Date) => {
      const t = new Date(target);
      t.setHours(0, 0, 0, 0);
      const today = new Date(currentDate);
      today.setHours(0, 0, 0, 0);
      return Math.ceil((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    // 1. Subscriptions (3, 2, 1 Days Before, Day-of & Overdue)
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach(sub => {
        const deadline = getSubscriptionNextDeadline(sub, currentDate);
        if (!deadline || !deadline.nextDueDate) return;
        const sym = sub.currency === 'USD' ? '$' : '₱';
        const d = deadline.daysRemaining;

        if (!deadline.isCurrentMonthPaid) {
          if (d === 0) {
            list.push({
              id: `sub-${sub.id}-${deadline.nextDueDateStr}-0`,
              title: 'Subscription Due Today',
              message: `Your subscription "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due today.`,
              icon: Calendar,
              color: '#10b981',
              screen: 'Subscription',
            });
          } else if (d === 1) {
            list.push({
              id: `sub-${sub.id}-${deadline.nextDueDateStr}-1`,
              title: 'Subscription Due Tomorrow',
              message: `Reminder: "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due tomorrow.`,
              icon: Calendar,
              color: '#10b981',
              screen: 'Subscription',
            });
          } else if (d === 2 || d === 3) {
            list.push({
              id: `sub-${sub.id}-${deadline.nextDueDateStr}-${d}`,
              title: `Subscription Due in ${d} Days`,
              message: `Your subscription "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is due in ${d} days.`,
              icon: Calendar,
              color: '#10b981',
              screen: 'Subscription',
            });
          } else if (d < 0) {
            list.push({
              id: `sub-${sub.id}-${deadline.nextDueDateStr}-overdue`,
              title: 'Subscription Overdue',
              message: `Your subscription "${sub.title}" (${sym}${sub.amount.toLocaleString()}) is overdue for payment.`,
              icon: AlertCircle,
              color: colors.danger,
              screen: 'Subscription',
            });
          }
        }
      });
    }

    // 2. Rent Properties (3, 2, 1 Days Before, Day-of & Overdue)
    if (rents && rents.length > 0) {
      rents.forEach(rent => {
        const rentDeadline = getRentNextDeadline(rent, currentDate);
        if (!rentDeadline) return;
        const d = getDaysDiff(rentDeadline);
        const sym = rent.currency === 'USD' ? '$' : '₱';
        const dateKey = rentDeadline.toISOString().split('T')[0];

        if (d === 0) {
          list.push({
            id: `rent-${rent.id}-${dateKey}-0`,
            title: 'Rent Payment Due Today',
            message: `Monthly rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due today.`,
            icon: Home,
            color: '#10b981',
            screen: 'Rent',
          });
        } else if (d === 1) {
          list.push({
            id: `rent-${rent.id}-${dateKey}-1`,
            title: 'Rent Due Tomorrow',
            message: `Reminder: Monthly rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due tomorrow.`,
            icon: Home,
            color: '#10b981',
            screen: 'Rent',
          });
        } else if (d === 2 || d === 3) {
          list.push({
            id: `rent-${rent.id}-${dateKey}-${d}`,
            title: `Rent Due in ${d} Days`,
            message: `Monthly rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is due in ${d} days.`,
            icon: Home,
            color: '#10b981',
            screen: 'Rent',
          });
        } else if (d < 0) {
          list.push({
            id: `rent-${rent.id}-${dateKey}-overdue`,
            title: 'Rent Payment Overdue',
            message: `Monthly rent for "${rent.propertyName}" (${sym}${rent.monthlyAmount.toLocaleString()}) is overdue.`,
            icon: AlertCircle,
            color: colors.danger,
            screen: 'Rent',
          });
        }
      });
    }

    // 3. Installments (3, 2, 1 Days Before, Day-of & Overdue)
    if (installments && installments.length > 0) {
      installments.forEach(item => {
        const instDeadline = getInstallmentNextDeadline(item, currentDate);
        if (!instDeadline) return;
        const d = getDaysDiff(instDeadline);
        const sym = item.currency === 'USD' ? '$' : '₱';
        const dateKey = instDeadline.toISOString().split('T')[0];

        if (d === 0) {
          list.push({
            id: `installment-${item.id}-${dateKey}-0`,
            title: 'Installment Due Today',
            message: `Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due today.`,
            icon: CreditCard,
            color: '#10b981',
            screen: 'Installment',
          });
        } else if (d === 1) {
          list.push({
            id: `installment-${item.id}-${dateKey}-1`,
            title: 'Installment Due Tomorrow',
            message: `Reminder: Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due tomorrow.`,
            icon: CreditCard,
            color: '#10b981',
            screen: 'Installment',
          });
        } else if (d === 2 || d === 3) {
          list.push({
            id: `installment-${item.id}-${dateKey}-${d}`,
            title: `Installment Due in ${d} Days`,
            message: `Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is due in ${d} days.`,
            icon: CreditCard,
            color: '#10b981',
            screen: 'Installment',
          });
        } else if (d < 0) {
          list.push({
            id: `installment-${item.id}-${dateKey}-overdue`,
            title: 'Installment Overdue',
            message: `Payment for "${item.productName}" (${sym}${item.monthlyAmount.toLocaleString()}) is overdue.`,
            icon: AlertCircle,
            color: colors.danger,
            screen: 'Installment',
          });
        }
      });
    }

    // 4. Grocery Lists (3, 2, 1 Days Before & Grocery Day)
    if (groceryLists && groceryLists.length > 0) {
      groceryLists.forEach(list_item => {
        if (!list_item.scheduledDays || list_item.scheduledDays.length === 0) return;
        list_item.scheduledDays.forEach(dayIndex => {
          const nextDate = getGroceryNextOccurrence(dayIndex, currentDate);
          const d = getDaysDiff(nextDate);
          const dateKey = nextDate.toISOString().split('T')[0];

          if (d === 0) {
            list.push({
              id: `grocery-${list_item.id}-${dateKey}-0`,
              title: 'Grocery Day',
              message: `Scheduled grocery shopping today for: ${list_item.title}`,
              icon: ShoppingCart,
              color: '#10b981',
              screen: 'Grocery',
            });
          } else if (d === 1) {
            list.push({
              id: `grocery-${list_item.id}-${dateKey}-1`,
              title: 'Grocery Scheduled Tomorrow',
              message: `Reminder: Grocery shopping for "${list_item.title}" is scheduled for tomorrow.`,
              icon: ShoppingCart,
              color: '#10b981',
              screen: 'Grocery',
            });
          } else if (d === 2 || d === 3) {
            list.push({
              id: `grocery-${list_item.id}-${dateKey}-${d}`,
              title: `Grocery in ${d} Days`,
              message: `Upcoming grocery shopping in ${d} days for: ${list_item.title}`,
              icon: ShoppingCart,
              color: '#10b981',
              screen: 'Grocery',
            });
          }
        });
      });
    }

    // 5. Recursion (Paydays - 3, 2, 1 Days Before & Day-of)
    if (recursions && recursions.length > 0) {
      recursions.forEach(rec => {
        const paydayDate = getRecursionNextDeadline(rec, currentDate);
        if (!paydayDate) return;
        const d = getDaysDiff(paydayDate);
        const dateKey = paydayDate.toISOString().split('T')[0];

        if (d === 0) {
          list.push({
            id: `payday-${rec.id}-${dateKey}-0`,
            title: 'Payday Alert',
            message: `Payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} today.`,
            icon: Coins,
            color: '#10b981',
            screen: 'Recursion',
          });
        } else if (d === 1) {
          list.push({
            id: `payday-${rec.id}-${dateKey}-1`,
            title: 'Payday Tomorrow',
            message: `Reminder: Payday from ${rec.companyName} (₱${rec.amount.toLocaleString()}) is tomorrow!`,
            icon: Coins,
            color: '#10b981',
            screen: 'Recursion',
          });
        } else if (d === 2 || d === 3) {
          list.push({
            id: `payday-${rec.id}-${dateKey}-${d}`,
            title: `Payday in ${d} Days`,
            message: `Upcoming payday from ${rec.companyName}: Expecting ₱${rec.amount.toLocaleString()} in ${d} days.`,
            icon: Coins,
            color: '#10b981',
            screen: 'Recursion',
          });
        }
      });
    }

    // 6. Money Split Plans (3, 2, 1 Days Before & Day-of)
    if (splits && splits.length > 0) {
      splits.forEach(plan => {
        const splitDate = getSplitNextDeadline(plan, currentDate);
        if (!splitDate) return;
        const d = getDaysDiff(splitDate);
        const sym = plan.currency === 'USD' ? '$' : '₱';
        const dateKey = splitDate.toISOString().split('T')[0];

        if (d === 0) {
          list.push({
            id: `split-${plan.id}-${dateKey}-0`,
            title: 'Money Split Due Today',
            message: `Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled for distribution today.`,
            icon: GitFork,
            color: '#10b981',
            screen: 'Split',
          });
        } else if (d === 1) {
          list.push({
            id: `split-${plan.id}-${dateKey}-1`,
            title: 'Money Split Tomorrow',
            message: `Reminder: Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled for tomorrow.`,
            icon: GitFork,
            color: '#10b981',
            screen: 'Split',
          });
        } else if (d === 2 || d === 3) {
          list.push({
            id: `split-${plan.id}-${dateKey}-${d}`,
            title: `Money Split in ${d} Days`,
            message: `Money Split "${plan.title}" (${sym}${plan.totalAmount.toLocaleString()}) is scheduled in ${d} days.`,
            icon: GitFork,
            color: '#10b981',
            screen: 'Split',
          });
        }
      });
    }

    // 7. Active Debts (3, 2, 1 Days Before, Day-of & Overdue)
    if (debts && debts.length > 0) {
      debts.forEach(d => {
        if (!d.dueDate) return;
        const parts = d.dueDate.split('-');
        const debtDate = parts.length === 3
          ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
          : new Date(d.dueDate);
        const diff = getDaysDiff(debtDate);

        if (diff === 0) {
          list.push({
            id: `debt-due-${d.id}-${d.dueDate}-0`,
            title: 'Debt Payment Due Today',
            message: `Don't forget to pay ${d.personName}: ₱${d.amount.toLocaleString()} for ${d.taskName}.`,
            icon: Receipt,
            color: '#10b981',
            screen: 'Debts',
          });
        } else if (diff === 1) {
          list.push({
            id: `debt-due-${d.id}-${d.dueDate}-1`,
            title: 'Debt Due Tomorrow',
            message: `Reminder: Debt payment to ${d.personName} (₱${d.amount.toLocaleString()}) is due tomorrow.`,
            icon: Receipt,
            color: '#10b981',
            screen: 'Debts',
          });
        } else if (diff === 2 || diff === 3) {
          list.push({
            id: `debt-due-${d.id}-${d.dueDate}-${diff}`,
            title: `Debt Due in ${diff} Days`,
            message: `Reminder: Debt payment to ${d.personName} (₱${d.amount.toLocaleString()}) is due in ${diff} days.`,
            icon: Receipt,
            color: '#10b981',
            screen: 'Debts',
          });
        } else if (diff < 0) {
          list.push({
            id: `debt-overdue-${d.id}-${d.dueDate}`,
            title: 'Overdue Debt Reminder',
            message: `Debt payment to ${d.personName} (₱${d.amount.toLocaleString()}) is overdue!`,
            icon: AlertCircle,
            color: colors.danger,
            screen: 'Debts',
          });
        }
      });
    }

    // 8. Goals Reached 100% Target
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

    return list.filter(n => !dismissedIds.includes(n.id));
  }, [goals, wallets, debts, groceryLists, subscriptions, installments, rents, recursions, splits, colors, dismissedIds, currentDate]);

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

  const fullDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return {
    notifications,
    statusMessage,
    currentDate,
    fullDate,
    dismissedIds,
    markAllAsRead,
  };
}
