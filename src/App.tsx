import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import {
  ScreenType,
  UserProfile,
  UserRole,
  CalendarDay,
  LedgerItem,
  BazaarExpense,
  MemberBillingRecord,
  WeeklyMenuDay,
  CanteenNotice,
  Department,
  MealCallState,
} from './types';
import {
  INITIAL_PROFILES,
  INITIAL_MENU,
  INITIAL_OCTOBER_DAYS,
  INITIAL_LEDGER,
  INITIAL_BAZAAR_EXPENSES,
  INITIAL_BILLING_RECORDS,
  INITIAL_WEEKLY_MENU,
  INITIAL_NOTICES,
  INITIAL_ALL_MEMBERS,
  INITIAL_DEPARTMENTS,
  INITIAL_MEAL_CALL,
  generateCurrentMonthInitialDays,
  getInitialMealCall,
} from './data';
import { Navbar } from './components/Navbar';
import { api } from './services/api.ts';
import { HomeScreen } from './components/HomeScreen';
import { AuthScreen } from './components/AuthScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { MealBookingScreen } from './components/MealBookingScreen';
import { LedgerScreen } from './components/LedgerScreen';
import { BazaarScreen } from './components/BazaarScreen';
import { AccountsScreen } from './components/AccountsScreen';
import { MenuScreen } from './components/MenuScreen';
import { AdminScreen } from './components/AdminScreen';
import { DatabaseStudioScreen } from './components/DatabaseStudioScreen';
import {
  LedgerModal,
  FeedbackModal,
  ProfileEditModal,
  PasswordModal,
} from './components/Modals';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('booking');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.gpfNo || parsed.id)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PROFILES.member;
  });

  const getMonthStorageKey = (gpfNo: string) => {
    const now = new Date();
    return `kb_canteen_month_days_${now.getFullYear()}-${now.getMonth()}_${gpfNo}`;
  };

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => {
    try {
      const now = new Date();
      const initialUserGpf = currentUser?.gpfNo || INITIAL_PROFILES.member.gpfNo;
      const userKey = `kb_canteen_month_days_${now.getFullYear()}-${now.getMonth()}_${initialUserGpf}`;
      const fallbackKey = `kb_canteen_month_days_${now.getFullYear()}-${now.getMonth()}`;
      const saved = localStorage.getItem(userKey) || localStorage.getItem(fallbackKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return generateCurrentMonthInitialDays();
  });

  const [ledger, setLedger] = useState<LedgerItem[]>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_ledger');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_LEDGER;
  });

  const [menuItems] = useState(INITIAL_MENU);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Expanded State for Full Lovable Canteen Management Suite with localStorage persistence
  const [bazaarExpenses, setBazaarExpenses] = useState<BazaarExpense[]>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_bazaar_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((exp: any) => ({
            ...exp,
            amount: typeof exp.amount === 'number' && !isNaN(exp.amount)
              ? exp.amount
              : Number(exp.amount || exp.totalAmount || 0),
          }));
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_BAZAAR_EXPENSES;
  });

  const [billingRecords, setBillingRecords] =
    useState<MemberBillingRecord[]>(INITIAL_BILLING_RECORDS);

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenuDay[]>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_weekly_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_WEEKLY_MENU;
  });

  const [notices, setNotices] = useState<CanteenNotice[]>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_notices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTICES;
  });

  const [allMembers, setAllMembers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_all_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deptReplacements: Record<string, { bn: string; en: string }> = {
            'আইসিটি ডিপার্টমেন্ট': { bn: 'আইটি অপারেশন', en: 'IT Operation' },
            'আইসিটি শাখা': { bn: 'আইটি অপারেশন', en: 'IT Operation' },
            'প্রশাসন বিভাগ': { bn: 'সাধারণ সেবা বিভাগ', en: 'Common Services Department' },
            'হিসাব বিভাগ': { bn: 'কেন্দ্রীয় হিসাব ও তহবিল ব্যবস্থাপনা বিভাগ', en: 'Central Accounts and Fund Management Department' },
            'প্রধান শাখা': { bn: 'শাখা নিয়ন্ত্রণ বিভাগ', en: 'Branch Control Department' },
            'ঋণ ও অগ্রিম শাখা': { bn: 'ঋণ ও অগ্রিম বিভাগ', en: 'Loan and Advance Department' },
            'অডিট ও পরিদর্শন বিভাগ': { bn: 'নিরীক্ষা ও পরিদর্শন বিভাগ', en: 'Audit and Inspection Department' },
            'মানব সম্পদ বিভাগ': { bn: 'কর্মী ব্যবস্থাপনা বিভাগ', en: 'Personnel Management Department' },
            'পরিকল্পনা ও ঋণ কার্যক্রম': { bn: 'ঋণ ও অগ্রিম বিভাগ', en: 'Loan and Advance Department' },
          };
          return parsed.map((m: UserProfile) => {
            if (deptReplacements[m.department]) {
              return {
                ...m,
                department: deptReplacements[m.department].bn,
                departmentEn: deptReplacements[m.department].en,
              };
            }
            return m;
          });
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ALL_MEMBERS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_departments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const allowedNames = new Set(INITIAL_DEPARTMENTS.map((d) => d.name));
          const initialMap = new Map<string, Department>();
          INITIAL_DEPARTMENTS.forEach((d) => initialMap.set(d.name, d));

          // Retain ONLY the 15 specified departments
          const validParsed = parsed.filter((p: Department) => allowedNames.has(p.name));

          // Merge any saved attributes with code definition
          const merged = validParsed.map((p: Department) => {
            const initial = initialMap.get(p.name);
            if (initial) {
              return { ...initial, ...p, code: initial.code, nameEn: initial.nameEn || p.nameEn, id: initial.id };
            }
            return p;
          });

          // Add any of the 15 that might be missing
          const mergedNames = new Set(merged.map((d: Department) => d.name));
          const missing = INITIAL_DEPARTMENTS.filter((d) => !mergedNames.has(d.name));
          const result = [...merged, ...missing];
          try {
            localStorage.setItem('kb_canteen_departments', JSON.stringify(result));
          } catch {
            // ignore
          }
          return result;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_DEPARTMENTS;
  });

  const [mealCallState, setMealCallState] = useState<MealCallState>(() => {
    try {
      const saved = localStorage.getItem('kb_canteen_meal_call_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If stored data contains outdated 2024 dates, refresh to current date
          if (
            typeof parsed.targetDate === 'string' &&
            (parsed.targetDate.includes('২০২৪') || parsed.targetDate.includes('2024'))
          ) {
            return getInitialMealCall();
          }
          if (parsed.cutoffTime === '১০:০০ AM' || parsed.cutoffTime === '10:00 AM') {
            parsed.cutoffTime = 'বিকাল ৫:০০ টা';
            parsed.cutoffTimeEn = '5:00 PM';
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_MEAL_CALL;
  });

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_current_user', JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_weekly_menu', JSON.stringify(weeklyMenu));
    } catch {
      // ignore
    }
  }, [weeklyMenu]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_ledger', JSON.stringify(ledger));
    } catch {
      // ignore
    }
  }, [ledger]);

  useEffect(() => {
    if (calendarDays && calendarDays.length > 0 && currentUser?.gpfNo) {
      try {
        localStorage.setItem(getMonthStorageKey(currentUser.gpfNo), JSON.stringify(calendarDays));
      } catch {
        // ignore
      }
    }
  }, [calendarDays, currentUser?.gpfNo]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_departments', JSON.stringify(departments));
    } catch {
      // ignore
    }
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_all_members', JSON.stringify(allMembers));
    } catch {
      // ignore
    }
  }, [allMembers]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_bazaar_expenses', JSON.stringify(bazaarExpenses));
    } catch {
      // ignore
    }
  }, [bazaarExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_meal_call_state', JSON.stringify(mealCallState));
    } catch {
      // ignore
    }
  }, [mealCallState]);

  useEffect(() => {
    try {
      localStorage.setItem('kb_canteen_notices', JSON.stringify(notices));
    } catch {
      // ignore
    }
  }, [notices]);

  // When currentUser changes, reload their personal calendar days
  useEffect(() => {
    if (!currentUser?.gpfNo) return;
    try {
      const userKey = getMonthStorageKey(currentUser.gpfNo);
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCalendarDays(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
  }, [currentUser?.gpfNo]);

  // Load live data from PostgreSQL database on mount / profile switch
  useEffect(() => {
    let isMounted = true;
    async function loadDatabaseData() {
      try {
        const [dbMealCall, dbBazaar, dbNotices, dbPayments, dbBookings] = await Promise.all([
          api.getLatestMealCall(),
          api.getBazaarExpenses(),
          api.getNotices(),
          api.getPayments(currentUser.gpfNo),
          api.getBookings(currentUser.gpfNo),
        ]);

        if (!isMounted) return;

        if (dbMealCall) {
          setMealCallState(dbMealCall);
        }
        if (dbBazaar && dbBazaar.length > 0) {
          setBazaarExpenses(dbBazaar);
        }
        if (dbNotices && dbNotices.length > 0) {
          setNotices(dbNotices);
        }
        if (dbPayments && dbPayments.length > 0) {
          const mappedLedger: LedgerItem[] = dbPayments.map((p: any) => ({
            id: `TXN-${p.id || p.voucherNo}`,
            date: p.date,
            description: p.notes || p.method || 'অগ্রিম ব্যালেন্স জমা',
            descriptionEn: p.notes || p.method || 'Advance Balance Deposit',
            type: 'deposit',
            amount: p.amount,
            balanceAfter: currentUser.advanceBalance,
            ref: p.voucherNo || `VCH-${p.id}`,
          }));
          setLedger(mappedLedger);
        }
        if (dbBookings && dbBookings.length > 0) {
          setCalendarDays((prev) =>
            prev.map((day) => {
              const matched = dbBookings.find((b: any) => b.dayNumber === day.day);
              if (matched) {
                return {
                  ...day,
                  officerMeal: matched.officerMeal,
                  guestMeal: matched.guestMeal,
                  status: matched.status as any,
                };
              }
              return day;
            })
          );
        }
      } catch (err) {
        console.warn('Database initialization note:', err);
      }
    }
    loadDatabaseData();
    return () => {
      isMounted = false;
    };
  }, [currentUser.gpfNo]);

  const handleUpdateMealCall = (patch: Partial<MealCallState>) => {
    const updated = { ...mealCallState, ...patch };
    setMealCallState(updated);
    api.saveMealCall(updated).catch((err) => console.warn('Meal call sync notice:', err));
  };

  const handleUpdateDays = (updater: CalendarDay[] | ((prev: CalendarDay[]) => CalendarDay[])) => {
    setCalendarDays((prev) => {
      const nextDays = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(getMonthStorageKey(currentUser.gpfNo), JSON.stringify(nextDays));
      } catch {
        // ignore
      }
      // Persist any altered day bookings to PostgreSQL
      nextDays.forEach((d) => {
        api.saveBooking({
          gpfNo: currentUser.gpfNo,
          date: `${d.day} সেপ্টেম্বর ২০২৬`,
          dayNumber: d.day,
          officerMeal: d.officerMeal,
          guestMeal: d.guestMeal,
          status: d.status,
        }).catch((err) => console.warn('Booking sync notice:', err));
      });
      return nextDays;
    });
  };

  // Modal open states
  const [ledgerOpen, setLedgerOpen] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [profileEditOpen, setProfileEditOpen] = useState<boolean>(false);
  const [passwordOpen, setPasswordOpen] = useState<boolean>(false);

  // Switch role / profile
  const handleSwitchUser = (role: UserRole) => {
    const matched = allMembers.find((m) => m.role === role) || INITIAL_PROFILES[role];
    setCurrentUser(matched);
    try {
      localStorage.setItem('kb_canteen_current_user', JSON.stringify(matched));
    } catch {
      // ignore
    }
  };

  // Login callback
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kb_canteen_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentScreen('dashboard');
  };

  // Toggle today's status
  const handleToggleTodayStatus = () => {
    const newStatus = currentUser.todayMealStatus === 'on' ? 'off' : 'on';
    const newMonthlyMeals =
      newStatus === 'off'
        ? Math.max(0, currentUser.monthlyMeals - 1)
        : currentUser.monthlyMeals + 1;
    const updatedUser: UserProfile = {
      ...currentUser,
      todayMealStatus: newStatus,
      monthlyMeals: newMonthlyMeals,
    };
    setCurrentUser(updatedUser);
    setAllMembers((prev) =>
      prev.map((m) =>
        m.gpfNo === currentUser.gpfNo || m.id === currentUser.id
          ? { ...m, todayMealStatus: newStatus, monthlyMeals: newMonthlyMeals }
          : m
      )
    );
    try {
      localStorage.setItem('kb_canteen_current_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    api.saveUser(updatedUser).catch((err) => console.warn('Today status sync notice:', err));
  };

  // Add balance deposit
  const handleAddDeposit = (amount: number, desc: string) => {
    const newBalance = currentUser.advanceBalance + amount;
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const voucher = `VCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn: LedgerItem = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      date: formattedDate,
      description: desc,
      descriptionEn: desc,
      type: 'deposit',
      amount,
      balanceAfter: newBalance,
      ref: voucher,
    };

    setLedger((prev) => [newTxn, ...prev]);

    const updatedUser: UserProfile = {
      ...currentUser,
      advanceBalance: newBalance,
    };
    setCurrentUser(updatedUser);
    setAllMembers((prev) =>
      prev.map((m) =>
        m.gpfNo === currentUser.gpfNo || m.id === currentUser.id
          ? { ...m, advanceBalance: newBalance }
          : m
      )
    );
    try {
      localStorage.setItem('kb_canteen_current_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }

    // Persist payment record to Cloud SQL
    api.recordPayment({
      gpfNo: currentUser.gpfNo,
      userName: currentUser.name,
      date: formattedDate,
      amount,
      voucherNo: voucher,
      method: 'অনলাইন/নগদ জমা',
      notes: desc,
    }).catch((err) => console.warn('Payment sync notice:', err));
  };

  // Edit profile info
  const handleSaveProfile = (updated: Partial<UserProfile>) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updated,
    };
    setCurrentUser(updatedUser);
    setAllMembers((prev) =>
      prev.map((m) =>
        m.gpfNo === currentUser.gpfNo || m.id === currentUser.id
          ? { ...m, ...updated }
          : m
      )
    );
    try {
      localStorage.setItem('kb_canteen_current_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    api.saveUser(updatedUser).catch((err) => console.warn('User profile sync notice:', err));
  };

  // Add Bazaar Expense
  const handleAddBazaarExpense = (newExpense: BazaarExpense) => {
    setBazaarExpenses([newExpense, ...bazaarExpenses]);
    api.saveBazaarExpense(newExpense).catch((err) => console.warn('Bazaar expense sync notice:', err));
  };

  // Notice handlers
  const handleAddNotice = (newNotice: CanteenNotice) => {
    setNotices([newNotice, ...notices]);
    api.saveNotice(newNotice).catch((err) => console.warn('Notice sync notice:', err));
  };

  const handleDeleteNotice = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  // Department handlers
  const handleAddDepartment = (dept: Department) => {
    setDepartments((prev) => [...prev, dept]);
  };

  const handleUpdateDepartment = (updatedDept: Department) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === updatedDept.id ? updatedDept : d))
    );
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAssignDeptRole = (
    deptId: string,
    role: 'admin' | 'coadmin',
    memberGpf: string,
    memberName: string,
    isNewMember?: boolean,
    newMemberData?: Partial<UserProfile>
  ) => {
    // 1. Update department leadership fields
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === deptId) {
          if (role === 'admin') {
            return { ...d, adminGpf: memberGpf, adminName: memberName };
          } else {
            return { ...d, coAdminGpf: memberGpf, coAdminName: memberName };
          }
        }
        return d;
      })
    );

    // 2. Update user profile role in allMembers (or add new member if new)
    setAllMembers((prev) => {
      const exists = prev.some((m) => m.gpfNo === memberGpf);
      if (exists) {
        return prev.map((m) =>
          m.gpfNo === memberGpf ? { ...m, role } : m
        );
      } else if (isNewMember && newMemberData) {
        const targetDept = departments.find((d) => d.id === deptId);
        const newProfile: UserProfile = {
          id: memberGpf,
          name: memberName,
          role,
          designation: newMemberData.designation || (role === 'admin' ? 'সহকারী মহাব্যবস্থাপক' : 'সিনিয়র প্রিন্সিপাল অফিসার'),
          department: newMemberData.department || targetDept?.name || 'প্রধান কার্যালয়',
          gpfNo: memberGpf,
          mobile: newMemberData.mobile || '০১৭১১-৯৮৭৬৫৪',
          email: `${memberGpf.toLowerCase()}@kbl.gov.bd`,
          roomNo: newMemberData.roomNo || targetDept?.floor || '৩য় তলা',
          monthlyMeals: 0,
          upcomingMeals: 1,
          advanceBalance: 2000,
          dueAmount: 0,
          todayMealStatus: 'on',
          mealRate: 65,
        };
        return [...prev, newProfile];
      }
      return prev;
    });

    // 3. If current logged in user was modified, update currentUser state
    if (currentUser.gpfNo === memberGpf) {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
  };

  // Total Bazaar sum (using amount field from BazaarExpense)
  const totalBazaarCost = bazaarExpenses.reduce((acc, curr) => {
    const amt = typeof curr.amount === 'number' && !isNaN(curr.amount)
      ? curr.amount
      : Number(curr.amount || (curr as any).totalAmount || 0);
    return acc + (isNaN(amt) ? 0 : amt);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-200 dark:selection:bg-emerald-800 selection:text-emerald-950 dark:selection:text-emerald-100 font-sans transition-colors duration-200">
      {/* If on Home Screen without mobile framing, render full responsive landing */}
      {currentScreen === 'home' && !isMobileMode ? (
        <HomeScreen
          onNavigate={(screen) => setCurrentScreen(screen)}
          lang={lang}
          setLang={setLang}
        />
      ) : (
        <div
          className={`flex-1 flex flex-col ${
            isMobileMode
              ? 'py-2 sm:py-6 px-1 sm:px-4 items-center justify-center bg-slate-900/80'
              : ''
          }`}
        >
          {/* Mobile frame wrapper if mobile mode is toggled */}
          <div
            className={`w-full flex-1 flex flex-col transition-all duration-300 ${
              isMobileMode
                ? 'max-w-[420px] bg-white dark:bg-[#111827] rounded-3xl shadow-2xl overflow-hidden border-4 sm:border-[8px] border-slate-800 dark:border-slate-700 min-h-[580px] h-[92vh] max-h-[900px] overflow-y-auto'
                : 'min-h-screen'
            }`}
          >
            {/* Header navbar only on authenticated app pages (hide on auth, register, home) */}
            {currentScreen !== 'auth' && currentScreen !== 'register' && currentScreen !== 'home' && (
              <Navbar
                currentScreen={currentScreen}
                setCurrentScreen={setCurrentScreen}
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
                isMobileMode={isMobileMode}
                setIsMobileMode={setIsMobileMode}
                lang={lang}
                setLang={setLang}
              />
            )}

            {/* Body Pages */}
            <div className="flex-1 pb-10">
              {currentScreen === 'home' && (
                <HomeScreen
                  onNavigate={(screen) => setCurrentScreen(screen)}
                  lang={lang}
                  setLang={setLang}
                />
              )}

              {currentScreen === 'auth' && (
                <AuthScreen
                  key="auth-login"
                  initialMode="login"
                  onLoginSuccess={handleLoginSuccess}
                  onNavigate={(screen) => setCurrentScreen(screen)}
                  lang={lang}
                />
              )}

              {currentScreen === 'register' && (
                <AuthScreen
                  key="auth-register"
                  initialMode="register"
                  onLoginSuccess={handleLoginSuccess}
                  onNavigate={(screen) => setCurrentScreen(screen)}
                  lang={lang}
                />
              )}

              {currentScreen === 'dashboard' && (
                <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                  <DashboardScreen
                    currentUser={currentUser}
                    menuItems={menuItems}
                    weeklyMenu={weeklyMenu}
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    onOpenLedger={() => setCurrentScreen('ledger')}
                    onOpenFeedback={() => setFeedbackOpen(true)}
                    onOpenProfileEdit={() => setProfileEditOpen(true)}
                    onOpenPasswordChange={() => setPasswordOpen(true)}
                    onToggleTodayStatus={handleToggleTodayStatus}
                    lang={lang}
                    mealCallState={mealCallState}
                  />
                </main>
              )}

              {currentScreen === 'booking' && (
                <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                  <MealBookingScreen
                    days={calendarDays}
                    onUpdateDays={handleUpdateDays}
                    currentUser={currentUser}
                    onNavigate={(screen) => setCurrentScreen(screen)}
                    lang={lang}
                    mealCallState={mealCallState}
                    onUpdateMealCall={handleUpdateMealCall}
                    weeklyMenu={weeklyMenu}
                    menuItems={menuItems}
                  />
                </main>
              )}

              {currentScreen === 'ledger' && (
                <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                  <LedgerScreen
                    currentUser={currentUser}
                    ledger={ledger}
                    advanceBalance={currentUser.advanceBalance}
                    onAddDeposit={handleAddDeposit}
                    lang={lang}
                  />
                </main>
              )}

              {currentScreen === 'bazaar' && (
                <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                  <BazaarScreen
                    expenses={bazaarExpenses}
                    onAddExpense={handleAddBazaarExpense}
                    currentUser={currentUser}
                    members={allMembers}
                    lang={lang}
                    mealCallState={mealCallState}
                    onUpdateMealCall={handleUpdateMealCall}
                  />
                </main>
              )}

              {currentScreen === 'accounts' && (
                <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                  <AccountsScreen
                    billingRecords={billingRecords}
                    currentUser={currentUser}
                    totalBazaarCost={totalBazaarCost}
                    departments={departments}
                    lang={lang}
                  />
                </main>
              )}

              {currentScreen === 'menu' && (
                currentUser.role === 'admin' || currentUser.role === 'manager' ? (
                  <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                    <MenuScreen
                      weeklyMenu={weeklyMenu}
                      onUpdateMenu={setWeeklyMenu}
                      currentUser={currentUser}
                      lang={lang}
                    />
                  </main>
                ) : (
                  <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                    <DashboardScreen
                      currentUser={currentUser}
                      menuItems={menuItems}
                      weeklyMenu={weeklyMenu}
                      onNavigate={(screen) => setCurrentScreen(screen)}
                      onOpenLedger={() => setLedgerOpen(true)}
                      onOpenFeedback={() => setFeedbackOpen(true)}
                      onOpenProfileEdit={() => setProfileEditOpen(true)}
                      onOpenPasswordChange={() => setPasswordOpen(true)}
                      onToggleTodayStatus={handleToggleTodayStatus}
                      lang={lang}
                      mealCallState={mealCallState}
                    />
                  </main>
                )
              )}

              {currentScreen === 'admin' && (
                <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                  <AdminScreen
                    members={allMembers}
                    onUpdateMembers={setAllMembers}
                    notices={notices}
                    onAddNotice={handleAddNotice}
                    onDeleteNotice={handleDeleteNotice}
                    departments={departments}
                    onAddDepartment={handleAddDepartment}
                    onUpdateDepartment={handleUpdateDepartment}
                    onDeleteDepartment={handleDeleteDepartment}
                    onAssignDeptRole={handleAssignDeptRole}
                    currentUser={currentUser}
                    lang={lang}
                    mealCallState={mealCallState}
                    onUpdateMealCall={handleUpdateMealCall}
                  />
                </main>
              )}

              {currentScreen === 'database' && (
                <div className="w-full">
                  <DatabaseStudioScreen
                    onBack={() => setCurrentScreen('dashboard')}
                    lang={lang}
                  />
                </div>
              )}

              {/* Application Footer */}
              {currentScreen !== 'auth' && currentScreen !== 'register' && currentScreen !== 'home' && (
                <footer className="max-w-5xl mx-auto px-3 sm:px-6 py-6 text-center" data-purpose="app-footer">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {lang === 'bn'
                      ? 'প্রস্তুতকৃতঃ আইটি সিস্টেম রিসার্চ অ্যান্ড ডেভেলপমেন্ট বিভাগ'
                      : 'Developed by: IT System Research and Development Department'}
                  </p>
                </footer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <LedgerModal
        isOpen={ledgerOpen}
        onClose={() => setLedgerOpen(false)}
        ledger={ledger}
        advanceBalance={currentUser.advanceBalance}
        onAddDeposit={handleAddDeposit}
        lang={lang}
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        lang={lang}
      />

      <ProfileEditModal
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        profile={currentUser}
        onSave={handleSaveProfile}
        lang={lang}
      />

      <PasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
