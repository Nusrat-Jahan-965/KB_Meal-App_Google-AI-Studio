export interface CutoffCountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isTodayCutoffPassed: boolean;
  targetCutoffStr: string;
}

export const padZero = (n: number) => String(n).padStart(2, '0');

export function parseCutoffTime(cutoffStr?: string): { hour: number; minute: number } {
  let hour = 17;
  let minute = 0;
  if (!cutoffStr) return { hour, minute };

  const isPM =
    cutoffStr.includes('বিকাল') ||
    cutoffStr.includes('সন্ধ্যা') ||
    cutoffStr.includes('রাত') ||
    /pm/i.test(cutoffStr);
  const isAM =
    cutoffStr.includes('সকাল') ||
    cutoffStr.includes('ভোর') ||
    /am/i.test(cutoffStr);

  const enDigits = cutoffStr.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
  const match = enDigits.match(/(\d{1,2})(?::(\d{1,2}))?/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    hour = h;
    minute = m;
  }
  return { hour, minute };
}

export function calculateCutoffRemaining(cutoffStr?: string): CutoffCountdownState {
  const now = new Date();
  const { hour, minute } = parseCutoffTime(cutoffStr);
  const todayCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);

  const isTodayCutoffPassed = now.getTime() >= todayCutoff.getTime();
  let targetDate = todayCutoff;
  if (isTodayCutoffPassed) {
    targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute, 0, 0);
  }

  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return {
    hours,
    minutes,
    seconds,
    isTodayCutoffPassed,
    targetCutoffStr: cutoffStr || 'বিকাল ৫:০০ টা',
  };
}
