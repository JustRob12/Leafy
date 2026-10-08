import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Layers, 
  Home, 
  CreditCard, 
  ArrowDownRight, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Zap, 
  Eye, 
  EyeOff, 
  RotateCcw 
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { useResponsive, rf } from '../utils/responsive';
import { MONTH_NAMES } from '../utils/paymentSchedule';

const CARD_MAX_WIDTH = 560;

type FilterType = 'all' | 'subscription' | 'installment' | 'rent' | 'transaction';

export interface CalendarEvent {
  id: string;
  type: 'subscription' | 'installment' | 'rent' | 'transaction';
  title: string;
  subtitle: string;
  amount: number;
  currency: 'PHP' | 'USD';
  day: number;
  dateStr: string; // "YYYY-MM-DD"
  status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  statusLabel: string;
  color: string;
  typeColor?: string;
  isPaid?: boolean;
  installmentMonthIndex?: number;
  walletName?: string;
  rawItem: any;
  cycleKey?: string;
}

export interface CalendarGridCell {
  key: string;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  date: Date;
}

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const { 
    transactions, 
    wallets, 
    subscriptions, 
    installments, 
    rents, 
    paySubscriptionMonth, 
    payInstallmentMonth, 
    payRentMonth, 
    showConfirm, 
    isBalanceHidden, 
    toggleBalanceVisibility, 
    colors, 
    isDarkMode 
  } = useAppContext();

  const { contentWidth, isLandscape } = useResponsive();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<FilterType>('all');

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    const maxDays = new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate();
    setSelectedDate(new Date(prev.getFullYear(), prev.getMonth(), Math.min(selectedDate.getDate(), maxDays)));
  };

  const nextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    const maxDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), Math.min(selectedDate.getDate(), maxDays)));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parseDateParts = (dateStr?: string): { year: number; month: number; day: number } | null => {
    if (!dateStr) return null;
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length < 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // 0-indexed month
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return { year: y, month: m, day: d };
  };

  // Build scheduled events for the current month
  const monthEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    const totalDays = daysInMonth(month, year);
    const currentCycleKey = `${MONTH_NAMES[month]} ${year}`;

    // 1. Subscriptions (Display on ALL months)
    (subscriptions || []).forEach(sub => {
      const rawDay = sub?.dayOfMonth && !isNaN(sub.dayOfMonth) 
        ? sub.dayOfMonth 
        : (parseDateParts(sub?.date)?.day || 1);
      const targetDay = Math.min(Math.max(1, rawDay), totalDays);
      const eventDate = new Date(year, month, targetDay);
      eventDate.setHours(0, 0, 0, 0);

      const isPaid = (sub.lastPaidCycle === currentCycleKey) || (sub.paymentHistory || []).some((h: any) => 
        h.cycleKey === currentCycleKey || 
        (h.paidDate && new Date(h.paidDate).getMonth() === month && new Date(h.paidDate).getFullYear() === year)
      );

      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'upcoming' = 'upcoming';
      let statusLabel = 'Not Paid';

      if (isPaid) {
        status = 'paid';
        statusLabel = 'Paid ✓';
      } else {
        const isCurrentViewedMonth = year === today.getFullYear() && month === today.getMonth();
        const isPastViewedMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

        if (isPastViewedMonth) {
          status = 'overdue';
          statusLabel = 'Not Paid (Overdue)';
        } else if (isCurrentViewedMonth) {
          if (diffDays < 0) {
            status = 'overdue';
            statusLabel = `Not Paid (${Math.abs(diffDays)}d overdue)`;
          } else if (diffDays === 0) {
            status = 'due_today';
            statusLabel = 'Due Today';
          } else if (diffDays <= 3) {
            status = 'due_soon';
            statusLabel = `Due in ${diffDays}d`;
          } else {
            status = 'upcoming';
            statusLabel = 'Not Paid';
          }
        } else {
          status = 'upcoming';
          statusLabel = 'Not Paid';
        }
      }

      const wallet = wallets.find(w => w.id === sub.walletId);
      const mm = (month + 1).toString().padStart(2, '0');
      const dd = targetDay.toString().padStart(2, '0');

      events.push({
        id: `sub-${sub.id}-${year}-${month}`,
        type: 'subscription',
        title: sub.title,
        subtitle: `Subscription • ${currentCycleKey}`,
        amount: sub.amount,
        currency: sub.currency || 'PHP',
        day: targetDay,
        dateStr: `${year}-${mm}-${dd}`,
        status,
        statusLabel,
        color: isPaid ? '#10b981' : '#f87171',
        typeColor: '#10b981',
        isPaid,
        walletName: wallet?.name || 'External / Card',
        rawItem: sub,
        cycleKey: currentCycleKey,
      });
    });

    // 2. Installments (Project across ALL months for the full monthsToPay duration)
    (installments || []).forEach(item => {
      const monthsToPay = item.monthsToPay && item.monthsToPay > 0 ? item.monthsToPay : 1;
      const paidMonths = item.paidMonths || 0;

      // Base anchor: dueDate corresponds to Month (paidMonths + 1)
      const anchorParsed = parseDateParts(item.dueDate) || parseDateParts(item.startDate) || parseDateParts(item.date);
      if (!anchorParsed) return;

      const anchorCycleIndex = item.dueDate ? paidMonths : 0;

      // Check each scheduled month of the installment plan (k from 1 to monthsToPay)
      for (let k = 1; k <= monthsToPay; k++) {
        const cycleOffset = (k - 1) - anchorCycleIndex;
        const instTargetDate = new Date(anchorParsed.year, anchorParsed.month + cycleOffset, anchorParsed.day);
        const instY = instTargetDate.getFullYear();
        const instM = instTargetDate.getMonth();

        // Does this installment month k match the currently viewed (year, month)?
        if (instY === year && instM === month) {
          const targetDay = Math.min(anchorParsed.day, totalDays);
          const eventDate = new Date(year, month, targetDay);
          eventDate.setHours(0, 0, 0, 0);

          const isPaid = k <= paidMonths;
          const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const remainingMonths = Math.max(0, monthsToPay - k);

          let status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'upcoming' = 'upcoming';
          let statusLabel = `Month ${k}/${monthsToPay} • Not Paid`;

          if (isPaid) {
            status = 'paid';
            statusLabel = `Month ${k}/${monthsToPay} Paid ✓`;
          } else if (k === paidMonths + 1) {
            if (diffDays < 0) {
              status = 'overdue';
              statusLabel = `Month ${k}/${monthsToPay} • Overdue`;
            } else if (diffDays === 0) {
              status = 'due_today';
              statusLabel = `Month ${k}/${monthsToPay} • Due Today`;
            } else if (diffDays <= 3) {
              status = 'due_soon';
              statusLabel = `Month ${k}/${monthsToPay} (${diffDays}d left)`;
            } else {
              status = 'upcoming';
              statusLabel = `Month ${k}/${monthsToPay} • Not Paid`;
            }
          } else {
            status = 'upcoming';
            statusLabel = `Month ${k}/${monthsToPay} • Not Paid`;
          }

          const wallet = wallets.find(w => w.id === item.walletId);
          const mm = (month + 1).toString().padStart(2, '0');
          const dd = targetDay.toString().padStart(2, '0');

          events.push({
            id: `inst-${item.id}-month-${k}`,
            type: 'installment',
            title: item.productName,
            subtitle: `Installment • Month ${k} of ${monthsToPay} (${remainingMonths} remaining)`,
            amount: item.monthlyAmount,
            currency: item.currency || 'PHP',
            day: targetDay,
            dateStr: `${year}-${mm}-${dd}`,
            status,
            statusLabel,
            color: isPaid ? '#10b981' : '#f87171',
            typeColor: '#3b82f6',
            isPaid,
            installmentMonthIndex: k,
            walletName: wallet?.name || 'Linked Wallet',
            rawItem: item,
            cycleKey: currentCycleKey,
          });
        }
      }
    });

    // 3. Rent (Display from lease start date onwards)
    (rents || []).forEach(item => {
      const startParts = parseDateParts(item.startDate) || parseDateParts(item.dueDate) || parseDateParts(item.date);
      if (!startParts) return;

      const rentDay = startParts.day || 1;
      const targetDay = Math.min(rentDay, totalDays);
      const eventDate = new Date(year, month, targetDay);
      eventDate.setHours(0, 0, 0, 0);

      // Number of months since the rent started: 0 for start month, 1 for next month, etc.
      const monthsSinceStart = (year - startParts.year) * 12 + (month - startParts.month);

      // Only display rent from the start date onwards (do not display phantom rent before tenancy began)
      if (monthsSinceStart < 0) return;

      const cycleNumber = monthsSinceStart + 1;
      const paidCycles = item.paidCycles || 0;

      // A cycle is paid if paidCycles covers this cycle number, or if there is a matching payment record
      const isPaidByCycles = cycleNumber <= paidCycles;
      const historyMatch = (item.paymentHistory || []).some((h: any) => h.cycle === cycleNumber);

      const isPaid = isPaidByCycles || historyMatch;
      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'upcoming' = 'upcoming';
      let statusLabel = 'Rent Not Paid';

      if (isPaid) {
        status = 'paid';
        statusLabel = 'Rent Paid ✓';
      } else {
        const isCurrentViewedMonth = year === today.getFullYear() && month === today.getMonth();
        const isPastViewedMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

        if (isPastViewedMonth) {
          status = 'overdue';
          statusLabel = 'Rent Not Paid (Overdue)';
        } else if (isCurrentViewedMonth) {
          if (diffDays < 0) {
            status = 'overdue';
            statusLabel = `Rent Not Paid (${Math.abs(diffDays)}d overdue)`;
          } else if (diffDays === 0) {
            status = 'due_today';
            statusLabel = 'Rent Due Today';
          } else if (diffDays <= 3) {
            status = 'due_soon';
            statusLabel = `Rent Due (${diffDays}d left)`;
          } else {
            status = 'upcoming';
            statusLabel = 'Rent Not Paid';
          }
        } else {
          status = 'upcoming';
          statusLabel = 'Rent Not Paid';
        }
      }

      const wallet = wallets.find(w => w.id === item.walletId);
      const mm = (month + 1).toString().padStart(2, '0');
      const dd = targetDay.toString().padStart(2, '0');

      events.push({
        id: `rent-${item.id}-${year}-${month}`,
        type: 'rent',
        title: item.propertyName,
        subtitle: `Rent • ${item.location ? `${item.location} • ` : ''}${currentCycleKey}`,
        amount: item.monthlyAmount,
        currency: item.currency || 'PHP',
        day: targetDay,
        dateStr: `${year}-${mm}-${dd}`,
        status,
        statusLabel,
        color: isPaid ? '#10b981' : '#f87171',
        typeColor: '#f59e0b',
        isPaid,
        walletName: wallet?.name || 'Rent Wallet',
        rawItem: item,
        cycleKey: currentCycleKey,
      });
    });

    // 4. Transactions
    (transactions || []).forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === month && txDate.getFullYear() === year) {
        const targetDay = txDate.getDate();
        const wallet = wallets.find(w => w.id === tx.walletId);
        const isDeposit = tx.type === 'deposit';
        const mm = (month + 1).toString().padStart(2, '0');
        const dd = targetDay.toString().padStart(2, '0');

        events.push({
          id: `tx-${tx.id}`,
          type: 'transaction',
          title: tx.title,
          subtitle: `${isDeposit ? 'Income' : 'Expense'} • ${wallet?.name || 'Wallet'}`,
          amount: tx.amount,
          currency: tx.currency || 'PHP',
          day: targetDay,
          dateStr: `${year}-${mm}-${dd}`,
          status: 'paid',
          statusLabel: isDeposit ? '+Income' : '-Expense',
          color: isDeposit ? '#10b981' : '#8b5cf6',
          typeColor: isDeposit ? '#10b981' : '#8b5cf6',
          isPaid: true,
          walletName: wallet?.name,
          rawItem: tx,
        });
      }
    });

    return events;
  }, [subscriptions, installments, rents, transactions, wallets, month, year, today]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return monthEvents;
    return monthEvents.filter(e => e.type === filterType);
  }, [monthEvents, filterType]);

  // Events map by day for quick lookup
  const eventsByDay = useMemo(() => {
    const map: { [day: number]: CalendarEvent[] } = {};
    filteredEvents.forEach(e => {
      if (!map[e.day]) map[e.day] = [];
      map[e.day].push(e);
    });
    return map;
  }, [filteredEvents]);

  // Selected date events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    if (selectedDate.getMonth() !== month || selectedDate.getFullYear() !== year) return [];
    const day = selectedDate.getDate();
    return eventsByDay[day] || [];
  }, [selectedDate, month, year, eventsByDay]);

  // Upcoming events this month (from today or selected date forward)
  const upcomingMonthEvents = useMemo(() => {
    const curDay = selectedDate && selectedDate.getMonth() === month && selectedDate.getFullYear() === year
      ? selectedDate.getDate()
      : 1;

    return filteredEvents
      .filter(e => e.day >= curDay && e.type !== 'transaction')
      .sort((a, b) => a.day - b.day);
  }, [filteredEvents, selectedDate, month, year]);

  // Monthly Total Due
  const monthTotalObligation = useMemo(() => {
    return monthEvents
      .filter(e => e.type !== 'transaction')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [monthEvents]);

  const monthPaidObligation = useMemo(() => {
    return monthEvents
      .filter(e => e.type !== 'transaction' && e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [monthEvents]);

  const monthUnpaidObligation = useMemo(() => {
    return Math.max(0, monthTotalObligation - monthPaidObligation);
  }, [monthTotalObligation, monthPaidObligation]);

  // Payment handlers with confirmation
  const handlePayEvent = (event: CalendarEvent) => {
    const sym = event.currency === 'USD' ? '$' : '₱';
    if (event.type === 'subscription') {
      showConfirm(
        'Confirm Subscription Payment',
        `Pay ${sym}${event.amount.toLocaleString()} for "${event.title}" for ${event.cycleKey || `${MONTH_NAMES[month]} ${year}`}?`,
        async () => {
          await paySubscriptionMonth(event.rawItem.id, event.cycleKey || `${MONTH_NAMES[month]} ${year}`);
        },
        false,
        'Pay Now',
        'pay'
      );
    } else if (event.type === 'installment') {
      const nextDueK = (event.rawItem.paidMonths || 0) + 1;
      const targetLabel = event.installmentMonthIndex 
        ? `Month ${event.installmentMonthIndex} of ${event.rawItem.monthsToPay}` 
        : `Month ${nextDueK} of ${event.rawItem.monthsToPay}`;
      showConfirm(
        'Confirm Installment Payment',
        `Pay monthly amount ${sym}${event.amount.toLocaleString()} for "${event.title}" (${targetLabel})?`,
        async () => {
          await payInstallmentMonth(event.rawItem.id);
        },
        false,
        'Pay Now',
        'pay'
      );
    } else if (event.type === 'rent') {
      showConfirm(
        'Confirm Rent Payment',
        `Pay monthly rent ${sym}${event.amount.toLocaleString()} for "${event.title}" for ${event.cycleKey || `${MONTH_NAMES[month]} ${year}`}?`,
        async () => {
          await payRentMonth(event.rawItem.id);
        },
        false,
        'Pay Now',
        'pay'
      );
    }
  };

  const handleOpenDetail = (event: CalendarEvent) => {
    if (event.type === 'subscription') {
      navigation.navigate('SubscriptionDetail', { subscription: event.rawItem });
    } else if (event.type === 'installment') {
      navigation.navigate('InstallmentDetail', { installment: event.rawItem });
    } else if (event.type === 'rent') {
      navigation.navigate('RentDetail', { rent: event.rawItem });
    }
  };

  const styles = getStyles(colors, isDarkMode);

  // Group month into structured 7-day week rows (Google Calendar layout)
  const weeks = useMemo(() => {
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: CalendarGridCell[] = [];

    // 1. Trailing days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        key: `prev-${prevDate.getFullYear()}-${prevDate.getMonth()}-${d}`,
        day: d,
        month: prevDate.getMonth(),
        year: prevDate.getFullYear(),
        isCurrentMonth: false,
        date: prevDate,
      });
    }

    // 2. Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      cells.push({
        key: `curr-${year}-${month}-${d}`,
        day: d,
        month,
        year,
        isCurrentMonth: true,
        date: currDate,
      });
    }

    // 3. Leading days of next month to complete the last 7-day week row
    const remainingInWeek = cells.length % 7;
    if (remainingInWeek > 0) {
      const needed = 7 - remainingInWeek;
      for (let d = 1; d <= needed; d++) {
        const nextDate = new Date(year, month + 1, d);
        cells.push({
          key: `next-${nextDate.getFullYear()}-${nextDate.getMonth()}-${d}`,
          day: d,
          month: nextDate.getMonth(),
          year: nextDate.getFullYear(),
          isCurrentMonth: false,
          date: nextDate,
        });
      }
    }

    // Partition into 7-day week rows
    const result: CalendarGridCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }

    return result;
  }, [year, month]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Financial Calendar</Text>
          <Text style={styles.headerSub}>Installments, Subscriptions & Rent</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity 
            onPress={toggleBalanceVisibility} 
            style={styles.headerIconBtn}
          >
            {isBalanceHidden ? <EyeOff size={18} color={colors.primary} /> : <Eye size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={jumpToToday} 
            style={styles.todayBtn}
          >
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* MONTH SWITCHER & OBLIGATION SUMMARY BANNER */}
        <View style={styles.monthHeaderCard}>
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.monthInfo}>
              <Text style={styles.monthText}>{monthNames[month]} {year}</Text>
              <Text style={styles.monthObligationSub}>
                {isBalanceHidden ? '₱ ******' : `₱${monthTotalObligation.toLocaleString()} Total Scheduled`}
              </Text>
            </View>

            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Progress Bar: Paid vs Remaining */}
          {monthTotalObligation > 0 && (
            <View style={styles.monthProgressBarContainer}>
              <View style={styles.monthProgressLabels}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                  <Text style={[styles.monthProgressText, { color: '#10b981', fontFamily: theme.fonts.semiBold }]}>
                    Paid: {isBalanceHidden ? '₱ ******' : `₱${monthPaidObligation.toLocaleString()}`}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#f87171' }} />
                  <Text style={[styles.monthProgressText, { color: monthUnpaidObligation > 0 ? (isDarkMode ? '#fca5a5' : '#ef4444') : colors.textMuted, fontFamily: theme.fonts.semiBold }]}>
                    Not Paid: {isBalanceHidden ? '₱ ******' : `₱${monthUnpaidObligation.toLocaleString()}`}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarTrack}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.min(100, (monthPaidObligation / monthTotalObligation) * 100)}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {/* GOOGLE CALENDAR CATEGORY FILTER PILLS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterPillsContainer}
        >
          <TouchableOpacity 
            style={[styles.filterPill, filterType === 'all' && styles.filterPillActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterPillText, filterType === 'all' && styles.filterPillTextActive]}>
              All Schedules
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filterType === 'subscription' && styles.filterPillActive]}
            onPress={() => setFilterType('subscription')}
          >
            <View style={[styles.pillColorDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.filterPillText, filterType === 'subscription' && styles.filterPillTextActive]}>
              Subscriptions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filterType === 'installment' && styles.filterPillActive]}
            onPress={() => setFilterType('installment')}
          >
            <View style={[styles.pillColorDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={[styles.filterPillText, filterType === 'installment' && styles.filterPillTextActive]}>
              Installments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filterType === 'rent' && styles.filterPillActive]}
            onPress={() => setFilterType('rent')}
          >
            <View style={[styles.pillColorDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.filterPillText, filterType === 'rent' && styles.filterPillTextActive]}>
              Rent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filterType === 'transaction' && styles.filterPillActive]}
            onPress={() => setFilterType('transaction')}
          >
            <View style={[styles.pillColorDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={[styles.filterPillText, filterType === 'transaction' && styles.filterPillTextActive]}>
              Transactions
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CALENDAR GRID (GOOGLE CALENDAR MONTH VIEW) */}
        <View style={styles.calendarCard}>
          <View style={styles.headerWeekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <View key={i} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {weeks.map((week, weekIdx) => (
              <View key={`week-${weekIdx}`} style={styles.gridWeekRow}>
                {week.map(cell => {
                  if (!cell.isCurrentMonth) {
                    return (
                      <TouchableOpacity
                        key={cell.key}
                        style={styles.dayCell}
                        activeOpacity={0.6}
                        onPress={() => {
                          setCurrentDate(new Date(cell.year, cell.month, 1));
                          setSelectedDate(cell.date);
                        }}
                      >
                        <View style={styles.dayBadge}>
                          <Text style={[styles.dayText, styles.otherMonthDayText]}>
                            {cell.day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  const isToday = cell.day === today.getDate() && 
                                  month === today.getMonth() && 
                                  year === today.getFullYear();

                  const isSelected = selectedDate && 
                                     cell.day === selectedDate.getDate() && 
                                     cell.month === selectedDate.getMonth() && 
                                     cell.year === selectedDate.getFullYear();

                  const dayEvts = eventsByDay[cell.day] || [];
                  const hasUnpaid = dayEvts.some(e => e.type !== 'transaction' && e.status !== 'paid');
                  const hasOverdue = dayEvts.some(e => e.status === 'overdue');

                  return (
                    <TouchableOpacity 
                      key={cell.key} 
                      style={styles.dayCell}
                      activeOpacity={0.7}
                      onPress={() => setSelectedDate(cell.date)}
                    >
                      <View style={[
                        styles.dayBadge,
                        hasUnpaid && !isToday && !isSelected && styles.unpaidDayBadge,
                        isToday && styles.todayBadge,
                        isSelected && !isToday && styles.selectedBadge,
                      ]}>
                        <Text style={[
                          styles.dayText,
                          hasUnpaid && !isToday && !isSelected && styles.unpaidDayText,
                          isToday && styles.todayText,
                          isSelected && !isToday && styles.selectedText,
                        ]}>
                          {cell.day}
                        </Text>
                      </View>

                      {/* Event Dots Container */}
                      <View style={styles.eventDotsRow}>
                        {dayEvts.slice(0, 3).map((e, idx) => {
                          const isEventUnpaid = e.type !== 'transaction' && e.status !== 'paid';
                          const dotColor = isEventUnpaid ? '#f87171' : (e.status === 'paid' ? '#10b981' : e.color);
                          return (
                            <View 
                              key={`${e.id}-${idx}`} 
                              style={[
                                styles.eventDot, 
                                { backgroundColor: dotColor }
                              ]} 
                            />
                          );
                        })}
                        {dayEvts.length > 3 && (
                          <View style={[styles.eventDot, { backgroundColor: colors.textMuted }]} />
                        )}
                      </View>

                      {/* Overdue / Unpaid Alert Accent */}
                      {hasUnpaid && (
                        <View style={[
                          styles.overdueCornerDot,
                          { backgroundColor: hasOverdue ? '#ef4444' : '#f87171' }
                        ]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* CALENDAR LEGEND */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Paid</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f87171' }]} />
              <Text style={styles.legendText}>Not Paid</Text>
            </View>
            <View style={styles.legendDivider} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Sub</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Inst</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Rent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.legendText}>Tx</Text>
            </View>
          </View>
        </View>

        {/* AGENDA SECTION (SCHEDULE LIST FOR SELECTED DATE) */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.agendaTitle}>{formattedSelectedDate}</Text>
              <Text style={styles.agendaSub}>
                {selectedDayEvents.length === 0 
                  ? 'No scheduled payments on this date' 
                  : `${selectedDayEvents.length} scheduled item${selectedDayEvents.length > 1 ? 's' : ''}`}
              </Text>
            </View>
            {selectedDate && selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && (
              <View style={styles.agendaTodayBadge}>
                <Text style={styles.agendaTodayBadgeText}>TODAY</Text>
              </View>
            )}
          </View>

          {/* SELECTED DAY ITEMS */}
          {selectedDayEvents.length > 0 ? (
            <View style={styles.agendaEventsList}>
              {selectedDayEvents.map((evt) => {
                const isUnpaid = evt.type !== 'transaction' && evt.status !== 'paid';
                return (
                  <View 
                    key={evt.id} 
                    style={[
                      styles.agendaCard,
                      isUnpaid && styles.agendaCardUnpaid,
                      evt.status === 'paid' && styles.agendaCardPaid,
                    ]}
                  >
                    <View style={styles.agendaCardBody}>
                      <View style={styles.agendaCardTop}>
                        {/* Icon & Category Pill */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={[
                            styles.agendaCategoryPill, 
                            { 
                              backgroundColor: isUnpaid 
                                ? (isDarkMode ? 'rgba(239, 68, 68, 0.18)' : '#fee2e2') 
                                : (evt.status === 'paid' ? 'rgba(16, 185, 129, 0.12)' : (evt.typeColor || evt.color) + '18') 
                            }
                          ]}>
                            {evt.type === 'subscription' ? (
                              <CreditCard size={11} color={isUnpaid ? (isDarkMode ? '#fca5a5' : '#ef4444') : (evt.typeColor || evt.color)} />
                            ) : evt.type === 'installment' ? (
                              <Layers size={11} color={isUnpaid ? (isDarkMode ? '#fca5a5' : '#ef4444') : (evt.typeColor || evt.color)} />
                            ) : evt.type === 'rent' ? (
                              <Home size={11} color={isUnpaid ? (isDarkMode ? '#fca5a5' : '#ef4444') : (evt.typeColor || evt.color)} />
                            ) : (
                              <ArrowDownRight size={11} color={evt.color} />
                            )}
                            <Text style={[
                              styles.agendaCategoryText, 
                              { color: isUnpaid ? (isDarkMode ? '#fca5a5' : '#ef4444') : (evt.typeColor || evt.color) }
                            ]}>
                              {evt.type.toUpperCase()}
                            </Text>
                          </View>

                          {/* Status Chip */}
                          <View style={[
                            styles.statusChip,
                            isUnpaid ? styles.statusChipUnpaid : styles.statusChipPaid,
                          ]}>
                            {evt.status === 'paid' ? (
                              <CheckCircle2 size={10} color="#10b981" />
                            ) : (
                              <Clock size={10} color={isDarkMode ? '#fca5a5' : '#ef4444'} />
                            )}
                            <Text style={[
                              styles.statusChipText,
                              isUnpaid ? { color: isDarkMode ? '#fca5a5' : '#ef4444', fontFamily: theme.fonts.bold } : { color: '#10b981', fontFamily: theme.fonts.bold }
                            ]}>
                              {evt.statusLabel}
                            </Text>
                          </View>
                        </View>

                        {/* Amount */}
                        <Text style={[styles.agendaAmountText, isUnpaid && { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
                          {isBalanceHidden ? `${evt.currency === 'USD' ? '$' : '₱'} ******` : `${evt.currency === 'USD' ? '$' : '₱'}${evt.amount.toLocaleString()}`}
                        </Text>
                      </View>

                      {/* Title & Wallet */}
                      <Text style={styles.agendaCardTitle} numberOfLines={1}>{evt.title}</Text>
                      <Text style={styles.agendaCardSubtitle} numberOfLines={1}>
                        {evt.subtitle} {evt.walletName ? `• ${evt.walletName}` : ''}
                      </Text>

                      {/* Action Buttons Row */}
                      <View style={styles.agendaActionRow}>
                        <TouchableOpacity 
                          style={styles.agendaDetailBtn}
                          onPress={() => handleOpenDetail(evt)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.agendaDetailBtnText}>View Details</Text>
                          <ExternalLink size={12} color={colors.primary} />
                        </TouchableOpacity>

                        {isUnpaid && (
                          <TouchableOpacity 
                            style={styles.agendaPayBtn}
                            onPress={() => handlePayEvent(evt)}
                            activeOpacity={0.8}
                          >
                            <Zap size={12} color="#ffffff" style={{ marginRight: 3 }} />
                            <Text style={styles.agendaPayBtnText}>Pay Now</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyDayContainer}>
              <CalendarIcon size={32} color={colors.textMuted + '66'} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyDayTitle}>No obligations for this date</Text>
              <Text style={styles.emptyDaySub}>
                Tap on dates with colored dots above or browse upcoming payments below.
              </Text>
            </View>
          )}

          {/* UPCOMING THIS MONTH SCHEDULE LIST */}
          {upcomingMonthEvents.length > 0 && (
            <View style={styles.upcomingSection}>
              <View style={styles.upcomingHeaderRow}>
                <Clock size={14} color={colors.primary} />
                <Text style={styles.upcomingSectionTitle}>Upcoming This Month</Text>
              </View>

              <View style={{ gap: 8 }}>
                {upcomingMonthEvents.map((evt) => {
                  const isUnpaid = evt.type !== 'transaction' && evt.status !== 'paid';
                  const displayColor = isUnpaid ? '#f87171' : (evt.status === 'paid' ? '#10b981' : evt.color);
                  return (
                    <TouchableOpacity 
                      key={`up-${evt.id}`}
                      style={[styles.upcomingItemCard, isUnpaid && styles.upcomingItemCardUnpaid]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedDate(new Date(year, month, evt.day));
                      }}
                    >
                      <View style={[styles.upcomingDayBadge, isUnpaid && styles.upcomingDayBadgeUnpaid]}>
                        <Text style={[styles.upcomingDayNum, isUnpaid && { color: isDarkMode ? '#fca5a5' : '#b91c1c' }]}>{evt.day}</Text>
                        <Text style={[styles.upcomingDayMonth, isUnpaid && { color: isDarkMode ? '#f87171' : '#dc2626' }]}>{MONTH_NAMES[month].toUpperCase()}</Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.upcomingItemTitle} numberOfLines={1}>{evt.title}</Text>
                          <View style={[
                            styles.miniTypeChip, 
                            { 
                              backgroundColor: isUnpaid 
                                ? (isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2') 
                                : 'rgba(16, 185, 129, 0.15)' 
                            }
                          ]}>
                            <Text style={[styles.miniTypeChipText, { color: isUnpaid ? (isDarkMode ? '#fca5a5' : '#ef4444') : '#10b981' }]}>
                              {isUnpaid ? 'NOT PAID' : 'PAID'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.upcomingItemSub, isUnpaid && { color: isDarkMode ? '#fca5a5' : '#ef4444' }]} numberOfLines={1}>
                          {evt.statusLabel} • {evt.walletName || 'Wallet'}
                        </Text>
                      </View>

                      <Text style={[styles.upcomingItemAmount, isUnpaid && { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
                        {isBalanceHidden ? `${evt.currency === 'USD' ? '$' : '₱'} ******` : `${evt.currency === 'USD' ? '$' : '₱'}${evt.amount.toLocaleString()}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    color: colors.text,
  },
  headerSub: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(10),
    color: colors.textMuted,
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  todayBtn: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  todayBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    color: colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    maxWidth: CARD_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  monthHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(17),
    color: colors.text,
  },
  monthObligationSub: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: colors.primary,
    marginTop: 2,
  },
  monthProgressBarContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  monthProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  monthProgressText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(10.5),
    color: colors.textMuted,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(254, 202, 202, 0.65)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: colors.text,
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  pillColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calendarCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  headerWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 6,
    width: '100%',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'column',
    width: '100%',
  },
  gridWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    position: 'relative',
  },
  otherMonthDayText: {
    color: isDarkMode ? '#475569' : '#94a3b8',
    fontFamily: theme.fonts.regular,
    opacity: 0.65,
  },
  dayBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unpaidDayBadge: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.45)' : '#fca5a5',
  },
  unpaidDayText: {
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    fontFamily: theme.fonts.bold,
  },
  todayBadge: {
    backgroundColor: colors.primary,
  },
  selectedBadge: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '14',
  },
  dayText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: colors.text,
  },
  todayText: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  selectedText: {
    color: colors.primary,
    fontFamily: theme.fonts.bold,
  },
  eventDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 2,
    height: 6,
  },
  eventDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
  overdueCornerDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(10),
    color: colors.textMuted,
  },
  agendaSection: {
    marginTop: 4,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  agendaTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    color: colors.text,
  },
  agendaSub: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    color: colors.textMuted,
    marginTop: 1,
  },
  agendaTodayBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  agendaTodayBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(9.5),
    color: colors.primary,
    letterSpacing: 0.5,
  },
  agendaEventsList: {
    gap: 10,
  },
  agendaCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  agendaCardUnpaid: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.05)' : '#fffbfa',
    borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
  },
  agendaCardPaid: {
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0',
  },
  agendaCardBody: {
    flex: 1,
    padding: 12,
  },
  agendaCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  agendaCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  agendaCategoryText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(9),
    letterSpacing: 0.5,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
  },
  statusChipPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusChipUnpaid: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.35)' : '#fca5a5',
  },
  statusChipDueToday: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  statusChipOverdue: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : '#fecaca',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  statusChipUpcoming: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
  },
  statusChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(9.5),
    color: colors.textMuted,
  },
  agendaAmountText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: colors.text,
  },
  agendaCardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13.5),
    color: colors.text,
    marginBottom: 2,
  },
  agendaCardSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    color: colors.textMuted,
    marginBottom: 10,
  },
  agendaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
  },
  agendaDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agendaDetailBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(11),
    color: colors.primary,
  },
  agendaPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  agendaPayBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    color: '#ffffff',
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  emptyDayTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
    color: colors.text,
  },
  emptyDaySub: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  upcomingSection: {
    marginTop: 10,
  },
  upcomingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  upcomingSectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13),
    color: colors.text,
  },
  upcomingItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  upcomingItemCardUnpaid: {
    borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.4)' : '#fca5a5',
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.04)' : '#fffbfa',
  },
  upcomingDayBadge: {
    width: 38,
    height: 40,
    borderRadius: 8,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  upcomingDayBadgeUnpaid: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
    borderColor: isDarkMode ? 'rgba(248, 113, 113, 0.4)' : '#fca5a5',
    borderWidth: 1,
  },
  upcomingDayNum: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13),
    color: colors.text,
  },
  upcomingDayMonth: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(8),
    color: colors.primary,
  },
  upcomingItemTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(12.5),
    color: colors.text,
  },
  miniTypeChip: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniTypeChipText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(8),
    textTransform: 'uppercase',
  },
  upcomingItemSub: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(10.5),
    color: colors.textMuted,
    marginTop: 1,
  },
  upcomingItemAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12.5),
    color: colors.text,
  },
});
