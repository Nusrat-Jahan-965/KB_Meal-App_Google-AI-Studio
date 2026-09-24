import React, { useState, useRef, useEffect } from 'react';
import { CalendarDay, DayStatus, ScreenType, UserProfile, MealCallState, WeeklyMenuDay, MenuItem } from '../types';
import { TodayLunchMenuCard } from './TodayLunchMenuCard';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  AlertCircle,
  Sparkles,
  Lock,
  Clock,
  Utensils,
  Timer,
} from 'lucide-react';
import {
  getLocalizedCutoff,
  getMonthAbbr,
} from '../utils/localization';

interface MealBookingScreenProps {
  days: CalendarDay[];
  onUpdateDays: (updated: CalendarDay[]) => void;
  currentUser: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  lang: 'bn' | 'en';
  mealCallState: MealCallState;
  onUpdateMealCall?: (patch: Partial<MealCallState>) => void;
  weeklyMenu?: WeeklyMenuDay[];
  menuItems?: MenuItem[];
}

const WEEKDAY_NAMES_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
const WEEKDAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const toBnDigits = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

const generateDaysForMonth = (year: number, month: number): CalendarDay[] => {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const currentDay = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const weekday = new Date(year, month, d).getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    const isHoliday = weekday === 5 || weekday === 6; // Friday and Saturday
    if (isHoliday) {
      result.push({
        day: d,
        weekday,
        status: 'holiday',
        label: 'ছুটি',
        officerMeal: 0,
        guestMeal: 0,
      });
    } else if (isCurrentMonth && d < currentDay) {
      const booked = d % 7 !== 3;
      result.push({
        day: d,
        weekday,
        status: booked ? 'cutoff' : 'unbooked',
        label: booked ? '১ মিল' : 'খালি',
        officerMeal: booked ? 1 : 0,
        guestMeal: 0,
        isPast: true,
      });
    } else if (isCurrentMonth && d === currentDay) {
      result.push({
        day: d,
        weekday,
        status: 'booked',
        label: '১ মিল',
        officerMeal: 1,
        guestMeal: 0,
      });
    } else if (isCurrentMonth && d === currentDay + 1) {
      result.push({
        day: d,
        weekday,
        status: 'booked',
        label: '১ মিল',
        officerMeal: 1,
        guestMeal: 0,
      });
    } else {
      result.push({
        day: d,
        weekday,
        status: 'available',
        label: 'উপলব্ধ',
        officerMeal: 0,
        guestMeal: 0,
      });
    }
  }
  return result;
};

import {
  calculateCutoffRemaining,
  CutoffCountdownState,
  padZero,
} from '../utils/cutoffCountdown';

export const MealBookingScreen: React.FC<MealBookingScreenProps> = ({
  days,
  onUpdateDays,
  currentUser,
  onNavigate,
  lang,
  mealCallState,
  onUpdateMealCall,
  weeklyMenu,
  menuItems,
}) => {
  const today = new Date();
  const currentSystemYear = today.getFullYear();
  const currentSystemMonth = today.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Dec
  const currentSystemDay = today.getDate();
  const initialMonthKey = `${currentSystemYear}-${currentSystemMonth}`;

  // Live countdown timer for cutoff
  const [countdown, setCountdown] = useState<CutoffCountdownState>(() =>
    calculateCutoffRemaining(mealCallState.cutoffTime)
  );

  useEffect(() => {
    // Tick every 1000ms
    const timer = setInterval(() => {
      setCountdown(calculateCutoffRemaining(mealCallState.cutoffTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [mealCallState.cutoffTime]);

  // By default, display the current month, year, and day
  const [selectedYear, setSelectedYear] = useState<number>(currentSystemYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentSystemMonth);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(currentSystemDay);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [swipeNotice, setSwipeNotice] = useState<string | null>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const [monthDaysMap, setMonthDaysMap] = useState<Record<string, CalendarDay[]>>(() => {
    let initialDays = days && days.length > 0 ? days : null;
    if (!initialDays) {
      try {
        const userKey = `kb_canteen_month_days_${initialMonthKey}_${currentUser.gpfNo}`;
        const fallbackKey = `kb_canteen_month_days_${initialMonthKey}`;
        const saved = localStorage.getItem(userKey) || localStorage.getItem(fallbackKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) initialDays = parsed;
        }
      } catch {
        // fallback
      }
    }
    const map: Record<string, CalendarDay[]> = {
      [initialMonthKey]: initialDays || generateDaysForMonth(currentSystemYear, currentSystemMonth),
    };
    return map;
  });

  useEffect(() => {
    if (days && days.length > 0) {
      setMonthDaysMap((prev) => ({
        ...prev,
        [initialMonthKey]: days,
      }));
    }
  }, [days, initialMonthKey]);

  const currentMonthKey = `${selectedYear}-${selectedMonth}`;
  const activeDays =
    monthDaysMap[currentMonthKey] ||
    (() => {
      try {
        const userKey = `kb_canteen_month_days_${currentMonthKey}_${currentUser.gpfNo}`;
        const fallbackKey = `kb_canteen_month_days_${currentMonthKey}`;
        const saved = localStorage.getItem(userKey) || localStorage.getItem(fallbackKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
      return generateDaysForMonth(selectedYear, selectedMonth);
    })();

  const updateActiveDays = (newDays: CalendarDay[]) => {
    setMonthDaysMap((prev) => ({
      ...prev,
      [currentMonthKey]: newDays,
    }));
    if (currentMonthKey === initialMonthKey) {
      onUpdateDays(newDays);
    }
    try {
      localStorage.setItem(`kb_canteen_month_days_${currentMonthKey}_${currentUser.gpfNo}`, JSON.stringify(newDays));
      localStorage.setItem(`kb_canteen_month_days_${currentMonthKey}`, JSON.stringify(newDays));
    } catch {
      // ignore
    }
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const leadingOffset = new Date(selectedYear, selectedMonth, 1).getDay();

  const currentMonthNameBn = MONTH_NAMES_BN[selectedMonth];
  const currentMonthNameEn = MONTH_NAMES_EN[selectedMonth];
  const currentYearBn = toBnDigits(selectedYear);

  const safeSelectedDayNum = Math.min(selectedDayNum, daysInMonth);
  const selectedDay = activeDays.find((d) => d.day === safeSelectedDayNum) || activeDays[0] || {
    day: 1,
    weekday: leadingOffset,
    status: 'available',
    officerMeal: 0,
    guestMeal: 0,
  };
  const isPrivileged = currentUser.role === 'admin' || currentUser.role === 'coadmin';
  const calledDates = mealCallState.calledDates || [];
  const isSelectedDayCalled = calledDates.includes(safeSelectedDayNum);

  const bookedCount = activeDays.filter((d) => d.status === 'booked').length;
  const workingDaysCount = activeDays.filter((d) => d.status !== 'holiday').length;

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setSelectedDayNum(1);
    setSwipeNotice(lang === 'bn' ? 'পূর্ববর্তী মাস' : 'Previous Month');
    setTimeout(() => setSwipeNotice(null), 1200);
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedDayNum(1);
    setSwipeNotice(lang === 'bn' ? 'পরবর্তী মাস' : 'Next Month');
    setTimeout(() => setSwipeNotice(null), 1200);
  };

  // Touch and mouse drag swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        handleNextMonth();
      } else {
        handlePrevMonth();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      mouseStartXRef.current = e.clientX;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartXRef.current !== null) {
      const deltaX = e.clientX - mouseStartXRef.current;
      if (Math.abs(deltaX) > 60) {
        if (deltaX < 0) {
          handleNextMonth();
        } else {
          handlePrevMonth();
        }
      }
    }
    mouseStartXRef.current = null;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleDateMealCall = (dayNum: number) => {
    if (!isPrivileged || !onUpdateMealCall) return;

    const currentCalled = mealCallState.calledDates || [];
    const isCalled = currentCalled.includes(dayNum);
    const updatedCalled = isCalled
      ? currentCalled.filter((d) => d !== dayNum)
      : [...currentCalled, dayNum].sort((a, b) => a - b);

    onUpdateMealCall({
      calledDates: updatedCalled,
      isActive: updatedCalled.length > 0,
      targetDate: `${dayNum} ${currentMonthNameBn} ${currentYearBn}`,
      calledBy: currentUser.name,
      calledByGpf: currentUser.gpfNo,
      calledByRole: currentUser.role,
      calledAt: `আজ ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`,
    });

    showToast(
      isCalled
        ? `${dayNum} ${currentMonthNameBn} এর মিল কল প্রত্যাহার করা হয়েছে। মেম্বারদের বুকিং লক।`
        : `${dayNum} ${currentMonthNameBn} এর জন্য মিল কল চালু করা হয়েছে! মেম্বাররা এখন বুক করতে পারবেন।`
    );
  };

  const getStatusColor = (status: DayStatus, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-[#064e3b] text-white ring-3 ring-emerald-600 shadow-md font-bold';
    }

    switch (status) {
      case 'booked':
        return 'bg-[#15803d] text-white hover:bg-emerald-700';
      case 'unbooked':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200';
      case 'available':
        return 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200';
      case 'cutoff':
        return 'bg-slate-700 text-slate-100 opacity-90';
      case 'holiday':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      default:
        return 'bg-white text-gray-800';
    }
  };

  const getStatusBadgeText = (day: CalendarDay) => {
    if (day.status === 'holiday') return lang === 'bn' ? 'ছুটি' : 'Holiday';
    if (day.status === 'cancelled') return lang === 'bn' ? 'বাতিল' : 'Cancelled';
    if (day.status === 'unbooked') return lang === 'bn' ? 'খালি' : 'Empty';
    if (day.status === 'cutoff') return `${day.officerMeal + day.guestMeal} মিল`;
    if (day.status === 'booked') {
      const total = day.officerMeal + day.guestMeal;
      return total > 1 ? `${total} মিল` : '১ মিল';
    }
    return lang === 'bn' ? 'উপলব্ধ' : 'Available';
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDayNum(day.day);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  // Toggle booking for the selected day
  const handleToggleBooking = () => {
    if (!isPrivileged && !isSelectedDayCalled) {
      showToast(
        lang === 'bn'
          ? `এডমিন বা কো-এডমিন ${safeSelectedDayNum} ${currentMonthNameBn} এর জন্য এখনো মিল কল দেননি। শুধু মিল কল দেওয়া তারিখেই মেম্বাররা মিল বুক করতে পারবেন।`
          : `Meal Call is not active for ${currentMonthNameEn.slice(0, 3)} ${safeSelectedDayNum}. Members can only book on dates with an active Meal Call.`
      );
      return;
    }

    if (selectedDay.status === 'holiday') {
      showToast(lang === 'bn' ? 'সরকারি ছুটির দিনে মিল বুকিং সম্ভব নয়।' : 'Cannot book on official holiday.');
      return;
    }

    const updated = activeDays.map((d) => {
      if (d.day === safeSelectedDayNum) {
        if (d.status === 'booked') {
          return {
            ...d,
            status: 'cancelled' as DayStatus,
            officerMeal: 0,
            guestMeal: 0,
            label: 'বাতিল',
          };
        } else {
          return {
            ...d,
            status: 'booked' as DayStatus,
            officerMeal: 1,
            guestMeal: 0,
            label: '১ মিল',
          };
        }
      }
      return d;
    });

    updateActiveDays(updated);
    showToast(
      selectedDay.status === 'booked'
        ? lang === 'bn'
          ? `${safeSelectedDayNum} ${currentMonthNameBn} এর মিল বাতিল করা হয়েছে।`
          : `Meal cancelled for ${currentMonthNameEn.slice(0, 3)} ${safeSelectedDayNum}.`
        : lang === 'bn'
        ? `${safeSelectedDayNum} ${currentMonthNameBn} এর মিল সফলভাবে বুক করা হয়েছে!`
        : `Meal booked for ${currentMonthNameEn.slice(0, 3)} ${safeSelectedDayNum}!`
    );
  };

  // Modify Officer meals
  const handleOfficerMealChange = (delta: number) => {
    if (!isPrivileged && !isSelectedDayCalled) {
      showToast(
        lang === 'bn'
          ? `এডমিন বা কো-এডমিন ${safeSelectedDayNum} ${currentMonthNameBn} এর জন্য এখনো মিল কল দেননি।`
          : `Meal Call is not active for ${currentMonthNameEn.slice(0, 3)} ${safeSelectedDayNum}.`
      );
      return;
    }

    const newCount = Math.max(0, Math.min(5, (selectedDay.officerMeal || 0) + delta));
    const newStatus: DayStatus = newCount > 0 || selectedDay.guestMeal > 0 ? 'booked' : 'unbooked';

    const updated = activeDays.map((d) => {
      if (d.day === safeSelectedDayNum) {
        return {
          ...d,
          officerMeal: newCount,
          status: newStatus,
          label: newCount + d.guestMeal > 0 ? `${newCount + d.guestMeal} মিল` : 'খালি',
        };
      }
      return d;
    });

    updateActiveDays(updated);
  };

  // Modify Guest meals
  const handleGuestMealChange = (delta: number) => {
    if (!isPrivileged && !isSelectedDayCalled) {
      showToast(
        lang === 'bn'
          ? `এডমিন বা কো-এডমিন ${safeSelectedDayNum} ${currentMonthNameBn} এর জন্য এখনো মিল কল দেননি।`
          : `Meal Call is not active for ${currentMonthNameEn.slice(0, 3)} ${safeSelectedDayNum}.`
      );
      return;
    }

    const newCount = Math.max(0, Math.min(10, (selectedDay.guestMeal || 0) + delta));
    const newStatus: DayStatus = selectedDay.officerMeal > 0 || newCount > 0 ? 'booked' : 'unbooked';

    const updated = activeDays.map((d) => {
      if (d.day === safeSelectedDayNum) {
        return {
          ...d,
          guestMeal: newCount,
          status: newStatus,
          label: d.officerMeal + newCount > 0 ? `${d.officerMeal + newCount} মিল` : 'খালি',
        };
      }
      return d;
    });

    updateActiveDays(updated);
  };

  // Bulk Book entire month - restricted to called dates for members!
  const handleBookWholeMonth = () => {
    if (!isPrivileged) {
      if (calledDates.length === 0) {
        showToast(
          lang === 'bn'
            ? 'বর্তমানে কোনো তারিখেই মিল কল চালু নেই। এডমিন বা কো-এডমিন মিল কল দেওয়ার পর বুকিং করা যাবে।'
            : 'No active Meal Call dates currently available.'
        );
        return;
      }

      const updated = activeDays.map((d) => {
        if (d.status === 'holiday' || d.status === 'cutoff') return d;
        // Regular members can ONLY book dates where admin/co-admin gave meal call!
        if (!calledDates.includes(d.day)) {
          return d;
        }
        return {
          ...d,
          status: 'booked' as DayStatus,
          officerMeal: 1,
          guestMeal: 0,
          label: '১ মিল',
        };
      });

      updateActiveDays(updated);
      showToast(
        lang === 'bn'
          ? `শুধুমাত্র মিল কল চালু থাকা ${calledDates.length}টি তারিখে (${calledDates.map((d) => `${d} ${currentMonthNameBn.slice(0, 4)}`).join(', ')}) মিল সফলভাবে বুক করা হয়েছে!`
          : `Booked meals for active Meal Call dates (${calledDates.join(', ')} ${currentMonthNameEn.slice(0, 3)})!`
      );
      return;
    }

    // Privileged users (Admin / Co-admin) can book all working days
    const updated = activeDays.map((d) => {
      if (d.status === 'holiday' || d.status === 'cutoff') return d;
      return {
        ...d,
        status: 'booked' as DayStatus,
        officerMeal: 1,
        guestMeal: 0,
        label: '১ মিল',
      };
    });

    updateActiveDays(updated);
    showToast(
      lang === 'bn'
        ? `পুরো ${currentMonthNameBn} মাসের সকল কার্যদিবসে মিল বুকিং কনফার্ম করা হয়েছে!`
        : `Whole month meals booked for all working days in ${currentMonthNameEn}!`
    );
  };

  // Save / Confirm for Selected Day
  const handleConfirmSelectedDay = () => {
    if (!isPrivileged && !isSelectedDayCalled) {
      showToast(
        lang === 'bn'
          ? 'এই তারিখে এডমিন/কো-এডমিন মিল কল দেননি। শুধু মিল কল দেওয়া তারিখেই বুকিং সংরক্ষণ করা যাবে।'
          : 'Meal Call has not been opened for this date.'
      );
      return;
    }

    showToast(
      lang === 'bn'
        ? `${safeSelectedDayNum} ${currentMonthNameBn} ${currentYearBn} এর জন্য বুকিং সংরক্ষিত হয়েছে।`
        : `Booking saved for ${safeSelectedDayNum} ${currentMonthNameEn} ${selectedYear}.`
    );
  };

  const totalSelectedMeals = (selectedDay.officerMeal || 0) + (selectedDay.guestMeal || 0);
  const estimatedDayBill = totalSelectedMeals * currentUser.mealRate;

  return (
    <div className="space-y-4 pb-8" data-purpose="meal-booking-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#064e3b] text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 text-sm font-semibold border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl shrink-0">
            <Utensils className="w-6 h-6 text-[#064E2B] dark:text-emerald-400" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'মিল বুকিং' : 'Meal Booking'}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                {lang === 'bn' ? 'দৈনিক ও মাসিক ক্যালেন্ডার' : 'Daily & Monthly Calendar'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn'
                ? 'অনুমোদিত মিল কলের দিনগুলোতে নিজের ও মেহমানের দুপুরের খাবার বুকিং ও ব্যবস্থাপনা'
                : 'Book and manage officer and guest lunches on approved meal call dates'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleBookWholeMonth}
            className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>
              {lang === 'bn' ? 'পুরো মাসের মিল বুক করুন' : 'Book Whole Month'}
            </span>
          </button>
        </div>
      </section>

      {/* 1. Live Cut-off Countdown Timer Banner */}
      <section
        id="meal-booking-cutoff-countdown"
        className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-[#064E2B] via-[#085a33] to-[#043d22] text-white shadow-md relative overflow-hidden border border-emerald-600/30 transition-all"
      >
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-300/10 pointer-events-none blur-2xl" />
        <div className="absolute left-1/4 -top-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          {/* Left Side: Timer Info and Headings */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 border border-white/20 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <Timer className="w-3.5 h-3.5 text-emerald-200" />
                <span>{lang === 'bn' ? 'লাইভ কাট-অফ টাইমার' : 'Live Cut-off Timer'}</span>
              </span>

              <span className="text-xs font-semibold text-emerald-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                {lang === 'bn' ? 'কাট-অফ সময়সূচি:' : 'Daily Cut-off:'}{' '}
                <strong className="text-white font-bold ml-1">
                  {getLocalizedCutoff(mealCallState.cutoffTime, lang)}
                </strong>
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white leading-snug">
              {!countdown.isTodayCutoffPassed
                ? lang === 'bn'
                  ? 'দৈনিক মিল বুকিং ও বাতিল করার কাট-অফ বাকি আছে:'
                  : 'Time Remaining for Today’s Meal Booking & Cancellation:'
                : lang === 'bn'
                ? 'আজকের কাট-অফ সময় সমাপ্ত • পরবর্তী দিনের কাট-অফ কাউন্টডাউন:'
                : 'Today’s Cut-off Closed • Next Day’s Countdown:'}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-2xl">
              {lang === 'bn'
                ? 'মেস নীতিমালা অনুযায়ী প্রতিদিন বিকাল ৫:০০ ঘটিকার পর সংশ্লিষ্ট দিনের মিল লক হয়ে যায়। কাট-অফের পূর্বে নিজের ও মেহমানের মিল নিশ্চিত করুন।'
                : 'As per mess policy, meals are locked after 5:00 PM daily. Please confirm your officer and guest meals before the cut-off.'}
            </p>
          </div>

          {/* Right Side: Digital Clock Units */}
          <div className="flex items-center justify-start lg:justify-end shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/15 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/20 shadow-md">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-12 sm:h-14 bg-black/20 backdrop-blur-sm border border-white/25 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black font-sans text-white tracking-wider">
                    {lang === 'bn' ? toBnDigits(padZero(countdown.hours)) : padZero(countdown.hours)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-200 font-bold uppercase tracking-wider mt-1">
                  {lang === 'bn' ? 'ঘণ্টা' : 'Hours'}
                </span>
              </div>

              <span className="text-2xl sm:text-3xl font-black text-emerald-200/90 pb-4 animate-pulse select-none">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-12 sm:h-14 bg-black/20 backdrop-blur-sm border border-white/25 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black font-sans text-white tracking-wider">
                    {lang === 'bn' ? toBnDigits(padZero(countdown.minutes)) : padZero(countdown.minutes)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-200 font-bold uppercase tracking-wider mt-1">
                  {lang === 'bn' ? 'মিনিট' : 'Minutes'}
                </span>
              </div>

              <span className="text-2xl sm:text-3xl font-black text-emerald-200/90 pb-4 animate-pulse select-none">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-12 sm:h-14 bg-amber-400/20 backdrop-blur-sm border border-amber-300/40 rounded-xl flex items-center justify-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black font-sans text-amber-200 tracking-wider">
                    {lang === 'bn' ? toBnDigits(padZero(countdown.seconds)) : padZero(countdown.seconds)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider mt-1">
                  {lang === 'bn' ? 'সেকেন্ড' : 'Seconds'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Status / Urgency Bar */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2 text-emerald-100 font-medium">
            <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              {lang === 'bn'
                ? `কাট-অফ নিয়ম: পূর্ববর্তী দিন ${getLocalizedCutoff(mealCallState.cutoffTime, lang)} ঘটিকার পূর্বে বুকিং ও বাতিল সম্পন্ন করুন`
                : `Cut-off rule: Complete booking & cancellation before ${getLocalizedCutoff(mealCallState.cutoffTime, lang)} previous day`}
            </span>
          </div>

          {!countdown.isTodayCutoffPassed ? (
            countdown.hours === 0 && countdown.minutes < 60 ? (
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-xs shadow-2xs animate-pulse flex items-center space-x-1.5">
                <span>⚠️</span>
                <span>{lang === 'bn' ? '১ ঘণ্টার কম সময় বাকি! দ্রুত বুকিং সম্পন্ন করুন' : 'Less than 1 hr remaining! Confirm now'}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-[#064E2B] font-bold text-xs shadow-2xs flex items-center space-x-1.5">
                <span>✓</span>
                <span>{lang === 'bn' ? 'বুকিং ও ক্যানসেল উইন্ডো চালু আছে' : 'Booking & cancel window is active'}</span>
              </span>
            )
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-300 text-amber-950 font-bold text-xs shadow-2xs flex items-center space-x-1.5">
              <span>🔒</span>
              <span>{lang === 'bn' ? 'আজকের কাট-অফ সমাপ্ত • পরবর্তী দিনের জন্য কাউন্টডাউন' : 'Today closed • Next day countdown'}</span>
            </span>
          )}
        </div>
      </section>

      {/* 1. Top Booking Rules Notice */}
      <section className="bg-emerald-50/90 border-l-4 border-[#0a5832] rounded-r-xl p-3 sm:p-3.5 text-xs text-emerald-950 flex items-start space-x-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">
            {lang === 'bn' ? 'বুকিং নিয়মাবলী: ' : 'Booking Rules: '}
          </span>
          {lang === 'bn'
            ? 'শুধুমাত্র উপরোক্ত মিল কল দেওয়া তারিখগুলোতেই মেম্বাররা মিল বুক বা পরিবর্তন করতে পারবেন। অন্য দিনগুলোতে বুকিং লক থাকবে। শুক্র ও শনিবার ব্যাংকের সরকারি ছুটির দিনে মিল বন্ধ থাকবে।'
            : 'Members can book or change meals only on the meal-called dates listed above. Bookings will remain locked on other days. Canteen is closed on Fridays & Saturdays (Official Bank Holidays).'}
        </p>
      </section>

      {/* Today's Lunch Menu Card */}
      <TodayLunchMenuCard
        weeklyMenu={weeklyMenu}
        menuItems={menuItems}
        lang={lang}
        showFeedbackBtn={false}
      />

      {/* 2-Column Responsive Layout for Desktop (Eliminates vertical scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column: Month Selector, Legend, Calendar Matrix Grid */}
        <div id="canteen-calendar-matrix-area" className="lg:col-span-7 xl:col-span-7 space-y-4">
          {/* 2. Month Selector & Stats Header */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              {/* Month Navigator with Arrows & Swipe & Quick Jumper */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 active:scale-95 text-gray-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
                    title="পূর্ববর্তী মাস (বা ডানে সোয়াইপ করুন)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-2 px-2">
                    <CalendarIcon className="w-4 h-4 text-[#0a5832] dark:text-emerald-400" />
                    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight select-none">
                      {lang === 'bn' ? `${currentMonthNameBn} ${currentYearBn}` : `${currentMonthNameEn} ${selectedYear}`}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 active:scale-95 text-gray-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
                    title="পরবর্তী মাস (বা বামে সোয়াইপ করুন)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick jump to Current Month & Today */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear(currentSystemYear);
                    setSelectedMonth(currentSystemMonth);
                    setSelectedDayNum(currentSystemDay);
                    setSwipeNotice(
                      lang === 'bn'
                        ? `চলতি মাস ও আজ (${toBnDigits(currentSystemDay)} ${currentMonthNameBn}) লোড হয়েছে`
                        : `Current Month & Today (${currentSystemDay} ${currentMonthNameEn}) Loaded`
                    );
                    setTimeout(() => setSwipeNotice(null), 1500);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-2xs ${
                    selectedYear === currentSystemYear && selectedMonth === currentSystemMonth
                      ? 'bg-emerald-700 text-white border border-emerald-800'
                      : 'text-[#0a5832] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
                  }`}
                  title={lang === 'bn' ? 'চলতি মাস ও আজকের দিনে ফিরে যান' : 'Jump to Current Month & Today'}
                >
                  <span>📍</span>
                  <span>
                    {lang === 'bn'
                      ? `আজ ও চলতি মাস (${toBnDigits(currentSystemDay)} ${MONTH_NAMES_BN[currentSystemMonth].slice(0, 5)})`
                      : `Today & Current Month (${currentSystemDay} ${MONTH_NAMES_EN[currentSystemMonth].slice(0, 3)})`}
                  </span>
                </button>
              </div>

          {/* Month Stats */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
              {lang === 'bn' ? `মোট কার্যদিবস: ${workingDaysCount} দিন` : `Working Days: ${workingDaysCount}`}
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold">
              {lang === 'bn' ? `বুকড: ${bookedCount}টি মিল` : `Booked: ${bookedCount} Meals`}
            </span>
          </div>
        </div>

        {/* Swipe helper banner */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 pb-1 px-1">
          <span className="flex items-center space-x-1">
            <span>👈</span>
            <span className="font-medium">
              {lang === 'bn'
                ? 'ক্যালেন্ডারে সোয়াইপ (Swipe) করে বা তীর চিহ্নে ক্লিক করে মাস পরিবর্তন করুন'
                : 'Swipe left/right on calendar or click arrows to change month'}
            </span>
            <span>👉</span>
          </span>
          {swipeNotice && (
            <span className="text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full animate-bounce">
              {swipeNotice}
            </span>
          )}
        </div>

        {/* 3. Status Color Legend */}
        <div className="pt-2 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'bn' ? 'রঙ ও মিল কল নির্দেশিকা' : 'Status & Meal Call Legend'}
            </div>
            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {lang === 'bn'
                ? `📢 মিল কল চালু: ${calledDates.length} দিন`
                : `📢 Meal Calls: ${calledDates.length} days`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#15803d]"></span>
              <span className="text-gray-700 font-medium">{lang === 'bn' ? 'বুক করা' : 'Booked'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-gray-200 border border-gray-300"></span>
              <span className="text-gray-700 font-medium">{lang === 'bn' ? 'বুক হয়নি' : 'Unbooked'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-sky-100 border border-sky-300"></span>
              <span className="text-gray-700 font-medium">{lang === 'bn' ? 'উপলব্ধ' : 'Available'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300"></span>
              <span className="text-gray-700 font-medium">{lang === 'bn' ? 'বাতিল' : 'Cancelled'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-700"></span>
              <span className="text-gray-700 font-medium">{lang === 'bn' ? 'কাট-অফ বন্ধ' : 'Cut-off Closed'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300"></span>
              <span className="text-gray-700 font-medium">{lang === 'bn' ? 'ছুটি' : 'Holiday'}</span>
            </div>
            <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-800 font-bold">
                {lang === 'bn' ? '📢 মিল কল সক্রিয় (বুকিং উন্মুক্ত)' : '📢 Meal Call Active (Open)'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500 font-medium">
                {lang === 'bn' ? 'লক (মিল কল হয়নি)' : 'Locked (No Call)'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Calendar Matrix Grid (7 columns) with Touch/Mouse Swipe */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="calendar-container overflow-hidden rounded-xl border border-gray-200 bg-gray-50/30 select-none touch-pan-y transition-all"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center bg-gray-100/90 py-2 border-b border-gray-200 text-xs font-bold">
            {(lang === 'bn' ? WEEKDAY_NAMES_BN : WEEKDAY_NAMES_EN).map((dayName, idx) => (
              <div
                key={dayName}
                className={idx === 5 || idx === 6 ? 'text-rose-600 font-bold' : 'text-gray-700'}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 p-1.5 sm:p-2">
            {/* Blank offset placeholders for the first day of month */}
            {Array.from({ length: leadingOffset }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-16 sm:h-20 rounded-lg bg-gray-100/40 opacity-30 pointer-events-none"
              ></div>
            ))}

            {/* Active Month Days */}
            {activeDays.map((dayItem) => {
              const isSelected = dayItem.day === safeSelectedDayNum;
              const isDateCalled = calledDates.includes(dayItem.day);
              const isHoliday = dayItem.status === 'holiday';
              const isToday =
                selectedYear === currentSystemYear &&
                selectedMonth === currentSystemMonth &&
                dayItem.day === currentSystemDay;
              const colorClass = getStatusColor(dayItem.status, isSelected);

              return (
                <button
                  key={dayItem.day}
                  type="button"
                  onClick={() => handleDayClick(dayItem)}
                  className={`h-16 sm:h-20 rounded-lg p-1 sm:p-1.5 flex flex-col justify-between text-left transition-all duration-150 cursor-pointer relative ${colorClass} ${
                    !isHoliday && !isPrivileged && !isDateCalled ? 'opacity-85' : ''
                  } ${isToday ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs sm:text-sm font-bold font-sans">
                        {dayItem.day}
                      </span>
                      {isToday && (
                        <span className="text-[8px] sm:text-[9px] font-black bg-amber-500 text-white px-1 py-0.2 rounded-xs leading-none shadow-2xs">
                          {lang === 'bn' ? 'আজ' : 'Today'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {isDateCalled && !isHoliday && (
                        <span
                          className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300 ring-2 ring-white' : 'bg-emerald-500 ring-1 ring-white'}`}
                          title="এই তারিখে মিল কল সক্রিয় রয়েছে"
                        />
                      )}
                      {!isHoliday && !isDateCalled && !isPrivileged && (
                        <Lock className="w-2.5 h-2.5 text-gray-400 opacity-60" />
                      )}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                    </div>
                  </div>

                  <div className="w-full">
                    <span className="text-[9px] sm:text-[10px] font-semibold truncate block">
                      {getStatusBadgeText(dayItem)}
                    </span>
                    {!isHoliday && (
                      <span
                        className={`text-[8px] sm:text-[9px] font-bold block truncate mt-0.5 ${
                          isDateCalled
                            ? isSelected
                              ? 'text-emerald-200'
                              : 'text-emerald-700'
                            : isSelected
                            ? 'text-gray-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {isDateCalled
                          ? lang === 'bn'
                            ? '📢 কল চালু'
                            : '📢 Open'
                          : !isPrivileged
                          ? lang === 'bn'
                            ? '🔒 কল নেই'
                            : '🔒 Locked'
                          : lang === 'bn'
                          ? 'কল অফ'
                          : 'Off'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
        </div>

        {/* Right Column: Selected Day Detail Panel (Sticky on Desktop - No Vertical Scrolling) */}
        <div
          id="selected-day-detail-panel"
          ref={detailPanelRef}
          className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 space-y-4"
        >
          {/* 5. Selected Day Detail Panel */}
          <section
            className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-sm space-y-4"
            data-purpose="selected-day-detail-panel"
          >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-black text-gray-900">
                {safeSelectedDayNum} {lang === 'bn' ? `${currentMonthNameBn} ${currentYearBn}` : `${currentMonthNameEn} ${selectedYear}`}
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                ({lang === 'bn' ? `${WEEKDAY_NAMES_BN[selectedDay.weekday]}বার` : WEEKDAY_NAMES_EN[selectedDay.weekday]})
              </span>

              {/* Meal Call status chip for this date */}
              {selectedDay.status !== 'holiday' && (
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                    isSelectedDayCalled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isSelectedDayCalled
                    ? lang === 'bn'
                      ? '📢 মিল কল দেওয়া হয়েছে'
                      : '📢 Meal Call Issued'
                    : lang === 'bn'
                    ? '🔒 মিল কল দেওয়া হয়নি'
                    : '🔒 No Meal Call'}
                </span>
              )}

              {/* Live Cut-off Timer pill styled with Dashboard / Accounts theme */}
              {selectedDay.status !== 'holiday' && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#064E2B] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold shadow-2xs">
                  <Clock className="w-3 h-3 text-[#064E2B] dark:text-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium">
                    {lang === 'bn' ? 'কাট-অফ বাকি:' : 'Cut-off in:'}
                  </span>
                  <span className="font-mono font-black text-emerald-900 dark:text-emerald-200">
                    {lang === 'bn'
                      ? `${toBnDigits(padZero(countdown.hours))}:${toBnDigits(padZero(countdown.minutes))}:${toBnDigits(padZero(countdown.seconds))}`
                      : `${padZero(countdown.hours)}:${padZero(countdown.minutes)}:${padZero(countdown.seconds)}`}
                  </span>
                </span>
              )}
            </div>

            <div className="text-xs text-emerald-800 font-semibold mt-1 flex items-center space-x-1.5 flex-wrap">
              {selectedDay.status === 'holiday' ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-800">
                    {lang === 'bn' ? 'সরকারি ছুটির দিন • ক্যান্টিন বন্ধ' : 'Official Holiday • Canteen Closed'}
                  </span>
                </>
              ) : isSelectedDayCalled ? (
                selectedDay.status === 'booked' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'bn'
                        ? 'মিল বুকড রয়েছে • কাট-অফ: পূর্বদিন বিকাল ৫:০০'
                        : 'Meal Booked • Cut-off: 5:00 PM previous day'}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700">
                      {lang === 'bn'
                        ? 'মিল কল সক্রিয় — আপনি এই তারিখে মিল বুক করতে পারেন'
                        : 'Meal call active — You can book a meal for this date'}
                    </span>
                  </>
                )
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-800">
                    {isPrivileged
                      ? lang === 'bn'
                        ? 'এই তারিখে মিল কল এখনো দেওয়া হয়নি (এডমিন/কো-এডমিন হিসেবে নিচে থেকে কল দিতে পারেন)'
                        : 'No meal call issued for this date yet (As Admin/Co-Admin, you can issue a call below)'
                      : lang === 'bn'
                      ? 'এই তারিখে এখনো মিল কল দেওয়া হয়নি। এডমিন মিল কল দিলে বুকিং করা যাবে।'
                      : 'No meal call issued yet. Booking opens once Admin issues a meal call.'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Quick Date Meal Call Toggle */}
            {isPrivileged && selectedDay.status !== 'holiday' && onUpdateMealCall && (
              <button
                type="button"
                onClick={() => handleToggleDateMealCall(safeSelectedDayNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer border ${
                  isSelectedDayCalled
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                }`}
              >
                {isSelectedDayCalled
                  ? lang === 'bn'
                    ? 'মিল কল প্রত্যাহার করুন'
                    : 'Withdraw Call'
                  : lang === 'bn'
                  ? '📢 এই তারিখে মিল কল দিন'
                  : '📢 Issue Meal Call'}
              </button>
            )}

            {/* Quick Toggle Status Button */}
            {selectedDay.status !== 'holiday' && selectedDay.status !== 'cutoff' && (
              <button
                onClick={handleToggleBooking}
                disabled={!isPrivileged && !isSelectedDayCalled}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                  !isPrivileged && !isSelectedDayCalled
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
                    : selectedDay.status === 'booked'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer'
                }`}
                title={
                  !isPrivileged && !isSelectedDayCalled
                    ? 'এডমিন কর্তৃক এই তারিখে মিল কল দেওয়া না থাকায় বুকিং লক রয়েছে'
                    : ''
                }
              >
                {selectedDay.status === 'booked'
                  ? lang === 'bn'
                    ? 'বাতিল করুন'
                    : 'Cancel Meal'
                  : lang === 'bn'
                  ? 'বুক করুন'
                  : 'Book Meal'}
              </button>
            )}
          </div>
        </div>

        {/* Counter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Counter 1: কর্মকর্তা লাঞ্চ */}
          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs sm:text-sm text-gray-800 block">
                {lang === 'bn' ? 'কর্মকর্তা লাঞ্চ' : 'Officer Lunch'}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                ৳ {currentUser.mealRate} / মিল
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleOfficerMealChange(-1)}
                disabled={(!isPrivileged && !isSelectedDayCalled) || selectedDay.status === 'holiday' || selectedDay.status === 'cutoff'}
                className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-sm font-sans text-gray-900">
                {selectedDay.officerMeal || 0}
              </span>
              <button
                type="button"
                onClick={() => handleOfficerMealChange(1)}
                disabled={(!isPrivileged && !isSelectedDayCalled) || selectedDay.status === 'holiday' || selectedDay.status === 'cutoff'}
                className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold hover:bg-emerald-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Counter 2: অতিথি মিল */}
          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs sm:text-sm text-gray-800 block">
                {lang === 'bn' ? 'অতিথি মিল' : 'Guest Meal'}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                ৳ {currentUser.mealRate} / মিল
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleGuestMealChange(-1)}
                disabled={(!isPrivileged && !isSelectedDayCalled) || selectedDay.status === 'holiday' || selectedDay.status === 'cutoff'}
                className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-sm font-sans text-gray-900">
                {selectedDay.guestMeal || 0}
              </span>
              <button
                type="button"
                onClick={() => handleGuestMealChange(1)}
                disabled={(!isPrivileged && !isSelectedDayCalled) || selectedDay.status === 'holiday' || selectedDay.status === 'cutoff'}
                className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold hover:bg-emerald-800 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Estimated Day Bill Strip */}
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
          <span className="text-xs text-emerald-900 font-medium">
            {lang === 'bn' ? 'দিনের আনুমানিক মোট বিল:' : 'Estimated Bill for this Day:'}
          </span>
          <span className="text-base font-black text-emerald-950 font-sans">
            ৳ {estimatedDayBill.toLocaleString()}
          </span>
        </div>

        {/* 6. Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={handleBookWholeMonth}
            disabled={!isPrivileged && calledDates.length === 0}
            type="button"
            className="w-full sm:w-1/2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#064e3b] font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 transition flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>
              {isPrivileged
                ? lang === 'bn'
                  ? 'পুরো মাস বুক করুন'
                  : 'Book Whole Month'
                : lang === 'bn'
                ? `অনুমোদিত মিল কল দিনগুলো বুক করুন (${calledDates.length} দিন)`
                : `Book Active Meal Call Dates (${calledDates.length} days)`}
            </span>
          </button>

          <button
            onClick={handleConfirmSelectedDay}
            disabled={!isPrivileged && !isSelectedDayCalled}
            type="button"
            className="w-full sm:w-1/2 py-2.5 px-4 bg-[#0a5832] hover:bg-[#074728] active:bg-[#053a20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {lang === 'bn'
                ? `${safeSelectedDayNum} ${currentMonthNameBn.slice(0, 4)} কনফার্ম করুন`
                : `Confirm for ${currentMonthNameEn.slice(0, 3)} ${safeSelectedDayNum}`}
            </span>
          </button>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};
