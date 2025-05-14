/**
 * Configuration file for the quota management system
 * Defines quota types, reset frequencies, and related types
 */

import plans from "razorpay/dist/types/plans";

export type QuotaKey = "small_messages" | "large_messages" | "image_generation";
export type ResetFrequency = "3hour" | "daily" | "monthly";
export type SubscriptionTier = "free" | "basic" | "pro" | "enterprise";

export interface QuotaConfig {
  limit: number;
  resetFrequency: ResetFrequency;
}

export type TierQuotas = {
  [K in SubscriptionTier]: {
    name: K;
    quotas: {
      [Q in QuotaKey]: QuotaConfig;
    };
  };
};

export const SUBSCRIPTION_TIERS: TierQuotas = {
  free: {
    name: "free",
    quotas: {
      small_messages: { limit: 10, resetFrequency: "monthly" },
      large_messages: { limit: 5, resetFrequency: "monthly" },
      image_generation: { limit: 3, resetFrequency: "monthly" },
    },
  },
  basic: {
    name: "basic",
    quotas: {
      small_messages: { limit: 500, resetFrequency: "monthly" },
      large_messages: { limit: 100, resetFrequency: "monthly" },
      image_generation: { limit: 50, resetFrequency: "monthly" },
    },
  },
  pro: {
    name: "pro",
    quotas: {
      small_messages: { limit: 1000, resetFrequency: "monthly" },
      large_messages: { limit: 200, resetFrequency: "monthly" },
      image_generation: { limit: 100, resetFrequency: "monthly" },
    },
  },
  enterprise: {
    name: "enterprise",
    quotas: {
      small_messages: { limit: 5000, resetFrequency: "monthly" },
      large_messages: { limit: 1000, resetFrequency: "monthly" },
      image_generation: { limit: 100, resetFrequency: "monthly" },
    },
  },
};

export const PLANS_TO_SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  plan_QTWneymEdMUvPK: "basic",
  plan_QTWQY2cqBWZ2ma: "basic",
};

export const getSubscriptionTierFromPlanId = (planId: string) => {
  return PLANS_TO_SUBSCRIPTION_TIERS[planId] || "free";
};

export interface QuotaStatus {
  used: number;
  limit: number;
  resetsAt: Date;
  remaining: number;
  percentageUsed: number;
}

export interface QuotaError {
  code: "QUOTA_EXCEEDED";
  message: string;
  details: {
    quotaKey: QuotaKey;
    used: number;
    limit: number;
    resetsAt: Date;
  };
}

export class QuotaExceededError extends Error {
  constructor(quotaKey: QuotaKey, quota: any) {
    super(
      `Quota exceeded for ${quotaKey}. Used: ${quota.used_count}/${quota.quota_limit}`
    );
    this.name = "QuotaExceededError";
  }
}

export const QUOTA_DISPLAY_NAMES: Record<QuotaKey, string> = {
  small_messages: "Small Messages",
  large_messages: "Large Messages",
  image_generation: "Image Generation",
};
