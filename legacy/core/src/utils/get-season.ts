export const getSeason = (referenceDate: Date = new Date()): number => {
  return referenceDate.getFullYear() + (referenceDate.getMonth() >= 9 ? 1 : 0);
};
