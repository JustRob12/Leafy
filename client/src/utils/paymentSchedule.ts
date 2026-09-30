/**
 * Payment schedule helpers for Installments, Rent Properties, and Subscriptions.
 */

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
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
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
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const datePart = `${day} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const timePart = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Paid on ${datePart} • ${timePart}`;
}

export function getDueDateStatus(dueDateStr: string): { isOverdue: boolean; isDueSoon: boolean; daysRemaining: number } {
  if (!dueDateStr) return { isOverdue: false, isDueSoon: false, daysRemaining: 999 };
  const today = new Date();
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
