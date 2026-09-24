import React, { useState, useMemo } from 'react';
import { BazaarExpense, BazaarCategory, UserProfile, MealCallState } from '../types';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  CheckCircle,
  TrendingUp,
  Receipt,
  Printer,
  X,
  Tag,
  DollarSign,
  ArrowUpDown,
  Lock,
  Megaphone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { BankLogo } from './BankLogo';
import { downloadPdfFromElement } from '../utils/pdfExport';
import {
  getLocalizedName,
  getLocalizedDate,
  getLocalizedItemsDescription,
  getLocalizedDesignation,
  getLocalizedDepartment,
} from '../utils/localization';
import { INITIAL_ALL_MEMBERS } from '../data';

export interface DailyBazaarItem {
  id: string;
  category: BazaarCategory;
  itemsDescription: string;
  amount: number;
  buyerName: string;
  buyerGpf: string;
  verifiedBy?: string;
}

export interface DailyBazaarGroup {
  id: string;
  date: string;
  timestamp: number;
  totalAmount: number;
  buyers: string[];
  buyerGpfs: string[];
  categories: BazaarCategory[];
  itemsList: DailyBazaarItem[];
}

const bnToEnDigits = (str: string): string => {
  const bnDigits: { [k: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => bnDigits[d] || d);
};

export const toBnDigits = (str: string | number): string => {
  const bnDigits: { [k: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };
  return String(str).replace(/[0-9]/g, (d) => bnDigits[d] || d);
};

export const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const getTodayIsoDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getEndOfMonthIsoDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const mStr = String(m + 1).padStart(2, '0');
  return `${y}-${mStr}-${String(lastDay).padStart(2, '0')}`;
};

export const getTodayFormattedDateBn = (): string => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());
  return `${toBnDigits(d)}/${toBnDigits(m)}/${toBnDigits(y)}`;
};

export const getTodayFormattedDateEn = (): string => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());
  return `${d}/${m}/${y}`;
};

const parseDateStrToTime = (dateStr: string): number => {
  if (!dateStr) return 0;
  const enStr = bnToEnDigits(dateStr).trim();
  const slashParts = enStr.split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10) - 1;
    const year = parseInt(slashParts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return new Date(enStr).getTime() || 0;
};

interface BazaarScreenProps {
  expenses: BazaarExpense[];
  onAddExpense: (expense: BazaarExpense) => void;
  currentUser: UserProfile;
  members?: UserProfile[];
  lang: 'bn' | 'en';
  mealCallState: MealCallState;
  onUpdateMealCall: (updated: Partial<MealCallState>) => void;
}

const CATEGORY_MAP: Record<
  BazaarCategory,
  { labelBn: string; labelEn: string; color: string; badgeBg: string }
> = {
  fish_meat: {
    labelBn: 'মাছ ও মাংস',
    labelEn: 'Fish & Meat',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
  },
  eggs: {
    labelBn: 'ডিম',
    labelEn: 'Eggs',
    color: 'text-amber-800',
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-900',
  },
  rice_grains: {
    labelBn: 'চাল ও ডাল',
    labelEn: 'Rice & Grains',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  oil_spices: {
    labelBn: 'তেল ও মসলা',
    labelEn: 'Oil & Spices',
    color: 'text-orange-700',
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
  },
  vegetables: {
    labelBn: 'শাকসবজি',
    labelEn: 'Vegetables',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  utility_other: {
    labelBn: 'গ্যাস ও ইউটিলিটি',
    labelEn: 'Gas & Utility',
    color: 'text-slate-700',
    badgeBg: 'bg-slate-100 border-slate-200 text-slate-800',
  },
};

export const BazaarScreen: React.FC<BazaarScreenProps> = ({
  expenses,
  onAddExpense,
  currentUser,
  members = [],
  lang,
  mealCallState,
  onUpdateMealCall,
}) => {
  const isPrivileged = currentUser.role === 'admin' || currentUser.role === 'coadmin';

  if (!isPrivileged) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-rose-200 dark:border-rose-900/50 shadow-xs">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {lang === 'bn' ? 'অননুমোদিত প্রবেশাধিকার' : 'Access Restricted'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'মিল কল ও বাজার খরচ ব্যবস্থাপনা শুধুমাত্র এডমিন ও কো-এডমিনদের জন্য উন্মুক্ত।'
              : 'Meal Call and Bazaar Expense management is strictly restricted to Admin and Co-Admin.'}
          </p>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<DailyBazaarGroup | null>(null);
  const [isDownloadingVoucher, setIsDownloadingVoucher] = useState(false);
  const [isDownloadingBazaarSheet, setIsDownloadingBazaarSheet] = useState(false);

  const handleDownloadVoucherPdf = async () => {
    if (!activeVoucher) return;
    setIsDownloadingVoucher(true);
    const safeDate = activeVoucher.date.replace(/\//g, '-');
    await downloadPdfFromElement('voucher-print-area', {
      fileName: `বাজার_ভাউচার_মেমো_${safeDate}`,
    });
    setIsDownloadingVoucher(false);
  };

  const handleDownloadBazaarSheetPdf = async () => {
    setIsDownloadingBazaarSheet(true);
    const now = new Date();
    const monthNameBn = MONTH_NAMES_BN[now.getMonth()];
    const yearBn = toBnDigits(now.getFullYear());
    await downloadPdfFromElement('bazaar-register-table-area', {
      fileName:
        lang === 'bn'
          ? `কর্মসংস্থান_ব্যাংক_দৈনিক_বাজার_রেজিস্টার_${monthNameBn}_${yearBn}`
          : `KBL_Daily_Bazaar_Register_${MONTH_NAMES_EN[now.getMonth()]}_${now.getFullYear()}`,
    });
    setIsDownloadingBazaarSheet(false);
  };

  // Meal Call state & controls inside BazaarScreen (defaults to current date & month)
  const [mealCallToast, setMealCallToast] = useState<string | null>(null);
  const [callStartDate, setCallStartDate] = useState<string>(getTodayIsoDate);
  const [callEndDate, setCallEndDate] = useState<string>(getEndOfMonthIsoDate);

  const triggerMealCallToast = (msg: string) => {
    setMealCallToast(msg);
    setTimeout(() => setMealCallToast(null), 3500);
  };

  const handleApplyMealCallRange = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!callStartDate || !callEndDate) {
      triggerMealCallToast(
        lang === 'bn' ? 'অনুগ্রহ করে শুরু ও শেষের তারিখ নির্বাচন করুন।' : 'Please select start and end dates.'
      );
      return;
    }

    const start = new Date(callStartDate);
    const end = new Date(callEndDate);

    if (start > end) {
      triggerMealCallToast(
        lang === 'bn' ? 'শুরুর তারিখ শেষের তারিখের চেয়ে পরে হতে পারে না।' : 'Start date cannot be after end date.'
      );
      return;
    }

    const dates: number[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      dates.push(curr.getDate());
      curr.setDate(curr.getDate() + 1);
    }

    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => a - b);
    const now = new Date();
    const timeString = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const startDay = start.getDate();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();

    onUpdateMealCall({
      isActive: true,
      targetDate: `${toBnDigits(startDay)} ${MONTH_NAMES_BN[startMonth]} ${toBnDigits(startYear)}`,
      targetDateEn: `${startDay} ${MONTH_NAMES_EN[startMonth]} ${startYear}`,
      calledDates: uniqueDates.length > 0 ? uniqueDates : [startDay],
      calledBy: currentUser.name,
      calledByGpf: currentUser.gpfNo,
      calledByRole: currentUser.role,
      calledAt: `আজ ${timeString}`,
      cutoffTime: 'বিকাল ৫:০০ টা',
      menuHighlight: 'আজকের স্পেশাল মেন্যু প্রস্তুত',
      customNote: 'সকলকে যথাসময়ে মিল কনফার্ম বা অফ করার অনুরোধ করা হচ্ছে।',
    });

    triggerMealCallToast(
      lang === 'bn'
        ? `সফলভাবে মিল কল দেওয়া হয়েছে! (${uniqueDates.length} দিন মেম্বারদের বুকিং উন্মুক্ত)`
        : `Meal Call successfully activated for ${uniqueDates.length} days!`
    );
  };

  const handleCloseMealCall = () => {
    onUpdateMealCall({
      isActive: false,
      calledDates: [],
    });
    triggerMealCallToast(
      lang === 'bn'
        ? 'মিল কল বন্ধ করা হয়েছে। মেম্বারদের মিল বুকিং স্থগিত রাখা হয়েছে।'
        : 'Meal Call closed. Member meal booking is now locked.'
    );
  };

  const memberList = useMemo(() => {
    return members && members.length > 0 ? members : INITIAL_ALL_MEMBERS;
  }, [members]);

  const normalizeGpfDigits = (str: string): string => {
    return bnToEnDigits(str).toLowerCase().replace(/[^0-9]/g, '');
  };

  const findMemberByGpf = (gpf: string): UserProfile | undefined => {
    if (!gpf) return undefined;
    const cleanInput = gpf.trim();
    // 1. Direct match on gpfNo
    const directMatch = memberList.find((m) => m.gpfNo.toLowerCase() === cleanInput.toLowerCase());
    if (directMatch) return directMatch;

    // 2. Digits match (e.g. '2490' or '২৪৯০' matches 'GPF-২৪৯০')
    const inputDigits = normalizeGpfDigits(cleanInput);
    if (inputDigits) {
      const digitMatch = memberList.find((m) => {
        const mDigits = normalizeGpfDigits(m.gpfNo);
        return mDigits && mDigits === inputDigits;
      });
      if (digitMatch) return digitMatch;
    }

    return undefined;
  };

  // Form states for new entry (GPF entry primary, default current date & month)
  const [buyerGpf, setBuyerGpf] = useState(currentUser.gpfNo || 'GPF-২৪৯০');
  const [buyerName, setBuyerName] = useState(currentUser.name);
  const [isCustomGpfMode, setIsCustomGpfMode] = useState(false);
  const [category, setCategory] = useState<BazaarCategory>('fish_meat');
  const [itemsDescription, setItemsDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayFormattedDateBn);

  const matchedOfficer = useMemo(() => {
    return findMemberByGpf(buyerGpf);
  }, [buyerGpf, memberList]);

  const handleGpfSelect = (selectedGpf: string) => {
    if (selectedGpf === '__custom__') {
      setIsCustomGpfMode(true);
      return;
    }
    setIsCustomGpfMode(false);
    setBuyerGpf(selectedGpf);
    const officer = findMemberByGpf(selectedGpf);
    if (officer) {
      setBuyerName(officer.name);
    }
  };

  const handleCustomGpfChange = (val: string) => {
    setBuyerGpf(val);
    const officer = findMemberByGpf(val);
    if (officer) {
      setBuyerName(officer.name);
    }
  };

  // Group all expenses DATE-WISE (Same date categories will NOT be separated)
  const groupedExpenses = useMemo<DailyBazaarGroup[]>(() => {
    const groupsMap = new Map<string, DailyBazaarGroup>();

    expenses.forEach((exp) => {
      const dStr = (exp.date || '').trim();
      if (!dStr) return;

      if (!groupsMap.has(dStr)) {
        groupsMap.set(dStr, {
          id: `DAY-${dStr}`,
          date: dStr,
          timestamp: parseDateStrToTime(dStr),
          totalAmount: 0,
          buyers: [],
          buyerGpfs: [],
          categories: [],
          itemsList: [],
        });
      }

      const group = groupsMap.get(dStr)!;
      group.totalAmount += exp.amount;

      if (exp.buyerName && !group.buyers.includes(exp.buyerName)) {
        group.buyers.push(exp.buyerName);
      }
      if (exp.buyerGpf && !group.buyerGpfs.includes(exp.buyerGpf)) {
        group.buyerGpfs.push(exp.buyerGpf);
      }
      if (exp.category && !group.categories.includes(exp.category)) {
        group.categories.push(exp.category);
      }

      group.itemsList.push({
        id: exp.id,
        category: exp.category,
        itemsDescription: exp.itemsDescription,
        amount: exp.amount,
        buyerName: exp.buyerName,
        buyerGpf: exp.buyerGpf,
        verifiedBy: exp.verifiedBy,
      });
    });

    // Date-wise sorting (newest date first)
    return Array.from(groupsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses]);

  // Filtered date-wise expenses
  const filteredGroups = useMemo(() => {
    return groupedExpenses.filter((group) => {
      const matchCategory =
        selectedCategory === 'all' ||
        group.categories.includes(selectedCategory as BazaarCategory);

      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        group.date.includes(term) ||
        group.buyers.some((b) => b.toLowerCase().includes(term)) ||
        group.buyerGpfs.some((g) => g.toLowerCase().includes(term) || normalizeGpfDigits(g).includes(term)) ||
        group.itemsList.some(
          (it) =>
            it.itemsDescription.toLowerCase().includes(term) ||
            it.buyerName.toLowerCase().includes(term) ||
            (it.buyerGpf && it.buyerGpf.toLowerCase().includes(term))
        );

      return matchCategory && matchSearch;
    });
  }, [groupedExpenses, selectedCategory, searchTerm]);

  // Calculation metrics
  const totalBazaarMonth = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const filteredTotalAmount = filteredGroups.reduce((acc, g) => acc + g.totalAmount, 0);
  const todayFormattedBn = getTodayFormattedDateBn();
  const todayDayMonthBn = todayFormattedBn.slice(0, 5); // e.g. "২২/০৯"
  const todayDayMonthEn = `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const todayBazaar = expenses
    .filter((e) => {
      const d = (e.date || '').trim();
      return (
        d.includes(todayDayMonthBn) ||
        d.includes(todayDayMonthEn) ||
        d.includes(todayFormattedBn) ||
        d.includes('১৫/১০') // preserve backward compatibility with sample data
      );
    })
    .reduce((acc, curr) => acc + curr.amount, 0);
  const averageDailyBazaar = Math.round(
    totalBazaarMonth / Math.max(1, groupedExpenses.length)
  );

  const handleSubmitNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const matched = findMemberByGpf(buyerGpf);
    const finalBuyerGpf = matched ? matched.gpfNo : (buyerGpf.trim() || currentUser.gpfNo);
    const finalBuyerName = matched ? matched.name : (buyerName.trim() || currentUser.name);

    const newExpense: BazaarExpense = {
      id: `BZ-${Date.now().toString().slice(-4)}`,
      date,
      buyerName: finalBuyerName,
      buyerGpf: finalBuyerGpf,
      category,
      itemsDescription: itemsDescription || 'দৈনিক মেস বাজার সামগ্রী',
      amount: Number(amount),
      voucherNo: `AUTO-${Date.now().toString().slice(-4)}`,
      verifiedBy: 'মেস ম্যানেজার অনুমোদিত',
    };

    onAddExpense(newExpense);
    setIsAddModalOpen(false);
    // Reset form
    setItemsDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-12">
      {/* Header Banner */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-[#064E2B]" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {lang === 'bn' ? 'মিল কল ও বাজার খরচ' : 'Meal Call & Bazaar Expenses'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {lang === 'bn'
                  ? 'তারিখভিত্তিক মিল কল অনুমোদন, বাজার রেজিস্টার ও মিল রেটের ভিত্তি'
                  : 'Date-wise meal call approval, daily bazaar register & meal rate foundation'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setDate(getTodayFormattedDateBn());
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#064E2B] hover:bg-[#085a33] text-white font-bold text-sm rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন বাজার খরচ ইনপুট' : 'Add Bazaar Expense'}</span>
        </button>
      </section>

      {/* MEAL CALL DATE RANGE SELECTOR */}
      {(currentUser.role === 'admin' || currentUser.role === 'coadmin') && (
        <section
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs"
          data-purpose="bazaar-meal-call-range-selector"
        >
          <p className="text-sm sm:text-base font-normal text-gray-800 mb-3 sm:mb-4">
            {lang === 'bn'
              ? 'যেসব তারিখে মিল কল দেওয়া হবে, শুধু সেসব তারিখেই মেম্বাররা মিল বুক করতে পারবেন।'
              : 'Members can only book meals on dates where a meal call has been issued.'}
          </p>

          <form onSubmit={handleApplyMealCallRange} className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                {lang === 'bn' ? 'শুরু' : 'Start Date'}
              </label>
              <input
                type="date"
                value={callStartDate}
                onChange={(e) => setCallStartDate(e.target.value)}
                className="w-full sm:w-52 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs font-medium"
                required
              />
            </div>

            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                {lang === 'bn' ? 'শেষ' : 'End Date'}
              </label>
              <input
                type="date"
                value={callEndDate}
                onChange={(e) => setCallEndDate(e.target.value)}
                className="w-full sm:w-52 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#064E2B] hover:bg-[#085a33] text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
            >
              {lang === 'bn' ? 'মিল কল দিন' : 'Issue Meal Call'}
            </button>

            {mealCallState.isActive && (
              <button
                type="button"
                onClick={handleCloseMealCall}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm rounded-lg transition active:scale-95 cursor-pointer"
              >
                {lang === 'bn' ? 'কল বন্ধ করুন' : 'Close Call'}
              </button>
            )}
          </form>

          {/* Current status display */}
          {mealCallState.isActive && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 inline-block"></span>
                {lang === 'bn' ? 'মিল কল সক্রিয়' : 'Meal Call Active'}
              </span>
              <span>
                {lang === 'bn' ? 'অনুমোদিত তারিখসমূহ: ' : 'Approved Dates: '}
                <strong className="text-emerald-900 font-bold">
                  {(mealCallState.calledDates || []).length > 0
                    ? (mealCallState.calledDates || []).map((d) => `${d} ${lang === 'bn' ? MONTH_NAMES_BN[new Date().getMonth()].slice(0, 5) : MONTH_NAMES_EN[new Date().getMonth()].slice(0, 3)}`).join(', ')
                    : lang === 'bn' ? 'কোনো তারিখ নেই' : 'No dates'}
                </strong>
              </span>
              <span className="text-gray-400">|</span>
              <span>{lang === 'bn' ? 'আহ্বানকারী: ' : 'Called By: '}<strong>{getLocalizedName(mealCallState.calledBy, lang)}</strong></span>
            </div>
          )}

          {/* Feedback Toast */}
          {mealCallToast && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{mealCallToast}</span>
              </div>
              <button
                onClick={() => setMealCallToast(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </section>
      )}

      {/* 4 Summary Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {lang === 'bn' ? 'চলতি মাসের মোট বাজার' : 'Total Month Bazaar'}
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#064E2B] font-sans">
              ৳ {totalBazaarMonth.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1 inline" />
            {lang === 'bn' ? `${expenses.length} টি ভাউচার অনুমোদিত` : `${expenses.length} vouchers approved`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {lang === 'bn' ? 'আজকের বাজার ব্যয়' : "Today's Bazaar Cost"}
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 font-sans">
              ৳ {todayBazaar.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {lang === 'bn'
              ? `${toBnDigits(new Date().getDate())} ${MONTH_NAMES_BN[new Date().getMonth()]} ${toBnDigits(new Date().getFullYear())}`
              : `${new Date().getDate()} ${MONTH_NAMES_EN[new Date().getMonth()]} ${new Date().getFullYear()}`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {lang === 'bn' ? 'গড়ে দৈনিক বাজার খরচ' : 'Avg Daily Expense'}
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 font-sans">
              ৳ {averageDailyBazaar.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded w-max">
            {lang === 'bn' ? 'সুষম বাজেট সাশ্রয়ী' : 'Budget Saver'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {lang === 'bn' ? 'প্রাক্কলিত চলতি মিল রেট' : 'Est. Meal Rate'}
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-900 font-sans">
              ৳ ৬৫.০০
            </span>
            <span className="text-xs text-gray-400 ml-1">{lang === 'bn' ? '/ মিল' : '/ meal'}</span>
          </div>
          <span className="text-[11px] text-blue-700 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 inline" />
            {lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে সমন্বিত' : 'Auto-adjusted'}
          </span>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'পণ্য, বাজারকারী বা তারিখ খুঁজুন...' : 'Search items, buyer, date...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#064E2B] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap border cursor-pointer ${
                selectedCategory === key
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              {lang === 'bn' ? info.labelBn : info.labelEn}
            </button>
          ))}
        </div>
      </section>

      {/* Bazaar Table - Arranged strictly DATE-WISE, No Voucher No, Consolidated Categories */}
      <section
        id="bazaar-register-table-area"
        className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden"
      >
        {/* Official Bank Header for PDF Export */}
        <div className="hidden print-only-header p-5 border-b-2 border-emerald-900 bg-white text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
            <BankLogo size="md" />
            <div className="text-left">
              <h2 className="text-xl font-black text-emerald-950 tracking-tight leading-tight">
                {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
              </h2>
              <p className="text-xs font-bold text-gray-700">
                {lang === 'bn'
                  ? 'প্রধান কার্যালয়, ১ ডিআইটি এভিনিউ, ঢাকা'
                  : 'Head Office, 1 DIT Avenue, Dhaka'}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-1">
            <h3 className="text-sm font-bold text-gray-800">
              {lang === 'bn'
                ? 'কর্মকর্তা ক্যান্টিন ও মেস ব্যবস্থাপনা কমিটি'
                : 'Officers Canteen & Mess Management Committee'}
            </h3>
            <div className="inline-block mt-1 px-4 py-0.5 bg-emerald-800 text-white rounded font-bold text-xs">
              {lang === 'bn'
                ? `দৈনিক বাজার রেজিস্টার — ${MONTH_NAMES_BN[new Date().getMonth()]} ${toBnDigits(new Date().getFullYear())}`
                : `Daily Bazaar Register — ${MONTH_NAMES_EN[new Date().getMonth()]} ${new Date().getFullYear()}`}
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-gray-600 mt-2.5 pt-1.5 border-t border-dashed border-gray-300 font-sans">
            <span>
              {lang === 'bn' ? 'প্রিন্ট তারিখ:' : 'Print Date:'}{' '}
              {getLocalizedDate(getTodayFormattedDateBn(), lang)}
            </span>
            <span>
              {lang === 'bn' ? 'মোট রেকর্ডকৃত দিন:' : 'Total Recorded Days:'}{' '}
              {lang === 'bn' ? toBnDigits(filteredGroups.length) : filteredGroups.length}{' '}
              {lang === 'bn' ? 'দিন' : 'Days'}
            </span>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              {lang === 'bn' ? 'দৈনিক বাজার রেজিস্টার' : 'Daily Bazaar Register'}
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {filteredGroups.length} {lang === 'bn' ? 'দিনের রেকর্ড' : 'days recorded'}
            </span>
          </div>

          <div className="flex items-center space-x-2 no-print">
            <span className="text-xs text-gray-500 font-medium hidden md:inline">
              {lang === 'bn' ? 'তারিখ অনুযায়ী ক্রমানুসারে সাজানো' : 'Sorted Date-wise'}
            </span>
            <button
              type="button"
              onClick={handleDownloadBazaarSheetPdf}
              disabled={isDownloadingBazaarSheet}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#064E2B] border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-60"
              title={lang === 'bn' ? 'সম্পূর্ণ দৈনিক বাজার রেজিস্টার পিডিএফ ডাউনলোড করুন' : 'Download daily bazaar register PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isDownloadingBazaarSheet
                  ? lang === 'bn'
                    ? 'ডাউনলোড হচ্ছে...'
                    : 'Downloading...'
                  : lang === 'bn'
                  ? 'রেজিস্টার পিডিএফ'
                  : 'Register PDF'}
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3 px-4 w-32">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4 min-w-[280px]">
                  {lang === 'bn' ? 'ক্যাটাগরি ও বাজার সামগ্রীর বিবরণ' : 'Category & Items Breakdown'}
                </th>
                <th className="py-3 px-4 w-44">{lang === 'bn' ? 'বাজারকারী' : 'Purchaser'}</th>
                <th className="py-3 px-4 text-right w-36">{lang === 'bn' ? 'মোট টাকার পরিমাণ' : 'Total Amount'}</th>
                <th className="py-3 px-4 text-center w-24 no-print">{lang === 'bn' ? 'মেমো / রসিদ' : 'Slip'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                    {lang === 'bn' ? 'কোনো বাজার রেকর্ড পাওয়া যায়নি।' : 'No bazaar records found.'}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  return (
                    <tr key={group.id} className="hover:bg-emerald-50/20 transition">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap align-top">
                        <div className="flex items-center gap-1.5 text-emerald-950 font-black text-sm">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{getLocalizedDate(group.date, lang)}</span>
                        </div>
                      </td>

                      {/* Consolidated Items of Same Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-2">
                          {/* Categories Present */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {group.categories.map((catKey) => {
                              const cat = CATEGORY_MAP[catKey];
                              return (
                                <span
                                  key={catKey}
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${cat.badgeBg}`}
                                >
                                  {lang === 'bn' ? cat.labelBn : cat.labelEn}
                                </span>
                              );
                            })}
                          </div>

                          {/* Itemized List */}
                          <div className="space-y-1 text-xs text-gray-800">
                            {group.itemsList.map((item, idx) => {
                              const cat = CATEGORY_MAP[item.category];
                              return (
                                <div
                                  key={item.id || idx}
                                  className="pdf-item-row flex items-start justify-between gap-2 p-1.5 rounded-lg bg-gray-50/80 border border-gray-200/80"
                                >
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${cat.color.replace('text-', 'bg-')} shrink-0`}></span>
                                    <span className="font-semibold text-gray-900 leading-snug">
                                      {getLocalizedItemsDescription(item.itemsDescription, lang)}
                                    </span>
                                  </div>
                                  <span className="font-bold text-emerald-900 whitespace-nowrap font-mono text-xs">
                                    ৳ {item.amount.toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Purchaser */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-gray-900 leading-tight">
                          {(group.buyers.length > 0 ? group.buyers : [currentUser.name])
                            .map((b) => getLocalizedName(b, lang))
                            .join(', ')}
                        </div>
                        {group.buyerGpfs.length > 0 && (
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {group.buyerGpfs.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Total Amount for Date */}
                      <td className="py-3.5 px-4 text-right font-black text-gray-900 font-sans whitespace-nowrap align-top">
                        <span className="text-base text-emerald-950 font-black">
                          ৳ {group.totalAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Slip Action */}
                      <td className="py-3.5 px-4 text-center align-top no-print">
                        <button
                          onClick={() => setActiveVoucher(group)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                          title="দৈনিক বাজার ক্যাশ মেমো দেখুন"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{lang === 'bn' ? 'মেমো' : 'Slip'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50/90 font-bold border-t-2 border-emerald-800 text-gray-900 text-xs sm:text-sm">
                <td colSpan={3} className="py-3.5 px-4 text-right font-black text-gray-950">
                  {lang === 'bn' ? 'সর্বমোট বাজার খরচ:' : 'Grand Total Bazaar Amount:'}
                </td>
                <td className="py-3.5 px-4 text-right font-black text-emerald-950 text-base whitespace-nowrap">
                  ৳ {filteredTotalAmount.toLocaleString()}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Verification Signatures for PDF */}
        <div className="hidden print-only-signatures mt-10 pt-8 px-8 pb-6 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold text-gray-800">
            <div>
              <div className="border-t border-dashed border-gray-400 pt-2 text-gray-900">
                {lang === 'bn' ? 'বাজারকারী কর্মকর্তা' : 'Purchasing Officer'}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                {lang === 'bn' ? 'স্বাক্ষর ও তারিখ' : 'Signature & Date'}
              </p>
            </div>
            <div>
              <div className="border-t border-dashed border-gray-400 pt-2 text-gray-900">
                {lang === 'bn' ? 'মেস ম্যানেজার / কো-এডমিন' : 'Mess Manager / Co-Admin'}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                {lang === 'bn' ? 'স্বাক্ষর ও তারিখ' : 'Signature & Date'}
              </p>
            </div>
            <div>
              <div className="border-t border-dashed border-gray-400 pt-2 text-gray-900">
                {lang === 'bn' ? 'আহ্বায়ক, মেস কমিটি / এডমিন' : 'Convener, Mess Committee / Admin'}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                {lang === 'bn' ? 'স্বাক্ষর ও তারিখ' : 'Signature & Date'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Add New Bazaar Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#064E2B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">
                  {lang === 'bn' ? 'নতুন বাজার খরচ ইনপুট' : 'Input New Bazaar Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitNewExpense} className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'বাজারের তারিখ' : 'Bazaar Date'}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                    placeholder={getTodayFormattedDateBn()}
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {lang === 'bn'
                    ? 'একই তারিখে একাধিক ক্যাটাগরির খরচ আলাদা না হয়ে তারিখ অনুযায়ী এক সাথে সমন্বিত থাকবে।'
                    : 'Expenses on the same date will automatically group under that date.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'বাজারের ক্যাটাগরি' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BazaarCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
                >
                  <option value="fish_meat">{lang === 'bn' ? 'মাছ ও মাংস (Fish & Meat)' : 'Fish & Meat'}</option>
                  <option value="eggs">{lang === 'bn' ? 'ডিম (Eggs)' : 'Eggs'}</option>
                  <option value="rice_grains">{lang === 'bn' ? 'চাল ও ডাল (Rice & Grains)' : 'Rice & Grains'}</option>
                  <option value="oil_spices">{lang === 'bn' ? 'তেল ও মসলা (Oil & Spices)' : 'Oil & Spices'}</option>
                  <option value="vegetables">{lang === 'bn' ? 'শাকসবজি ও সালাদ (Vegetables)' : 'Vegetables & Salad'}</option>
                  <option value="utility_other">{lang === 'bn' ? 'গ্যাস সিলিন্ডার ও ইউটিলিটি (Gas & Utility)' : 'Gas & Utility'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'আইটেমসমূহ ও বিস্তারিত দর' : 'Item Details & Rate'}
                </label>
                <textarea
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: রুই মাছ ৭ কেজি @ ৩৪০ = ২৩৮০ টাকা, কাঁচামরিচ ২৫০ গ্রাম...'
                      : 'e.g., Rui Fish 7kg @ 340 = 2380 Tk, Green chili 250g...'
                  }
                  required
                />
              </div>

              {/* Purchaser Officer GPF Section */}
              <div className="bg-gray-50/90 p-3 sm:p-3.5 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 text-xs sm:text-sm">
                    {lang === 'bn' ? 'বাজারকারী কর্মকর্তা (GPF নম্বর)' : 'Purchaser Officer (GPF Number)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomGpfMode(!isCustomGpfMode)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline flex items-center gap-1"
                  >
                    {isCustomGpfMode
                      ? (lang === 'bn' ? '📋 তালিকা থেকে GPF বাছুন' : '📋 Select from GPF List')
                      : (lang === 'bn' ? '✏️ সরাসরি GPF টাইপ করুন' : '✏️ Type Custom GPF')}
                  </button>
                </div>

                {!isCustomGpfMode ? (
                  <div>
                    <select
                      value={memberList.some((m) => m.gpfNo === buyerGpf) ? buyerGpf : '__custom__'}
                      onChange={(e) => handleGpfSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium bg-white text-gray-900 text-sm"
                    >
                      {memberList.map((m) => (
                        <option key={m.gpfNo} value={m.gpfNo}>
                          {m.gpfNo} — {getLocalizedName(m.name, lang)} ({getLocalizedDepartment(m.department, lang)})
                        </option>
                      ))}
                      <option value="__custom__">
                        {lang === 'bn' ? '✏️ অন্যান্য / কাস্টম GPF টাইপ করুন...' : '✏️ Enter Custom GPF...'}
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="officers-gpf-datalist"
                      value={buyerGpf}
                      onChange={(e) => handleCustomGpfChange(e.target.value)}
                      placeholder={lang === 'bn' ? 'GPF নম্বর লিখুন (যেমন: GPF-২৪৯০ বা ২৪৯০)' : 'Enter GPF (e.g. GPF-2490 or 2490)'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono font-bold text-gray-900 placeholder:font-sans placeholder:font-normal text-sm bg-white"
                      required
                    />
                    <datalist id="officers-gpf-datalist">
                      {memberList.map((m) => (
                        <option key={m.gpfNo} value={m.gpfNo}>
                          {m.name} ({m.department})
                        </option>
                      ))}
                    </datalist>
                  </div>
                )}

                {/* Auto-detected officer verification badge */}
                {matchedOfficer ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-gray-900">
                          {getLocalizedName(matchedOfficer.name, lang)}
                        </span>
                        <span className="text-emerald-700 ml-1.5 font-medium">
                          ({getLocalizedDesignation(matchedOfficer.designation, lang)} • {getLocalizedDepartment(matchedOfficer.department, lang)})
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                      {matchedOfficer.gpfNo}
                    </span>
                  </div>
                ) : (
                  isCustomGpfMode && (
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {lang === 'bn' ? 'কর্মকর্তার নাম (ম্যানুয়াল এন্ট্রি):' : 'Officer Name (Manual Entry):'}
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder={lang === 'bn' ? 'কর্মকর্তার নাম' : "Officer's name"}
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                        required
                      />
                    </div>
                  )
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'মোট খরচের টাকা (৳)' : 'Total Amount (৳)'}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold text-emerald-800"
                  placeholder="৩০০০"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                {lang === 'bn' ? (
                  <>💡 <strong>তারিখ অনুযায়ী সমন্বিত রেজিস্টার:</strong> নতুন খরচটি যুক্ত হওয়ার পর রেজিস্টারে তারিখ ক্রমানুসারে সাজানো থাকবে এবং চলতি মাসের মোট খরচ ও মিল রেট স্বয়ংক্রিয়ভাবে আপডেট হবে।</>
                ) : (
                  <>💡 <strong>Date-wise Consolidated Register:</strong> Once added, expenses are chronologically sorted and both the monthly expenditure and per-meal rate are updated automatically.</>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Memo / Slip Modal */}
      {activeVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Top Bar */}
            <div className="px-5 py-3 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {lang === 'bn' ? 'অফিসিয়াল দৈনিক বাজার ক্যাশ মেমো' : 'Official Daily Bazaar Cash Memo'}
                </span>
              </div>
              <button
                onClick={() => setActiveVoucher(null)}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Body */}
            <div id="voucher-print-area" className="p-6 bg-[#fffefc] text-gray-900 space-y-4">
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-gray-300">
                <div className="flex justify-center mb-1">
                  <BankLogo size="md" />
                </div>
                <h3 className="font-black text-lg text-emerald-950">
                  {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
                </h3>
                <h4 className="text-xs font-bold text-gray-700">
                  {lang === 'bn'
                    ? 'কর্মকর্তা মেস ও ক্যান্টিন ব্যবস্থাপনা কমিটি'
                    : 'Officers Mess & Canteen Management Committee'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {lang === 'bn'
                    ? 'প্রধান কার্যালয়, ১ ডিআইটি এভিনিউ, ঢাকা'
                    : 'Head Office, 1 DIT Avenue, Dhaka'}
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 bg-emerald-800 text-white text-xs font-bold rounded-md uppercase">
                  {lang === 'bn' ? 'দৈনিক বাজার খরচ বিবরণী' : 'Daily Bazaar Expense Statement'}
                </div>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-gray-200 font-sans">
                <div>
                  <span className="text-gray-500">{lang === 'bn' ? 'বাজারের তারিখ:' : 'Bazaar Date:'}</span>{' '}
                  <span className="font-bold text-emerald-950">{getLocalizedDate(activeVoucher.date, lang)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">{lang === 'bn' ? 'আইটেম সংখ্যা:' : 'Total Items:'}</span>{' '}
                  <span className="font-bold">
                    {activeVoucher.itemsList.length} {lang === 'bn' ? 'টি' : 'items'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{lang === 'bn' ? 'বাজারকারী:' : 'Purchaser:'}</span>{' '}
                  <span className="font-bold">
                    {(activeVoucher.buyers.length > 0 ? activeVoucher.buyers : [currentUser.name])
                      .map((b) => getLocalizedName(b, lang))
                      .join(', ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">{lang === 'bn' ? 'জিপিএফ / আইডি:' : 'GPF / ID:'}</span>{' '}
                  <span className="font-mono font-bold text-gray-700">
                    {activeVoucher.buyerGpfs.join(', ') || currentUser.gpfNo}
                  </span>
                </div>
              </div>

              {/* Items Table Detail for this date */}
              <div className="space-y-1">
                <span className="text-gray-500 font-bold text-xs block mb-1">
                  {lang === 'bn' ? 'তারিখের ক্রয়কৃত সামগ্রীর বিবরণ:' : 'Purchased Items Breakdown:'}
                </span>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                        <th className="py-2 px-3">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                        <th className="py-2 px-3 text-right">{lang === 'bn' ? 'টাকা (৳)' : 'Amount (৳)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeVoucher.itemsList.map((item, idx) => {
                        const cat = CATEGORY_MAP[item.category];
                        return (
                          <tr key={item.id || idx} className="hover:bg-gray-50/50">
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeBg}`}>
                                {lang === 'bn' ? cat.labelBn : cat.labelEn}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-800 font-medium">
                              {getLocalizedItemsDescription(item.itemsDescription, lang)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                              ৳ {item.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-900 text-white rounded-xl">
                <span className="font-bold text-sm">
                  {lang === 'bn' ? 'ওই দিনের সর্বমোট বাজার খরচ:' : 'Total Bazaar Cost for Date:'}
                </span>
                <span className="font-black text-xl font-sans">
                  ৳ {activeVoucher.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[11px] text-gray-600">
                <div className="border-t border-gray-400 pt-1">
                  <span>{lang === 'bn' ? 'বাজারকারী কর্মকর্তা' : 'Purchasing Officer'}</span>
                </div>
                <div className="border-t border-gray-400 pt-1">
                  <span className="font-bold text-emerald-900">
                    {lang === 'bn' ? 'মেস ইনচার্জ / ম্যানেজার' : 'Mess In-Charge / Manager'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveVoucher(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadVoucherPdf}
                  disabled={isDownloadingVoucher}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60 transition"
                  title={lang === 'bn' ? 'বাজার ভাউচারটি পিডিএফ হিসেবে ডাউনলোড করুন' : 'Download voucher as PDF'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isDownloadingVoucher
                      ? lang === 'bn'
                        ? 'পিডিএফ তৈরি হচ্ছে...'
                        : 'Generating PDF...'
                      : lang === 'bn'
                      ? 'পিডিএফ ডাউনলোড'
                      : 'Download PDF'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'প্রিন্ট মেমো' : 'Print Memo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
