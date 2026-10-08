/**
 * Payment schedule helpers for Installments, Rent Properties, and Subscriptions.
 */

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function calculateCycleDueDate(startDateStr: string, cycleIndex: number): string {
  if (!startDateStr) return new Date().toISOString().split('T')[0];
  const parts = startDateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return startDateStr;

  // Cycle 1 is 1 month after start date, Cycle 2 is 2 months, etc.
  const targetDate = new Date(y, (m - 1) + cycleIndex, d);
  const outY = targetDate.getFullYear();
  const outM = targetDate.getMonth() + 1;
  const outD = targetDate.getDate();

  const mm = outM < 10 ? `0${outM}` : `${outM}`;
  const dd = outD < 10 ? `0${outD}` : `${outD}`;
  return `${outY}-${mm}-${dd}`;
}

export function calculateRentCycleDueDate(startDateStr: string, cycleIndex: number): string {
  if (!startDateStr) return new Date().toISOString().split('T')[0];
  const parts = startDateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return startDateStr;

  // For rent: Month 1 (cycleIndex 1) is on startDate! Month 2 is 1 month after, etc.
  const targetDate = new Date(y, (m - 1) + (cycleIndex - 1), d);
  const outY = targetDate.getFullYear();
  const outM = targetDate.getMonth() + 1;
  const outD = targetDate.getDate();

  const mm = outM < 10 ? `0${outM}` : `${outM}`;
  const dd = outD < 10 ? `0${outD}` : `${outD}`;
  return `${outY}-${mm}-${dd}`;
}

export function formatScheduleDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) {
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${day} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }
  }
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatPaidTimestamp(isoStr: string): string {
  if (!isoStr) return '';
  const dateObj = new Date(isoStr);
  if (isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const datePart = `${day} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const timePart = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Paid on ${datePart} • ${timePart}`;
}

export function getDueDateStatus(dueDateStr: string, baseDate = new Date()): { isOverdue: boolean; isDueSoon: boolean; daysRemaining: number } {
  if (!dueDateStr) return { isOverdue: false, isDueSoon: false, daysRemaining: 999 };
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const parts = dueDateStr.split('-');
  let due: Date;
  if (parts.length === 3) {
    due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    due = new Date(dueDateStr);
  }
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    isOverdue: daysRemaining < 0,
    isDueSoon: daysRemaining >= 0 && daysRemaining <= 3,
    daysRemaining,
  };
}

export interface SubscriptionDeadlineInfo {
  nextDueDate: Date;
  nextDueDateStr: string;
  formattedDueDate: string;
  cycleKey: string;
  isCurrentMonthPaid: boolean;
  isOverdue: boolean;
  isDueSoon: boolean;
  daysRemaining: number;
}

/**
 * Calculates the next deadline and payment status for a subscription.
 * - If current month is unpaid: next deadline is this month (or overdue if date passed).
 * - If current month is paid: next deadline is next month (or next unpaid forward month).
 */
export function getSubscriptionNextDeadline(
  sub: { dayOfMonth?: number; paymentHistory?: any[] },
  baseDate: Date = new Date()
): SubscriptionDeadlineInfo {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();
  const rawDay = sub?.dayOfMonth && !isNaN(sub.dayOfMonth) ? sub.dayOfMonth : 1;
  const dayOfMonth = Math.min(31, Math.max(1, rawDay));

  const history = sub?.paymentHistory || [];
  const currentCycleKey = `${MONTH_NAMES[currentMonthIdx]} ${currentYear}`;
  const isCurrentMonthPaid = history.some((h: any) => h.cycleKey === currentCycleKey);

  let targetYear = currentYear;
  let targetMonth = currentMonthIdx;

  if (isCurrentMonthPaid) {
    // Current month is already paid!
    // Search forward for the first upcoming month cycle that is NOT paid
    for (let offset = 1; offset <= 12; offset++) {
      const candidateDate = new Date(currentYear, currentMonthIdx + offset, 1);
      const candY = candidateDate.getFullYear();
      const candM = candidateDate.getMonth();
      const candCycleKey = `${MONTH_NAMES[candM]} ${candY}`;
      if (!history.some((h: any) => h.cycleKey === candCycleKey)) {
        targetYear = candY;
        targetMonth = candM;
        break;
      }
    }
  } else {
    // Current month is NOT paid yet
    targetYear = currentYear;
    targetMonth = currentMonthIdx;
  }

  // Clamped day for months with fewer days (e.g. Feb 28, Apr 30)
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(dayOfMonth, daysInTargetMonth);

  const nextDueDate = new Date(targetYear, targetMonth, clampedDay);
  nextDueDate.setHours(0, 0, 0, 0);

  const diffTime = nextDueDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const mm = (targetMonth + 1) < 10 ? `0${targetMonth + 1}` : `${targetMonth + 1}`;
  const dd = clampedDay < 10 ? `0${clampedDay}` : `${clampedDay}`;
  const nextDueDateStr = `${targetYear}-${mm}-${dd}`;
  const formattedDueDate = `${String(clampedDay).padStart(2, '0')} ${MONTH_NAMES[targetMonth]} ${targetYear}`;
  const cycleKey = `${MONTH_NAMES[targetMonth]} ${targetYear}`;

  const isOverdue = !isCurrentMonthPaid && daysRemaining < 0;
  const isDueSoon = !isCurrentMonthPaid && daysRemaining >= 0 && daysRemaining <= 3;

  return {
    nextDueDate,
    nextDueDateStr,
    formattedDueDate,
    cycleKey,
    isCurrentMonthPaid,
    isOverdue,
    isDueSoon,
    daysRemaining,
  };
}

/**
 * Sorts installments:
 * 1. Active installments first, completed installments at the bottom.
 * 2. Active installments sorted by closest payment due date (earliest dueDate first).
 * 3. Completed installments sorted with most recent at top of completed.
 */
export function sortInstallmentsByClosestDate<T extends { dueDate?: string; paidMonths?: number; monthsToPay?: number; productName?: string }>(items: T[]): T[] {
  if (!items || items.length <= 1) return items ? [...items] : [];

  return [...items].sort((a, b) => {
    const aCompleted = (a.paidMonths ?? 0) >= (a.monthsToPay ?? 1);
    const bCompleted = (b.paidMonths ?? 0) >= (b.monthsToPay ?? 1);

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    if (aCompleted && bCompleted) {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateB - dateA;
    }

    const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return (a.productName || '').localeCompare(b.productName || '');
  });
}

/**
 * Sorts rent properties:
 * Closest payment due date first (earliest dueDate first).
 */
export function sortRentsByClosestDate<T extends { dueDate?: string; propertyName?: string }>(items: T[]): T[] {
  if (!items || items.length <= 1) return items ? [...items] : [];

  return [...items].sort((a, b) => {
    const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return (a.propertyName || '').localeCompare(b.propertyName || '');
  });
}

/**
 * Sorts subscriptions:
 * 1. Unpaid subscriptions for the current period come first.
 * 2. Unpaid subscriptions sorted with nearest deadline at the top (overdue and soonest due first).
 * 3. Subscriptions already paid for the monthly cycle go to the bottom/last part.
 * 4. Paid subscriptions sorted by their upcoming next renewal deadline.
 */
export function sortSubscriptionsByClosestDeadline<T extends { title?: string; dayOfMonth?: number; paymentHistory?: any[] }>(items: T[], baseDate = new Date()): T[] {
  if (!items || items.length <= 1) return items ? [...items] : [];

  return [...items].sort((a, b) => {
    const deadA = getSubscriptionNextDeadline(a, baseDate);
    const deadB = getSubscriptionNextDeadline(b, baseDate);

    // Unpaid comes before paid
    if (deadA.isCurrentMonthPaid !== deadB.isCurrentMonthPaid) {
      return deadA.isCurrentMonthPaid ? 1 : -1;
    }

    // Near deadline first
    const timeA = deadA.nextDueDate.getTime();
    const timeB = deadB.nextDueDate.getTime();

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    return (a.title || '').localeCompare(b.title || '');
  });
}

/**
 * Returns the next due date for Rent property.
 */
export function getRentNextDeadline(
  rent: { dueDate?: string; startDate?: string; paidCycles?: number },
  baseDate: Date = new Date()
): Date | null {
  if (rent.dueDate) {
    const parts = rent.dueDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date(rent.dueDate);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  if (rent.startDate) {
    const nextDueStr = calculateRentCycleDueDate(rent.startDate, (rent.paidCycles || 0) + 1);
    const parts = nextDueStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  return null;
}

/**
 * Returns the next due date for Installment item if not yet fully paid.
 */
export function getInstallmentNextDeadline(
  item: { dueDate?: string; paidMonths?: number; monthsToPay?: number },
  baseDate: Date = new Date()
): Date | null {
  if (!item.dueDate || (item.paidMonths ?? 0) >= (item.monthsToPay ?? 1)) return null;
  const parts = item.dueDate.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(item.dueDate);
  d.setHours(0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns the upcoming payday date for Recursion item.
 */
export function getRecursionNextDeadline(
  rec: { frequency: 'monthly' | 'weekly' | 'bi-monthly'; dayOfMonth?: number; dayOfWeek?: number },
  baseDate: Date = new Date()
): Date | null {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  const dateNum = today.getDate();
  const dayOfWeek = today.getDay();

  if (rec.frequency === 'monthly') {
    const rawDay = rec.dayOfMonth || 1;
    const daysInThisMonth = new Date(year, month + 1, 0).getDate();
    const clampedDay = Math.min(rawDay, daysInThisMonth);
    let target = new Date(year, month, clampedDay);
    if (target.getTime() < today.getTime()) {
      const daysInNextMonth = new Date(year, month + 2, 0).getDate();
      target = new Date(year, month + 1, Math.min(rawDay, daysInNextMonth));
    }
    target.setHours(0, 0, 0, 0);
    return target;
  }

  if (rec.frequency === 'weekly') {
    const targetDay = rec.dayOfWeek ?? 0;
    const diff = (targetDay - dayOfWeek + 7) % 7;
    const target = new Date(year, month, dateNum + diff);
    target.setHours(0, 0, 0, 0);
    return target;
  }

  if (rec.frequency === 'bi-monthly') {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    let target: Date;
    if (dateNum <= 15) {
      target = new Date(year, month, 15);
    } else if (dateNum <= lastDayOfMonth) {
      target = new Date(year, month, lastDayOfMonth);
    } else {
      target = new Date(year, month + 1, 15);
    }
    target.setHours(0, 0, 0, 0);
    return target;
  }

  return null;
}

/**
 * Returns next occurrence date for a grocery day index (0 = Sun .. 6 = Sat).
 */
export function getGroceryNextOccurrence(dayIndex: number, baseDate: Date = new Date()): Date {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const diff = (dayIndex - today.getDay() + 7) % 7;
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
  target.setHours(0, 0, 0, 0);
  return target;
}

/**
 * Returns the upcoming deadline date for a Money Split plan.
 */
export function getSplitNextDeadline(
  plan: { schedule?: { type: 'once' | 'weekly' | 'semi-monthly' | 'monthly' | 'yearly'; date?: string; weeklyOption?: string; dayOfMonth?: number; yearlyMonth?: number; yearlyDay?: number } },
  baseDate: Date = new Date()
): Date | null {
  const s = plan.schedule;
  if (!s) return null;

  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  const dateNum = today.getDate();
  const dayOfWeek = today.getDay();

  if (s.type === 'once') {
    if (!s.date) return null;
    const parts = s.date.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  if (s.type === 'monthly') {
    const rawDay = s.dayOfMonth || 1;
    const daysInThisMonth = new Date(year, month + 1, 0).getDate();
    const clampedDay = Math.min(rawDay, daysInThisMonth);
    let target = new Date(year, month, clampedDay);
    if (target.getTime() < today.getTime()) {
      const daysInNextMonth = new Date(year, month + 2, 0).getDate();
      target = new Date(year, month + 1, Math.min(rawDay, daysInNextMonth));
    }
    target.setHours(0, 0, 0, 0);
    return target;
  }

  if (s.type === 'semi-monthly') {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const secondDay = s.dayOfMonth === 30 ? Math.min(30, lastDay) : 15;

    if (s.dayOfMonth === 30) {
      if (dateNum <= 15) {
        return new Date(year, month, 15);
      } else if (dateNum <= secondDay) {
        return new Date(year, month, secondDay);
      } else {
        return new Date(year, month + 1, 15);
      }
    } else {
      if (dateNum <= 15) {
        return new Date(year, month, 15);
      } else {
        return new Date(year, month + 1, 15);
      }
    }
  }

  if (s.type === 'weekly') {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    if (s.weeklyOption === 'weekdays') {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        return today;
      }
      const daysUntilMon = (1 - dayOfWeek + 7) % 7;
      return new Date(year, month, dateNum + daysUntilMon);
    }

    if (s.weeklyOption === 'weekends') {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return today;
      }
      const daysUntilSat = (6 - dayOfWeek + 7) % 7;
      return new Date(year, month, dateNum + daysUntilSat);
    }

    const targetDay = s.weeklyOption && dayMap[s.weeklyOption] !== undefined ? dayMap[s.weeklyOption] : 1;
    const diff = (targetDay - dayOfWeek + 7) % 7;
    return new Date(year, month, dateNum + diff);
  }

  if (s.type === 'yearly') {
    const yMonth = s.yearlyMonth ?? 0;
    const yDay = s.yearlyDay || 1;
    let target = new Date(year, yMonth, yDay);
    if (target.getTime() < today.getTime()) {
      target = new Date(year + 1, yMonth, yDay);
    }
    target.setHours(0, 0, 0, 0);
    return target;
  }

  return null;
}
