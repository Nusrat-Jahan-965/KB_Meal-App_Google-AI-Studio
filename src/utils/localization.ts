import { UserRole } from '../types';

// Map Bengali names to English
const NAME_MAP: Record<string, string> = {
  'মো: সাইফুল ইসলাম': 'Md. Saiful Islam',
  'সাইফুল ইসলাম': 'Saiful Islam',
  'হাসান মাহমুদ': 'Hasan Mahmud',
  'মোহাম্মদ রহিম উল্লাহ': 'Mohammad Rahim Ullah',
  'রহিম উল্লাহ': 'Rahim Ullah',
  'মোছা: নাসরিন সুলতানা': 'Mst. Nasrin Sultana',
  'কাজী মিজানুর রহমান': 'Kazi Mizanur Rahman',
  'মো: জহিরুল ইসলাম': 'Md. Zahirul Islam',
};

// Map Bengali designations to English
const DESIGNATION_MAP: Record<string, string> = {
  'মহাব্যবস্থাপক ও মেস ইনচার্জ': 'General Manager & Mess In-charge',
  'মহাব্যবস্থাপক ও ইনচার্জ': 'General Manager & In-charge',
  'মহাব্যবস্থাপক': 'General Manager',
  'সহকারী মহাব্যবস্থাপক': 'Assistant General Manager',
  'সিনিয়র অফিসার, আইসিটি শাখা': 'Senior Officer, ICT Branch',
  'সিনিয়র অফিসার': 'Senior Officer',
  'সিনিয়র অফিসার': 'Senior Officer',
  'অফিসার ও সহকারী মেস ম্যানেজার': 'Officer & Assistant Mess Manager',
  'প্রিন্সিপাল অফিসার': 'Principal Officer',
  'সিনিয়র প্রিন্সিপাল অফিসার': 'Senior Principal Officer',
  'অফিসার (ক্যাশ)': 'Officer (Cash)',
  'অফিসার': 'Officer',
  'মেস ইনচার্জ (মহাব্যবস্থাপক)': 'Mess In-charge (General Manager)',
};

// Map Bengali departments to English
const DEPARTMENT_MAP: Record<string, string> = {
  'সাধারণ সেবা বিভাগ': 'Common Services Department',
  'ঋণ ও অগ্রিম বিভাগ': 'Loan and Advance Department',
  'ব্যবস্থাপনা পরিচালকের স্কোয়াড': 'Managing Director’s Squad',
  'ঋণ আদায় ও পর্যবেক্ষণ বিভাগ': 'Loan Recovery and Monitoring Department',
  'কর্মী ব্যবস্থাপনা বিভাগ': 'Personnel Management Department',
  'আইন, গবেষণা ও উন্নয়ন বিভাগ': 'Law, Research and Development Department',
  'কেন্দ্রীয় হিসাব ও তহবিল ব্যবস্থাপনা বিভাগ': 'Central Accounts and Fund Management Department',
  'আইটি অপারেশন': 'IT Operation',
  'বাস্তব সম্পদ ও প্রকৌশল বিভাগ': 'Real Asset and Engineering Department',
  'শৃঙ্খলা ও আপীল বিভাগ': 'Discipline and Appeal Department',
  'নিরীক্ষা ও পরিদর্শন বিভাগ': 'Audit and Inspection Department',
  'আইটি সিস্টেম, রিসার্চ এন্ড ডেভেলপমেন্ট বিভাগ': 'IT Systems, Research and Development Department',
  'শাখা নিয়ন্ত্রণ বিভাগ': 'Branch Control Department',
  'বাজেট, ব্যয় নিয়ন্ত্রণ ও হিসাব সমন্বয় বিভাগ': 'Budget, Expenditure Control and Accounts Reconciliation Department',
  'কর্মী কল্যাণ, প্রশিক্ষণ ও মানব সম্পদ বিভাগ': 'Employee Welfare, Training and Human Resources Department',
  'প্রশাসন বিভাগ': 'Administration Department',
  'প্রশাসন': 'Administration',
  'আইসিটি ডিপার্টমেন্ট': 'ICT Department',
  'আইসিটি শাখা': 'ICT Branch',
  'আইসিটি': 'ICT',
  'হিসাব বিভাগ': 'Accounts Department',
  'হিসাব শাখা': 'Accounts Branch',
  'হিসাব': 'Accounts',
  'ঋণ ও অগ্রিম শাখা': 'Loans & Advances Branch',
  'অডিট ও পরিদর্শন বিভাগ': 'Audit & Inspection Department',
  'প্রধান শাখা': 'Principal Branch',
  'মানবসম্পদ ও প্রশিক্ষণ': 'HR & Training Department',
  'মানব সম্পদ বিভাগ': 'Human Resources Department',
  'আইন ও আদায় বিভাগ': 'Legal & Recovery Department',
  'পরিকল্পনা ও গবেষণা': 'Planning & Research Department',
  'পরিকল্পনা ও ঋণ কার্যক্রম': 'Planning & Credit Operations',
};

// Map Bengali room locations to English
const ROOM_MAP: Record<string, string> = {
  '২০১, প্রশাসন ভবন': 'Room 201, Administration Building',
  '৪০১ (৪র্থ তলা), প্রধান কার্যালয়': 'Room 401 (4th Fl), Head Office',
  '৩০৫, হিসাব ভবন': 'Room 305, Accounts Building',
  '৫০২, প্রধান কার্যালয়': 'Room 502, Head Office',
  '২০৫, অডিট ভবন': 'Room 205, Audit Building',
  '১০৩, নিচতলা': 'Room 103, Ground Floor',
};

// Map Cut-off times
const CUTOFF_MAP: Record<string, string> = {
  'বিকাল ৫:০০ টা': '5:00 PM',
  'বিকাল ৫:০০ ঘটিকা': '5:00 PM',
  'সকাল ০৯:১৫ টা': '09:15 AM',
  'বিকাল ৫টা': '5:00 PM',
};

// Map Special Menu Highlights
const MENU_HIGHLIGHT_MAP: Record<string, string> = {
  'আজকের স্পেশাল মেন্যু: রুই মাছের দোপেঁয়াজা, ডাল ও সালাদ': "Today's Special Menu: Rui Fish Dopiaza, Dal & Salad",
  'আজকের স্পেশাল মেন্যু প্রস্তুত': "Today's special menu ready",
  'আজকের মেন্যু সক্রিয়': "Today's menu active",
  'আজকের মেনু তালিকা প্রস্তুত': "Today's menu schedule ready",
};

// Map Custom Notes
const CUSTOM_NOTE_MAP: Record<string, string> = {
  'সকল সদস্যকে বিকাল ৫:০০ ঘটিকার মধ্যে মিল নিশ্চিত বা পরিবর্তনের অনুরোধ করা হচ্ছে।':
    'All members are requested to confirm or modify meals before 5:00 PM.',
  'সকলকে যথাসময়ে মিল কনফার্ম বা অফ করার অনুরোধ করা হচ্ছে।':
    'Everyone is requested to confirm or cancel meals on time.',
};

export function getLocalizedName(name?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!name) return '';
  if (lang === 'bn') return name;
  return NAME_MAP[name.trim()] || name;
}

export function getLocalizedDesignation(desig?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!desig) return '';
  if (lang === 'bn') return desig;
  return DESIGNATION_MAP[desig.trim()] || desig;
}

export function getLocalizedDepartment(dept?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!dept) return '';
  if (lang === 'bn') return dept;
  const trimmed = dept.trim();
  if (DEPARTMENT_MAP[trimmed]) return DEPARTMENT_MAP[trimmed];
  const converted = trimmed
    .replace(/বিভাগ/g, 'Department')
    .replace(/শাখা/g, 'Branch')
    .replace(/ডিপার্টমেন্ট/g, 'Department');
  return converted;
}

export function getLocalizedRoom(room?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!room) return '';
  if (lang === 'bn') return room;
  return ROOM_MAP[room.trim()] || room;
}

export function getLocalizedCutoff(cutoff?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!cutoff) return '';
  if (lang === 'bn') return cutoff;
  return CUTOFF_MAP[cutoff.trim()] || cutoff;
}

export function getLocalizedMenuHighlight(highlight?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!highlight) {
    return lang === 'bn' ? 'আজকের মেন্যু সক্রিয়' : "Today's menu active";
  }
  if (lang === 'bn') return highlight;
  return MENU_HIGHLIGHT_MAP[highlight.trim()] || highlight;
}

export function getLocalizedCustomNote(note?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!note) return '';
  if (lang === 'bn') return note;
  return CUSTOM_NOTE_MAP[note.trim()] || note;
}

// Map bazaar item descriptions
const ITEM_DESCRIPTION_MAP: Record<string, string> = {
  'তাজা রুই মাছ ৮.৫ কেজি @ ৩৫০/- ও দেশি চিংড়ি ১ কেজি @ ৮৫০/-':
    'Fresh Rui Fish 8.5 kg @ 350/- & Local Prawns 1 kg @ 850/-',
  'মৌসুমি সবজি (পটল, পেঁপে, আলু ১০ কেজি, কাঁচামরিচ, ধনেপাতা)':
    'Seasonal Vegetables (Pointed gourd, Papaya, Potato 10 kg, Green chili, Coriander)',
  'মিনিকেট চাল ৫০ কেজির ১ বস্তা ও প্রিমিয়াম মসুর ডাল ৫ কেজি':
    'Miniket Rice 50 kg sack & Premium Lentils (Dal) 5 kg',
  'তীর সয়াবিন তেল ৫ লিটার, পেঁয়াজ ৫ কেজি, রসুন ও আদা':
    'Teer Soybean Oil 5 Ltr, Onion 5 kg, Garlic & Ginger',
  'ফার্মের ব্রয়লার মুরগি ১২ কেজি @ ২১০/- ও ফার্মের ডিম ৬০টি':
    'Farm Broiler Chicken 12 kg @ 210/- & Farm Eggs 60 pcs',
  'রান্নার এলপিজি গ্যাস সিলিন্ডার ১টি ও ডিশওয়াশ সাবান/স্ক্রাবার':
    'Cooking LPG Gas Cylinder 1 pc & Dishwash Soap/Scrubber',
  'কাতল মাছ ৯ কেজি @ ৩৪০/- এবং টমেটো ও লেবু':
    'Katla Fish 9 kg @ 340/- and Tomatoes & Lemons',
  'পোলাও চাল ২ কেজি, চিনিগুঁড়া ও সোনালি মুরগি বিশেষ ভোজের জন্য':
    'Polao Rice 2 kg, Chinigura & Sonali Chicken for Special Feast',
};

export function getLocalizedItemsDescription(desc?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!desc) return '';
  if (lang === 'bn') return desc;
  return ITEM_DESCRIPTION_MAP[desc.trim()] || desc;
}

export function getRoleTitle(role: UserRole, lang: 'bn' | 'en' = 'bn'): string {
  if (role === 'admin') {
    return lang === 'bn' ? 'এডমিন / ইনচার্জ' : 'Admin / In-charge';
  }
  if (role === 'coadmin') {
    return lang === 'bn' ? 'কো-এডমিন' : 'Co-Admin';
  }
  return lang === 'bn' ? 'মেম্বার' : 'Member';
}

const MONTH_ABBR_BN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
const MONTH_ABBR_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getMonthAbbr(monthIndex: number, lang: 'bn' | 'en' = 'bn'): string {
  const idx = Math.max(0, Math.min(11, monthIndex));
  return lang === 'bn' ? MONTH_ABBR_BN[idx] : MONTH_ABBR_EN[idx];
}

export function formatCalledDates(dates: number[], lang: 'bn' | 'en' = 'bn', monthIndex: number = new Date().getMonth()): string {
  const monthStr = getMonthAbbr(monthIndex, lang);
  return dates.map((d) => `${d} ${monthStr}`).join(', ');
}

// Convert date strings like "১৫/১০/২০২৪" or "15/10/2024" or "১৫ অক্টোবর ২০২৪" to localized form
export function getLocalizedDate(dateStr?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!dateStr) return '';
  if (lang === 'bn') return dateStr;

  // Convert Bengali numerals to English
  const toEnDigits = (str: string) =>
    str.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

  let en = toEnDigits(dateStr);
  en = en
    .replace(/জানুয়ারি/g, 'January')
    .replace(/ফেব্রুয়ারি/g, 'February')
    .replace(/মার্চ/g, 'March')
    .replace(/এপ্রিল/g, 'April')
    .replace(/মে/g, 'May')
    .replace(/জুন/g, 'June')
    .replace(/জুলাই/g, 'July')
    .replace(/আগস্ট/g, 'August')
    .replace(/সেপ্টেম্বর/g, 'September')
    .replace(/অক্টোবর/g, 'October')
    .replace(/নভেম্বর/g, 'November')
    .replace(/ডিসেম্বর/g, 'December');

  return en;
}

export function toBnDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
}
