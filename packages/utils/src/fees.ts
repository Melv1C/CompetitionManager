export const BASE_FEE = 0.35;
export const VARIABLE_FEE_RATE = 0.02;

/**
 * Calculate the fees for a given total
 * @param total
 * @returns the fees
 */
export const getFees = (total: number) => {
  if (total <= 0) {
    return 0;
  }
  return Math.round((BASE_FEE + VARIABLE_FEE_RATE * total) * 100) / 100;
};
