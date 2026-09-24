import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (maps to Firebase Auth UID & GPF No)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  role: text('role').notNull().default('member'), // 'member' | 'coadmin' | 'admin'
  designation: text('designation').default('কর্মকর্তা'),
  designationEn: text('designation_en').default('Officer'),
  department: text('department').default('সাধারণ'),
  departmentEn: text('department_en').default('General'),
  gpfNo: text('gpf_no').notNull().unique(),
  mobile: text('mobile').default(''),
  roomNo: text('room_no').default('৪০২'),
  advanceBalance: integer('advance_balance').notNull().default(0),
  dueAmount: integer('due_amount').notNull().default(0),
  todayMealStatus: text('today_meal_status').notNull().default('on'), // 'on' | 'off'
  mealRate: integer('meal_rate').notNull().default(65),
  createdAt: timestamp('created_at').defaultNow(),
});

// Meal calls table (Admin/Co-Admin meal call approval state)
export const mealCalls = pgTable('meal_calls', {
  id: serial('id').primaryKey(),
  isActive: boolean('is_active').notNull().default(true),
  targetDate: text('target_date').notNull(), // e.g. '২৪ সেপ্টেম্বর ২০২৬'
  targetDateEn: text('target_date_en'),
  cutoffTime: text('cutoff_time').notNull().default('বিকাল ৫:০০ টা'),
  cutoffTimeEn: text('cutoff_time_en').default('5:00 PM'),
  calledBy: text('called_by').notNull(),
  calledByGpf: text('called_by_gpf').notNull(),
  calledByRole: text('called_by_role').notNull().default('admin'),
  calledAt: text('called_at').notNull(),
  menuHighlight: text('menu_highlight').default(''),
  customNote: text('custom_note').default(''),
  calledDates: text('called_dates').notNull().default('[1,2,3,4,5,7,8,9,10,11,12,14,15,16,17,18,19,21,22,23,24,25,26,28,29,30]'), // JSON string array of days
  createdAt: timestamp('created_at').defaultNow(),
});

// Meal bookings table (Daily officer & guest meal bookings)
export const mealBookings = pgTable('meal_bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  gpfNo: text('gpf_no').notNull(),
  date: text('date').notNull(), // e.g. '2026-09-24' or '২৪ সেপ্টেম্বর ২০২৬'
  dayNumber: integer('day_number').notNull(), // 1 to 31
  officerMeal: integer('officer_meal').notNull().default(1),
  guestMeal: integer('guest_meal').notNull().default(0),
  status: text('status').notNull().default('booked'), // 'booked' | 'cancelled' | 'consumed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments / Advance deposits table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  gpfNo: text('gpf_no').notNull(),
  userName: text('user_name').notNull(),
  date: text('date').notNull(),
  amount: integer('amount').notNull(),
  voucherNo: text('voucher_no').notNull(),
  method: text('method').notNull().default('নগদ জমা'), // e.g. 'নগদ জমা', 'ব্যাংক একাউন্ট ট্রান্সফার', 'অনলাইন'
  notes: text('notes').default(''),
  status: text('status').notNull().default('verified'), // 'verified' | 'pending'
  createdAt: timestamp('created_at').defaultNow(),
});

// Daily bazaar expenses table
export const bazaarExpenses = pgTable('bazaar_expenses', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  buyerName: text('buyer_name').notNull(),
  buyerGpf: text('buyer_gpf').notNull(),
  category: text('category').notNull(), // 'fish_meat' | 'eggs' | 'rice_grains' | 'oil_spices' | 'vegetables' | 'utility_other'
  itemsDescription: text('items_description').notNull(),
  amount: integer('amount').notNull(),
  voucherNo: text('voucher_no').notNull(),
  verifiedBy: text('verified_by').default('এডমিন কমিটি'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Canteen notices table
export const notices = pgTable('notices', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('general'), // 'urgent' | 'holiday' | 'general'
  date: text('date').notNull(),
  author: text('author').notNull().default('ক্যান্টিন ইন-চার্জ'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(mealBookings),
  payments: many(payments),
}));

export const mealBookingsRelations = relations(mealBookings, ({ one }) => ({
  user: one(users, {
    fields: [mealBookings.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
