import React, { useState } from 'react';
import { WeeklyMenuDay, UserProfile } from '../types';
import {
  Utensils,
  Clock,
  Star,
  Sparkles,
  Edit2,
  Check,
  Calendar,
  AlertCircle,
  X,
  Download,
} from 'lucide-react';
import { downloadPdfFromElement } from '../utils/pdfExport';

interface MenuScreenProps {
  weeklyMenu: WeeklyMenuDay[];
  onUpdateMenu: (updated: WeeklyMenuDay[]) => void;
  currentUser: UserProfile;
  lang: 'bn' | 'en';
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  weeklyMenu,
  onUpdateMenu,
  currentUser,
  lang,
}) => {
  const [editingDay, setEditingDay] = useState<WeeklyMenuDay | null>(null);
  const [mainDish, setMainDish] = useState('');
  const [sideDish1, setSideDish1] = useState('');
  const [sideDish2, setSideDish2] = useState('');
  const [riceDish, setRiceDish] = useState('');
  const [specialItem, setSpecialItem] = useState('');
  const [isDownloadingMenu, setIsDownloadingMenu] = useState(false);

  const handleDownloadMenuPdf = async () => {
    setIsDownloadingMenu(true);
    await downloadPdfFromElement('weekly-menu-schedule-area', {
      fileName: lang === 'bn' ? 'কর্মসংস্থান_ব্যাংক_সাপ্তাহিক_লাঞ্চ_মেনু_শিডিউল' : 'KBL_Weekly_Lunch_Menu_Schedule',
    });
    setIsDownloadingMenu(false);
  };

  const handleOpenEdit = (day: WeeklyMenuDay) => {
    setEditingDay(day);
    setMainDish(day.mainDish);
    setSideDish1(day.sideDish1);
    setSideDish2(day.sideDish2);
    setRiceDish(day.riceDish);
    setSpecialItem(day.specialItem || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    const updated = weeklyMenu.map((d) => {
      if (d.id === editingDay.id) {
        return {
          ...d,
          mainDish,
          sideDish1,
          sideDish2,
          riceDish,
          specialItem,
        };
      }
      return d;
    });

    onUpdateMenu(updated);
    setEditingDay(null);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-12">
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl shrink-0">
            <Utensils className="w-6 h-6 text-[#064E2B] dark:text-emerald-400" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {lang === 'bn' ? 'সাপ্তাহিক লাঞ্চ মেনু শিডিউল' : 'Weekly Lunch Menu Schedule'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
              {lang === 'bn'
                ? 'ক্যান্টিনের পুষ্টিকর ও সুষম খাবার তালিকা — প্রতিদিন দুপুর ১:১৫ হতে ২:৩০'
                : 'Nutritious & balanced meal menu — Served Daily from 1:15 PM to 2:30 PM'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl font-bold">
            <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              {lang === 'bn' ? 'খাবার সময়: দুপুর ১:১৫ – ২:৩০' : 'Meal Time: 1:15 PM – 2:30 PM'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadMenuPdf}
            disabled={isDownloadingMenu}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
            title={lang === 'bn' ? 'সাপ্তাহিক লাঞ্চ মেনু শিডিউল পিডিএফ ডাউনলোড করুন' : 'Download Weekly Lunch Menu PDF'}
          >
            <Download className="w-4 h-4" />
            <span>
              {isDownloadingMenu
                ? lang === 'bn' ? 'পিডিএফ হচ্ছে...' : 'Generating...'
                : lang === 'bn' ? 'মেনু পিডিএফ' : 'Menu PDF'}
            </span>
          </button>
        </div>
      </section>

      {/* Printable / Downloadable Menu Schedule Area */}
      <div id="weekly-menu-schedule-area" className="space-y-4 md:space-y-6">
        {/* Notice on Nutrition & Hygiene */}
        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-950 dark:text-amber-200 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {lang === 'bn' ? 'স্বাস্থ্যবিধি ও মান নিয়ন্ত্রণ: ' : 'Hygiene & Quality Assurance: '}
            </span>
            <span>
              {lang === 'bn'
                ? 'প্রতিটি খাবার ১০০% বিশুদ্ধ সয়াবিন তেল, আয়োডিনযুক্ত লবণ ও তাজা শাকসবজি দিয়ে ব্যাংকের নিজস্ব বাবুর্চি দ্বারা প্রস্তুত করা হয়। মেনু সংক্রান্ত পরামর্শের জন্য মতামত অপশন ব্যবহার করুন।'
                : 'All meals are prepared by the dedicated bank kitchen using pure soybean oil, iodized salt, and fresh farm produce. Use the feedback section for suggestions.'}
            </span>
          </div>
        </div>

        {/* Weekday Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeklyMenu.map((item) => {
            const isToday = item.id === 'TUE';
            const isHoliday = item.isHoliday;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-xs flex flex-col justify-between transition duration-200 ${
                  isToday
                    ? 'ring-2 ring-emerald-600 border-emerald-300 dark:border-emerald-700'
                    : 'border-gray-200/80 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                {/* Card Header & Day */}
                <div>
                  <div
                    className={`px-4 py-3 flex items-center justify-between border-b ${
                      isToday
                        ? 'bg-emerald-800 text-white dark:bg-emerald-900'
                        : isHoliday
                        ? 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-gray-50 text-gray-900 dark:bg-slate-800/60 dark:text-slate-100'
                    } ${isToday ? 'border-emerald-700' : 'border-gray-200/80 dark:border-slate-800'}`}
                  >
                    <div>
                      <span className="font-extrabold text-sm sm:text-base block leading-tight">
                        {lang === 'bn' ? item.dayNameBn : item.dayNameEn}
                      </span>
                      <span
                        className={`text-[11px] font-medium block ${
                          isToday ? 'text-emerald-200' : 'text-gray-500 dark:text-slate-400'
                        }`}
                      >
                        {lang === 'bn' ? item.dayNameEn : item.dayNameBn}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {isToday && (
                        <span className="px-2 py-0.5 bg-white text-emerald-950 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                          {lang === 'bn' ? 'আজকের মেনু' : "Today's Menu"}
                        </span>
                      )}
                      {isHoliday && (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-[10px] font-bold rounded-full">
                          {lang === 'bn' ? 'ছুটি' : 'Holiday'}
                        </span>
                      )}
                      {(currentUser.role === 'admin' || currentUser.role === 'coadmin') &&
                        !isHoliday && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition text-inherit cursor-pointer"
                            title={lang === 'bn' ? 'মেনু সম্পাদনা করুন' : 'Edit Menu'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Menu Details */}
                  <div className="p-4 space-y-2.5 text-xs font-sans">
                    {isHoliday ? (
                      <div className="py-6 text-center text-gray-400 dark:text-slate-500 font-medium">
                        {lang === 'bn'
                          ? 'সাপ্তাহিক সরকারি ছুটির দিন • ক্যান্টিন বন্ধ থাকবে'
                          : 'Weekly Official Holiday • Canteen Closed'}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between pb-1.5 border-b border-gray-100 dark:border-slate-800">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">
                            {lang === 'bn' ? 'প্রধান পদ:' : 'Main Dish:'}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white text-right text-sm">
                            {lang === 'bn' ? item.mainDish : (item.mainDishEn || item.mainDish)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between pb-1.5 border-b border-gray-100 dark:border-slate-800">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">
                            {lang === 'bn' ? 'সবজি / ভাজি:' : 'Vegetables / Fry:'}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-slate-200 text-right">
                            {lang === 'bn' ? item.sideDish1 : (item.sideDish1En || item.sideDish1)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between pb-1.5 border-b border-gray-100 dark:border-slate-800">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">
                            {lang === 'bn' ? 'ডাল:' : 'Lentils (Dal):'}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-slate-200 text-right">
                            {lang === 'bn' ? item.sideDish2 : (item.sideDish2En || item.sideDish2)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between pb-1.5 border-b border-gray-100 dark:border-slate-800">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">
                            {lang === 'bn' ? 'ভাত / পোলাও:' : 'Rice / Polao:'}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-slate-200 text-right">
                            {lang === 'bn' ? item.riceDish : (item.riceDishEn || item.riceDish)}
                          </span>
                        </div>

                        {item.specialItem && (
                          <div className="flex items-start justify-between pt-1 text-emerald-800 dark:text-emerald-400">
                            <span className="font-semibold">
                              {lang === 'bn' ? 'বিশেষ সংযোজন:' : 'Special Item:'}
                            </span>
                            <span className="font-bold text-right">
                              {lang === 'bn' ? item.specialItem : (item.specialItemEn || item.specialItem)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Card Footer Rating */}
                {!isHoliday && (
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-sans">{lang === 'bn' ? '৪.৮' : '4.8'}</span>
                      <span className="text-gray-400 dark:text-slate-500 font-normal">
                        {lang === 'bn' ? '(৫৫+ কর্মকর্তা রেটিং)' : '(55+ officer ratings)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Menu Modal (For Admin & Co-Admin) */}
      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-[#064E2B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-emerald-200" />
                <h3 className="font-bold text-sm">
                  {lang === 'bn' ? `মেনু সম্পাদন: ${editingDay.dayNameBn}` : `Edit Menu: ${editingDay.dayNameEn}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingDay(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'প্রধান তরকারি / মাছ / মাংস' : 'Main Dish / Fish / Meat'}
                </label>
                <input
                  type="text"
                  value={mainDish}
                  onChange={(e) => setMainDish(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'সবজি / ভাজি পদ' : 'Vegetables / Fry Dish'}
                </label>
                <input
                  type="text"
                  value={sideDish1}
                  onChange={(e) => setSideDish1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'ডালের পদ' : 'Lentil (Dal) Dish'}
                </label>
                <input
                  type="text"
                  value={sideDish2}
                  onChange={(e) => setSideDish2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'ভাত / খিচুড়ি / পোলাও' : 'Rice / Khichuri / Polao'}
                </label>
                <input
                  type="text"
                  value={riceDish}
                  onChange={(e) => setRiceDish(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'স্পেশাল আইটেম (ঐচ্ছিক)' : 'Special Item (Optional)'}
                </label>
                <input
                  type="text"
                  value={specialItem}
                  onChange={(e) => setSpecialItem(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder={lang === 'bn' ? 'যেমন: সালাদ, লেবু, দই...' : 'e.g. Salad, Lemon, Yogurt...'}
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
