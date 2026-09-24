import React, { useState, useEffect } from 'react';
import { MenuItem, ScreenType, UserProfile, MealCallState, WeeklyMenuDay } from '../types';
import { TodayLunchMenuCard } from './TodayLunchMenuCard';
import {
  Clock,
  ArrowRight,
  Shield,
  Key,
  Edit,
  Utensils,
  CreditCard,
  Settings,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  PhoneCall,
  CalendarCheck,
  Check,
  Lock,
  Megaphone,
  LayoutDashboard,
  Calendar,
} from 'lucide-react';
import {
  getLocalizedName,
  getLocalizedDesignation,
  getLocalizedDepartment,
  getLocalizedRoom,
  getLocalizedCutoff,
  toBnDigits,
  getRoleTitle,
} from '../utils/localization';
import { calculateCutoffRemaining, padZero } from '../utils/cutoffCountdown';

interface DashboardScreenProps {
  currentUser: UserProfile;
  menuItems: MenuItem[];
  onNavigate: (screen: ScreenType) => void;
  onOpenLedger: () => void;
  onOpenFeedback: () => void;
  onOpenProfileEdit: () => void;
  onOpenPasswordChange: () => void;
  onToggleTodayStatus: () => void;
  lang: 'bn' | 'en';
  mealCallState: MealCallState;
  weeklyMenu?: WeeklyMenuDay[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentUser,
  menuItems,
  onNavigate,
  onOpenLedger,
  onOpenFeedback,
  onOpenProfileEdit,
  onOpenPasswordChange,
  onToggleTodayStatus,
  lang,
  mealCallState,
  weeklyMenu,
}) => {
  const [toggleConfirmNotice, setToggleConfirmNotice] = useState(false);
  const [toggleWarning, setToggleWarning] = useState<string | null>(null);
  const isPrivileged = currentUser.role === 'admin' || currentUser.role === 'coadmin';
  const calledDates = mealCallState.calledDates || [];
  const currentDayNum = new Date().getDate();
  const currentMonthNum = new Date().getMonth();
  const isTodayCalled = calledDates.includes(currentDayNum);

  const [countdown, setCountdown] = useState(() =>
    calculateCutoffRemaining(mealCallState.cutoffTime)
  );

  useEffect(() => {
    setCountdown(calculateCutoffRemaining(mealCallState.cutoffTime));
    const timer = setInterval(() => {
      setCountdown(calculateCutoffRemaining(mealCallState.cutoffTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [mealCallState.cutoffTime]);

  const handleStatusClick = () => {
    if (!isPrivileged && !isTodayCalled) {
      setToggleWarning(
        lang === 'bn'
          ? `এডমিন বা কো-এডমিন আজকের (${currentDayNum} তারিখ) জন্য এখনো মিল কল দেননি। শুধু মিল কল দেওয়া তারিখেই মেম্বাররা মিল বুক/পরিবর্তন করতে পারেন।`
          : "Meal Call has not been initiated for today by Admin/Co-Admin yet. Members can only modify meals on approved meal call dates."
      );
      setTimeout(() => setToggleWarning(null), 3500);
      return;
    }
    onToggleTodayStatus();
    setToggleConfirmNotice(true);
    setTimeout(() => setToggleConfirmNotice(false), 3000);
  };

  return (
    <div className="space-y-4 md:space-y-5 pb-8">
      {/* Top Page Header Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl shrink-0">
            <LayoutDashboard className="w-6 h-6 text-[#064E2B] dark:text-emerald-400" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-full">
                {lang === 'bn' ? 'সদস্য ড্যাশবোর্ড' : 'Member Portal'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn'
                ? 'দৈনিক মিল স্থিতি, চলতি ব্যালেন্স ও মেস পরিচালনার হালনাগাদ তথ্যাবলি'
                : 'Daily meal status, current advance balance, and canteen management updates'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>
              {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক মেস' : 'KBL Officers Mess'}
            </span>
          </div>
        </div>
      </section>

      {/* 1. Meal Call Alert Banner (Driven by mealCallState) */}
      <section
        className={`rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden text-white transition-all ${
          mealCallState.isActive
            ? 'bg-gradient-to-r from-[#064E2B] via-[#085a33] to-[#0a6639]'
            : 'bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 border border-amber-500/30'
        }`}
        data-purpose="meal-call-banner"
      >
        <div className="flex items-start sm:items-center space-x-3.5 z-10">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              mealCallState.isActive
                ? 'bg-white/15 text-emerald-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {mealCallState.isActive ? (
              <Megaphone className="w-5 h-5 text-emerald-200 animate-pulse" />
            ) : (
              <Lock className="w-5 h-5 text-amber-300" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  mealCallState.isActive
                    ? 'bg-emerald-400 text-emerald-950 shadow-2xs'
                    : 'bg-amber-400 text-amber-950'
                }`}
              >
                {mealCallState.isActive
                  ? lang === 'bn'
                    ? 'সক্রিয় মিল কল • বুকিং উন্মুক্ত'
                    : 'Active Meal Call • Booking Open'
                  : lang === 'bn'
                  ? 'মিল কল অপেক্ষমান • বুকিং স্থগিত'
                  : 'Meal Call Pending • Booking Locked'}
              </span>

              <span className="text-xs text-slate-200">
                {mealCallState.isActive
                  ? lang === 'bn'
                    ? `আহ্বানকারী: ${mealCallState.calledBy} (${
                        mealCallState.calledByRole === 'admin' ? 'এডমিন' : 'কো-এডমিন'
                      })`
                    : `Called by: ${getLocalizedName(mealCallState.calledBy, 'en')} (${
                        mealCallState.calledByRole === 'admin' ? 'Admin' : 'Co-Admin'
                      })`
                  : lang === 'bn'
                  ? 'আজকের মিল কল এখনও ঘোষণা করা হয়নি'
                  : 'Awaiting Admin/Co-admin Meal Call'}
              </span>
            </div>

            <div className="mt-1 leading-relaxed">
              {mealCallState.isActive ? (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-0.5">
                  <span className="inline-flex items-center text-xs sm:text-sm text-slate-100/95 font-medium">
                    <span>{lang === 'bn' ? 'কাট-অফ সময়:' : 'Cut-off Time:'}</span>
                    <span className="font-bold text-white ml-1.5">{getLocalizedCutoff(mealCallState.cutoffTime, lang)}</span>
                  </span>

                  {/* Compact Live Cutoff Timer Badge */}
                  <div
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-xs transition-colors ${
                      countdown.isTodayCutoffPassed
                        ? 'bg-amber-500/20 text-amber-200 border-amber-300/30'
                        : 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30'
                    }`}
                  >
                    <Clock
                      className={`w-3 h-3 ${
                        countdown.isTodayCutoffPassed ? 'text-amber-300' : 'text-emerald-300 animate-pulse'
                      }`}
                    />
                    <span>
                      {lang === 'bn' ? (
                        countdown.isTodayCutoffPassed ? (
                          <>
                            পরবর্তী কাট-অফ:{' '}
                            <span className="font-bold font-mono text-white">
                              {toBnDigits(padZero(countdown.hours))}:{toBnDigits(padZero(countdown.minutes))}:{toBnDigits(padZero(countdown.seconds))}
                            </span>
                          </>
                        ) : (
                          <>
                            বাকি:{' '}
                            <span className="font-bold font-mono text-white">
                              {toBnDigits(padZero(countdown.hours))}:{toBnDigits(padZero(countdown.minutes))}:{toBnDigits(padZero(countdown.seconds))}
                            </span>
                          </>
                        )
                      ) : (
                        countdown.isTodayCutoffPassed ? (
                          <>
                            Next in:{' '}
                            <span className="font-bold font-mono text-white">
                              {padZero(countdown.hours)}:{padZero(countdown.minutes)}:{padZero(countdown.seconds)}
                            </span>
                          </>
                        ) : (
                          <>
                            Left:{' '}
                            <span className="font-bold font-mono text-white">
                              {padZero(countdown.hours)}:{padZero(countdown.minutes)}:{padZero(countdown.seconds)}
                            </span>
                          </>
                        )
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-100/95 font-medium">
                  {lang === 'bn'
                    ? 'এডমিন বা কো-এডমিন "মিল কল ও বাজার খরচ" পৃষ্ঠা থেকে যে তারিখে মিল কল দেবেন, সাধারণ সদস্যরা শুধুমাত্র সেই তারিখগুলোতেই মিল বুকিং করতে পারবেন।'
                    : 'Admin or Co-admin will launch the Meal Call for specific dates before members can book.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          {isPrivileged ? (
            <button
              onClick={() => onNavigate('bazaar')}
              className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>
                {mealCallState.isActive
                  ? lang === 'bn'
                    ? 'বাজার পাতায় মিল কল দেখুন'
                    : 'View Meal Call in Bazaar'
                  : lang === 'bn'
                  ? '📢 বাজার পাতায় গিয়ে মিল কল দিন'
                  : 'Launch Meal Call in Bazaar'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('booking')}
              disabled={!mealCallState.isActive}
              className={`self-start sm:self-auto inline-flex items-center space-x-1.5 px-4 py-2 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition transform active:scale-95 ${
                mealCallState.isActive
                  ? 'bg-white hover:bg-emerald-50 text-[#064E2B] cursor-pointer'
                  : 'bg-white/20 text-white/60 cursor-not-allowed'
              }`}
            >
              <span>
                {mealCallState.isActive
                  ? lang === 'bn'
                    ? 'বুক করুন'
                    : 'Book Now'
                  : lang === 'bn'
                  ? '🔒 বুকিং বন্ধ'
                  : 'Locked'}
              </span>
              {mealCallState.isActive && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
      </section>

      {/* 2. Member Profile Card */}
      <section
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80"
        data-purpose="member-profile-card"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Avatar + Details */}
          <div className="flex items-start space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a522f] to-[#073b22] text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-800">
              <Shield className="w-7 h-7 text-emerald-200" />
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-none">
                  {getLocalizedName(currentUser.name, lang)}
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                  {getRoleTitle(currentUser.role, lang)}
                </span>
              </div>

              <p className="text-xs text-gray-600 font-semibold mt-1">
                {getLocalizedDesignation(currentUser.designation, lang)} •{' '}
                <span className="text-emerald-700">{getLocalizedDepartment(currentUser.department, lang)}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 font-mono">
                <div>
                  <span className="text-gray-400">{lang === 'bn' ? 'আইডি:' : 'ID:'}</span>{' '}
                  <span className="font-semibold text-gray-800">{currentUser.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">{lang === 'bn' ? 'মোবাইল:' : 'Mobile:'}</span>{' '}
                  <span className="font-semibold text-gray-800">{currentUser.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-400">{lang === 'bn' ? 'রুম:' : 'Room:'}</span>{' '}
                  <span className="font-semibold text-gray-800">{getLocalizedRoom(currentUser.roomNo, lang)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-3 text-xs">
                <button
                  onClick={onOpenPasswordChange}
                  className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={onOpenProfileEdit}
                  className="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'তথ্য সম্পাদন' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Today's Status Box */}
          <div className="bg-[#f7faf7] border border-emerald-100 rounded-xl p-3 sm:p-4 flex sm:flex-row md:flex-col items-center justify-between md:justify-center md:text-center w-full md:w-auto md:min-w-[160px] shrink-0">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {lang === 'bn' ? 'আজকের স্ট্যাটাস' : "Today's Status"}
              </span>
              <div className="text-sm sm:text-base font-extrabold text-emerald-950 mt-0.5">
                {currentUser.todayMealStatus === 'on' ? (
                  <span className="inline-flex items-center text-emerald-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block mr-1.5 animate-pulse"></span>
                    {lang === 'bn' ? 'মিল অন (১টি)' : 'Meal ON (1)'}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1.5"></span>
                    {lang === 'bn' ? 'মিল অফ' : 'Meal OFF'}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleStatusClick}
              className={`mt-0 md:mt-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                !mealCallState.isActive && !isPrivileged
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : currentUser.todayMealStatus === 'on'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              {currentUser.todayMealStatus === 'on'
                ? lang === 'bn'
                  ? 'মিল অফ করুন'
                  : 'Turn OFF'
                : lang === 'bn'
                ? 'মিল অন করুন'
                : 'Turn ON'}
            </button>
          </div>
        </div>

        {toggleWarning && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center space-x-2 animate-fadeIn">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{toggleWarning}</span>
          </div>
        )}

        {toggleConfirmNotice && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between">
            <span>
              {lang === 'bn'
                ? 'স্ট্যাটাস আপডেট করা হয়েছে। কাট-অফ সময় (৫:০০টা) পরবর্তী পরিবর্তনের জন্য প্রযোজ্য।'
                : 'Status updated. Cut-off time policy applied.'}
            </span>
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
        )}
      </section>

      {/* 3. Personal Summary 4 Cards (ব্যক্তিগত সংক্ষিপ্ত বিবরণ) */}
      <section data-purpose="metrics-grid">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
            {lang === 'bn' ? 'ব্যক্তিগত সংক্ষিপ্ত বিবরণ' : 'Personal Summary'}
          </h3>
          <span className="text-[11px] text-gray-500">
            {lang === 'bn' ? 'অক্টোবর ২০২৪' : 'October 2024'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: চলতি মাসের মিল */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {lang === 'bn' ? 'চলতি মাসের মিল' : 'Monthly Meals'}
            </span>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-sans">
                {currentUser.monthlyMeals}
              </span>
              <span className="text-xs text-gray-400 font-medium ml-1">
                / {lang === 'bn' ? '২০ টি' : '20 meals'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {lang === 'bn' ? '+৩ বিশেষ খাদ্য অন্তর্ভুক্ত' : '+3 special meals'}
            </span>
          </div>

          {/* Card 2: অফিস মিল / আসন্ন মিল */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {lang === 'bn' ? 'আসন্ন মিল (আগামীকাল)' : 'Upcoming Meal'}
            </span>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#064E2B] dark:text-emerald-400 font-sans">
                {currentUser.upcomingMeals}
              </span>
              <span className="text-xs text-gray-400 font-medium ml-1">
                {lang === 'bn' ? 'টি' : 'meal'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md inline-block w-max">
              {lang === 'bn' ? 'অনুমোদন প্রাপ্ত' : 'Approved'}
            </span>
          </div>

          {/* Card 3: অ্যাডভান্স ব্যালেন্স */}
          <div
            onClick={onOpenLedger}
            className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                {lang === 'bn' ? 'অ্যাডভান্স ব্যালেন্স' : 'Advance Balance'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-700 transition" />
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-400 font-sans">
                ৳ {currentUser.advanceBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              {lang === 'bn' ? 'পর্যাপ্ত ব্যালেন্স রয়েছে' : 'Sufficient Balance'}
            </span>
          </div>

          {/* Card 4: বর্তমান ডিউ */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {lang === 'bn' ? 'বর্তমান ডিউ' : 'Current Due'}
            </span>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-slate-200 font-sans">
                ৳ {currentUser.dueAmount.toFixed(2)}
              </span>
            </div>
            <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md inline-block w-max">
              {lang === 'bn' ? 'পরিশোধিত (নো ডিউ)' : 'Settled (No Due)'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Per Meal Rate Strip */}
      <section
        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-3 sm:p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        data-purpose="meal-rate-strip"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-black/15 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold flex items-center space-x-2">
              <span>{lang === 'bn' ? 'চলমান প্রতি মিল রেট:' : 'Current Per-Meal Rate:'}</span>
              <span className="bg-white text-amber-900 px-2 py-0.5 rounded-md font-sans text-sm font-black shadow-2xs">
                ৳ {currentUser.mealRate.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-amber-100 mt-0.5">
              {lang === 'bn'
                ? 'দৈনিক বাজার ব্যয়ের উপর স্বয়ংক্রিয়ভাবে হালনাগাদকৃত প্রাক্কলিত রেট।'
                : 'Automatically calculated estimated rate based on daily bazaar expenses.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLedger}
          className="self-start sm:self-auto text-xs bg-amber-950/25 hover:bg-amber-950/40 text-white px-3 py-1.5 rounded-lg font-bold border border-white/20 transition cursor-pointer shrink-0"
        >
          {lang === 'bn' ? 'হিসাব দেখুন' : 'View Breakdown'}
        </button>
      </section>

      {/* 5. Today's Lunch Menu */}
      <TodayLunchMenuCard
        weeklyMenu={weeklyMenu}
        menuItems={menuItems}
        lang={lang}
        onOpenFeedback={onOpenFeedback}
      />

      {/* 6. Emergency Notice Banner */}
      <section className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-950 dark:text-amber-200 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {lang === 'bn' ? 'জরুরি নোটিশ • মেস প্রশাসন: ' : 'Emergency Notice • Canteen Admin: '}
          </span>
          <span>
            {lang === 'bn'
              ? 'আগামী বৃহস্পতিবার অফিসিয়াল মিটিং উপলক্ষে স্পেশাল মিলের ব্যবস্থা থাকবে। প্রয়োজনীয় সমন্বয় সম্পন্ন করা হয়েছে।'
              : 'Special meals will be arranged next Thursday for official meeting. Necessary arrangements have been completed.'}
          </span>
        </div>
      </section>

      {/* 7. Quick Services (দ্রুত সেবা) */}
      <section data-purpose="quick-services">
        <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
          {lang === 'bn' ? 'দ্রুত সেবা ও অ্যাকশন' : 'Quick Services & Actions'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Service 1: মিল বুকিং */}
          <button
            onClick={() => onNavigate('booking')}
            className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
              {lang === 'bn' ? 'মিল বুকিং' : 'Meal Booking'}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
              {lang === 'bn' ? 'ক্যালেন্ডার ও পুরো মাস' : 'Calendar & month booking'}
            </span>
          </button>

          {/* Service 2: বাজার হিসাব ও ভাউচার (শুধুমাত্র এডমিন ও কো-এডমিন) */}
          {isPrivileged && (
            <button
              onClick={() => onNavigate('bazaar')}
              className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-2 group-hover:bg-teal-100 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
                {lang === 'bn' ? 'মিল কল ও বাজার খরচ' : 'Meal Call & Bazaar'}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
                {lang === 'bn' ? 'মিল কল অনুমোদন ও বাজার রেজিস্টার' : 'Approval & bazaar register'}
              </span>
            </button>
          )}

          {/* Service 3: মেস শিট ও মিল রেট (শুধুমাত্র এডমিন ও কো-এডমিন) */}
          {isPrivileged && (
            <button
              onClick={() => onNavigate('accounts')}
              className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
                {lang === 'bn' ? 'মাসিক হিসাব ও রেট' : 'Accounts & Rates'}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
                {lang === 'bn' ? 'স্বয়ংক্রিয় বিল ও স্লিপ' : 'Automated bills & slips'}
              </span>
            </button>
          )}

          {/* Service 4: সাপ্তাহিক মেনু শিডিউল (শুধুমাত্র এডমিন ও কো-এডমিনদের রুটিন ব্যবস্থাপনার জন্য) */}
          {isPrivileged && (
            <button
              onClick={() => onNavigate('menu')}
              className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
                {lang === 'bn' ? 'সাপ্তাহিক মেনু শিডিউল' : 'Weekly Menu'}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
                {lang === 'bn' ? 'কমিটি কর্তৃক রুটিন পরিচালনা' : 'Manage weekly routine'}
              </span>
            </button>
          )}

          {/* Service 5: জমা খাতা */}
          <button
            onClick={onOpenLedger}
            className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-2 group-hover:bg-purple-100 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
              {lang === 'bn' ? 'ব্যক্তিগত লেজার' : 'Personal Ledger'}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
              {lang === 'bn' ? 'লেনদেন বিবরণী খাতা' : 'Transactions & deposit ledger'}
            </span>
          </button>

          {/* Service 6: মতামত দিন */}
          <button
            onClick={onOpenFeedback}
            className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:bg-amber-100 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
              {lang === 'bn' ? 'মতামত দিন' : 'Food Feedback'}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
              {lang === 'bn' ? 'খাবারের মান ও রেটিং' : 'Meal quality & review'}
            </span>
          </button>

          {/* Service 7: প্রোফাইল সেটিংস */}
          <button
            onClick={onOpenProfileEdit}
            className="p-3.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl hover:border-emerald-300 hover:shadow-xs transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 flex items-center justify-center mb-2 group-hover:bg-gray-200 transition">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight">
              {lang === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 block">
              {lang === 'bn' ? 'পাসওয়ার্ড ও রুম তথ্য' : 'Password & room details'}
            </span>
          </button>

          {/* Service 8: মেস প্রশাসন (এডমিন) (শুধুমাত্র এডমিন ও কো-এডমিন) */}
          {isPrivileged && (
            <button
              onClick={() => onNavigate('admin')}
              className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl hover:border-emerald-400 hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center mb-2 group-hover:bg-emerald-900 transition">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-emerald-950 dark:text-emerald-200 block leading-tight">
                {lang === 'bn' ? 'মেস প্রশাসন' : 'Canteen Admin'}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                {lang === 'bn' ? 'বাবুর্চি ও কাট-অফ প্যানেল' : 'Cook & cutoff panel'}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* 8. Canteen Notice & Guidelines (ক্যান্টিন নোটিস ও নির্দেশনা) */}
      <section
        className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80 dark:border-slate-700 space-y-3"
        data-purpose="canteen-guidelines"
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <span>{lang === 'bn' ? 'ক্যান্টিন নোটিস ও নির্দেশনা' : 'Canteen Notice & Rules'}</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-950 dark:text-amber-200 flex items-start space-x-2">
            <span className="text-base">📌</span>
            <div className="leading-relaxed">
              <span className="font-bold block">
                {lang === 'bn' ? 'পবিত্র ঈদ-উল-ফিতরের ছুটিকালীন মিল বন্ধ থাকবে' : 'Canteen closed during Eid-ul-Fitr holidays'}
              </span>
              <p className="text-amber-900 dark:text-amber-300 mt-0.5">
                {lang === 'bn'
                  ? 'সরকারি সাধারণ ছুটি শুরু হওয়ার আগের দিন দুপুর পর্যন্ত ক্যান্টিন চালু থাকবে। ছুটিকালীন কোনো মিল কাউন্ট হবে না।'
                  : 'Canteen will remain open until noon the day before official public holidays begin. No meals counted during holidays.'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-950 dark:text-emerald-200 flex items-start space-x-2">
            <span className="text-base">ℹ️</span>
            <div className="leading-relaxed">
              <span className="font-bold block">
                {lang === 'bn' ? 'মিল অফ/অন করার কাট-অফ সময়: পূর্ববর্তী দিন বিকাল ৫:০০টা' : 'Meal Cut-off Time: 5:00 PM previous day'}
              </span>
              <p className="text-emerald-900 dark:text-emerald-300 mt-0.5">
                {lang === 'bn'
                  ? 'বাজারের প্রস্তুতি ও রান্নার অপচয় রোধে বিকাল ৫:০০ ঘটিকার পরে কোনো অনুরোধ গ্রহণযোগ্য নয়। জরুরি প্রয়োজনে মেস ম্যানেজারের সাথে সরাসরি যোগাযোগ করুন।'
                  : 'To prevent food waste and prepare market purchases, no requests accepted after 5:00 PM. Contact mess manager directly for emergencies.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer Helpline Card */}
      <footer className="p-3.5 bg-gray-100 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 dark:text-slate-300 gap-2">
        <div className="flex items-center space-x-2">
          <PhoneCall className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
          <span>
            {lang === 'bn'
              ? 'মেস ম্যানেজার হেল্পলাইন: এক্সটেনশন ৫২২ (অভ্যন্তরীণ)'
              : 'Mess Manager Helpline: Ext 522 (Internal)'}
          </span>
        </div>
        <div className="text-gray-500 dark:text-slate-400 font-mono">
          {lang === 'bn' ? 'ইমেইল: ' : 'Email: '}
          <span className="text-emerald-800 dark:text-emerald-400 font-semibold">canteen@kbl.gov.bd</span>
        </div>
      </footer>
    </div>
  );
};
