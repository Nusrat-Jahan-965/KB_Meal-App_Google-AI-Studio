import React, { useState } from 'react';
import { BankLogo } from './BankLogo';
import { ScreenType, UserProfile, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Smartphone,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Briefcase,
  Utensils,
  LayoutDashboard,
  CreditCard,
  Home,
  Check,
  Sun,
  Moon,
  Database,
} from 'lucide-react';
import { getLocalizedName, getLocalizedRoom } from '../utils/localization';

interface NavbarProps {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  currentUser: UserProfile;
  onSwitchUser: (role: UserRole) => void;
  isMobileMode: boolean;
  setIsMobileMode: (val: boolean) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setCurrentScreen,
  currentUser,
  onSwitchUser,
  isMobileMode,
  setIsMobileMode,
  lang,
  setLang,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const canAccessManagement =
    currentUser.role === 'admin' || currentUser.role === 'coadmin';

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return lang === 'bn' ? 'এডমিন / মেস ইনচার্জ' : 'Admin / Mess Incharge';
      case 'coadmin':
        return lang === 'bn' ? 'কো-এডমিন' : 'Co-Admin';
      default:
        return lang === 'bn' ? 'সাধারণ মেম্বার' : 'General Member';
    }
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'booking':
        return 'Meal Booking';
      case 'bazaar':
        return lang === 'bn' ? 'মিল কল ও বাজার খরচ' : 'Meal Call & Bazaar';
      case 'accounts':
        return lang === 'bn' ? 'হিসাব ও রেট' : 'Accounts & Rates';
      case 'menu':
        return lang === 'bn' ? 'খাবার মেনু' : 'Weekly Menu';
      case 'admin':
        return lang === 'bn' ? 'মেস প্রশাসন' : 'Admin Panel';
      case 'database':
        return lang === 'bn' ? 'ক্লাউড ডাটাবেজ স্টুডিও (phpMyAdmin)' : 'Cloud SQL Studio';
      case 'auth':
        return lang === 'bn' ? 'প্রবেশ (লগইন)' : 'Sign In';
      case 'register':
        return lang === 'bn' ? 'কর্মকর্তা নিবন্ধন' : 'Officer Registration';
      default:
        return lang === 'bn' ? 'মিল বুকিং সিস্টেম' : 'Meal Booking System';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200/90 dark:border-slate-800 shadow-xs">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand / Logo Area */}
        <div
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none group min-w-0"
          onClick={() => setCurrentScreen('home')}
        >
          <BankLogo size="md" className="shrink-0" />
          <div className="leading-tight min-w-0">
            <div className="text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-400 tracking-tight truncate">
              {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
            </div>
            <div className="text-xs sm:text-lg font-extrabold text-gray-900 dark:text-white leading-none mt-0.5 truncate">
              {getScreenTitle()}
            </div>
          </div>
        </div>

        {/* Center Quick Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
              currentScreen === 'home'
                ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
              currentScreen === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('booking')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
              currentScreen === 'booking'
                ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'মিল বুকিং' : 'Booking'}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('ledger')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
              currentScreen === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'জমা-খরচ খাতা' : 'Personal Ledger'}</span>
          </button>
          {canAccessManagement && (
            <>
              <button
                onClick={() => setCurrentScreen('bazaar')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
                  currentScreen === 'bazaar'
                    ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                    : 'hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{lang === 'bn' ? 'মিল কল ও বাজার খরচ' : 'Meal Call & Bazaar'}</span>
              </button>
              <button
                onClick={() => setCurrentScreen('accounts')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
                  currentScreen === 'accounts'
                    ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                    : 'hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{lang === 'bn' ? 'হিসাব ও রেট' : 'Accounts'}</span>
              </button>
            </>
          )}
          {canAccessManagement && (
            <button
              onClick={() => setCurrentScreen('menu')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
                currentScreen === 'menu'
                  ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-bold'
                  : 'hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{lang === 'bn' ? 'সাপ্তাহিক মেনু' : 'Weekly Menu'}</span>
            </button>
          )}
          {canAccessManagement && (
            <button
              onClick={() => setCurrentScreen('admin')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer ${
                currentScreen === 'admin'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'মেস প্রশাসন' : 'Admin'}</span>
            </button>
          )}
        </nav>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Mobile Screen Simulator Toggle */}
          <button
            onClick={() => setIsMobileMode(!isMobileMode)}
            className={`flex items-center space-x-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
              isMobileMode
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700'
            }`}
            title={
              isMobileMode
                ? (lang === 'bn' ? 'পূর্ণ স্ক্রিন ভিউতে ফিরুন' : 'Return to full screen view')
                : (lang === 'bn' ? 'মোবাইল অ্যাপ ফ্রেম ভিউ চালু করুন' : 'Enable mobile app frame view')
            }
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">
              {isMobileMode
                ? lang === 'bn'
                  ? 'মোবাইল অন'
                  : 'Mobile ON'
                : lang === 'bn'
                ? 'মোবাইল'
                : 'Mobile'}
            </span>
          </button>

          {/* Global Theme Toggle (High Contrast for Banking Staff) */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-700 shadow-xs cursor-pointer select-none"
            title={
              isDark
                ? lang === 'bn'
                  ? 'উচ্চ বৈসাদৃশ্য ডার্ক মোড সক্রিয় — সাধারণ লাইট মোডে পরিবর্তন করুন'
                  : 'High-contrast dark mode active — Click to switch to light mode'
                : lang === 'bn'
                ? 'ব্যাংকিং স্টাফ ডার্ক মোড চালু করুন (উচ্চ বৈসাদৃশ্য ও চোখের সুরক্ষামূলক)'
                : 'Switch to high-contrast banking dark mode'
            }
            aria-label="Toggle Dark/Light Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline font-bold text-amber-300">
                  {lang === 'bn' ? 'লাইট' : 'Light'}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="hidden sm:inline font-bold text-gray-800">
                  {lang === 'bn' ? 'ডার্ক' : 'Dark'}
                </span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="text-xs font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:border-gray-300 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition shrink-0"
          >
            {lang === 'bn' ? 'EN' : 'বাংলা'}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-gray-100 rounded-lg transition relative"
              title={lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {lang === 'bn' ? '১' : '1'}
              </span>
            </button>

            {/* Notification Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                    {lang === 'bn' ? 'ক্যান্টিন বিজ্ঞপ্তি (১)' : 'Canteen Notices (1)'}
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    {lang === 'bn' ? 'জরুরি' : 'Urgent'}
                  </span>
                </div>
                <div className="mt-2.5 space-y-2">
                  <div className="p-2 bg-amber-50/70 dark:bg-amber-950/30 border-l-3 border-amber-500 rounded-r-lg">
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      {lang === 'bn'
                        ? 'পবিত্র ঈদ-উল-ফিতরের ছুটিকালীন মিল বন্ধ'
                        : 'Eid-ul-Fitr Holidays Meal Suspension'}
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-snug">
                      {lang === 'bn'
                        ? 'সরকারি ছুটির দিনগুলোতে ক্যান্টিন বন্ধ থাকবে।'
                        : 'Canteen service will remain closed during government holidays.'}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 border-l-3 border-emerald-600 rounded-r-lg">
                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      {lang === 'bn' ? 'কাট-অফ সময় অনুস্মারক' : 'Cut-off Time Reminder'}
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                      {lang === 'bn'
                        ? 'প্রতিদিন বিকাল ৫:০০ ঘটিকার মধ্যে পরের দিনের মিল বুক করুন।'
                        : 'Please book tomorrow’s meal before 5:00 PM daily.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Dropdown */}
          <div className="relative">
            <div
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center space-x-1 pl-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-emerald-900 ring-2 ring-emerald-600/20">
                <Shield className="w-4 h-4 text-emerald-200" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-white transition" />
            </div>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {getLocalizedName(currentUser.name, lang)}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    {getRoleTitle(currentUser.role)}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-400 font-mono mt-0.5">
                    {currentUser.id} • {getLocalizedRoom(currentUser.roomNo, lang).split(',')[0]}
                  </div>
                </div>

                {/* Role Switcher for Testing / Demonstration */}
                <div className="px-3.5 py-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider mb-1.5">
                    {lang === 'bn' ? 'ব্যবহারকারী ভূমিকা পরিবর্তন' : 'Switch Role View'}
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onSwitchUser('member');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{lang === 'bn' ? 'হাসান মাহমুদ (মেম্বার)' : 'Hasan Mahmud (Member)'}</span>
                      </span>
                      {currentUser.role === 'member' && (
                        <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('admin');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{lang === 'bn' ? 'সাইফুল ইসলাম (এডমিন)' : 'Saiful Islam (Admin)'}</span>
                      </span>
                      {currentUser.role === 'admin' && (
                        <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSwitchUser('coadmin');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>{lang === 'bn' ? 'রহিম উল্লাহ (কো-এডমিন)' : 'Rahim Ullah (Co-Admin)'}</span>
                      </span>
                      {currentUser.role === 'coadmin' && (
                        <Check className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setCurrentScreen('auth');
                      setProfileOpen(false);
                    }}
                    className="w-full px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center space-x-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'লগইন স্ক্রিন / সাইন আউট' : 'Sign In / Switch Account'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Subnav Bar for mobile and small screens */}
      <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-gray-50/95 dark:bg-slate-900/95 px-2.5 py-2 overflow-x-auto flex items-center space-x-1.5 scrollbar-none text-xs touch-pan-x">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
            currentScreen === 'home'
              ? 'bg-[#064E2B] text-white shadow-2xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}
        >
          {lang === 'bn' ? 'হোম' : 'Home'}
        </button>
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
            currentScreen === 'dashboard'
              ? 'bg-[#064E2B] text-white shadow-2xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}
        >
          {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
        </button>
        <button
          onClick={() => setCurrentScreen('booking')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
            currentScreen === 'booking'
              ? 'bg-[#064E2B] text-white shadow-2xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}
        >
          {lang === 'bn' ? 'মিল বুকিং' : 'Booking'}
        </button>
        <button
          onClick={() => setCurrentScreen('ledger')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
            currentScreen === 'ledger'
              ? 'bg-[#064E2B] text-white shadow-2xs'
              : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
          }`}
        >
          {lang === 'bn' ? 'জমা-খরচ খাতা' : 'Personal Ledger'}
        </button>
        {canAccessManagement && (
          <>
            <button
              onClick={() => setCurrentScreen('bazaar')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
                currentScreen === 'bazaar'
                  ? 'bg-[#064E2B] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {lang === 'bn' ? 'মিল কল ও বাজার খরচ' : 'Meal Call & Bazaar'}
            </button>
            <button
              onClick={() => setCurrentScreen('accounts')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
                currentScreen === 'accounts'
                  ? 'bg-[#064E2B] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {lang === 'bn' ? 'হিসাব ও রেট' : 'Accounts'}
            </button>
          </>
        )}
        {canAccessManagement && (
          <button
            onClick={() => setCurrentScreen('menu')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
              currentScreen === 'menu'
                ? 'bg-[#064E2B] text-white shadow-2xs'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}
          >
            {lang === 'bn' ? 'সাপ্তাহিক মেনু' : 'Weekly Menu'}
          </button>
        )}
        {canAccessManagement && (
          <button
            onClick={() => setCurrentScreen('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition whitespace-nowrap ${
              currentScreen === 'admin'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {lang === 'bn' ? 'মেস প্রশাসন' : 'Admin'}
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-lg font-bold shrink-0 transition flex items-center space-x-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-amber-300 border border-gray-200 dark:border-slate-700 whitespace-nowrap cursor-pointer"
          title={isDark ? (lang === 'bn' ? 'লাইট মোডে পরিবর্তন' : 'Switch to Light Mode') : (lang === 'bn' ? 'ডার্ক মোড চালু' : 'Switch to Dark Mode')}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? 'লাইট' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>{lang === 'bn' ? 'ডার্ক' : 'Dark'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
