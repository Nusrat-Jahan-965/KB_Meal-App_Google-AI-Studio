import React, { useState } from 'react';
import { Department, UserProfile, UserRole } from '../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  X,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Database,
  Check,
  Copy,
  Download,
  Code,
} from 'lucide-react';
import {
  getLocalizedName,
  getLocalizedDesignation,
  getLocalizedDepartment,
  getLocalizedRoom,
} from '../utils/localization';

interface DepartmentManagementProps {
  departments: Department[];
  members: UserProfile[];
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
  onUpdateMembers: (members: UserProfile[]) => void;
  onOpenAddMember: () => void;
  currentUser: UserProfile;
  lang: 'bn' | 'en';
  activeSection?: 'departments' | 'members';
  onSectionChange?: (section: 'departments' | 'members') => void;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  departments,
  members,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onUpdateMembers,
  onOpenAddMember,
  lang,
  activeSection = 'departments',
  onSectionChange,
}) => {
  // Internal section tab if not strictly controlled from parent
  const [currentSection, setCurrentSection] = useState<'departments' | 'members'>(activeSection);

  // Synchronize with prop if provided
  const activeTab = onSectionChange ? activeSection : currentSection;
  const setTab = (tab: 'departments' | 'members') => {
    if (onSectionChange) {
      onSectionChange(tab);
    } else {
      setCurrentSection(tab);
    }
  };

  // Search and Filters
  const [deptSearch, setDeptSearch] = useState('');

  // Members search and filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDeptFilter, setMemberDeptFilter] = useState('all');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'admin' | 'coadmin' | 'member'>('all');
  const [memberMealFilter, setMemberMealFilter] = useState<'all' | 'on' | 'off'>('all');

  // Members sorting state (GPF, Department, Name, Balance, Role)
  const [memberSortField, setMemberSortField] = useState<'gpf' | 'department' | 'name' | 'balance' | 'role'>('gpf');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('asc');

  // Helper for sorting GPF with Bangla numerals
  const banglaToEnglishDigits = (str: string): string => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').replace(/[০-৯]/g, (d) => banglaDigits.indexOf(d).toString());
  };

  const extractGpfNumber = (gpf: string): number => {
    const eng = banglaToEnglishDigits(gpf);
    const digits = eng.replace(/\D/g, '');
    const num = parseInt(digits, 10);
    return isNaN(num) ? 0 : num;
  };

  const handleSortToggle = (field: 'gpf' | 'department' | 'name' | 'balance' | 'role') => {
    if (memberSortField === field) {
      setMemberSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setMemberSortField(field);
      setMemberSortOrder('asc');
    }
  };

  // Modals state
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  // New Department Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptNameEn, setNewDeptNameEn] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  // Code Database Sync State
  const [isDbSyncModalOpen, setIsDbSyncModalOpen] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [dbNotification, setDbNotification] = useState<string | null>(null);

  // Helpers
  const getDeptMemberCount = (deptName: string) => {
    return members.filter((m) => m.department === deptName).length;
  };

  // Submit Add Department
  const handleCreateDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    const newDept: Department = {
      id: `dept-${newDeptCode.trim().toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name: newDeptName.trim(),
      nameEn: newDeptNameEn.trim() || undefined,
      code: newDeptCode.trim().toUpperCase(),
      adminGpf: '',
      adminName: '',
      coAdminGpf: '',
      coAdminName: '',
    };

    onAddDepartment(newDept);

    setIsAddDeptModalOpen(false);
    setNewDeptName('');
    setNewDeptNameEn('');
    setNewDeptCode('');

    setDbNotification(
      lang === 'bn'
        ? `নতুন বিভাগ "${newDept.name}" কোড ডাটাবেজে সফলভাবে যুক্ত করা হয়েছে!`
        : `Department "${newDept.name}" successfully added to code database!`
    );
    setTimeout(() => setDbNotification(null), 4000);
  };

  // Submit Update Department (Rename & Details)
  const handleUpdateDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editingDept.name.trim() || !editingDept.code.trim()) return;

    onUpdateDepartment(editingDept);
    setEditingDept(null);
  };

  // Submit Delete Department
  const handleConfirmDeleteDept = () => {
    if (!deletingDept) return;
    onDeleteDepartment(deletingDept.id);
    setDeletingDept(null);
  };

  // Toggle meal status
  const handleToggleMemberMeal = (memberId: string) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          todayMealStatus: (m.todayMealStatus === 'on' ? 'off' : 'on') as 'on' | 'off',
        };
      }
      return m;
    });
    onUpdateMembers(updated);
  };

  // Inline role changer
  const handleChangeMemberRole = (memberId: string, newRole: UserRole) => {
    const updated = members.map((mem) =>
      mem.id === memberId ? { ...mem, role: newRole } : mem
    );
    onUpdateMembers(updated);
  };

  // Filtered departments for Department Management table
  const filteredDepartments = departments.filter((d) => {
    if (!deptSearch.trim()) return true;
    const q = deptSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.nameEn && d.nameEn.toLowerCase().includes(q))
    );
  });

  // Filtered members for Member Directory
  const filteredMembers = members.filter((m) => {
    if (memberDeptFilter !== 'all' && m.department !== memberDeptFilter) return false;
    if (memberRoleFilter !== 'all' && m.role !== memberRoleFilter) return false;
    if (memberMealFilter !== 'all' && m.todayMealStatus !== memberMealFilter) return false;

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.gpfNo.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.roomNo && m.roomNo.toLowerCase().includes(q)) ||
        (m.mobile && m.mobile.includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sorted members for Member Directory (GPF, Department, Name, Balance, Role)
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let comparison = 0;
    if (memberSortField === 'gpf') {
      const gpfA = extractGpfNumber(a.gpfNo);
      const gpfB = extractGpfNumber(b.gpfNo);
      if (gpfA !== gpfB) {
        comparison = gpfA - gpfB;
      } else {
        comparison = a.gpfNo.localeCompare(b.gpfNo, 'bn');
      }
    } else if (memberSortField === 'department') {
      comparison = a.department.localeCompare(b.department, 'bn');
      if (comparison === 0) {
        comparison = extractGpfNumber(a.gpfNo) - extractGpfNumber(b.gpfNo);
      }
    } else if (memberSortField === 'name') {
      comparison = a.name.localeCompare(b.name, 'bn');
    } else if (memberSortField === 'balance') {
      comparison = a.advanceBalance - b.advanceBalance;
    } else if (memberSortField === 'role') {
      const roleWeight = { admin: 1, coadmin: 2, member: 3 };
      comparison = (roleWeight[a.role] || 99) - (roleWeight[b.role] || 99);
    }

    return memberSortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SECTION 1: DEPARTMENT MANAGEMENT (Add, Delete, Rename Separately - NO CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#064E2B] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {lang === 'bn' ? 'ব্যাংক বিভাগ ব্যবস্থাপনা' : 'Department Management'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {lang === 'bn'
                    ? 'নতুন বিভাগ সংযোজন, কোড/নাম পরিবর্তন (Rename) ও বিভাগ ডিলিট করুন'
                    : 'Add new departments, rename codes/names, and delete departments'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:space-x-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'বিভাগ বা কোড খুঁজুন...' : 'Search department or code...'}
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#064E2B]"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsDbSyncModalOpen(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border border-gray-200 dark:border-slate-700"
                title={lang === 'bn' ? 'কোড ডাটাবেজ স্থিতি ও সিঙ্ক' : 'Code Database Status & Sync'}
              >
                <Database className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400" />
                <span>{lang === 'bn' ? 'কোড ডাটাবেজ' : 'Code Database'}</span>
              </button>

              <button
                onClick={() => setIsAddDeptModalOpen(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'bn' ? 'নতুন বিভাগ তৈরি' : 'Create Department'}</span>
              </button>
            </div>
          </div>

          {/* Success Notification Banner */}
          {dbNotification && (
            <div className="mx-4 sm:mx-5 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-[#064E2B] dark:text-emerald-300 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">{dbNotification}</span>
              </div>
              <button
                onClick={() => setDbNotification(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Department Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
                  <th className="py-3 px-4 w-28">{lang === 'bn' ? 'কোড (Code)' : 'Code'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'বিভাগের নাম' : 'Department Name'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'bn' ? 'নিবন্ধিত কর্মকর্তা' : 'Officers'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'bn' ? 'ব্যবস্থাপনা ও অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-sans">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400 dark:text-slate-500">
                      {lang === 'bn' ? 'কোনো বিভাগ পাওয়া যায়নি' : 'No departments found'}
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => {
                    const memberCount = getDeptMemberCount(dept.name);
                    return (
                      <tr
                        key={dept.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition"
                      >
                        <td className="py-3 px-4 font-mono">
                          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/70 text-[#064E2B] dark:text-emerald-300 text-xs font-black rounded-lg border border-emerald-200/80 dark:border-emerald-800">
                            {dept.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {dept.name}
                          </div>
                          {dept.nameEn && (
                            <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                              {dept.nameEn}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#064E2B] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                            <Users className="w-3 h-3 mr-1" />
                            {lang === 'bn' ? `${memberCount} জন` : `${memberCount} members`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setEditingDept({ ...dept })}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 hover:text-[#064E2B] dark:hover:text-emerald-400 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                              title={lang === 'bn' ? 'বিভাগের নাম ও কোড পরিবর্তন করুন' : 'Rename department and code'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'নাম পরিবর্তন' : 'Rename'}</span>
                            </button>
                            <button
                              onClick={() => setDeletingDept(dept)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition cursor-pointer"
                              title={lang === 'bn' ? 'বিভাগ মুছে ফেলুন' : 'Delete department'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'মুছুন' : 'Delete'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200/80 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              {lang === 'bn' ? (
                <>মোট বিভাগ: <strong className="text-gray-900 dark:text-white font-mono">{departments.length}</strong> টি</>
              ) : (
                <>Total Departments: <strong className="text-gray-900 dark:text-white font-mono">{departments.length}</strong></>
              )}
            </span>
            <span>
              {lang === 'bn'
                ? 'সদস্য ব্যবস্থাপনা ও মিলের তথ্যের জন্য পাশের কর্মকর্তা ও সদস্য তালিকা ট্যাবে যান।'
                : 'For member directory and meal status, see the Member Directory tab.'}
            </span>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: MEMBERS & ROLES DIRECTORY (Search, Roles & Meal Attendance) */}
      {/* ========================================================================= */}
      {activeTab === 'members' && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#064E2B] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {lang === 'bn' ? 'কর্মকর্তা সদস্য তালিকা ও প্রশাসনিক পদবী' : 'Member Directory & Roles'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {lang === 'bn'
                    ? 'বিভাগ অনুযায়ী ফিল্টার, প্রশাসনিক রোল দ্রুত পরিবর্তন ও মিল ওভাররাইড'
                    : 'Filter by department, change administrative roles, and toggle meal status'}
                </p>
              </div>
            </div>

            {/* Action & Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
              <select
                value={memberDeptFilter}
                onChange={(e) => setMemberDeptFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="all">
                  {lang === 'bn' ? `সব বিভাগ (${members.length})` : `All Departments (${members.length})`}
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({getDeptMemberCount(d.name)})
                  </option>
                ))}
              </select>

              <select
                value={memberRoleFilter}
                onChange={(e) => setMemberRoleFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="all">{lang === 'bn' ? 'সব ভূমিকা (Role)' : 'All Roles'}</option>
                <option value="admin">
                  {lang === 'bn'
                    ? `মেস এডমিন (${members.filter((m) => m.role === 'admin').length})`
                    : `Mess Admin (${members.filter((m) => m.role === 'admin').length})`}
                </option>
                <option value="coadmin">
                  {lang === 'bn'
                    ? `কো-এডমিন (${members.filter((m) => m.role === 'coadmin').length})`
                    : `Co-Admin (${members.filter((m) => m.role === 'coadmin').length})`}
                </option>
                <option value="member">
                  {lang === 'bn'
                    ? `সাধারণ মেম্বার (${members.filter((m) => m.role === 'member').length})`
                    : `Member (${members.filter((m) => m.role === 'member').length})`}
                </option>
              </select>

              {/* Sort By Dropdown (GPF, Department, Name, Balance) */}
              <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 w-full sm:w-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                  {lang === 'bn' ? 'সর্ট:' : 'Sort:'}
                </label>
                <select
                  value={`${memberSortField}-${memberSortOrder}`}
                  onChange={(e) => {
                    const [f, ord] = e.target.value.split('-') as [
                      'gpf' | 'department' | 'name' | 'balance' | 'role',
                      'asc' | 'desc'
                    ];
                    setMemberSortField(f);
                    setMemberSortOrder(ord);
                  }}
                  className="bg-transparent text-xs text-gray-900 dark:text-slate-100 font-semibold focus:outline-hidden cursor-pointer w-full"
                >
                  <option value="gpf-asc">
                    {lang === 'bn' ? 'GPF অনুযায়ী (ছোট ➔ বড়)' : 'By GPF (Ascending)'}
                  </option>
                  <option value="gpf-desc">
                    {lang === 'bn' ? 'GPF অনুযায়ী (বড় ➔ ছোট)' : 'By GPF (Descending)'}
                  </option>
                  <option value="department-asc">
                    {lang === 'bn' ? 'বিভাগ অনুযায়ী (ক ➔ ক্ষ)' : 'By Department (A ➔ Z)'}
                  </option>
                  <option value="department-desc">
                    {lang === 'bn' ? 'বিভাগ অনুযায়ী (ক্ষ ➔ ক)' : 'By Department (Z ➔ A)'}
                  </option>
                  <option value="name-asc">
                    {lang === 'bn' ? 'নাম অনুযায়ী (ক ➔ ক্ষ)' : 'By Name (A ➔ Z)'}
                  </option>
                  <option value="balance-desc">
                    {lang === 'bn' ? 'ব্যালেন্স অনুযায়ী (বেশি ➔ কম)' : 'By Balance (High ➔ Low)'}
                  </option>
                  <option value="balance-asc">
                    {lang === 'bn' ? 'ব্যালেন্স অনুযায়ী (কম ➔ বেশি)' : 'By Balance (Low ➔ High)'}
                  </option>
                </select>
              </div>

              <div className="relative w-full sm:w-52">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'নাম, GPF বা পদবী খুঁজুন...' : 'Search name, GPF, or designation...'}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#064E2B]"
                />
              </div>

              <button
                onClick={onOpenAddMember}
                className="inline-flex items-center justify-center space-x-1 px-3.5 py-1.5 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নতুন মেম্বার' : 'Add Member'}</span>
              </button>
            </div>
          </div>

          {/* Mobile horizontal scroll hint */}
          <div className="sm:hidden px-4 py-1.5 text-[11px] text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span>{lang === 'bn' ? 'সম্পূর্ণ দেখতে ডানে স্ক্রোল করুন →' : 'Scroll right to view all columns →'}</span>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700 select-none">
                  <th
                    onClick={() => handleSortToggle('gpf')}
                    className="py-3 px-4 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-slate-700/60 transition group"
                    title={lang === 'bn' ? 'GPF অনুযায়ী সর্ট করুন' : 'Sort by GPF'}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{lang === 'bn' ? 'GPF নং' : 'GPF No.'}</span>
                      {memberSortField === 'gpf' ? (
                        memberSortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-40 group-hover:opacity-100 transition shrink-0" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('name')}
                    className="py-3 px-4 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-slate-700/60 transition group"
                    title={lang === 'bn' ? 'নাম অনুযায়ী সর্ট করুন' : 'Sort by Name'}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{lang === 'bn' ? 'নাম ও পদবী' : 'Name & Title'}</span>
                      {memberSortField === 'name' ? (
                        memberSortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-40 group-hover:opacity-100 transition shrink-0" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('department')}
                    className="py-3 px-4 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-slate-700/60 transition group"
                    title={lang === 'bn' ? 'বিভাগ অনুযায়ী সর্ট করুন' : 'Sort by Department'}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{lang === 'bn' ? 'বিভাগ ও রুম' : 'Dept & Room'}</span>
                      {memberSortField === 'department' ? (
                        memberSortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-40 group-hover:opacity-100 transition shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'প্রশাসনিক ভূমিকা (Role)' : 'Admin Role'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'মোবাইল' : 'Mobile'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'bn' ? 'আজকের মিল' : 'Meal Status'}</th>
                  <th
                    onClick={() => handleSortToggle('balance')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100/80 dark:hover:bg-slate-700/60 transition group"
                    title={lang === 'bn' ? 'ব্যালেন্স অনুযায়ী সর্ট করুন' : 'Sort by Balance'}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>{lang === 'bn' ? 'ব্যালেন্স (৳)' : 'Balance (৳)'}</span>
                      {memberSortField === 'balance' ? (
                        memberSortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#064E2B] dark:text-emerald-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-40 group-hover:opacity-100 transition shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">{lang === 'bn' ? 'মিল অ্যাকশন' : 'Meal Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-sans">
                {sortedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400 dark:text-slate-500">
                      {lang === 'bn' ? 'কোনো কর্মকর্তা পাওয়া যায়নি' : 'No officers found'}
                    </td>
                  </tr>
                ) : (
                  sortedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#064E2B] dark:text-emerald-400">
                        {m.gpfNo}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {getLocalizedName(m.name, lang)}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          {getLocalizedDesignation(m.designation, lang)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-slate-300">
                        <div className="font-medium text-gray-900 dark:text-slate-200">
                          {getLocalizedDepartment(m.department, lang)}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                          {lang === 'bn' ? `রুম: ${m.roomNo}` : `Room: ${getLocalizedRoom(m.roomNo, lang)}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={m.role}
                          onChange={(e) => handleChangeMemberRole(m.id, e.target.value as UserRole)}
                          className={`text-xs font-bold py-1 px-2 rounded-lg border transition cursor-pointer ${
                            m.role === 'admin'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#064E2B] dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : m.role === 'coadmin'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="member">{lang === 'bn' ? 'সাধারণ মেম্বার' : 'Member'}</option>
                          <option value="coadmin">{lang === 'bn' ? 'বিভাগীয় কো-এডমিন' : 'Co-Admin'}</option>
                          <option value="admin">{lang === 'bn' ? 'মেস এডমিন' : 'Mess Admin'}</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-slate-400">{m.mobile}</td>
                      <td className="py-3 px-4 text-center">
                        {m.todayMealStatus === 'on' ? (
                          <span className="inline-flex items-center text-[#064E2B] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
                            {lang === 'bn' ? 'মিল চালু' : 'Meal Active'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                            {lang === 'bn' ? 'মিল বন্ধ' : 'Meal Off'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white font-mono">
                        ৳ {m.advanceBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleMemberMeal(m.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                            m.todayMealStatus === 'on'
                              ? 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {m.todayMealStatus === 'on'
                            ? lang === 'bn' ? 'অফ করুন' : 'Turn Off'
                            : lang === 'bn' ? 'অন করুন' : 'Turn On'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Member Table Footer Summary */}
          <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200/80 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              {lang === 'bn' ? (
                <>
                  মোট প্রদর্শিত কর্মকর্তা:{' '}
                  <strong className="text-gray-900 dark:text-white font-mono">{sortedMembers.length}</strong> জন{' '}
                  {sortedMembers.length !== members.length && `(মোট ${members.length} জনের মধ্যে)`}
                </>
              ) : (
                <>
                  Total Officers Shown:{' '}
                  <strong className="text-gray-900 dark:text-white font-mono">{sortedMembers.length}</strong>{' '}
                  {sortedMembers.length !== members.length && `(out of ${members.length})`}
                </>
              )}
            </span>
            <div className="flex items-center space-x-2">
              <span>{lang === 'bn' ? 'সর্ট করা হয়েছে:' : 'Sorted by:'}</span>
              <span className="inline-flex items-center space-x-1 font-bold text-[#064E2B] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                {memberSortField === 'gpf' && (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `GPF নং (${memberSortOrder === 'asc' ? 'ছোট ➔ বড়' : 'বড় ➔ ছোট'})`
                        : `GPF (${memberSortOrder === 'asc' ? 'Ascending' : 'Descending'})`}
                    </span>
                    {memberSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </>
                )}
                {memberSortField === 'department' && (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `বিভাগ (${memberSortOrder === 'asc' ? 'ক ➔ ক্ষ' : 'ক্ষ ➔ ক'})`
                        : `Department (${memberSortOrder === 'asc' ? 'A ➔ Z' : 'Z ➔ A'})`}
                    </span>
                    {memberSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </>
                )}
                {memberSortField === 'name' && (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `নাম (${memberSortOrder === 'asc' ? 'ক ➔ ক্ষ' : 'ক্ষ ➔ ক'})`
                        : `Name (${memberSortOrder === 'asc' ? 'A ➔ Z' : 'Z ➔ A'})`}
                    </span>
                    {memberSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </>
                )}
                {memberSortField === 'balance' && (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `ব্যালেন্স (${memberSortOrder === 'desc' ? 'বেশি ➔ কম' : 'কম ➔ বেশি'})`
                        : `Balance (${memberSortOrder === 'desc' ? 'High ➔ Low' : 'Low ➔ High'})`}
                    </span>
                    {memberSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </>
                )}
                {memberSortField === 'role' && (
                  <>
                    <span>
                      {lang === 'bn'
                        ? `পদবী (${memberSortOrder === 'asc' ? 'এডমিন ➔ মেম্বার' : 'মেম্বার ➔ এডমিন'})`
                        : `Role (${memberSortOrder === 'asc' ? 'Admin ➔ Member' : 'Member ➔ Admin'})`}
                    </span>
                    {memberSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </>
                )}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD DEPARTMENT */}
      {/* ========================================================================= */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#064E2B] dark:text-emerald-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {lang === 'bn' ? 'নতুন ব্যাংক বিভাগ তৈরি করুন' : 'Create New Bank Department'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddDeptModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeptSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিভাগের নাম (বাংলা)' : 'Department Name (Bengali)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'যেমন: ক্রেডিট রিস্ক ম্যানেজমেন্ট বিভাগ' : 'e.g. Credit Risk Management Dept'}
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#064E2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিভাগ কোড (Code)' : 'Department Code'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CRMD, ICT, HRD"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm uppercase font-mono text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#064E2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিভাগের নাম (English)' : 'Department Name (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Credit Risk Management"
                    value={newDeptNameEn}
                    onChange={(e) => setNewDeptNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#064E2B]"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'bn'
                    ? 'সংরক্ষণ করার পর বিভাগটি কোড ডাটাবেজ ও ব্রাউজার স্টোরেজে সরাসরি যুক্ত হবে এবং মেম্বার লিস্ট ও অ্যাকাউন্টস শিটে ব্যবহারের উপযোগী হবে।'
                    : 'Once saved, this department will be immediately added to the code database and local storage, available for all member forms and billing sheets.'}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
                >
                  {lang === 'bn' ? 'বিভাগ সংরক্ষণ করুন' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CODE DATABASE SYNC & EXPORT */}
      {/* ========================================================================= */}
      {isDbSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-[#064E2B] text-white">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">
                    {lang === 'bn' ? 'কোড ডাটাবেজ (Code Database) স্থিতি ও রপ্তানি' : 'Code Database Status & Export'}
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    {lang === 'bn' ? 'ব্যাংক ক্যান্টিন কোডবেস ও লোকাল স্টোরেজ সিঙ্ক্রোনাইজেশন' : 'Canteen codebase & local storage synchronization'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDbSyncModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    {lang === 'bn' ? 'মোট নিবন্ধিত বিভাগ' : 'Total Departments'}
                  </div>
                  <div className="text-xl font-bold font-mono text-[#064E2B] dark:text-emerald-400 mt-0.5">
                    {departments.length}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                    {lang === 'bn' ? 'ডাটাবেজ অবস্থান' : 'Database Location'}
                  </div>
                  <div className="text-xs font-bold font-mono text-blue-900 dark:text-blue-300 mt-1">
                    src/data.ts + Storage
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    {lang === 'bn' ? 'স্টোরেজ অবস্থা' : 'Storage State'}
                  </div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 mt-1 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{lang === 'bn' ? 'লাইভ সংরক্ষিত' : 'Live Synced'}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory banner */}
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300 space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-gray-900 dark:text-white">
                  <Code className="w-4 h-4 text-[#064E2B] dark:text-emerald-400" />
                  <span>{lang === 'bn' ? 'কোড ডাটাবেজ ইন্টিগ্রেশন নির্দেশনা:' : 'Code Database Integration Guide:'}</span>
                </div>
                <p>
                  {lang === 'bn'
                    ? 'আপনি যখনই অ্যাডমিন প্যানেল থেকে কোনো নতুন বিভাগ যোগ করবেন, সেটি স্বয়ংক্রিয়ভাবে সিস্টেমের স্থায়ী মেমোরি ও ব্রাউজার স্টোরেজে সংরক্ষিত থাকে এবং সকল মেম্বার ও অ্যাকাউন্টস শিটে প্রদর্শিত হয়।'
                    : 'Whenever you add a new department via the Admin Panel, it is automatically persisted in the application storage and available in member management and accounts.'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  {lang === 'bn'
                    ? 'কোডবেসের স্থায়ী সোর্স ফাইল (src/data.ts) আপডেট করতে নিচে থেকে প্রস্তুতকৃত কোড স্নিপেট এক ক্লিকে কপি করুন অথবা JSON ফাইল হিসেবে ব্যাকআপ ডাউনলোড করুন।'
                    : 'To update the codebase source file (src/data.ts), copy the formatted TypeScript code snippet below or download as JSON backup.'}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <span>{lang === 'bn' ? 'TypeScript ডাটাবেজ কোড (INITIAL_DEPARTMENTS):' : 'TypeScript Database Code (INITIAL_DEPARTMENTS):'}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const code = `export const INITIAL_DEPARTMENTS: Department[] = ${JSON.stringify(departments, null, 2)};\n`;
                        navigator.clipboard.writeText(code);
                        setHasCopiedCode(true);
                        setTimeout(() => setHasCopiedCode(false), 2500);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      {hasCopiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'কোড কপি করুন' : 'Copy Code'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(departments, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `kbl_canteen_departments_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-gray-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'JSON ডাউনলোড' : 'Download JSON'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] sm:text-xs rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                    <code>
                      {`// src/data.ts - Code Database\nexport const INITIAL_DEPARTMENTS: Department[] = ${JSON.stringify(departments, null, 2)};`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Action Close */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDbSyncModalOpen(false)}
                  className="px-5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT / RENAME DEPARTMENT */}
      {/* ========================================================================= */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#064E2B] dark:text-emerald-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {lang === 'bn' ? 'বিভাগের নাম ও তথ্য পরিবর্তন (Rename / Edit)' : 'Rename / Edit Department'}
                </h3>
              </div>
              <button
                onClick={() => setEditingDept(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDeptSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিভাগের নাম (বাংলা)' : 'Department Name (Bengali)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#064E2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিভাগ কোড (Code)' : 'Department Code'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDept.code}
                    onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono uppercase text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#064E2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিভাগের নাম (English)' : 'English Name'}
                  </label>
                  <input
                    type="text"
                    value={editingDept.nameEn || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-[#064E2B]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E2B] hover:bg-[#085a33] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
                >
                  {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/70 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {lang === 'bn' ? 'বিভাগ মুছে ফেলার নিশ্চয়তা' : 'Confirm Department Deletion'}
              </h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
              {lang === 'bn' ? (
                <>
                  আপনি কি নিশ্চিতভাবে{' '}
                  <strong className="text-gray-900 dark:text-white">[{deletingDept.code}] {deletingDept.name}</strong>{' '}
                  বিভাগটি মুছে ফেলতে চান?
                </>
              ) : (
                <>
                  Are you sure you want to delete{' '}
                  <strong className="text-gray-900 dark:text-white">[{deletingDept.code}] {deletingDept.name}</strong>{' '}
                  department?
                </>
              )}
            </p>

            {getDeptMemberCount(deletingDept.name) > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 inline mr-1 text-amber-600 shrink-0" />
                {lang === 'bn' ? (
                  <>সতর্কতা: এই বিভাগে বর্তমানে <strong>{getDeptMemberCount(deletingDept.name)}</strong> জন কর্মকর্তা নিবন্ধিত রয়েছেন।</>
                ) : (
                  <>Warning: Currently <strong>{getDeptMemberCount(deletingDept.name)}</strong> officers are registered in this department.</>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingDept(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteDept}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                {lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
