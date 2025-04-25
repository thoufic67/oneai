/**
 * Configuration file for the quota management system
 * Defines quota types, reset frequencies, and related types
 */

export type QuotaKey = "small_messages" | "large_messages" | "image_generation";
export type ResetFrequency = "3hour" | "daily" | "monthly";

export interface QuotaConfig {
  limit: number;
  resetFrequency: ResetFrequency;
}

export interface TierQuotas {
  [key: string]: {
    quotas: {
      [K in QuotaKey]: QuotaConfig;
    };
  };
}

export const SUBSCRIPTION_TIERS: TierQuotas = {
  free: {
    quotas: {
      small_messages: { limit: 100, resetFrequency: "monthly" },
      large_messages: { limit: 20, resetFrequency: "monthly" },
      image_generation: { limit: 5, resetFrequency: "3hour" },
    },
  },
  pro: {
    quotas: {
      small_messages: { limit: 500, resetFrequency: "monthly" },
      large_messages: { limit: 100, resetFrequency: "monthly" },
      image_generation: { limit: 10, resetFrequency: "3hour" },
    },
  },
  enterprise: {
    quotas: {
      small_messages: { limit: 5000, resetFrequency: "monthly" },
      large_messages: { limit: 1000, resetFrequency: "monthly" },
      image_generation: { limit: 100, resetFrequency: "3hour" },
    },
  },
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
  code: string;
  details: {
    quotaKey: QuotaKey;
    used: number;
    limit: number;
    resetsAt: Date;
  };

  constructor(
    quotaKey: QuotaKey,
    quota: { used_count: number; quota_limit: number; next_reset_at: Date }
  ) {
    super(`Quota exceeded for ${quotaKey}`);
    this.code = "QUOTA_EXCEEDED";
    this.details = {
      quotaKey,
      used: quota.used_count,
      limit: quota.quota_limit,
      resetsAt: quota.next_reset_at,
    };
  }
}
