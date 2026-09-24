import React, { useState, useMemo } from 'react';
import { LedgerItem, UserProfile } from '../types';
import {
  CreditCard,
  PlusCircle,
  Download,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  Receipt,
  Utensils,
  Calendar,
  CheckCircle2,
  Printer,
  FileText,
  User,
  Building,
} from 'lucide-react';
import { toBnDigits } from '../utils/localization';
import { downloadPdfFromElement } from '../utils/pdfExport';

interface LedgerScreenProps {
  currentUser: UserProfile;
  ledger: LedgerItem[];
  advanceBalance: number;
  onAddDeposit: (amount: number, desc: string) => void;
  lang: 'bn' | 'en';
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  currentUser,
  ledger,
  advanceBalance,
  onAddDeposit,
  lang,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'charge' | 'refund'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [depositDesc, setDepositDesc] = useState(
    lang === 'bn' ? 'ব্যাংক একাউন্ট ট্রান্সফার মাধ্যমে জমা' : 'Deposit via Bank Account Transfer'
  );
  const [isExporting, setIsExporting] = useState(false);

  // Quick preset deposit methods
  const depositPresets = [
    { label: lang === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer', val: lang === 'bn' ? 'ব্যাংক অ্যাকাউন্ট ট্রান্সফার' : 'Bank Account Transfer' },
    { label: lang === 'bn' ? 'ক্যাশ কাউন্টারে জমা' : 'Cash Deposit', val: lang === 'bn' ? 'ক্যাশ কাউন্টারে নগদ জমা' : 'Cash at Counter' },
    { label: lang === 'bn' ? 'বিকাশ / অনলাইন' : 'bKash / Online', val: lang === 'bn' ? 'বিকাশ / ডিজিটাল পেমেন্ট' : 'bKash / Digital Payment' },
  ];

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      onAddDeposit(amt, depositDesc.trim() || (lang === 'bn' ? 'নগদ জমা' : 'Deposit'));
      setShowAddForm(false);
      setDepositAmount('1000');
    }
  };

  // Filtered ledger list
  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const descToMatch = `${item.description} ${item.descriptionEn || ''} ${item.ref} ${item.date}`.toLowerCase();
      const matchesSearch = !searchQuery || descToMatch.includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [ledger, filterType, searchQuery]);

  // Aggregate stats
  const totalDeposited = useMemo(() => {
    return ledger
      .filter((i) => i.type === 'deposit')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [ledger]);

  const totalCharged = useMemo(() => {
    return ledger
      .filter((i) => i.type === 'charge')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [ledger]);

  const handlePrintOrPdf = async () => {
    setIsExporting(true);
    await downloadPdfFromElement('personal-ledger-statement-area', {
      fileName:
        lang === 'bn'
          ? `কর্মকর্তা_খাবার_লেজার_${currentUser.gpfNo}`
          : `Officer_Meal_Ledger_${currentUser.gpfNo}`,
    });
    setIsExporting(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800 shadow-2xs">
            <CreditCard className="w-6 h-6 text-[#064E2B] dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'ব্যক্তিগত জমা-খরচের খাতা (লেজার)' : 'Personal Deposit & Expense Ledger'}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {lang === 'bn' ? 'অফিসিয়াল খতিয়ান' : 'Official Ledger'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn'
                ? `কর্মকর্তা: ${currentUser.name} (${currentUser.designation}) • জিপিএফ নং: ${currentUser.gpfNo}`
                : `Officer: ${currentUser.nameEn || currentUser.name} (${currentUser.designationEn || currentUser.designation}) • GPF: ${currentUser.gpfNo}`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintOrPdf}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
            title={lang === 'bn' ? 'লেজার খতিয়ান পিডিএফ আকারে সংরক্ষণ করুন' : 'Export Ledger PDF'}
          >
            <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>
              {isExporting
                ? lang === 'bn' ? 'পিডিএফ হচ্ছে...' : 'Generating...'
                : lang === 'bn' ? 'লেজার স্টেটমেন্ট PDF' : 'Statement PDF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#064E2B] hover:bg-[#085a33] text-white shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'bn' ? '+ টাকা জমা করুন' : '+ Add Deposit'}</span>
          </button>
        </div>
      </section>

      {/* Aggregate Financial Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Available Balance */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-slate-900 rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {lang === 'bn' ? 'বর্তমান অবশিষ্ট ব্যালেন্স' : 'Current Available Balance'}
            </span>
            <span className="p-1.5 bg-emerald-200/60 dark:bg-emerald-900/60 rounded-lg text-emerald-800 dark:text-emerald-200">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100 font-sans tracking-tight">
              ৳ {lang === 'bn' ? toBnDigits(advanceBalance.toLocaleString()) : advanceBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              {advanceBalance >= 500
                ? lang === 'bn' ? '✓ খাবার বুকিংয়ের জন্য পর্যাপ্ত স্থিতি রয়েছে' : '✓ Sufficient balance for bookings'
                : lang === 'bn' ? '⚠ ব্যালেন্স কম, নতুন জমা দেওয়ার অনুরোধ করা যাচ্ছে' : '⚠ Low balance, please add deposit'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Deposited */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-400">
              {lang === 'bn' ? 'মোট অগ্রিম জমা (ক্রেডিট)' : 'Total Deposits (Credit)'}
            </span>
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-blue-200 font-sans tracking-tight">
              ৳ {lang === 'bn' ? toBnDigits(totalDeposited.toLocaleString()) : totalDeposited.toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-1">
              {lang === 'bn' ? 'চলতি চক্রের সকল জমা' : 'All deposits in current cycle'}
            </p>
          </div>
        </div>

        {/* Card 3: Total Meal Charges */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-400">
              {lang === 'bn' ? 'মোট খাবার খরচ কর্তন (ডেবিট)' : 'Total Meal Charges (Debit)'}
            </span>
            <span className="p-1.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-300 font-sans tracking-tight">
              ৳ {lang === 'bn' ? toBnDigits(totalCharged.toLocaleString()) : totalCharged.toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-1">
              {lang === 'bn' ? 'অনুমোদিত মিল অনুযায়ী কর্তিত' : 'Deducted as per booked meals'}
            </p>
          </div>
        </div>

        {/* Card 4: Total Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-400">
              {lang === 'bn' ? 'মোট লেনদেন এন্ট্রি' : 'Total Ledger Entries'}
            </span>
            <span className="p-1.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-sans tracking-tight">
              {lang === 'bn' ? toBnDigits(ledger.length) : ledger.length} {lang === 'bn' ? 'টি' : 'records'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-1">
              {lang === 'bn' ? 'স্বচ্ছ খতিয়ান ও অডিট রেকর্ড' : 'Transparent audit trail'}
            </p>
          </div>
        </div>
      </section>

      {/* Add Deposit Expandable Form */}
      {showAddForm && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-emerald-600/60 dark:border-emerald-500/60 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {lang === 'bn' ? 'ক্যান্টিন ফান্ডে নতুন টাকা জমা প্রদান' : 'Add Deposit to Canteen Fund'}
              </h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold"
            >
              {lang === 'bn' ? 'বন্ধ করুন ✕' : 'Close ✕'}
            </button>
          </div>

          <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'টাকার পরিমাণ (৳)*' : 'Amount (৳)*'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    min="50"
                    step="50"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-hidden"
                    placeholder="1000"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                    {lang === 'bn' ? 'দ্রুত নির্বাচন:' : 'Quick Select:'}
                  </span>
                  {[500, 1000, 2000, 3000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(String(amt))}
                      className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-gray-700 dark:text-slate-300 hover:text-emerald-700 border border-gray-200 dark:border-slate-700 cursor-pointer"
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'জমার মাধ্যম / ট্রানজেকশন বিবরণ*' : 'Payment Method / Notes*'}
                </label>
                <input
                  type="text"
                  required
                  value={depositDesc}
                  onChange={(e) => setDepositDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-hidden"
                  placeholder={lang === 'bn' ? 'যেমন: ব্যাংক একাউন্ট ডেবিট / ভাউচার নং...' : 'e.g. Bank Account Transfer / Voucher...'}
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {depositPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDepositDesc(preset.val)}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                {lang === 'bn' ? 'জমা নিশ্চিত করুন' : 'Confirm Deposit'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter and Search Bar */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#064E2B] text-white shadow-2xs'
                : 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100'
            }`}
          >
            {lang === 'bn' ? 'সকল লেনদেন' : 'All Transactions'} ({ledger.length})
          </button>
          <button
            onClick={() => setFilterType('deposit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              filterType === 'deposit'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100'
            }`}
          >
            {lang === 'bn' ? 'জমা সমূহ (Credit)' : 'Deposits'}
          </button>
          <button
            onClick={() => setFilterType('charge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              filterType === 'charge'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100'
            }`}
          >
            {lang === 'bn' ? 'মিল চার্জ (Debit)' : 'Meal Charges'}
          </button>
          <button
            onClick={() => setFilterType('refund')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              filterType === 'refund'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100'
            }`}
          >
            {lang === 'bn' ? 'সমন্বয় / ফেরত' : 'Refunds'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'বিবরণ বা ভাউচার আইডি খুঁজুন...' : 'Search description or ref...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </section>

      {/* Main Ledger Printable Document Area */}
      <section
        id="personal-ledger-statement-area"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
      >
        {/* Printable Official Header (Included in PDF export) */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক অফিসার্স মেস — ব্যক্তিগত লেজার হিসাব' : 'Karmasangsthan Bank Officers Mess — Personal Ledger Statement'}
              </h2>
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{lang === 'bn' ? 'কর্মকর্তার নাম:' : 'Officer Name:'} <strong className="text-gray-800 dark:text-slate-200">{currentUser.name}</strong></span>
              <span>{lang === 'bn' ? 'পদবি ও শাখা:' : 'Designation & Dept:'} <strong className="text-gray-800 dark:text-slate-200">{currentUser.designation}, {currentUser.department}</strong></span>
              <span>{lang === 'bn' ? 'জিপিএফ নং:' : 'GPF No:'} <strong className="text-gray-800 dark:text-slate-200">{currentUser.gpfNo}</strong></span>
            </div>
          </div>

          <div className="text-right sm:text-right shrink-0">
            <span className="text-[11px] text-gray-500 dark:text-slate-400 block font-medium">
              {lang === 'bn' ? 'লেজার হিসাব স্থিতি' : 'Ledger Balance Status'}
            </span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-sans">
              ৳ {lang === 'bn' ? toBnDigits(advanceBalance.toLocaleString()) : advanceBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5 sm:px-4">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-3.5 sm:px-4">{lang === 'bn' ? 'লেনদেনের বিবরণ' : 'Description'}</th>
                <th className="py-3 px-3.5 sm:px-4">{lang === 'bn' ? 'রেফারেন্স / ভাউচার' : 'Ref / Voucher'}</th>
                <th className="py-3 px-3.5 sm:px-4">{lang === 'bn' ? 'ধরন' : 'Type'}</th>
                <th className="py-3 px-3.5 sm:px-4 text-right">{lang === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</th>
                <th className="py-3 px-3.5 sm:px-4 text-right">{lang === 'bn' ? 'অবশিষ্ট ব্যালেন্স' : 'Balance After'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-sans">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                    <p className="font-medium text-sm">
                      {lang === 'bn' ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি' : 'No transaction records found'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {lang === 'bn' ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন' : 'Try adjusting your filters or search query'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item, idx) => {
                  const isDeposit = item.type === 'deposit';
                  const isRefund = item.type === 'refund';
                  const isCharge = item.type === 'charge';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Date */}
                      <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap text-gray-700 dark:text-slate-300 font-medium">
                        {lang === 'bn' ? toBnDigits(item.date) : item.date}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3.5 sm:px-4 text-gray-900 dark:text-white font-bold max-w-xs sm:max-w-md">
                        <div>
                          {lang === 'bn' ? item.description : (item.descriptionEn || item.description)}
                        </div>
                      </td>

                      {/* Voucher ID */}
                      <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                          {item.ref}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                        {isDeposit && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <ArrowDownLeft className="w-2.5 h-2.5 mr-1" />
                            {lang === 'bn' ? 'জমা (Credit)' : 'Deposit'}
                          </span>
                        )}
                        {isCharge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <ArrowUpRight className="w-2.5 h-2.5 mr-1" />
                            {lang === 'bn' ? 'মিল চার্জ (Debit)' : 'Meal Charge'}
                          </span>
                        )}
                        {isRefund && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <RefreshCw className="w-2.5 h-2.5 mr-1" />
                            {lang === 'bn' ? 'ফেরত / সমন্বয়' : 'Refund'}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap font-bold text-sm">
                        <span
                          className={
                            isDeposit || isRefund
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {isDeposit || isRefund ? '+' : '-'} ৳{' '}
                          {lang === 'bn' ? toBnDigits(item.amount.toLocaleString()) : item.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap font-extrabold text-sm text-gray-900 dark:text-white">
                        ৳ {lang === 'bn' ? toBnDigits(item.balanceAfter.toLocaleString()) : item.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Notice */}
        <div className="p-3.5 sm:p-4 bg-gray-50/80 dark:bg-slate-800/40 border-t border-gray-200 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'মেস নীতি অনুযায়ী প্রতিদিন দুপুর ২:৩০-এর পর মিল খাবার চার্জ স্বয়ংক্রিয়ভাবে সমন্বয় করা হয়।'
                : 'Meal charges are automatically adjusted daily after 2:30 PM per mess governance rules.'}
            </span>
          </div>
          <span className="font-semibold text-gray-700 dark:text-slate-300">
            {lang === 'bn' ? 'প্রয়োজনে যোগাযোগ: মেস প্রশাসন ও হিসাব সেল' : 'Support: Mess Administration & Accounts Cell'}
          </span>
        </div>
      </section>
    </div>
  );
};
