import React from 'react';
import { WeeklyMenuDay, MenuItem } from '../types';
import { Utensils, Clock, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { toBnDigits } from '../utils/localization';

interface TodayLunchMenuCardProps {
  weeklyMenu?: WeeklyMenuDay[];
  menuItems?: MenuItem[];
  lang: 'bn' | 'en';
  onOpenFeedback?: () => void;
  className?: string;
  showFeedbackBtn?: boolean;
}

const WEEKDAY_NAMES_BN = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার (সাপ্তাহিক বন্ধ)',
  'শনিবার (সাপ্তাহিক বন্ধ)',
];

const WEEKDAY_NAMES_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday (Weekend)',
  'Saturday (Weekend)',
];

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

const DAY_KEY_MAP: Record<number, string> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

export const TodayLunchMenuCard: React.FC<TodayLunchMenuCardProps> = ({
  weeklyMenu,
  menuItems,
  lang,
  onOpenFeedback,
  className = '',
  showFeedbackBtn = true,
}) => {
  const now = new Date();
  const dayIdx = now.getDay();
  const todayDayKey = DAY_KEY_MAP[dayIdx];

  // Match today's day from weeklyMenu schedule
  const todaySchedule = weeklyMenu?.find((m) => m.id === todayDayKey);

  const formattedDate =
    lang === 'bn'
      ? `${toBnDigits(now.getDate())} ${MONTH_NAMES_BN[now.getMonth()]} ${toBnDigits(now.getFullYear())} (${WEEKDAY_NAMES_BN[dayIdx]})`
      : `${now.getDate()} ${MONTH_NAMES_EN[now.getMonth()]} ${now.getFullYear()} (${WEEKDAY_NAMES_EN[dayIdx]})`;

  // Fallback dishes if weeklyMenu is not provided or if using static menuItems
  const dishes: { category: string; name: string; tag: string }[] = [];

  if (todaySchedule && !todaySchedule.isHoliday) {
    if (todaySchedule.mainDish) {
      dishes.push({
        category: lang === 'bn' ? 'প্রধান পদ' : 'Main Dish',
        name: lang === 'bn' ? todaySchedule.mainDish : (todaySchedule.mainDishEn || todaySchedule.mainDish),
        tag: lang === 'bn' ? 'মাছ / মাংস' : 'Fish / Meat',
      });
    }
    if (todaySchedule.sideDish1) {
      dishes.push({
        category: lang === 'bn' ? 'সবজি ও তরকারি' : 'Side Dish',
        name: lang === 'bn' ? todaySchedule.sideDish1 : (todaySchedule.sideDish1En || todaySchedule.sideDish1),
        tag: lang === 'bn' ? 'মৌসুমি' : 'Seasonal Veg',
      });
    }
    if (todaySchedule.sideDish2) {
      dishes.push({
        category: lang === 'bn' ? 'ডাল ফোঁড়ন' : 'Lentil / Dal',
        name: lang === 'bn' ? todaySchedule.sideDish2 : (todaySchedule.sideDish2En || todaySchedule.sideDish2),
        tag: lang === 'bn' ? 'ঘন বাগার' : 'Special Dal',
      });
    }
    if (todaySchedule.riceDish) {
      dishes.push({
        category: lang === 'bn' ? 'সুগন্ধি ভাত' : 'Rice Item',
        name: lang === 'bn' ? todaySchedule.riceDish : (todaySchedule.riceDishEn || todaySchedule.riceDish),
        tag: lang === 'bn' ? 'গরম ভাত' : 'Steamed Rice',
      });
    }
    if (todaySchedule.specialItem) {
      dishes.push({
        category: lang === 'bn' ? 'বিশেষ সংযোজন' : 'Complimentary',
        name: lang === 'bn' ? todaySchedule.specialItem : (todaySchedule.specialItemEn || todaySchedule.specialItem),
        tag: lang === 'bn' ? 'সালাদ ও লেবু' : 'Salad & Lemon',
      });
    }
  } else if (!todaySchedule && menuItems && menuItems.length > 0) {
    menuItems.forEach((item) => {
      dishes.push({
        category: lang === 'bn' ? item.category : (item.categoryEn || item.category),
        name: lang === 'bn' ? item.name : (item.nameEn || item.name),
        tag: lang === 'bn' ? 'তাজা খাবার' : 'Fresh Item',
      });
    });
  }

  const isWeekendOrHoliday =
    todaySchedule?.isHoliday || dayIdx === 5 || dayIdx === 6;

  return (
    <section
      data-purpose="today-lunch-menu"
      className={`bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80 dark:border-slate-700 transition ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-gray-100 dark:border-slate-700">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <Utensils className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {lang === 'bn' ? 'আজকের দুপুরের খাবারের মেনু' : "Today's Lunch Menu"}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              {lang === 'bn' ? 'তাজা ও পুষ্টিকর' : 'Fresh & Nutritious'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-gray-700 dark:text-slate-300">
              📅 {formattedDate}
            </span>
            <span className="inline-flex items-center text-gray-500 dark:text-slate-400">
              <Clock className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
              {lang === 'bn'
                ? 'পরিবেশন সময়: দুপুর ১:১৫ - ২:৩০ (প্রধান ক্যান্টিন)'
                : 'Serving: 1:15 PM - 2:30 PM (Main Canteen)'}
            </span>
          </div>
        </div>

        {showFeedbackBtn && onOpenFeedback && (
          <button
            type="button"
            onClick={onOpenFeedback}
            className="self-start sm:self-center inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition cursor-pointer shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'মতামত দিন' : 'Rate Food'}</span>
          </button>
        )}
      </div>

      {/* Content: Holiday Notice vs Dish Grid */}
      {isWeekendOrHoliday ? (
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center space-x-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block">
              {lang === 'bn'
                ? 'আজকের দিনে কোনো লাঞ্চ সার্ভিস নেই'
                : 'No Lunch Service Today'}
            </span>
            <span className="text-amber-700 dark:text-amber-300 text-xs">
              {lang === 'bn'
                ? 'সাপ্তাহিক ছুটি বা সরকারি বন্ধের কারণে আজ ক্যান্টিন সম্পূর্ণ বন্ধ রয়েছে।'
                : 'Canteen is closed today due to weekly holiday or government public holiday.'}
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {dishes.map((item, index) => (
            <div
              key={index}
              onClick={onOpenFeedback}
              className="group border border-gray-200/90 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-3 sm:p-3.5 transition duration-200 bg-gray-50/60 dark:bg-slate-900/50 hover:bg-emerald-50/40 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg group-hover:bg-[#064E2B] group-hover:text-white transition">
                  <Utensils className="w-3.5 h-3.5" />
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-slate-100 block leading-tight group-hover:text-[#064E2B] dark:group-hover:text-emerald-400 transition">
                  {item.name}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-1 block">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
