import React, { useState } from 'react';
import { LedgerItem, UserProfile } from '../types';
import { X, CheckCircle, CreditCard, PlusCircle, Star, Lock, Edit3 } from 'lucide-react';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: LedgerItem[];
  advanceBalance: number;
  onAddDeposit: (amount: number, desc: string) => void;
  lang: 'bn' | 'en';
}

export const LedgerModal: React.FC<LedgerModalProps> = ({
  isOpen,
  onClose,
  ledger,
  advanceBalance,
  onAddDeposit,
  lang,
}) => {
  const [depositAmount, setDepositAmount] = useState('1000');
  const [depositDesc, setDepositDesc] = useState(lang === 'bn' ? 'নগদ / বিকাশ জমা' : 'Cash / bKash Deposit');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      onAddDeposit(amt, depositDesc);
      setShowAddForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {lang === 'bn' ? 'জমা ও খরচের হিসাব (ট্রানজেকশন খাতা)' : 'Deposit & Meal Expense Ledger'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {lang === 'bn' ? 'চলতি মাস ও পূর্ববর্তী লেনদেন' : 'Current month & previous transactions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
              {lang === 'bn' ? 'বর্তমান অবশিষ্ট ব্যালেন্স' : 'Current Available Balance'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-100 font-sans">
              ৳ {advanceBalance.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-[#064E2B] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-emerald-900 flex items-center space-x-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '+ জমা দিন' : '+ Add Deposit'}</span>
          </button>
        </div>

        {/* Add deposit form */}
        {showAddForm && (
          <form onSubmit={handleDepositSubmit} className="mt-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
              {lang === 'bn' ? 'নতুন ব্যালেন্স জমা করুন' : 'Add Advance Deposit'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-600 dark:text-slate-300 block mb-0.5">
                  {lang === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 dark:text-white rounded-md font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 dark:text-slate-300 block mb-0.5">
                  {lang === 'bn' ? 'বিবরণ / মাধ্যম' : 'Method / Notes'}
                </label>
                <input
                  type="text"
                  value={depositDesc}
                  onChange={(e) => setDepositDesc(e.target.value)}
                  className="w-full text-xs p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 dark:text-white rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded hover:bg-emerald-800 cursor-pointer"
              >
                {lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
              </button>
            </div>
          </form>
        )}

        {/* Transaction list */}
        <div className="mt-3 overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-slate-800 pr-1 text-xs">
          {ledger.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800 dark:text-slate-200">{item.description}</div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-0.5">
                  {lang === 'bn' ? 'তারিখ:' : 'Date:'} {item.date} • {lang === 'bn' ? 'আইডি:' : 'ID:'} {item.ref}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold font-sans ${
                    item.type === 'deposit' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.type === 'deposit' ? '+' : '-'} ৳ {item.amount}
                </span>
                <span className="block text-[10px] text-gray-400 dark:text-slate-500">
                  {lang === 'bn' ? 'ব্যালেন্স:' : 'Balance:'} ৳{item.balanceAfter}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-lg text-xs cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, lang }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {lang === 'bn' ? 'আজকের খাবারের মান ও মতামত' : 'Daily Food Feedback'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-gray-800 dark:text-slate-100">
              {lang === 'bn' ? 'ধন্যবাদ! আপনার মতামত গৃহীত হয়েছে।' : 'Thank you for your feedback!'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'মেস ম্যানেজার খাবারের মান উন্নত করতে তা পর্যবেক্ষণ করবেন।'
                : 'The mess committee will review your suggestions to enhance food quality.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                {lang === 'bn' ? 'সামগ্রিক সন্তুষ্টি রেটিং' : 'Overall Satisfaction Rating'}
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-gray-500 dark:text-slate-400 font-bold ml-2 font-sans">
                  {rating} / 5
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-gray-700 dark:text-slate-200">
                {lang === 'bn' ? 'আজকের পদসমূহ:' : "Today's Dishes:"}
              </div>
              <div className="flex justify-between items-center text-gray-800 dark:text-slate-300">
                <span>{lang === 'bn' ? 'রুই মাছ ঝোল' : 'Rui Fish Curry'}</span>
                <span className="text-amber-500 font-bold">★★★★★</span>
              </div>
              <div className="flex justify-between items-center text-gray-800 dark:text-slate-300">
                <span>{lang === 'bn' ? 'ঘন মসুর ডাল' : 'Thick Lentil Soup (Dal)'}</span>
                <span className="text-amber-500 font-bold">★★★★★</span>
              </div>
              <div className="flex justify-between items-center text-gray-800 dark:text-slate-300">
                <span>{lang === 'bn' ? 'পাঁচমিশেল সবজি' : 'Mixed Vegetables'}</span>
                <span className="text-amber-500 font-bold">★★★★☆</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                {lang === 'bn' ? 'কোনো পরামর্শ বা মন্তব্য থাকলে লিখুন' : 'Any suggestions or remarks'}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'উদা: মাছের ঝোলে লবণের পরিমাণ সঠিক ছিল, ধন্যবাদ।'
                    : 'e.g. The food quality and spice levels were just right, thanks.'
                }
                className="w-full text-xs p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0a5933] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#074829] cursor-pointer"
              >
                {lang === 'bn' ? 'জমা দিন' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  lang: 'bn' | 'en';
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  lang,
}) => {
  const [name, setName] = useState(profile.name);
  const [mobile, setMobile] = useState(profile.mobile);
  const [roomNo, setRoomNo] = useState(profile.roomNo);
  const [designation, setDesignation] = useState(profile.designation);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, mobile, roomNo, designation });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {lang === 'bn' ? 'তথ্য সম্পাদন' : 'Edit Profile Information'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
              {lang === 'bn' ? 'কর্মকর্তার নাম' : 'Officer Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
              {lang === 'bn' ? 'পদবী' : 'Designation'}
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
              {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
              {lang === 'bn' ? 'কক্ষ নম্বর ও অবস্থান' : 'Room Number & Floor'}
            </label>
            <input
              type="text"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0a5933] text-white font-bold rounded-lg hover:bg-[#074829] cursor-pointer"
            >
              {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, lang }) => {
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-9 h-9 text-emerald-600 mx-auto" />
            <div className="font-bold text-gray-800 dark:text-slate-100">
              {lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password updated successfully!'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                {lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
              </label>
              <input
                type="password"
                required
                placeholder={lang === 'bn' ? 'নূন্যতম ৬ অক্ষর' : 'Minimum 6 characters'}
                className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                {lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                placeholder={lang === 'bn' ? 'পুনরায় লিখুন' : 'Re-enter new password'}
                className="w-full p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0a5933] text-white font-bold rounded-lg hover:bg-[#074829] cursor-pointer"
              >
                {lang === 'bn' ? 'আপডেট করুন' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
