/**
 * Min/Max Calculation Engine
 *
 * Business Rules:
 * - Safety Stock: 11 days of average daily usage
 * - Minimum: Safety stock + 7 days = 18 days of usage
 * - Maximum: Minimum × 2 = 36 days of usage
 * - Replenishment Cycle: Weekly (7 days)
 * - All calculations in EACH, rounded up for package quantities > 1
 */

// Constants for calculation
export const SAFETY_STOCK_DAYS = 11;
export const MIN_DAYS_ABOVE_SAFETY = 7;
export const MIN_DAYS = SAFETY_STOCK_DAYS + MIN_DAYS_ABOVE_SAFETY; // 18 days
export const MAX_MULTIPLIER = 2;
export const MAX_DAYS = MIN_DAYS * MAX_MULTIPLIER; // 36 days
export const REPLENISHMENT_CYCLE_DAYS = 7;

/**
 * Round up to the nearest package quantity
 */
export function roundUpToPackageQty(qty: number, packageQty: number): number {
  if (packageQty <= 1) return Math.ceil(qty);
  return Math.ceil(qty / packageQty) * packageQty;
}

/**
 * Calculate recommended min/max levels for vending station
 *
 * @param avgDailyUsage - Average daily usage in EACH
 * @param packageQty - Package quantity (minimum order increment)
 * @returns Recommended min and max values, rounded to package quantity
 */
export function calculateMinMax(
  avgDailyUsage: number,
  packageQty: number = 1
): { recommendedMin: number; recommendedMax: number } {
  // Calculate raw min/max based on usage
  const rawMin = avgDailyUsage * MIN_DAYS;
  const rawMax = avgDailyUsage * MAX_DAYS;

  // Round up to package quantity
  const recommendedMin = roundUpToPackageQty(rawMin, packageQty);
  const recommendedMax = roundUpToPackageQty(rawMax, packageQty);

  // Ensure max is at least min (can happen with rounding)
  return {
    recommendedMin,
    recommendedMax: Math.max(recommendedMax, recommendedMin),
  };
}

/**
 * Calculate safety stock quantity
 *
 * @param avgDailyUsage - Average daily usage in EACH
 * @param packageQty - Package quantity
 * @returns Safety stock quantity, rounded to package quantity
 */
export function calculateSafetyStock(
  avgDailyUsage: number,
  packageQty: number = 1
): number {
  const rawSafetyStock = avgDailyUsage * SAFETY_STOCK_DAYS;
  return roundUpToPackageQty(rawSafetyStock, packageQty);
}

/**
 * Calculate warehouse backup inventory level
 *
 * Formula: (Vending usage rate × (Replenishment cycle + Supplier lead time))
 *
 * @param avgDailyUsage - Average daily usage in EACH
 * @param supplierLeadTimeDays - Supplier lead time in days
 * @param packageQty - Package quantity
 * @returns Recommended warehouse backup quantity, rounded to package quantity
 */
export function calculateWarehouseBackup(
  avgDailyUsage: number,
  supplierLeadTimeDays: number,
  packageQty: number = 1
): number {
  const totalCoverageDays = REPLENISHMENT_CYCLE_DAYS + supplierLeadTimeDays;
  const rawBackup = avgDailyUsage * totalCoverageDays;
  return roundUpToPackageQty(rawBackup, packageQty);
}

/**
 * Analyze if current stock level is adequate
 *
 * @param currentQty - Current quantity on hand
 * @param avgDailyUsage - Average daily usage
 * @returns Analysis object with days of stock and status
 */
export function analyzeStockLevel(
  currentQty: number,
  avgDailyUsage: number
): {
  daysOfStock: number;
  status: "CRITICAL" | "LOW" | "OK" | "OVERSTOCKED";
  message: string;
} {
  if (avgDailyUsage === 0) {
    return {
      daysOfStock: Infinity,
      status: "OVERSTOCKED",
      message: "No usage recorded",
    };
  }

  const daysOfStock = currentQty / avgDailyUsage;

  if (daysOfStock < SAFETY_STOCK_DAYS) {
    return {
      daysOfStock,
      status: "CRITICAL",
      message: `Below safety stock (${SAFETY_STOCK_DAYS} days)`,
    };
  }

  if (daysOfStock < MIN_DAYS) {
    return {
      daysOfStock,
      status: "LOW",
      message: "Below recommended minimum",
    };
  }

  if (daysOfStock > MAX_DAYS * 1.5) {
    return {
      daysOfStock,
      status: "OVERSTOCKED",
      message: "Significantly above recommended maximum",
    };
  }

  return {
    daysOfStock,
    status: "OK",
    message: "Within recommended range",
  };
}

/**
 * Calculate reorder quantity to bring stock to max
 *
 * @param currentQty - Current quantity on hand
 * @param recommendedMax - Recommended maximum level
 * @param packageQty - Package quantity
 * @returns Reorder quantity rounded to package qty, or 0 if no reorder needed
 */
export function calculateReorderQty(
  currentQty: number,
  recommendedMax: number,
  packageQty: number = 1
): number {
  const shortage = recommendedMax - currentQty;
  if (shortage <= 0) return 0;
  return roundUpToPackageQty(shortage, packageQty);
}
