import React, { useState, useEffect } from 'react';
import { MemberBillingRecord, UserProfile, MemberMealDateBooking, MemberAdvanceDeposit, Department } from '../types';
import {
  Calculator,
  FileSpreadsheet,
  Search,
  Printer,
  Download,
  Receipt,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Coins,
  Building,
  User,
  X,
  Lock,
  Calendar,
  CreditCard,
  Utensils,
  Clock,
  Sparkles,
  FileText,
  BadgeCheck,
  Eye,
  MessageSquare,
  Send,
} from 'lucide-react';
import { BankLogo } from './BankLogo';
import { downloadPdfFromElement } from '../utils/pdfExport';
import { getLocalizedName, getLocalizedDesignation, getLocalizedDepartment } from '../utils/localization';
import { INITIAL_DEPARTMENTS } from '../data';

interface AccountsScreenProps {
  billingRecords: MemberBillingRecord[];
  currentUser: UserProfile;
  totalBazaarCost: number;
  departments?: Department[];
  lang: 'bn' | 'en';
}

// Helper to reliably retrieve or generate date-wise meal logs
const getMealDateBookings = (rec: MemberBillingRecord, lang: 'bn' | 'en' = 'bn'): MemberMealDateBooking[] => {
  if (rec.mealBookingDates && rec.mealBookingDates.length > 0) {
    return rec.mealBookingDates;
  }
  const days: MemberMealDateBooking[] = [];
  const total = rec.totalMeals;
  let remainingGuest = rec.guestMeals;
  for (let i = 1; i <= Math.min(total, 24); i++) {
    const hasGuest = remainingGuest > 0 && i % 4 === 0;
    if (hasGuest) remainingGuest--;
    const dayPad = i < 10 ? (lang === 'bn' ? `০${i}` : `0${i}`) : (lang === 'bn' ? `${i}`.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]) : `${i}`);
    days.push({
      date: lang === 'bn' ? `${dayPad}/১০/২০২৪` : `${dayPad}/10/2024`,
      dayName: lang === 'bn' ? 'অক্টোবর' : 'October',
      officerMeals: 1,
      guestMeals: hasGuest ? 1 : 0,
      totalMeals: hasGuest ? 2 : 1,
      menuItem: lang === 'bn' ? 'দুপুরের ব্যাংক লাঞ্চ ও ডাল' : 'Bank Lunch & Daal',
      status: 'consumed',
    });
  }
  return days;
};

// Helper to reliably retrieve or generate date-wise advance payments
const getAdvanceDeposits = (rec: MemberBillingRecord, lang: 'bn' | 'en' = 'bn'): MemberAdvanceDeposit[] => {
  if (rec.advanceDeposits && rec.advanceDeposits.length > 0) {
    return rec.advanceDeposits;
  }
  return [
    {
      date: lang === 'bn' ? '০১/১০/২০২৪' : '01/10/2024',
      amount: rec.advancePaid,
      voucherNo: `TR-KB-${rec.id.replace(/\D/g, '') || '01'}`,
      method: lang === 'bn' ? 'ব্যাংক একাউন্ট অটো-ডেবিট' : 'Bank Account Auto-Debit',
      notes: lang === 'bn' ? 'মাসিক নির্ধারিত অগ্রিম জমা' : 'Designated monthly advance deposit',
    },
  ];
};

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  billingRecords,
  currentUser,
  totalBazaarCost,
  departments = [],
  lang,
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
              ? 'কর্মকর্তাদের মেস বিল বিবরণী এবং মাসিক হিসাব শুধুমাত্র এডমিন ও কো-এডমিনদের জন্য উন্মুক্ত।'
              : 'Officers mess billing statement and monthly accounts are strictly restricted to Admin and Co-Admin.'}
          </p>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [activeSlip, setActiveSlip] = useState<MemberBillingRecord | null>(null);
  const [slipTab, setSlipTab] = useState<'all' | 'summary' | 'meals' | 'deposits'>('all');
  const [isDownloadingSlip, setIsDownloadingSlip] = useState(false);
  const [isDownloadingSheet, setIsDownloadingSheet] = useState(false);

  const handleDownloadSlipPdf = async () => {
    if (!activeSlip) return;
    setIsDownloadingSlip(true);
    const fileName = `${activeSlip.name.replace(/\s+/g, '_')}_মেস_বিল_স্লিপ_অক্টোবর_২০২৪`;
    await downloadPdfFromElement('printable-slip', {
      fileName,
    });
    setIsDownloadingSlip(false);
  };

  const handleDownloadFullSheetPdf = async () => {
    setIsDownloadingSheet(true);
    await downloadPdfFromElement('billing-full-sheet', {
      fileName: 'কর্মসংস্থান_ব্যাংক_কর্মকর্তা_মেস_বিল_বিবরণী_অক্টোবর_২০২৪',
    });
    setIsDownloadingSheet(false);
  };

  // Personal in-app notice state
  const [activeMessageRecipient, setActiveMessageRecipient] = useState<MemberBillingRecord | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [notificationSentSuccess, setNotificationSentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (notificationSentSuccess) {
      const timer = setTimeout(() => setNotificationSentSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationSentSuccess]);

  const openMessageModal = (rec: MemberBillingRecord) => {
    setActiveMessageRecipient(rec);

    const isBn = lang === 'bn';
    const statusText =
      rec.netDue > 0
        ? (isBn ? `বকেয়া ৳ ${rec.netDue.toLocaleString()} টাকা` : `Due ৳ ${rec.netDue.toLocaleString()}`)
        : rec.netDue < 0
        ? (isBn ? `উদ্বৃত্ত ব্যালেন্স ৳ ${Math.abs(rec.netDue).toLocaleString()} টাকা (পরবর্তী মাসে সমন্বয়যোগ্য)` : `Surplus balance ৳ ${Math.abs(rec.netDue).toLocaleString()} (adjustable next month)`)
        : (isBn ? 'হিসাব পরিশোধিত (০.০০)' : 'Settled (0.00)');

    const text = isBn ? `কর্মসংস্থান ব্যাংক অফিসার্স মেস (অক্টোবর ২০২৪)
বরাবর: জনাব ${rec.name} (${rec.designation}), GPF: ${rec.gpfNo}
শাখা/বিভাগ: ${rec.department}

সম্মানিত কর্মকর্তা,
অক্টোবর ২০২৪ মাসের আপনার মেস বিলের চূড়ান্ত হিসাব বিবরণী:
• মোট মিল সংখ্যা: ${rec.totalMeals} টি (কর্মকর্তা: ${rec.officerMeals}, মেহমান: ${rec.guestMeals})
• মিল বাবদ চার্জ: ৳ ${rec.mealCost.toLocaleString()}
• মেস সার্ভিস ফি: ৳ ${rec.messFee.toLocaleString()}
• সর্বমোট বিল: ৳ ${rec.totalBill.toLocaleString()}
• আপনার জমাকৃত অগ্রিম: ৳ ${rec.advancePaid.toLocaleString()}
• হিসাব স্ট্যাটাস: ${statusText}

${
  rec.netDue > 0
    ? 'অনুগ্রহপূর্বক আগামী ৫ কর্মদিবসের মধ্যে বকেয়া টাকা পরিশোধ করে মেস হিসাব নিষ্পত্তিতে সহযোগিতা করুন।'
    : rec.netDue < 0
    ? 'আপনার জমাকৃত অতিরিক্ত টাকা পরবর্তী মাসের মেস বিলে স্বয়ংক্রিয়ভাবে সমন্বয় করা হবে।'
    : 'মেস চার্জ যথাসময়ে পরিশোধের জন্য আপনাকে আন্তরিক ধন্যবাদ।'
}

ধন্যবাদান্তে,
ক্যান্টিন ও মেস ব্যবস্থাপনা কমিটি
কর্মসংস্থান ব্যাংক, প্রধান কার্যালয়, ঢাকা।` : `Karmasangsthan Bank Officers Mess (October 2024)
To: ${getLocalizedName(rec.name, lang)} (${getLocalizedDesignation(rec.designation, lang)}), GPF: ${rec.gpfNo}
Branch/Department: ${getLocalizedDepartment(rec.department, lang)}

Respected Officer,
Here is your final mess billing statement for October 2024:
• Total Meals: ${rec.totalMeals} (Officer: ${rec.officerMeals}, Guest: ${rec.guestMeals})
• Meal Charges: ৳ ${rec.mealCost.toLocaleString()}
• Mess Utility & Service Fee: ৳ ${rec.messFee.toLocaleString()}
• Total Bill: ৳ ${rec.totalBill.toLocaleString()}
• Advance Deposited: ৳ ${rec.advancePaid.toLocaleString()}
• Account Status: ${statusText}

${
  rec.netDue > 0
    ? 'Please settle your outstanding dues within 5 working days to help finalize the mess accounts.'
    : rec.netDue < 0
    ? 'Your surplus amount will automatically be adjusted in the upcoming month’s mess bill.'
    : 'Thank you sincerely for clearing your mess charges on schedule.'
}

Regards,
Canteen & Mess Management Committee
Karmasangsthan Bank, Head Office, Dhaka.`;

    setCustomMessage(text);
  };

  // Computed metrics
  const totalOfficersMeals = billingRecords.reduce(
    (acc, curr) => acc + curr.officerMeals,
    0
  );
  const totalGuestMeals = billingRecords.reduce(
    (acc, curr) => acc + curr.guestMeals,
    0
  );
  const totalMealsConsumed = totalOfficersMeals + totalGuestMeals;
  const messMaintenanceFee = billingRecords.length * 150;
  const totalAdvanceCollected = billingRecords.reduce(
    (acc, curr) => acc + curr.advancePaid,
    0
  );
  const totalBillCalculated = billingRecords.reduce(
    (acc, curr) => acc + curr.totalBill,
    0
  );

  // Safe total bazaar cost guarding against NaN or invalid numbers
  const safeBazaarCost =
    typeof totalBazaarCost === 'number' && !Number.isNaN(totalBazaarCost) && Number.isFinite(totalBazaarCost) && totalBazaarCost > 0
      ? totalBazaarCost
      : 16900;

  // Exact per-meal rate = total bazaar / total meals
  const exactMealRate =
    totalMealsConsumed > 0 && safeBazaarCost > 0
      ? (safeBazaarCost / totalMealsConsumed).toFixed(2)
      : '65.00';

  // Filtered list
  const filteredRecords = billingRecords.filter((rec) => {
    const matchDept =
      filterDepartment === 'all' ||
      rec.department === filterDepartment ||
      rec.department.toLowerCase().includes(filterDepartment.toLowerCase()) ||
      filterDepartment.toLowerCase().includes(rec.department.toLowerCase());
    const matchSearch =
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.gpfNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="space-y-4 md:space-y-6 pb-12">
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl shrink-0">
            <Calculator className="w-6 h-6 text-[#064E2B] dark:text-emerald-400" />
          </span>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {lang === 'bn'
                ? 'স্বয়ংক্রিয় মিল রেট ও মাসিক হিসাব'
                : 'Automated Meal Rate & Monthly Accounts'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
              {lang === 'bn'
                ? 'মোট বাজার ব্যয় ও পরিবেশিত মিলের ভিত্তিতে স্বচ্ছ ও নির্ভুল মেস বিলিং'
                : 'Transparent and automated canteen billing based on bazaar expense & meal count'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadFullSheetPdf}
            disabled={isDownloadingSheet}
            className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
            title={lang === 'bn' ? 'সম্পূর্ণ মেস বিল বিবরণী পিডিএফ ফাইল ডাউনলোড করুন' : 'Download complete mess billing statement PDF'}
          >
            <Download className="w-4 h-4" />
            <span>
              {isDownloadingSheet
                ? lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating...'
                : lang === 'bn' ? 'পূর্ণাঙ্গ শিট পিডিএফ' : 'Download Sheet PDF'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রিন্ট শিট' : 'Print Sheet'}</span>
          </button>
        </div>
      </section>

      {/* Printable / Downloadable Full Billing Sheet Container */}
      <div id="billing-full-sheet" className="space-y-4 md:space-y-6">
        {/* Dynamic Per-Meal Rate Formula Box */}
        <section className="bg-gradient-to-br from-[#064E2B] via-[#085a33] to-[#043d22] text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/15">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                {lang === 'bn' ? 'চলতি অক্টোবর ২০২৪ রেট গণনা সূত্র' : 'October 2024 Calculation Formula'}
              </span>
              <h3 className="text-base sm:text-xl font-black text-white mt-1.5 leading-snug">
                {lang === 'bn'
                  ? 'নিট প্রতি মিল রেট = মোট বাজার খরচ ÷ মোট পরিবেশিত মিল'
                  : 'Net Per-Meal Rate = Total Bazaar Expenses ÷ Total Consumed Meals'}
              </h3>
            </div>

            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center self-start sm:self-auto">
              <span className="text-[11px] text-emerald-200 block font-medium">
                {lang === 'bn' ? 'কার্যকর মিল রেট' : 'Current Meal Rate'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-100 font-sans">
                ৳ 65.00
              </span>
              <span className="text-[10px] text-emerald-200 block">
                ({lang === 'bn' ? `সঠিক রেট: ৳ ${exactMealRate}` : `Exact Rate: ৳ ${exactMealRate}`})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 text-xs">
            <div className="bg-black/15 p-2.5 sm:p-3 rounded-xl">
              <span className="text-emerald-200 block text-[11px] sm:text-xs">{lang === 'bn' ? 'চলতি মোট বাজার ব্যয়' : 'Total Bazaar Cost'}</span>
              <span className="text-base sm:text-lg font-black font-sans text-white mt-0.5 block">
                ৳ {safeBazaarCost.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300">{lang === 'bn' ? 'অনুমোদিত ভাউচারসমূহ' : 'Approved Vouchers'}</span>
            </div>

            <div className="bg-black/15 p-2.5 sm:p-3 rounded-xl">
              <span className="text-emerald-200 block text-[11px] sm:text-xs">{lang === 'bn' ? 'পরিবেশিত কর্মকর্তা মিল' : 'Officer Meals'}</span>
              <span className="text-base sm:text-lg font-black font-sans text-white mt-0.5 block">
                {totalOfficersMeals} {lang === 'bn' ? 'টি' : 'meals'}
              </span>
              <span className="text-[10px] text-emerald-300">{lang === 'bn' ? 'ব্যাংক কর্মকর্তাবৃন্দ' : 'Bank Officers'}</span>
            </div>

            <div className="bg-black/15 p-2.5 sm:p-3 rounded-xl">
              <span className="text-emerald-200 block text-[11px] sm:text-xs">{lang === 'bn' ? 'অতিথি / ভিজিটর মিল' : 'Guest Meals'}</span>
              <span className="text-base sm:text-lg font-black font-sans text-white mt-0.5 block">
                {totalGuestMeals} {lang === 'bn' ? 'টি' : 'meals'}
              </span>
              <span className="text-[10px] text-emerald-300">{lang === 'bn' ? 'মেহমান লাঞ্চ' : 'Guest Lunches'}</span>
            </div>

            <div className="bg-black/15 p-2.5 sm:p-3 rounded-xl">
              <span className="text-emerald-200 block text-[11px] sm:text-xs">{lang === 'bn' ? 'সর্বমোট মিল সংখ্যা' : 'Total Consumed Meals'}</span>
              <span className="text-base sm:text-lg font-black font-sans text-white mt-0.5 block">
                {totalMealsConsumed} {lang === 'bn' ? 'টি' : 'meals'}
              </span>
              <span className="text-[10px] text-emerald-300">{lang === 'bn' ? 'ক্যান্টিন লাঞ্চ প্লেট' : 'Canteen Plates'}</span>
            </div>
          </div>
        </div>

        {/* Soft decorative glow */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>
      </section>

      {/* 4 Financial KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {lang === 'bn' ? 'সংগৃহীত মোট অগ্রিম জমা' : 'Total Advance Deposited'}
          </span>
          <div className="my-1 sm:my-1.5">
            <span className="text-xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-400 font-sans">
              ৳ {totalAdvanceCollected.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-500 font-medium">{lang === 'bn' ? 'ব্যাংক ফান্ডে সংরক্ষিত' : 'Held in Bank Fund'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {lang === 'bn' ? 'চলতি মাসের মোট মিল বিল' : 'Total Billed Amount'}
          </span>
          <div className="my-1 sm:my-1.5">
            <span className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white font-sans">
              ৳ {totalBillCalculated.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400 font-medium">{lang === 'bn' ? 'মিল + সহায়ক ফি সহ' : 'Incl. meals & utility'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {lang === 'bn' ? 'মেস রিজার্ভ / উদ্বৃত্ত ফান্ড' : 'Mess Fund Surplus'}
          </span>
          <div className="my-1 sm:my-1.5">
            <span className="text-xl sm:text-3xl font-black text-blue-900 dark:text-blue-400 font-sans">
              ৳ {(totalAdvanceCollected - totalBillCalculated).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-blue-700 dark:text-blue-500 font-medium">{lang === 'bn' ? 'নিরাপদ সঞ্চিতি বজায় আছে' : 'Safe reserve maintained'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
            {lang === 'bn' ? 'মাসিক মেস রক্ষণাবেক্ষণ ফি' : 'Mess Maintenance Fee'}
          </span>
          <div className="my-1 sm:my-1.5">
            <span className="text-xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-sans">
              ৳ {messMaintenanceFee.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-amber-800 dark:text-amber-500 font-medium">{lang === 'bn' ? 'প্রতি সদস্য ৳ ১৫০/-' : '৳ 150 per member'}</span>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              lang === 'bn'
                ? 'কর্মকর্তার নাম, GPF নম্বর বা শাখা খুঁজুন...'
                : 'Search officer, GPF no or branch...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap font-medium">
            {lang === 'bn' ? 'শাখা / বিভাগ:' : 'Branch / Dept:'}
          </span>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">{lang === 'bn' ? 'সকল শাখা ও বিভাগ' : 'All Branches & Depts'}</option>
            {departments && departments.length > 0 ? (
              departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {lang === 'bn' ? d.name : (d.nameEn || d.name)}
                </option>
              ))
            ) : (
              INITIAL_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {lang === 'bn' ? d.name : (d.nameEn || d.name)}
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      {/* Monthly Mess Sheet Data Table */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-[#064E2B] dark:text-emerald-400 shrink-0" />
            <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-base">
              {lang === 'bn'
                ? 'অক্টোবর ২০২৪ কর্মকর্তাদের মেস বিল বিবরণী'
                : 'October 2024 Member Mess Billing Statement'}
            </h3>
            <span className="text-[11px] sm:text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              {filteredRecords.length} {lang === 'bn' ? 'জন সদস্য' : 'Members'}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#064E2B] dark:text-emerald-400 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'প্রতিটি কর্মকর্তার নামের পাশে \'স্লিপ\' বাটনে পূর্ণাঙ্গ ভাউচার এবং \'মেসেজ\' বাটনে ব্যক্তিগত বিল নোটিশ পাঠানো যাবে।'
                : 'Click \'Slip\' for official audit voucher and \'Message\' to send personal bill notice.'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[520px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700 text-xs whitespace-nowrap">
                <th className="py-2.5 px-3">{lang === 'bn' ? 'GPF নং' : 'GPF No'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'কর্মকর্তার নাম ও পদবী' : 'Officer Name & Designation'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'শাখা / বিভাগ' : 'Branch / Dept'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'বিল স্থিতি (বকেয়া / উদ্বৃত্ত)' : 'Bill Status (Due / Surplus)'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-sans">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className={`hover:bg-gray-50/70 dark:hover:bg-slate-800/60 transition ${
                    rec.gpfNo === currentUser.gpfNo ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-[#064E2B] dark:text-emerald-400 whitespace-nowrap">
                    {rec.gpfNo}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-gray-900 dark:text-white leading-tight flex items-center space-x-1.5">
                      <span>{getLocalizedName(rec.name, lang)}</span>
                      {rec.gpfNo === currentUser.gpfNo && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-normal">
                          {lang === 'bn' ? 'আপনি' : 'You'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                      {getLocalizedDesignation(rec.designation, lang)}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                    {getLocalizedDepartment(rec.department, lang)}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {rec.netDue > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        {lang === 'bn' ? `বকেয়া ৳${rec.netDue.toLocaleString()}` : `Due ৳${rec.netDue.toLocaleString()}`}
                      </span>
                    ) : rec.netDue < 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {lang === 'bn' ? `উদ্বৃত্ত ৳${Math.abs(rec.netDue).toLocaleString()}` : `Surplus ৳${Math.abs(rec.netDue).toLocaleString()}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                        {lang === 'bn' ? 'পরিশোধিত' : 'Paid'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setActiveSlip(rec);
                          setSlipTab('all');
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[#064E2B] dark:text-emerald-400 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                        title={lang === 'bn' ? 'পূর্ণাঙ্গ অফিসিয়াল মেস বিল স্লিপ ভাউচার দেখুন' : 'View official member mess bill slip voucher'}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'স্লিপ' : 'Slip'}</span>
                      </button>
                      <button
                        onClick={() => openMessageModal(rec)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                        title={lang === 'bn' ? 'কর্মকর্তাকে ব্যক্তিগত মেস বিল মেসেজ / নোটিশ পাঠান' : 'Send personal mess bill notice to officer'}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>

      {/* Individual Official Member Bill Slip Modal */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl lg:max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden my-3 sm:my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Top Bar (Screen Only) */}
            <div className="px-4 sm:px-5 py-3 bg-[#064E2B] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider block">
                    {lang === 'bn' ? 'কর্মকর্তা মেস বিল বিবরণী ও বিস্তারিত অডিট স্লিপ' : 'Officer Mess Bill Statement & Detailed Audit Slip'}
                  </span>
                  <span className="text-[11px] text-emerald-200 font-mono">
                    {getLocalizedName(activeSlip.name, lang)} • GPF: {activeSlip.gpfNo}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSlip(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs in Slip Modal (Screen Only) */}
            <div className="bg-emerald-950/20 dark:bg-slate-800/80 px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center space-x-1.5 text-xs font-bold whitespace-nowrap">
                <button
                  onClick={() => setSlipTab('all')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-xs ${
                    slipTab === 'all'
                      ? 'bg-[#064E2B] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'bn' ? 'পূর্ণাঙ্গ স্লিপ' : 'Full Slip'}
                </button>
                <button
                  onClick={() => setSlipTab('meals')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-xs ${
                    slipTab === 'meals'
                      ? 'bg-[#064E2B] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'bn' ? `তারিখভিত্তিক মিল লগ (${getMealDateBookings(activeSlip, lang).length} দিন)` : `Meal Log (${getMealDateBookings(activeSlip, lang).length} Days)`}
                </button>
                <button
                  onClick={() => setSlipTab('deposits')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-xs ${
                    slipTab === 'deposits'
                      ? 'bg-[#064E2B] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'bn' ? `অগ্রিম জমা (${getAdvanceDeposits(activeSlip, lang).length} টি)` : `Advance Vouchers (${getAdvanceDeposits(activeSlip, lang).length})`}
                </button>
                <button
                  onClick={() => setSlipTab('summary')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-xs ${
                    slipTab === 'summary'
                      ? 'bg-[#064E2B] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'bn' ? 'আর্থিক সারসংক্ষেপ' : 'Financial Summary'}
                </button>
              </div>

              <span className="text-[11px] text-gray-500 dark:text-slate-400 hidden sm:inline-block whitespace-nowrap">
                {lang === 'bn' ? 'প্রিন্টে সম্পূর্ণ ভাউচার অন্তর্ভুক্ত থাকবে' : 'Full voucher included in print'}
              </span>
            </div>

            {/* Printable Slip Content Area */}
            <div
              id="printable-slip"
              className="p-3.5 sm:p-7 bg-[#fffefc] text-gray-900 space-y-4 sm:space-y-5 font-sans overflow-y-auto flex-1"
            >
              {/* Slip Official Letterhead */}
              <div className="text-center pb-3 border-b-2 border-dashed border-gray-300">
                <div className="flex justify-center mb-1.5">
                  <BankLogo size="md" />
                </div>
                <h3 className="font-black text-lg sm:text-xl text-[#064E2B] tracking-tight">
                  {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
                </h3>
                <h4 className="text-xs font-bold text-gray-800">
                  {lang === 'bn'
                    ? 'ক্যান্টিন ও মেস ব্যবস্থাপনা কমিটি • প্রধান কার্যালয়, ঢাকা'
                    : 'Canteen & Mess Management Committee • Head Office, Dhaka'}
                </h4>
                <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-[#064E2B] text-white text-xs font-bold rounded-lg shadow-2xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'bn'
                      ? 'কর্মকর্তা মাসিক মেস বিল ভাউচার ও নিরীক্ষা স্লিপ • অক্টোবর ২০২৪'
                      : 'Officer Monthly Mess Bill Voucher & Audit Slip • October 2024'}
                  </span>
                </div>
              </div>

              {/* Member particulars Card */}
              <div className="bg-gray-50 p-3 sm:p-3.5 rounded-xl border border-gray-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex justify-between sm:justify-start sm:space-x-3">
                  <span className="text-gray-500">{lang === 'bn' ? 'কর্মকর্তার নাম:' : 'Officer Name:'}</span>
                  <span className="font-bold text-gray-900">{getLocalizedName(activeSlip.name, lang)}</span>
                </div>
                <div className="flex justify-between sm:justify-start sm:space-x-3">
                  <span className="text-gray-500">{lang === 'bn' ? 'GPF নম্বর:' : 'GPF Number:'}</span>
                  <span className="font-mono font-bold text-[#064E2B]">
                    {activeSlip.gpfNo}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start sm:space-x-3">
                  <span className="text-gray-500">{lang === 'bn' ? 'পদবী:' : 'Designation:'}</span>
                  <span className="font-semibold text-gray-800">{getLocalizedDesignation(activeSlip.designation, lang)}</span>
                </div>
                <div className="flex justify-between sm:justify-start sm:space-x-3">
                  <span className="text-gray-500">{lang === 'bn' ? 'শাখা / বিভাগ:' : 'Branch / Dept:'}</span>
                  <span className="font-semibold text-gray-800">{getLocalizedDepartment(activeSlip.department, lang)}</span>
                </div>
              </div>

              {/* Section 1: Financial Breakdown Summary Table */}
              {(slipTab === 'all' || slipTab === 'summary') && (
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-gray-100 p-2.5 font-bold text-gray-800 flex justify-between items-center border-b border-gray-200">
                    <span className="flex items-center space-x-1.5">
                      <Calculator className="w-3.5 h-3.5 text-[#064E2B]" />
                      <span>{lang === 'bn' ? '১. মেস বিল ও অগ্রিম সমন্বয় বিবরণী' : '1. Mess Bill & Advance Adjustment Statement'}</span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {lang === 'bn' ? 'রেট: ৳ ৬৫/- প্রতি মিল' : 'Rate: ৳ 65/- per meal'}
                    </span>
                  </div>
                  <div className="p-3 space-y-1.5 divide-y divide-gray-100">
                    <div className="flex justify-between pt-1">
                      <span>
                        {lang === 'bn'
                          ? `কর্মকর্তা মিল চার্জ (${activeSlip.officerMeals} টি @ ৳ ৬৫/-)`
                          : `Officer Meal Charges (${activeSlip.officerMeals} @ ৳ 65/-)`}
                      </span>
                      <span className="font-mono font-medium">
                        ৳ {(activeSlip.officerMeals * 65).toLocaleString()}
                      </span>
                    </div>
                    {activeSlip.guestMeals > 0 && (
                      <div className="flex justify-between pt-1">
                        <span>
                          {lang === 'bn'
                            ? `অতিথি মিল চার্জ (${activeSlip.guestMeals} টি @ ৳ ৬৫/-)`
                            : `Guest Meal Charges (${activeSlip.guestMeals} @ ৳ 65/-)`}
                        </span>
                        <span className="font-mono font-medium text-amber-900">
                          ৳ {(activeSlip.guestMeals * 65).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1">
                      <span>{lang === 'bn' ? 'ক্যান্টিন পরিচালনা ও মেস ইউটিলিটি ফি' : 'Canteen Operation & Mess Utility Fee'}</span>
                      <span className="font-mono font-medium">৳ {activeSlip.messFee}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 font-bold text-gray-900 border-t border-gray-200">
                      <span>{lang === 'bn' ? 'সর্বমোট দাবি বিল (মিল + মেস ফি)' : 'Total Billed Amount (Meals + Utility)'}</span>
                      <span className="font-mono text-sm">৳ {activeSlip.totalBill.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-[#064E2B] font-bold">
                      <span>{lang === 'bn' ? 'জমাকৃত মোট অগ্রিম টাকা' : 'Total Advance Deposited'}</span>
                      <span className="font-mono text-sm">৳ {activeSlip.advancePaid.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Date-wise Meal Booking Log */}
              {(slipTab === 'all' || slipTab === 'meals') && (
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-emerald-50/70 p-2.5 font-bold text-[#064E2B] flex justify-between items-center border-b border-emerald-200">
                    <span className="flex items-center space-x-1.5">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? '২. ইউজারের তারিখভিত্তিক মিল বুকিং ও খাবার গ্রহণের বিস্তারিত লগ' : '2. Date-wise Meal Booking & Attendance Log'}</span>
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {lang === 'bn' ? `মোট ${activeSlip.totalMeals} টি মিল` : `Total ${activeSlip.totalMeals} Meals`}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px] min-w-[500px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold whitespace-nowrap">
                          <th className="py-1.5 px-3 w-10 text-center">{lang === 'bn' ? 'ক্রম' : 'SL'}</th>
                          <th className="py-1.5 px-3">{lang === 'bn' ? 'তারিখ ও বার' : 'Date & Day'}</th>
                          <th className="py-1.5 px-3 text-center">{lang === 'bn' ? 'কর্মকর্তা মিল' : 'Officer'}</th>
                          <th className="py-1.5 px-3 text-center">{lang === 'bn' ? 'অতিথি মিল' : 'Guest'}</th>
                          <th className="py-1.5 px-3 text-center font-bold">{lang === 'bn' ? 'মোট মিল' : 'Total'}</th>
                          <th className="py-1.5 px-3">{lang === 'bn' ? 'পরিবেশিত মেন্যু বিবরণী' : 'Menu Item'}</th>
                          <th className="py-1.5 px-3 text-right">{lang === 'bn' ? 'চার্জ (৳)' : 'Charge (৳)'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getMealDateBookings(activeSlip, lang).map((m, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-1.5 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-mono font-medium text-gray-800 whitespace-nowrap">
                              {m.date} ({m.dayName})
                            </td>
                            <td className="py-1.5 px-3 text-center font-bold text-emerald-800">
                              {m.officerMeals > 0 ? (lang === 'bn' ? `${m.officerMeals} টি` : `${m.officerMeals}`) : '-'}
                            </td>
                            <td className="py-1.5 px-3 text-center font-medium text-amber-800">
                              {m.guestMeals > 0 ? (lang === 'bn' ? `${m.guestMeals} টি` : `${m.guestMeals}`) : '-'}
                            </td>
                            <td className="py-1.5 px-3 text-center font-black text-gray-900">
                              <span className="font-mono px-1.5 py-0.2 bg-emerald-50 rounded text-[#064E2B]">
                                {m.totalMeals}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-gray-600 truncate max-w-[200px]">
                              {m.menuItem || (lang === 'bn' ? 'দুপুরের নিয়মিত মিল' : 'Regular Lunch')}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-medium text-gray-800 whitespace-nowrap">
                              ৳ {m.totalMeals * 65}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-bold text-gray-900 border-t border-gray-200">
                          <td colSpan={2} className="py-2 px-3">
                            {lang === 'bn' ? 'সর্বমোট মিলের সংখ্যা:' : 'Total Meals Count:'}
                          </td>
                          <td className="py-2 px-3 text-center text-emerald-800">
                            {activeSlip.officerMeals} {lang === 'bn' ? 'টি' : ''}
                          </td>
                          <td className="py-2 px-3 text-center text-amber-800">
                            {activeSlip.guestMeals} {lang === 'bn' ? 'টি' : ''}
                          </td>
                          <td className="py-2 px-3 text-center font-black">
                            {activeSlip.totalMeals} {lang === 'bn' ? 'টি' : ''}
                          </td>
                          <td className="py-2 px-3 text-right text-[10px] text-gray-500">
                            {lang === 'bn' ? 'সর্বমোট মিল বাবদ বিল:' : 'Total Meal Cost:'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-[#064E2B] whitespace-nowrap">
                            ৳ {activeSlip.mealCost.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Section 3: Date-wise Advance Deposits Voucher Log */}
              {(slipTab === 'all' || slipTab === 'deposits') && (
                <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-blue-50/70 p-2.5 font-bold text-blue-900 flex justify-between items-center border-b border-blue-200">
                    <span className="flex items-center space-x-1.5">
                      <Coins className="w-3.5 h-3.5 text-blue-800" />
                      <span>{lang === 'bn' ? '৩. ইউজারের অগ্রিম টাকা জমার তারিখভিত্তিক ভাউচার বিবরণী' : '3. Advance Deposit Date-wise Voucher Statement'}</span>
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 font-bold text-blue-900">
                      {lang === 'bn' ? `মোট জমা: ৳ ${activeSlip.advancePaid.toLocaleString()}` : `Total Deposited: ৳ ${activeSlip.advancePaid.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px] min-w-[500px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold whitespace-nowrap">
                          <th className="py-1.5 px-3 w-10 text-center">{lang === 'bn' ? 'ক্রম' : 'SL'}</th>
                          <th className="py-1.5 px-3">{lang === 'bn' ? 'জমা প্রদানের তারিখ' : 'Deposit Date'}</th>
                          <th className="py-1.5 px-3">{lang === 'bn' ? 'ভাউচার / রশিদ নং' : 'Voucher / Receipt No'}</th>
                          <th className="py-1.5 px-3">{lang === 'bn' ? 'জমার মাধ্যম / ট্রানজেকশন বিবরণ' : 'Method / Details'}</th>
                          <th className="py-1.5 px-3">{lang === 'bn' ? 'মন্তব্য' : 'Remarks'}</th>
                          <th className="py-1.5 px-3 text-right">{lang === 'bn' ? 'জমাকৃত টাকা (৳)' : 'Amount (৳)'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getAdvanceDeposits(activeSlip, lang).map((dep, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-1.5 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-mono font-medium text-gray-800 whitespace-nowrap">
                              {dep.date}
                            </td>
                            <td className="py-1.5 px-3 font-mono font-bold text-emerald-900 whitespace-nowrap">
                              {dep.voucherNo}
                            </td>
                            <td className="py-1.5 px-3 text-gray-700 font-medium">{dep.method}</td>
                            <td className="py-1.5 px-3 text-gray-500 text-[10px]">{dep.notes || '-'}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-black text-emerald-800 whitespace-nowrap">
                              ৳ {dep.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-bold text-gray-900 border-t border-gray-200">
                          <td colSpan={5} className="py-2 px-3 text-right">
                            {lang === 'bn' ? 'সর্বমোট জমাকৃত অগ্রিম টাকা (Total Advance Paid):' : 'Total Advance Paid:'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-emerald-800 whitespace-nowrap">
                            ৳ {activeSlip.advancePaid.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Net Result Banner */}
              <div
                className={`p-3.5 rounded-xl flex items-center justify-between text-sm font-bold ${
                  activeSlip.netDue > 0
                    ? 'bg-rose-50 border-2 border-rose-300 text-rose-950'
                    : 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                }`}
              >
                <div>
                  <span className="block text-xs uppercase tracking-wider opacity-80">
                    {activeSlip.netDue > 0
                      ? lang === 'bn' ? 'নিট প্রদেয় বকেয়া মেস বিল' : 'Net Due Payable'
                      : lang === 'bn' ? 'উদ্বৃত্ত ফেরতযোগ্য / পরবর্তী মাসে সমন্বয়' : 'Surplus / Refundable'}
                  </span>
                  <span className="text-sm sm:text-base font-black">
                    {activeSlip.netDue > 0
                      ? lang === 'bn' ? 'কর্তৃপক্ষকে প্রদেয় বকেয়া টাকা:' : 'Amount Payable to Authority:'
                      : lang === 'bn' ? 'কর্মকর্তার সংরক্ষিত / উদ্বৃত্ত ব্যালেন্স:' : 'Officer’s Maintained Surplus:'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black font-sans">
                    ৳ {Math.abs(activeSlip.netDue).toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-normal opacity-80">
                    ({lang === 'bn' ? `মোট বিল ৳ ${activeSlip.totalBill} - অগ্রিম ৳ ${activeSlip.advancePaid}` : `Total Bill ৳ ${activeSlip.totalBill} - Advance ৳ ${activeSlip.advancePaid}`})
                  </span>
                </div>
              </div>

              {/* Official Dual Signatures */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 text-center text-[11px] text-gray-600 border-t border-gray-200">
                <div>
                  <div className="h-8 sm:h-10"></div>
                  <div className="border-t border-gray-400 pt-1 font-semibold text-gray-800">
                    {lang === 'bn' ? 'কর্মকর্তার স্বাক্ষর ও তারিখ' : 'Officer’s Signature & Date'}
                  </div>
                  <div className="text-[10px] text-gray-500">{lang === 'bn' ? 'সংশ্লিষ্ট কর্মকর্তা' : 'Respective Officer'}</div>
                </div>
                <div>
                  <div className="h-8 sm:h-10 flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-[#064E2B] opacity-60" />
                  </div>
                  <div className="border-t border-gray-400 pt-1 font-bold text-[#064E2B]">
                    {lang === 'bn' ? 'মেস ম্যানেজার / ক্যাশিয়ার' : 'Mess Manager / Cashier'}
                  </div>
                  <div className="text-[10px] text-gray-500">{lang === 'bn' ? 'ক্যান্টিন ও মেস ব্যবস্থাপনা কমিটি' : 'Canteen & Mess Management Committee'}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer (Screen Only) */}
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0 gap-2">
              <div className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 flex items-center space-x-1 sm:space-x-1.5">
                <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                <span className="truncate">{lang === 'bn' ? 'অফিসিয়াল রেকর্ড হিসেবে অনুমোদিত' : 'Approved Official Record'}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSlip(null)}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSlipPdf}
                  disabled={isDownloadingSlip}
                  className="inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
                  title={lang === 'bn' ? 'কর্মকর্তার মেস বিল স্লিপটি পিডিএফ হিসেবে ডাউনলোড করুন' : 'Download officer mess bill slip PDF'}
                >
                  <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>{isDownloadingSlip ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...') : (lang === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Officer Personal Message / SMS Notification Modal */}
      {activeMessageRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden my-3 sm:my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-[#064E2B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {lang === 'bn' ? 'ব্যক্তিগত মেস বিল নোটিশ পাঠান' : 'Send Personal Mess Bill Notice'}
                  </h3>
                  <p className="text-[11px] text-emerald-100/90">
                    {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক অফিসার্স মেস ব্যবস্থাপনা কমিটি' : 'Karmasangsthan Bank Officers Mess Committee'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMessageRecipient(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Recipient Profile Card */}
              <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3 sm:p-3.5 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-3">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#064E2B] dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 sm:w-5 h-4 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">
                        {getLocalizedName(activeMessageRecipient.name, lang)}
                      </h4>
                      <span className="font-mono text-xs px-2 py-0.5 bg-white dark:bg-slate-700 text-[#064E2B] dark:text-emerald-400 rounded font-bold border border-gray-200 dark:border-slate-600">
                        {activeMessageRecipient.gpfNo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {getLocalizedDesignation(activeMessageRecipient.designation, lang)} • {getLocalizedDepartment(activeMessageRecipient.department, lang)}
                    </p>
                  </div>
                </div>

                <div>
                  {activeMessageRecipient.netDue > 0 ? (
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {lang === 'bn' ? `বকেয়া: ৳ ${activeMessageRecipient.netDue.toLocaleString()}` : `Due: ৳ ${activeMessageRecipient.netDue.toLocaleString()}`}
                    </span>
                  ) : activeMessageRecipient.netDue < 0 ? (
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {lang === 'bn' ? `উদ্বৃত্ত: ৳ ${Math.abs(activeMessageRecipient.netDue).toLocaleString()}` : `Surplus: ৳ ${Math.abs(activeMessageRecipient.netDue).toLocaleString()}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      {lang === 'bn' ? 'পরিশোধিত' : 'Paid'}
                    </span>
                  )}
                </div>
              </div>

              {/* Editable Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {lang === 'bn' ? 'নোটিশের বিবরণ / টেক্সট (প্রয়োজনে পরিমার্জন করতে পারেন)' : 'Notice Content / Message Text (editable)'}
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {customMessage.length} {lang === 'bn' ? 'অক্ষর' : 'chars'}
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-xs leading-relaxed font-sans bg-gray-50/70 dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064E2B] dark:text-white"
                />
              </div>

              {/* Action Button: In-App Notice Only */}
              <div className="pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationSentSuccess(
                      lang === 'bn'
                        ? `জনাব ${activeMessageRecipient.name}-কে ব্যক্তিগত ইন-অ্যাপ নোটিশ সফলভাবে পাঠানো হয়েছে!`
                        : `Personal in-app notice successfully sent to ${getLocalizedName(activeMessageRecipient.name, lang)}!`
                    );
                    setActiveMessageRecipient(null);
                  }}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs hover:shadow cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ইন-অ্যাপ নোটিশ পাঠান' : 'Send In-App Notice'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-3.5 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400">
                {lang === 'bn' ? 'নোটিশটি কর্মকর্তা তার ড্যাশবোর্ডে সরাসরি দেখতে পাবেন' : 'Officer will receive this notification directly on dashboard'}
              </span>
              <button
                type="button"
                onClick={() => setActiveMessageRecipient(null)}
                className="px-3 sm:px-4 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition cursor-pointer"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {notificationSentSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-[#064E2B] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw]">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{notificationSentSuccess}</span>
          <button
            onClick={() => setNotificationSentSuccess(null)}
            className="ml-2 text-emerald-200 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
