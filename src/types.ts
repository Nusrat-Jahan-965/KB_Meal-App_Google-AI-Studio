export type ScreenType = 'home' | 'auth' | 'register' | 'dashboard' | 'booking' | 'ledger' | 'bazaar' | 'accounts' | 'admin' | 'menu' | 'database';

export type UserRole = 'member' | 'coadmin' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nameEn?: string;
  role: UserRole;
  designation: string;
  designationEn?: string;
  department: string;
  departmentEn?: string;
  gpfNo: string;
  mobile: string;
  email: string;
  roomNo: string;
  roomNoEn?: string;
  monthlyMeals: number;
  upcomingMeals: number;
  advanceBalance: number;
  dueAmount: number;
  todayMealStatus: 'on' | 'off';
  mealRate: number;
}

export type DayStatus = 'booked' | 'unbooked' | 'available' | 'cancelled' | 'cutoff' | 'holiday';

export interface CalendarDay {
  day: number;
  weekday: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  status: DayStatus;
  label?: string;
  officerMeal: number;
  guestMeal: number;
  isPast?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  categoryEn?: string;
  imageUrl: string;
}

export interface LedgerItem {
  id: string;
  date: string;
  description: string;
  descriptionEn?: string;
  type: 'deposit' | 'charge' | 'refund';
  amount: number;
  balanceAfter: number;
  ref: string;
}

export type BazaarCategory =
  | 'fish_meat'
  | 'eggs'
  | 'rice_grains'
  | 'oil_spices'
  | 'vegetables'
  | 'utility_other';

export interface BazaarExpense {
  id: string;
  date: string;
  buyerName: string;
  buyerGpf: string;
  category: BazaarCategory;
  itemsDescription: string;
  amount: number;
  voucherNo: string;
  receiptImg?: string;
  verifiedBy?: string;
}

export interface MemberMealDateBooking {
  date: string; // e.g. '০১/১০/২০২৪'
  dayName: string; // e.g. 'মঙ্গলবার'
  officerMeals: number;
  guestMeals: number;
  totalMeals: number;
  menuItem?: string;
  status?: 'consumed' | 'booked' | 'cancelled';
}

export interface MemberAdvanceDeposit {
  date: string; // e.g. '০১/১০/২০২৪'
  amount: number;
  voucherNo: string;
  method: string; // e.g. 'ব্যাংক একাউন্ট ট্রান্সফার' | 'নগদ জমা' | 'অনলাইন ট্রানজেকশন'
  notes?: string;
}

export interface MemberBillingRecord {
  id: string;
  gpfNo: string;
  name: string;
  designation: string;
  department: string;
  mobile?: string;
  officerMeals: number;
  guestMeals: number;
  totalMeals: number;
  mealCost: number;
  messFee: number;
  totalBill: number;
  advancePaid: number;
  netDue: number; // positive = due, negative = refundable
  status: 'cleared' | 'due' | 'refund';
  mealBookingDates?: MemberMealDateBooking[];
  advanceDeposits?: MemberAdvanceDeposit[];
}

export interface WeeklyMenuDay {
  id: string;
  dayNameBn: string;
  dayNameEn: string;
  isHoliday: boolean;
  mainDish: string;
  mainDishEn?: string;
  sideDish1: string;
  sideDish1En?: string;
  sideDish2: string;
  sideDish2En?: string;
  riceDish: string;
  riceDishEn?: string;
  specialItem?: string;
  specialItemEn?: string;
  imageUrl: string;
}

export interface CanteenNotice {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'holiday' | 'general';
  date: string;
  author: string;
}

export interface Department {
  id: string;
  name: string;
  nameEn?: string;
  code: string;
  floorRoom?: string;
  adminGpf?: string;
  adminName?: string;
  coAdminGpf?: string;
  coAdminName?: string;
  phone?: string;
  description?: string;
}

export interface MealCallState {
  isActive: boolean;
  targetDate: string;
  targetDateEn?: string;
  cutoffTime: string;
  cutoffTimeEn?: string;
  calledBy: string;
  calledByEn?: string;
  calledByGpf: string;
  calledByRole: UserRole;
  calledAt: string;
  calledAtEn?: string;
  menuHighlight?: string;
  menuHighlightEn?: string;
  customNote?: string;
  customNoteEn?: string;
  calledDates: number[];
}

