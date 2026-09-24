import { UserProfile, MealCallState, BazaarExpense, CanteenNotice, CalendarDay } from '../types';

export const api = {
  // Users
  async getUsers(): Promise<UserProfile[] | null> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveUser(user: Partial<UserProfile>): Promise<boolean> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Meal Calls
  async getLatestMealCall(): Promise<MealCallState | null> {
    try {
      const res = await fetch('/api/meal-calls/latest');
      if (!res.ok) return null;
      const data = await res.json();
      if (!data) return null;
      return {
        isActive: Boolean(data.isActive),
        targetDate: data.targetDate,
        targetDateEn: data.targetDateEn || data.targetDate,
        cutoffTime: (data.cutoffTime === '১০:০০ AM' || data.cutoffTime === '10:00 AM') ? 'বিকাল ৫:০০ টা' : (data.cutoffTime || 'বিকাল ৫:০০ টা'),
        cutoffTimeEn: (data.cutoffTimeEn === '10:00 AM' || data.cutoffTimeEn === '১০:০০ AM') ? '5:00 PM' : (data.cutoffTimeEn || '5:00 PM'),
        calledBy: data.calledBy,
        calledByGpf: data.calledByGpf,
        calledByRole: data.calledByRole,
        calledAt: data.calledAt,
        menuHighlight: data.menuHighlight,
        customNote: data.customNote,
        calledDates: typeof data.calledDates === 'string' ? JSON.parse(data.calledDates) : (data.calledDates || []),
      };
    } catch {
      return null;
    }
  },

  async saveMealCall(mealCall: MealCallState): Promise<boolean> {
    try {
      const res = await fetch('/api/meal-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealCall),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Bookings
  async getBookings(gpfNo: string): Promise<any[] | null> {
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(gpfNo)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveBooking(booking: {
    gpfNo: string;
    date: string;
    dayNumber: number;
    officerMeal: number;
    guestMeal: number;
    status?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Payments
  async getPayments(gpfNo?: string): Promise<any[] | null> {
    try {
      const url = gpfNo ? `/api/payments?gpfNo=${encodeURIComponent(gpfNo)}` : '/api/payments';
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async recordPayment(payment: {
    gpfNo: string;
    userName: string;
    date: string;
    amount: number;
    voucherNo: string;
    method?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Bazaar Expenses
  async getBazaarExpenses(): Promise<BazaarExpense[] | null> {
    try {
      const res = await fetch('/api/bazaar');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveBazaarExpense(expense: BazaarExpense): Promise<boolean> {
    try {
      const res = await fetch('/api/bazaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Notices
  async getNotices(): Promise<CanteenNotice[] | null> {
    try {
      const res = await fetch('/api/notices');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveNotice(notice: Partial<CanteenNotice>): Promise<boolean> {
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
