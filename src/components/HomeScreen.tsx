import React from 'react';
import { BankLogo } from './BankLogo';
import { ScreenType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Utensils, ShoppingCart, Calculator, ArrowRight, CheckCircle2, Sun, Moon } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  lang: 'bn' | 'en';
  setLang: (l: 'bn' | 'en') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, lang, setLang }) => {
  const { toggleTheme, isDark } = useTheme();
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8faf8] dark:bg-[#090d16]">
      <div className="flex-grow flex flex-col">
        {/* Hero Section with Nav */}
        <section className="relative bg-gradient-to-b from-[#09522f] via-[#0b5b35] to-[#0a522f] dark:from-[#06331e] dark:via-[#09472a] dark:to-[#052917] text-white pb-28 md:pb-36 shadow-md">
          {/* Top Bar Navigation */}
          <nav
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between"
            data-purpose="top-navigation"
          >
            {/* Logo Brand Group */}
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onNavigate('home')}>
              <BankLogo size="md" className="ring-2 ring-white/25" />
              <span className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-xs">
                {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
              </span>
            </div>

            {/* Right Side Nav Actions */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
                title={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
                type="button"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span className="hidden sm:inline text-xs">{lang === 'bn' ? 'লাইট' : 'Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-emerald-200" />
                    <span className="hidden sm:inline text-xs">{lang === 'bn' ? 'ডার্ক' : 'Dark'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="text-white/90 hover:text-white font-semibold text-sm md:text-base tracking-wider uppercase transition-colors"
                type="button"
              >
                {lang === 'bn' ? 'EN' : 'বাংলা'}
              </button>

              <button
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center justify-center px-3.5 sm:px-5 py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg shadow-xs hover:shadow transition-all duration-200 cursor-pointer"
              >
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="inline-flex items-center justify-center px-3.5 sm:px-5 py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-bold text-[#08482a] bg-[#e5f0ea] hover:bg-white rounded-lg shadow-xs hover:shadow transition-all duration-200 cursor-pointer"
              >
                {lang === 'bn' ? 'নিবন্ধন' : 'Register'}
              </button>
            </div>
          </nav>

          {/* Hero Body Content */}
          <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 pb-6 text-center flex flex-col items-center">
            {/* Centered Circular Emblem Badge */}
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#116e41] p-2 ring-4 ring-white/15 shadow-2xl flex items-center justify-center mb-6 transition-transform hover:scale-105 duration-300"
              data-purpose="hero-bank-emblem"
            >
              <BankLogo size="lg" className="w-full h-full shadow-inner" />
            </div>

            {/* Main Headlines */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight md:leading-snug mb-2">
              {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight md:leading-snug text-white/95 mb-5">
              {lang === 'bn' ? 'মিল বুকিং সিস্টেম' : 'Meal Booking System'}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 max-w-2xl font-normal mb-8 leading-relaxed">
              {lang === 'bn'
                ? 'ব্যাংকের ক্যান্টিন হিসাব — মিল বুকিং, বাজার খরচ ও মিল রেট এক জায়গায়।'
                : "Bank's canteen management — meal booking, market expenses, and automated meal rates in one place."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center justify-center space-x-2 px-8 py-2.5 bg-[#e5f0ea] hover:bg-white text-emerald-950 font-bold text-base md:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                <ArrowRight className="w-5 h-5 text-emerald-900" />
              </button>

              <button
                onClick={() => onNavigate('booking')}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-semibold text-base rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'bn' ? 'মিল ক্যালেন্ডার' : 'Meal Calendar'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-10 w-full mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Card 1: মিল বুকিং ও বাতিল */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/70 border border-gray-100 flex flex-col justify-between"
              data-purpose="feature-card"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-1.5 bg-amber-500 rounded-full"></div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {lang === 'bn' ? 'মিল বুকিং ও বাতিল' : 'Meal Booking & Cancellation'}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {lang === 'bn'
                    ? 'পূর্বের দিন বিকাল ৫টা পর্যন্ত এক বা একাধিক মিল, এমনকি পুরো মাসের এডভান্স বুকিং।'
                    : 'Book or cancel single or multiple meals before 5:00 PM daily, including full month advance booking.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-800 space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{lang === 'bn' ? 'দৈনিক কাট-অফ: বিকাল ৫:০০ টা' : 'Daily Cut-off: 5:00 PM'}</span>
              </div>
            </div>

            {/* Feature Card 2: বাজার খরচ ইনপুট */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/70 border border-gray-100 flex flex-col justify-between"
              data-purpose="feature-card"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-1.5 bg-amber-500 rounded-full"></div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {lang === 'bn' ? 'বাজার খরচ ইনপুট' : 'Bazaar Expense Accounting'}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {lang === 'bn'
                    ? 'মাছ, মাংস, ডিম, তেল, কাঁচাবাজার, গ্যাস, বুয়া খরচ — টাইপ অনুযায়ী হিসাব।'
                    : 'Fish, meat, eggs, oil, vegetables, gas, cook bills — categorized real-time expense tracking.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-800 space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{lang === 'bn' ? 'স্বচ্ছ ভাউচার ভিত্তিক হিসাব' : 'Voucher-based Accounting'}</span>
              </div>
            </div>

            {/* Feature Card 3: স্বয়ংক্রিয় মিল রেট */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/70 border border-gray-100 flex flex-col justify-between"
              data-purpose="feature-card"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-1.5 bg-amber-500 rounded-full"></div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {lang === 'bn' ? 'স্বয়ংক্রিয় মিল রেট' : 'Automated Meal Rate'}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {lang === 'bn'
                    ? 'মোট খরচ ÷ মোট মিল সংখ্যা; প্রতি মেম্বারের খরচ ও বাকি টাকা তৎক্ষণাৎ।'
                    : 'Total cost divided by total meals; individual member bill and remaining balance computed instantly.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-800 space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'bn' ? 'চলমান গড় রেট: ৳৬৫' : 'Running Average Rate: ৳65'}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Main Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-gray-200/80 dark:border-slate-800 py-4 text-center mt-auto" data-purpose="page-footer">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">
            {lang === 'bn'
              ? 'প্রস্তুতকৃতঃ আইটি সিস্টেম রিসার্চ অ্যান্ড ডেভেলপমেন্ট বিভাগ'
              : 'Developed by: IT System Research and Development Department'}
          </p>
        </div>
      </footer>
    </div>
  );
};
