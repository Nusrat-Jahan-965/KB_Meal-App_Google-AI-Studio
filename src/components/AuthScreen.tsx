import React, { useState, useEffect } from 'react';
import { BankLogo } from './BankLogo';
import { ScreenType, UserProfile, UserRole } from '../types';
import { INITIAL_PROFILES } from '../data';
import { ChevronDown, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (screen: ScreenType) => void;
  lang: 'bn' | 'en';
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onNavigate, lang, initialMode = 'login' }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('hasan.ict@kbl.gov.bd');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form states
  const [regDept, setRegDept] = useState('ict');
  const [regName, setRegName] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regGpfNo, setRegGpfNo] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Match against known profiles or default to member
    if (loginEmail.includes('admin') || loginEmail.includes('saiful')) {
      onLoginSuccess(INITIAL_PROFILES.admin);
    } else if (loginEmail.includes('coadmin') || loginEmail.includes('rahim')) {
      onLoginSuccess(INITIAL_PROFILES.coadmin);
    } else {
      onLoginSuccess(INITIAL_PROFILES.member);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: regGpfNo ? `GPF-${regGpfNo}` : 'KB-NEW',
      name: regName || 'নতুন কর্মকর্তা',
      role: 'member',
      designation: regDesignation || 'কর্মকর্তা',
      department:
        regDept === 'admin'
          ? 'প্রশাসন বিভাগ'
          : regDept === 'accounts'
          ? 'হিসাব বিভাগ'
          : regDept === 'planning'
          ? 'পরিকল্পনা ও ঋণ কার্যক্রম'
          : 'আইসিটি ডিপার্টমেন্ট',
      gpfNo: regGpfNo || 'GPF-০০৯৯',
      mobile: regMobile || '০১৭১১-০০০০০০',
      email: regEmail || 'user@kbl.gov.bd',
      roomNo: '৪০৫, প্রধান কার্যালয়',
      monthlyMeals: 0,
      upcomingMeals: 1,
      advanceBalance: 1500,
      dueAmount: 0,
      todayMealStatus: 'on',
      mealRate: 65,
    };

    setSuccessMsg(
      lang === 'bn'
        ? 'নিবন্ধন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...'
        : 'Registration successful! Entering dashboard...'
    );
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 900);
  };

  const handleDemoSelect = (role: UserRole) => {
    onLoginSuccess(INITIAL_PROFILES[role]);
  };

  return (
    <div className="min-h-screen bg-[#f5f8f5] dark:bg-[#090d16] flex flex-col justify-start items-center py-4 sm:py-8 px-3">
      {/* Container sizing matches mobile/desktop accurately */}
      <main
        className="w-full max-w-md bg-transparent flex flex-col pb-8"
        data-purpose="auth-container"
      >
        {/* Back to Home Button */}
        <div className="w-full flex justify-between items-center mb-3 px-1">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'হোম পেজে ফিরুন' : 'Back to Home'}</span>
          </button>
          <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">কর্মসংস্থান ব্যাংক পোর্টাল</span>
        </div>

        {/* Header Section */}
        <header
          className="bg-[#0a522a] rounded-t-2xl py-6 px-4 flex flex-col items-center justify-center text-center shadow-xs border border-b-0 border-[#084824]"
          data-purpose="brand-header"
        >
          {/* Circular Bank Emblem / Logo */}
          <div
            className="w-14 h-14 rounded-full bg-white border-2 border-emerald-300 p-1 shadow-sm flex items-center justify-center mb-2.5"
            data-purpose="bank-emblem"
          >
            <BankLogo size="sm" className="w-full h-full" />
          </div>
          {/* App Title */}
          <h1 className="text-white font-bold text-lg leading-tight tracking-normal">
            {lang === 'bn' ? 'কর্মসংস্থান ব্যাংক' : 'Karmasangsthan Bank'}
          </h1>
          <h2 className="text-emerald-100 font-medium text-sm leading-snug mt-0.5">
            {lang === 'bn' ? 'মিল বুকিং ও মেস ম্যানেজমেন্ট সিস্টেম' : 'Meal Booking & Mess Management System'}
          </h2>
        </header>

        {/* Main Content Form Card */}
        <div className="flex-1 flex flex-col" data-purpose="content-body">
          <section
            className="bg-white dark:bg-slate-900 rounded-b-2xl shadow-lg border border-t-0 border-gray-200 dark:border-slate-800 p-5 pt-5"
            data-purpose="auth-card"
          >
            {/* Segmented Toggle Tabs */}
            <nav
              className="bg-[#f0f3f1] dark:bg-slate-800 p-1 rounded-xl flex items-center justify-between mb-5 border border-gray-200/80 dark:border-slate-700"
              data-purpose="segmented-tabs"
            >
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`w-1/2 py-2 text-center text-xs font-bold transition-all duration-150 rounded-lg cursor-pointer ${
                  authMode === 'login'
                    ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs border border-gray-200/80 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`w-1/2 py-2 text-center text-xs font-bold transition-all duration-150 rounded-lg cursor-pointer ${
                  authMode === 'register'
                    ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs border border-gray-200/80 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Registration'}
              </button>
            </nav>

            {successMsg && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5" data-purpose="login-form">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1" htmlFor="loginEmail">
                    {lang === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@kbl.gov.bd"
                    className="w-full text-xs text-gray-700 bg-white border border-gray-300 rounded-md py-2 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1" htmlFor="loginPass">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <input
                    id="loginPass"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs text-gray-700 bg-white border border-gray-300 rounded-md py-2 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                  />
                </div>

                <div className="pt-1.5">
                  <button
                    type="submit"
                    className="w-full bg-[#0a5933] hover:bg-[#074829] active:bg-[#05371f] text-white font-bold text-sm py-2 px-4 rounded-md shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {lang === 'bn' ? 'লগইন' : 'Login'}
                  </button>
                </div>

                {/* Quick 1-Click Demo Profiles */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500 block mb-1.5 font-medium text-center">
                    {lang === 'bn' ? 'বা এক ক্লিকে ডেমো প্রবেশ করুন:' : 'Or test with instant demo role:'}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDemoSelect('member')}
                      className="py-1 px-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded text-[10px] font-bold text-center transition"
                    >
                      মেম্বার
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSelect('admin')}
                      className="py-1 px-1 bg-[#115e34] hover:bg-[#0c4727] text-white rounded text-[10px] font-bold text-center transition"
                    >
                      এডমিন
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSelect('coadmin')}
                      className="py-1 px-1 bg-[#d79a3c] hover:bg-[#bd8632] text-amber-950 rounded text-[10px] font-bold text-center transition"
                    >
                      কো-এডমিন
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Registration Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3" data-purpose="registration-form">
                <div className="pb-1 mb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                    {lang === 'bn' ? 'নতুন কর্মকর্তা নিবন্ধন' : 'New Officer Registration'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    {lang === 'bn'
                      ? 'ক্যান্টিনের মিল বুকিং ও অন্যান্য সেবার জন্য সঠিক তথ্য দিয়ে নিবন্ধন করুন।'
                      : 'Register with accurate details to access canteen booking services.'}
                  </p>
                </div>

                {/* Department Select */}
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="department">
                    {lang === 'bn' ? 'ডিপার্টমেন্ট' : 'Department'}
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full text-xs text-gray-700 bg-white border border-gray-300 rounded-md py-2 px-2.5 appearance-none focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden pr-8"
                    >
                      <option value="admin">প্রশাসন বিভাগ</option>
                      <option value="ict">আইসিটি ডিপার্টমেন্ট</option>
                      <option value="accounts">হিসাব বিভাগ</option>
                      <option value="planning">পরিকল্পনা ও ঋণ কার্যক্রম</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="fullname">
                    {lang === 'bn' ? 'নাম' : 'Full Name'}
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="উদা: হাসান মাহমুদ"
                    className="w-full text-xs text-gray-700 border border-gray-300 rounded-md py-1.5 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                  />
                </div>

                {/* Designation & GPF Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="designation">
                      {lang === 'bn' ? 'পদবী' : 'Designation'}
                    </label>
                    <input
                      id="designation"
                      type="text"
                      required
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder="অফিসার"
                      className="w-full text-xs text-gray-700 border border-gray-300 rounded-md py-1.5 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="gpf_no">
                      {lang === 'bn' ? 'জিপিএফ নম্বর' : 'GPF No.'}
                    </label>
                    <input
                      id="gpf_no"
                      type="text"
                      required
                      value={regGpfNo}
                      onChange={(e) => setRegGpfNo(e.target.value)}
                      placeholder="২৪৯০"
                      className="w-full text-xs text-gray-700 border border-gray-300 rounded-md py-1.5 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="mobile">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    required
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="০১৭১৭-৩৪৫৬৭৮"
                    className="w-full text-xs text-gray-700 border border-gray-300 rounded-md py-1.5 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="email">
                    {lang === 'bn' ? 'ইমেইল' : 'Official Email'}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@kbl.gov.bd"
                    className="w-full text-xs text-gray-700 border border-gray-300 rounded-md py-1.5 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="text-[12px] font-semibold text-gray-700 mb-1" htmlFor="password">
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs text-gray-700 border border-gray-300 rounded-md py-1.5 px-2.5 focus:border-[#0a5933] focus:ring-1 focus:ring-[#0a5933] outline-hidden"
                  />
                </div>

                {/* Submit */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    className="w-full bg-[#085a2e] hover:bg-[#064a25] active:bg-[#053d1e] text-white font-bold text-sm py-2 px-4 rounded-md shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Register Account'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* User Roles Guide Section */}
          <section className="mt-6 flex flex-col items-center" data-purpose="roles-explanation-section">
            <h3 className="text-xs font-bold text-[#44654b] dark:text-emerald-400 mb-3 tracking-wide text-center">
              {lang === 'bn' ? 'ব্যবহারকারীর ধরন' : 'User Role Types'}
            </h3>

            <div className="w-full space-y-2.5 text-left text-xs">
              {/* Admin Card */}
              <div
                onClick={() => handleDemoSelect('admin')}
                className="bg-[#115e34] text-white rounded-lg p-2.5 px-3 shadow-xs border border-emerald-800 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0"></span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-[13px] block">
                      {lang === 'bn' ? 'এডমিন' : 'Admin'}
                    </span>
                    <p className="text-[11px] text-emerald-50 mt-0.5 leading-snug">
                      {lang === 'bn'
                        ? 'সব কিছু নিয়ন্ত্রণ করেন: ডিপার্টমেন্ট, রোস্টার, কো-এডমিন নিয়োগ, মাসিক দায়িত্ব।'
                        : 'Controls full system: departments, rosters, appointing co-admins, and monthly catering duties.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Co-Admin Card */}
              <div
                onClick={() => handleDemoSelect('coadmin')}
                className="bg-[#d79a3c] text-[#2c1d06] rounded-lg p-2.5 px-3 shadow-xs border border-[#c38930] cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#412705] mt-1.5 shrink-0"></span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-[13px] text-[#2b1b04] block">
                      {lang === 'bn' ? 'কো-এডমিন' : 'Co-Admin'}
                    </span>
                    <p className="text-[11px] text-[#3e2b10] mt-0.5 leading-snug">
                      {lang === 'bn'
                        ? 'বাজার খরচ ও জমা ইনপুট, মিল কল, মাসিক হিসাব দেখেন।'
                        : 'Inputs bazaar expenses and deposits, activates meal calls, inspects monthly accounts.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Regular Member Card */}
              <div
                onClick={() => handleDemoSelect('member')}
                className="bg-[#dfede2] dark:bg-slate-800 text-[#22472e] dark:text-emerald-300 rounded-lg p-2.5 px-3 border border-[#cbdccd] dark:border-slate-700 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1b552d] dark:bg-emerald-400 mt-1.5 shrink-0"></span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-[13px] text-[#134925] dark:text-emerald-200 block">
                      {lang === 'bn' ? 'সাধারণ মেম্বার' : 'General Member'}
                    </span>
                    <p className="text-[11px] text-[#2b5938] dark:text-slate-300 mt-0.5 leading-snug">
                      {lang === 'bn'
                        ? 'নিজের মিল বুক বা বাতিল করতে পারেন এবং মাস শেষে নিজের বাকি দেখতে পারেন।'
                        : 'Can book or cancel their own meals and check dues and balances at month end.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
