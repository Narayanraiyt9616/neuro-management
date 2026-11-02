/**
 * Decimal-Safe Financial Arithmetic Utilities
 * Prevents IEEE-754 floating point arithmetic drift in currency calculations
 */

/**
 * Rounds a number to exactly 2 decimal places using epsilon correction
 */
export function roundCurrency(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Safe addition of currency amounts
 */
export function addCurrency(...amounts: number[]): number {
  const sum = amounts.reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0);
  return roundCurrency(sum);
}

/**
 * Safe subtraction: a - b
 */
export function subtractCurrency(a: number, b: number): number {
  return roundCurrency((isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b));
}

/**
 * Safe multiplication: quantity * unitPrice
 */
export function multiplyCurrency(quantity: number, unitPrice: number): number {
  return roundCurrency((isNaN(quantity) ? 0 : quantity) * (isNaN(unitPrice) ? 0 : unitPrice));
}

/**
 * Calculates percentage: (amount * rate) / 100
 */
export function calculatePercentage(amount: number, rate: number): number {
  return roundCurrency((roundCurrency(amount) * roundCurrency(rate)) / 100);
}

export default {
  roundCurrency,
  addCurrency,
  subtractCurrency,
  multiplyCurrency,
  calculatePercentage
};

