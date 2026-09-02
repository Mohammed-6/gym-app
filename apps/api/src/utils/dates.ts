export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** End date = start + durationInMonths, minus one day (e.g. 29 Aug + 1 month -> 28 Sep). */
export function calculateMembershipEndDate(startDate: Date, durationInMonths: number): Date {
  const result = new Date(startDate);
  result.setMonth(result.getMonth() + durationInMonths);
  result.setDate(result.getDate() - 1);
  return result;
}
