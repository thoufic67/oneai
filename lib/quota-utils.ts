/**
 * Utility functions for quota management
 * Handles date calculations and quota-related operations
 */

import { ResetFrequency } from "@/config/quota";

/**
 * Calculate the next reset date based on the reset frequency
 */
export function calculateNextReset(
  frequency: ResetFrequency,
  fromDate: Date = new Date()
): Date {
  const nextReset = new Date(fromDate);

  switch (frequency) {
    case "3hour":
      nextReset.setTime(fromDate.getTime() + 3 * 60 * 60 * 1000);
      break;

    case "daily":
      nextReset.setDate(fromDate.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);
      break;

    case "monthly":
      nextReset.setMonth(fromDate.getMonth() + 1);
      nextReset.setDate(1);
      nextReset.setHours(0, 0, 0, 0);
      break;

    default:
      throw new Error(`Unknown reset frequency: ${frequency}`);
  }

  return nextReset;
}
