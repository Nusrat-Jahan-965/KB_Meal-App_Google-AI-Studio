import React, { useState } from 'react';
import { UserProfile, CanteenNotice, Department, UserRole } from '../types';
import { DepartmentManagement } from './DepartmentManagement';
import {
  ShieldAlert,
  Users,
  ChefHat,
  Bell,
  Clock,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  X,
  Phone,
  Building2,
  ShieldCheck,
  UserCheck,
  Download,
} from 'lucide-react';
import { downloadPdfFromElement } from '../utils/pdfExport';
import { toBnDigits, MONTH_NAMES_BN, MONTH_NAMES_EN } from './BazaarScreen';

interface AdminScreenProps {
  members: UserProfile[];
  onUpdateMembers: (members: UserProfile[]) => void;
  notices: CanteenNotice[];
  onAddNotice: (notice: CanteenNotice) => void;
  onDeleteNotice: (id: string) => void;
  departments: Department[];
  onAddDepartment: (dept: Department) => void;
  onUpdateDepartment: (dept: Department) => void;
  onDeleteDepartment: (id: string) => void;
  onAssignDeptRole: (
    deptId: string,
    role: 'admin' | 'coadmin',
    memberGpf: string,
    memberName: string,
    isNewMember?: boolean,
    newMemberData?: Partial<UserProfile>
  ) => void;
  currentUser: UserProfile;
  lang: 'bn' | 'en';
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  members,
  onUpdateMembers,
  notices,
  onAddNotice,
  onDeleteNotice,
  departments,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAssignDeptRole,
  currentUser,
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
              ? 'ক্যান্টিন ও মেস অ্যাডমিন প্যানেল শুধুমাত্র এডমিন ও কো-এডমিনদের জন্য উন্মুক্ত।'
              : 'Canteen & Mess Admin Panel is strictly restricted to Admin and Co-Admin.'}
          </p>
        </div>
      </div>
    );
  }

  const [activeAdminTab, setActiveAdminTab] = useState<'departments' | 'members' | 'kitchen'>('departments');
  const [isCutoffLocked, setIsCutoffLocked] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDownloadingKitchen, setIsDownloadingKitchen] = useState(false);

  const handleDownloadKitchenPdf = async () => {
    setIsDownloadingKitchen(true);
    const now = new Date();
    await downloadPdfFromElement('kitchen-work-order-area', {
      fileName:
        lang === 'bn'
          ? `কর্মসংস্থান_ব্যাংক_রান্নাঘর_আদেশ_${toBnDigits(now.getDate())}_${MONTH_NAMES_BN[now.getMonth()]}_${toBnDigits(now.getFullYear())}`
          : `KBL_Kitchen_Work_Order_${now.getDate()}_${MONTH_NAMES_EN[now.getMonth()]}_${now.getFullYear()}`,
    });
    setIsDownloadingKitchen(false);
  };

  // New Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<'urgent' | 'holiday' | 'general'>('urgent');

  // New Member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberGpf, setNewMemberGpf] = useState('GPF-');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');
  const [newMemberDesignation, setNewMemberDesignation] = useState(lang === 'bn' ? 'অফিসার' : 'Officer');
  const [newMemberDept, setNewMemberDept] = useState(departments[0]?.name || (lang === 'bn' ? 'সাধারণ সেবা বিভাগ' : 'Common Services Department'));
  const [newMemberMobile, setNewMemberMobile] = useState('01711-');
  const [newMemberRoom, setNewMemberRoom] = useState(lang === 'bn' ? '৩০২, প্রধান ভবন' : '302, Main Building');

  // Computed Kitchen counts
  const activeMembersCount = members.filter((m) => m.todayMealStatus === 'on').length;
  const guestMealCount = 4; // today's guest reservations
  const totalCookingPlates = activeMembersCount + guestMealCount;

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    const newNotice: CanteenNotice = {
      id: `N-${Date.now().toString().slice(-4)}`,
      title: noticeTitle,
      content: noticeContent,
      type: noticeType,
      date: lang === 'bn' ? 'আজকের তারিখ' : 'Today',
      author: `${currentUser.name} (${currentUser.designation})`,
    };

    onAddNotice(newNotice);
    setIsNoticeModalOpen(false);
    setNoticeTitle('');
    setNoticeContent('');
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberGpf) return;

    const newMem: UserProfile = {
      id: newMemberGpf,
      name: newMemberName,
      role: newMemberRole,
      designation: newMemberDesignation,
      department: newMemberDept,
      gpfNo: newMemberGpf,
      mobile: newMemberMobile,
      email: `${newMemberGpf.toLowerCase()}@kbl.gov.bd`,
      roomNo: newMemberRoom,
      monthlyMeals: 0,
      upcomingMeals: 1,
      advanceBalance: 2000,
      dueAmount: 0,
      todayMealStatus: 'on',
      mealRate: 65,
    };

    onUpdateMembers([...members, newMem]);

    // If added as admin or coadmin, also assign to department leadership if matched
    const matchedDept = departments.find((d) => d.name === newMemberDept);
    if (matchedDept && (newMemberRole === 'admin' || newMemberRole === 'coadmin')) {
      onAssignDeptRole(matchedDept.id, newMemberRole, newMem.gpfNo, newMem.name);
    }

    setIsAddMemberModalOpen(false);
    setNewMemberName('');
    setNewMemberGpf('GPF-');
    setNewMemberRole('member');
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-12">
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#064E2B] dark:text-emerald-400" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'ক্যান্টিন ও মেস অ্যাডমিন প্যানেল' : 'Canteen Admin Management Panel'}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-full">
                {currentUser.role === 'admin'
                  ? lang === 'bn' ? 'প্রধান ইনচার্জ' : 'Chief In-Charge'
                  : lang === 'bn' ? 'কো-এডমিন মোড' : 'Co-Admin Mode'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              {lang === 'bn'
                ? 'ব্যাংক বিভাগ ব্যবস্থাপনা, কর্মকর্তা তালিকা, রান্নাঘর আদেশ ও সদস্য মিল উপস্থিতি'
                : 'Department management, officer directory, kitchen orders, and staff attendance'}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {/* Tab 1: Department Management (Add/Delete/Rename) */}
        <button
          onClick={() => setActiveAdminTab('departments')}
          className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeAdminTab === 'departments'
              ? 'bg-[#064E2B] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{lang === 'bn' ? 'বিভাগ ব্যবস্থাপনা' : 'Departments'}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeAdminTab === 'departments'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {departments.length}
          </span>
        </button>

        {/* Tab 2: Member Directory & Meal Attendance */}
        <button
          onClick={() => setActiveAdminTab('members')}
          className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeAdminTab === 'members'
              ? 'bg-[#064E2B] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'bn' ? 'কর্মকর্তা ও সদস্য তালিকা' : 'Member Directory'}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeAdminTab === 'members'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {members.length}
          </span>
        </button>

        {/* Tab 3: Kitchen Orders & Notices */}
        <button
          onClick={() => setActiveAdminTab('kitchen')}
          className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeAdminTab === 'kitchen'
              ? 'bg-[#064E2B] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>{lang === 'bn' ? 'রান্নাঘর আদেশ ও নোটিশ' : 'Kitchen & Notices'}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeAdminTab === 'kitchen'
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {notices.length}
          </span>
        </button>
      </div>

      {/* DEPARTMENT & MEMBERS SECTIONS */}
      {activeAdminTab !== 'kitchen' && (
        <DepartmentManagement
          departments={departments}
          members={members}
          onAddDepartment={onAddDepartment}
          onUpdateDepartment={onUpdateDepartment}
          onDeleteDepartment={onDeleteDepartment}
          onAssignDeptRole={onAssignDeptRole}
          onUpdateMembers={onUpdateMembers}
          onOpenAddMember={() => setIsAddMemberModalOpen(true)}
          currentUser={currentUser}
          lang={lang}
          activeSection={activeAdminTab}
          onSectionChange={(sec) => setActiveAdminTab(sec)}
        />
      )}

      {/* TAB 2: Kitchen Orders & Notices */}
      {activeAdminTab === 'kitchen' && (
        <div className="space-y-4 sm:space-y-6">
          {/* 1. Kitchen Operational Summary Card */}
          <section
            id="kitchen-work-order-area"
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-6 shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ChefHat className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {lang === 'bn' ? 'আজকের রান্নাঘর আদেশ (Kitchen Work Order)' : 'Kitchen Work Order'}
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-white">
                    {lang === 'bn'
                      ? `${toBnDigits(new Date().getDate())} ${MONTH_NAMES_BN[new Date().getMonth()]} ${toBnDigits(new Date().getFullYear())} • দুপুরের লাঞ্চ প্রস্তুতি`
                      : `${new Date().getDate()} ${MONTH_NAMES_EN[new Date().getMonth()]} ${new Date().getFullYear()} • Lunch Preparation`}
                  </h3>
                </div>
              </div>

              {/* Action buttons & Cut-off lock switch */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadKitchenPdf}
                  disabled={isDownloadingKitchen}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                  title={lang === 'bn' ? 'বাবুর্চির জন্য রান্নাঘর আদেশ স্লিপটি পিডিএফ ডাউনলোড করুন' : 'Download kitchen work order slip as PDF'}
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isDownloadingKitchen
                      ? lang === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'
                      : lang === 'bn' ? 'কিচেন অর্ডার পিডিএফ' : 'Kitchen Order PDF'}
                  </span>
                </button>

                <div className="flex items-center space-x-2.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <div className="text-xs">
                    <span className="text-gray-300 block text-[10px]">
                      {lang === 'bn' ? 'বিকাল ৫:০০ টা কাট-অফ:' : '5:00 PM Cut-off:'}
                    </span>
                    <span className="font-bold text-white text-xs">
                      {isCutoffLocked
                        ? lang === 'bn' ? '🔒 লকড (বন্ধ)' : '🔒 Locked (Closed)'
                        : lang === 'bn' ? '🔓 আনলকড (উন্মুক্ত)' : '🔓 Unlocked (Open)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCutoffLocked(!isCutoffLocked)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isCutoffLocked
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isCutoffLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Large Counter Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="bg-white/10 p-3.5 sm:p-4 rounded-xl border border-white/10">
                <span className="text-xs text-gray-300 font-medium">
                  {lang === 'bn' ? 'কর্মকর্তা মিল (নিশ্চিত)' : 'Officer Meals (Confirmed)'}
                </span>
                <div className="my-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-sans">
                    {activeMembersCount}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    {lang === 'bn' ? 'প্লেট' : 'Plates'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200">
                  {lang === 'bn' ? 'ব্যাংক কর্মকর্তাদের সক্রিয় মিল' : 'Active meals from bank officers'}
                </span>
              </div>

              <div className="bg-white/10 p-3.5 sm:p-4 rounded-xl border border-white/10">
                <span className="text-xs text-gray-300 font-medium">
                  {lang === 'bn' ? 'অতিথি / ভিজিটর মিল' : 'Guest / Visitor Meals'}
                </span>
                <div className="my-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">
                    {guestMealCount}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    {lang === 'bn' ? 'প্লেট' : 'Plates'}
                  </span>
                </div>
                <span className="text-[11px] text-amber-200">
                  {lang === 'bn' ? 'বিশেষ মেহমান রিজার্ভেশন' : 'Special guest reservations'}
                </span>
              </div>

              <div className="bg-emerald-950/60 p-3.5 sm:p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  {lang === 'bn' ? 'মোট রান্নার প্লেট সংখ্যা' : 'Total Cooking Plates'}
                </span>
                <div className="my-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-sans">
                    {totalCookingPlates}
                  </span>
                  <span className="text-xs text-emerald-300 ml-1">
                    {lang === 'bn' ? 'প্লেট' : 'Plates'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200">
                  {lang === 'bn' ? 'বাবুর্চির রান্নার চূড়ান্ত পরিমাণ' : 'Final cooking count for chef'}
                </span>
              </div>
            </div>
          </section>

          {/* 3. Notice Board Management */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  {lang === 'bn' ? 'ক্যান্টিন নোটিশ বোর্ড ব্যবস্থাপনা' : 'Canteen Notice Management'}
                </h3>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition cursor-pointer shrink-0"
              >
                {lang === 'bn' ? '+ নতুন নোটিশ লিখুন' : '+ Post Notice'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col justify-between ${
                    n.type === 'urgent'
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
                      : n.type === 'holiday'
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-100'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          n.type === 'urgent'
                            ? 'bg-rose-600 text-white'
                            : n.type === 'holiday'
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {n.type === 'urgent'
                          ? lang === 'bn' ? 'জরুরি' : 'Urgent'
                          : n.type === 'holiday'
                          ? lang === 'bn' ? 'ছুটির বিজ্ঞপ্তি' : 'Holiday'
                          : lang === 'bn' ? 'সাধারণ নোটিশ' : 'General'}
                      </span>
                      <button
                        onClick={() => onDeleteNotice(n.id)}
                        className="text-gray-400 hover:text-rose-700 transition cursor-pointer"
                        title={lang === 'bn' ? 'নোটিশ ডিলিট করুন' : 'Delete Notice'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm leading-tight text-gray-900 dark:text-white mb-1">
                      {n.title}
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-sans">{n.content}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 font-mono">
                    <span>{n.date}</span>
                    <span className="truncate max-w-[150px]">{n.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Add Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  {lang === 'bn' ? 'নতুন ক্যান্টিন নোটিশ প্রকাশ করুন' : 'Publish Canteen Notice'}
                </h3>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিজ্ঞপ্তির ধরন' : 'Notice Type'}
                </label>
                <select
                  value={noticeType}
                  onChange={(e) =>
                    setNoticeType(e.target.value as 'urgent' | 'holiday' | 'general')
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="urgent">
                    {lang === 'bn' ? 'জরুরি ঘোষণা (Urgent Alert)' : 'Urgent Alert'}
                  </option>
                  <option value="holiday">
                    {lang === 'bn' ? 'ছুটির নোটিস (Holiday Notice)' : 'Holiday Notice'}
                  </option>
                  <option value="general">
                    {lang === 'bn' ? 'সাধারণ নির্দেশনা (General Notice)' : 'General Notice'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'নোটিশের শিরোনাম' : 'Notice Title'}
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: আগামী বৃহস্পতিবারের মেনু পরিবর্তন সংক্রান্ত'
                      : 'e.g., Regarding upcoming menu schedule update'
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
                </label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder={
                    lang === 'bn'
                      ? 'নোটিশের বিস্তারিত বক্তব্য লিখুন...'
                      : 'Write detailed notice content...'
                  }
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold transition"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-xs"
                >
                  {lang === 'bn' ? 'পাবলিশ করুন' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-[#064E2B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-200" />
                <h3 className="font-bold text-sm">
                  {lang === 'bn' ? 'নতুন ক্যান্টিন মেম্বার যুক্ত করুন' : 'Add New Canteen Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'GPF নম্বর' : 'GPF Number'}
                  </label>
                  <input
                    type="text"
                    value={newMemberGpf}
                    onChange={(e) => setNewMemberGpf(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600"
                    placeholder={lang === 'bn' ? 'কর্মকর্তার নাম' : 'Officer Name'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পদবী' : 'Designation'}
                  </label>
                  <input
                    type="text"
                    value={newMemberDesignation}
                    onChange={(e) => setNewMemberDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিভাগ / শাখা' : 'Department'}
                  </label>
                  <select
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'প্রশাসনিক ভূমিকা (Role)' : 'Role'}
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  <option value="member">
                    {lang === 'bn' ? 'সাধারণ সদস্য (Member)' : 'Regular Member'}
                  </option>
                  <option value="coadmin">
                    {lang === 'bn' ? 'বিভাগীয় কো-এডমিন (Department Co-Admin)' : 'Department Co-Admin'}
                  </option>
                  <option value="admin">
                    {lang === 'bn' ? 'মেস অ্যাডমিন (Mess Admin)' : 'Mess Admin'}
                  </option>
                </select>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                  {lang === 'bn'
                    ? '* কো-এডমিন বা এডমিন নির্বাচন করলে উক্ত বিভাগের দায়িত্বে স্বয়ংক্রিয়ভাবে নিযুক্ত হবেন।'
                    : '* Selecting Co-Admin or Admin assigns administrative permissions for the chosen department.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={newMemberMobile}
                    onChange={(e) => setNewMemberMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'রুম ও ভবন' : 'Room & Building'}
                  </label>
                  <input
                    type="text"
                    value={newMemberRoom}
                    onChange={(e) => setNewMemberRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold transition"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl font-bold transition shadow-xs"
                >
                  {lang === 'bn' ? 'মেম্বার যুক্ত করুন' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
