import { db } from './index.ts';
import { users, mealCalls, mealBookings, payments, bazaarExpenses, notices } from './schema.ts';
import { desc, eq, and, or } from 'drizzle-orm';

function normalizeGpf(gpf: string): string {
  if (!gpf) return '';
  return gpf.trim().replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
}

function toBnGpf(gpf: string): string {
  if (!gpf) return '';
  return gpf.trim().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
}

// Users
export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(users.id);
  } catch (error) {
    console.error('Database query failed in getUsers:', error);
    throw new Error('Failed to fetch users from database.', { cause: error });
  }
}

export async function getUserByGpf(gpfNo: string) {
  try {
    const result = await db.select().from(users).where(eq(users.gpfNo, gpfNo)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByGpf:', error);
    throw new Error('Failed to fetch user by GPF.', { cause: error });
  }
}

export async function upsertUser(data: {
  uid: string;
  email: string;
  name: string;
  nameEn?: string;
  role?: string;
  designation?: string;
  designationEn?: string;
  department?: string;
  departmentEn?: string;
  gpfNo: string;
  mobile?: string;
  roomNo?: string;
  advanceBalance?: number;
  dueAmount?: number;
  todayMealStatus?: string;
  mealRate?: number;
}) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: data.uid,
        email: data.email,
        name: data.name,
        nameEn: data.nameEn || '',
        role: data.role || 'member',
        designation: data.designation || 'কর্মকর্তা',
        designationEn: data.designationEn || 'Officer',
        department: data.department || 'সাধারণ',
        departmentEn: data.departmentEn || 'General',
        gpfNo: data.gpfNo,
        mobile: data.mobile || '',
        roomNo: data.roomNo || '',
        advanceBalance: data.advanceBalance ?? 0,
        dueAmount: data.dueAmount ?? 0,
        todayMealStatus: data.todayMealStatus || 'on',
        mealRate: data.mealRate ?? 65,
      })
      .onConflictDoUpdate({
        target: users.gpfNo,
        set: {
          email: data.email,
          name: data.name,
          nameEn: data.nameEn || '',
          role: data.role || 'member',
          designation: data.designation || 'কর্মকর্তা',
          department: data.department || 'সাধারণ',
          mobile: data.mobile || '',
          roomNo: data.roomNo || '',
          advanceBalance: data.advanceBalance ?? 0,
          dueAmount: data.dueAmount ?? 0,
          todayMealStatus: data.todayMealStatus || 'on',
          mealRate: data.mealRate ?? 65,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertUser:', error);
    throw new Error('Failed to save user in database.', { cause: error });
  }
}

// Meal Calls
export async function getLatestMealCall() {
  try {
    const result = await db.select().from(mealCalls).orderBy(desc(mealCalls.id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in getLatestMealCall:', error);
    throw new Error('Failed to fetch meal call state.', { cause: error });
  }
}

export async function saveMealCall(data: {
  isActive: boolean;
  targetDate: string;
  targetDateEn?: string;
  cutoffTime: string;
  cutoffTimeEn?: string;
  calledBy: string;
  calledByGpf: string;
  calledByRole?: string;
  calledAt: string;
  menuHighlight?: string;
  customNote?: string;
  calledDates: number[];
}) {
  try {
    const result = await db
      .insert(mealCalls)
      .values({
        isActive: data.isActive,
        targetDate: data.targetDate,
        targetDateEn: data.targetDateEn || data.targetDate,
        cutoffTime: data.cutoffTime,
        cutoffTimeEn: data.cutoffTimeEn || data.cutoffTime,
        calledBy: data.calledBy,
        calledByGpf: data.calledByGpf,
        calledByRole: data.calledByRole || 'admin',
        calledAt: data.calledAt,
        menuHighlight: data.menuHighlight || '',
        customNote: data.customNote || '',
        calledDates: JSON.stringify(data.calledDates),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in saveMealCall:', error);
    throw new Error('Failed to save meal call.', { cause: error });
  }
}

// Meal Bookings
export async function getBookingsByGpf(gpfNo: string) {
  try {
    const enGpf = normalizeGpf(gpfNo);
    const bnGpf = toBnGpf(gpfNo);
    return await db
      .select()
      .from(mealBookings)
      .where(
        or(
          eq(mealBookings.gpfNo, gpfNo),
          eq(mealBookings.gpfNo, enGpf),
          eq(mealBookings.gpfNo, bnGpf)
        )
      );
  } catch (error) {
    console.error('Database query failed in getBookingsByGpf:', error);
    throw new Error('Failed to fetch bookings.', { cause: error });
  }
}

export async function saveMealBooking(data: {
  userId?: number;
  gpfNo: string;
  date: string;
  dayNumber: number;
  officerMeal: number;
  guestMeal: number;
  status?: string;
}) {
  try {
    const enGpf = normalizeGpf(data.gpfNo);
    const bnGpf = toBnGpf(data.gpfNo);

    // Check if booking exists for this day and user (matching either Bengali or English GPF)
    const existing = await db
      .select()
      .from(mealBookings)
      .where(
        and(
          or(
            eq(mealBookings.gpfNo, data.gpfNo),
            eq(mealBookings.gpfNo, enGpf),
            eq(mealBookings.gpfNo, bnGpf)
          ),
          eq(mealBookings.dayNumber, data.dayNumber)
        )
      )
      .limit(1);

    const calculatedStatus =
      data.status || (data.officerMeal > 0 || data.guestMeal > 0 ? 'booked' : 'unbooked');

    if (existing.length > 0) {
      const result = await db
        .update(mealBookings)
        .set({
          gpfNo: data.gpfNo,
          officerMeal: data.officerMeal,
          guestMeal: data.guestMeal,
          status: calculatedStatus,
          updatedAt: new Date(),
        })
        .where(eq(mealBookings.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(mealBookings)
        .values({
          userId: data.userId,
          gpfNo: data.gpfNo,
          date: data.date,
          dayNumber: data.dayNumber,
          officerMeal: data.officerMeal,
          guestMeal: data.guestMeal,
          status: calculatedStatus,
        })
        .returning();
      return result[0];
    }
  } catch (error) {
    console.error('Database query failed in saveMealBooking:', error);
    throw new Error('Failed to save meal booking.', { cause: error });
  }
}

// Payments
export async function getPayments(gpfNo?: string) {
  try {
    if (gpfNo) {
      return await db.select().from(payments).where(eq(payments.gpfNo, gpfNo)).orderBy(desc(payments.id));
    }
    return await db.select().from(payments).orderBy(desc(payments.id));
  } catch (error) {
    console.error('Database query failed in getPayments:', error);
    throw new Error('Failed to fetch payments.', { cause: error });
  }
}

export async function createPayment(data: {
  userId?: number;
  gpfNo: string;
  userName: string;
  date: string;
  amount: number;
  voucherNo: string;
  method?: string;
  notes?: string;
}) {
  try {
    const result = await db
      .insert(payments)
      .values({
        userId: data.userId,
        gpfNo: data.gpfNo,
        userName: data.userName,
        date: data.date,
        amount: data.amount,
        voucherNo: data.voucherNo,
        method: data.method || 'নগদ জমা',
        notes: data.notes || '',
        status: 'verified',
      })
      .returning();

    // Also update advance balance in users table
    const user = await getUserByGpf(data.gpfNo);
    if (user) {
      const newAdvance = (user.advanceBalance || 0) + data.amount;
      await db
        .update(users)
        .set({ advanceBalance: newAdvance })
        .where(eq(users.gpfNo, data.gpfNo));
    }

    return result[0];
  } catch (error) {
    console.error('Database query failed in createPayment:', error);
    throw new Error('Failed to record payment.', { cause: error });
  }
}

// Bazaar Expenses
export async function getBazaarExpenses() {
  try {
    return await db.select().from(bazaarExpenses).orderBy(desc(bazaarExpenses.id));
  } catch (error) {
    console.error('Database query failed in getBazaarExpenses:', error);
    throw new Error('Failed to fetch bazaar expenses.', { cause: error });
  }
}

export async function createBazaarExpense(data: {
  date: string;
  buyerName: string;
  buyerGpf: string;
  category: string;
  itemsDescription: string;
  amount: number;
  voucherNo: string;
  verifiedBy?: string;
}) {
  try {
    const result = await db
      .insert(bazaarExpenses)
      .values({
        date: data.date,
        buyerName: data.buyerName,
        buyerGpf: data.buyerGpf,
        category: data.category,
        itemsDescription: data.itemsDescription,
        amount: data.amount,
        voucherNo: data.voucherNo,
        verifiedBy: data.verifiedBy || 'এডমিন কমিটি',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createBazaarExpense:', error);
    throw new Error('Failed to record bazaar expense.', { cause: error });
  }
}

// Notices
export async function getNotices() {
  try {
    return await db.select().from(notices).orderBy(desc(notices.id));
  } catch (error) {
    console.error('Database query failed in getNotices:', error);
    throw new Error('Failed to fetch notices.', { cause: error });
  }
}

export async function createNotice(data: {
  title: string;
  content: string;
  type?: string;
  date: string;
  author: string;
}) {
  try {
    const result = await db
      .insert(notices)
      .values({
        title: data.title,
        content: data.content,
        type: data.type || 'general',
        date: data.date,
        author: data.author,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createNotice:', error);
    throw new Error('Failed to create notice.', { cause: error });
  }
}
