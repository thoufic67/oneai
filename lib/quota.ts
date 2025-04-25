/**
 * QuotaManager class for handling user quota operations
 * Manages quota checking, incrementing, and resetting
 */

import { createClient } from "@/lib/supabase/client";
import {
  QuotaKey,
  QuotaExceededError,
  SUBSCRIPTION_TIERS,
  ResetFrequency,
} from "@/config/quota";

export class QuotaManager {
  private supabase = createClient();

  /**
   * Check if user has sufficient quota
   */
  async checkQuota(
    userId: string,
    quotaKey: QuotaKey,
    units: number = 1
  ): Promise<boolean> {
    const { data: user, error: userError } = await this.supabase
      .from("users")
      .select("subscription_tier")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const { data: quota, error: quotaError } = await this.supabase
      .from("usage_quotas")
      .select("*")
      .eq("user_id", userId)
      .eq("quota_key", quotaKey)
      .single();

    if (quotaError && quotaError.code !== "PGRST116") throw quotaError;

    // If no quota record exists, create one
    if (!quota) {
      const tierConfig =
        SUBSCRIPTION_TIERS[user.subscription_tier].quotas[quotaKey];
      await this.initializeQuota(
        userId,
        quotaKey,
        tierConfig.limit,
        tierConfig.resetFrequency
      );
      return true;
    }

    // Check if quota needs reset
    if (new Date() >= new Date(quota.next_reset_at)) {
      await this.resetQuota(quota);
      return true;
    }

    // Check against limit
    if (quota.used_count + units > quota.quota_limit) {
      throw new QuotaExceededError(quotaKey, quota);
    }

    return true;
  }

  /**
   * Increment quota usage
   */
  async incrementQuota(
    userId: string,
    quotaKey: QuotaKey,
    units: number = 1
  ): Promise<void> {
    const { error } = await this.supabase
      .from("usage_quotas")
      .update({
        used_count: this.supabase.rpc("increment_quota", {
          increment_by: units,
        }),
        last_usage_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("quota_key", quotaKey);

    if (error) throw error;
  }

  /**
   * Initialize quota for a user
   */
  private async initializeQuota(
    userId: string,
    quotaKey: QuotaKey,
    limit: number,
    resetFrequency: ResetFrequency
  ): Promise<void> {
    const nextReset = this.calculateNextReset(resetFrequency);

    const { error } = await this.supabase.from("usage_quotas").insert({
      user_id: userId,
      quota_key: quotaKey,
      quota_limit: limit,
      used_count: 0,
      reset_frequency: resetFrequency,
      last_reset_at: new Date().toISOString(),
      next_reset_at: nextReset.toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Reset quota based on frequency
   */
  private async resetQuota(quota: any): Promise<void> {
    const nextReset = this.calculateNextReset(quota.reset_frequency);

    const { error } = await this.supabase
      .from("usage_quotas")
      .update({
        used_count: 0,
        last_reset_at: new Date().toISOString(),
        next_reset_at: nextReset.toISOString(),
      })
      .eq("id", quota.id);

    if (error) throw error;
  }

  /**
   * Calculate next reset timestamp based on frequency
   */
  private calculateNextReset(frequency: ResetFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case "3hour":
        return new Date(now.getTime() + 3 * 60 * 60 * 1000);

      case "daily":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;

      case "monthly":
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;

      default:
        throw new Error(`Unknown reset frequency: ${frequency}`);
    }
  }

  /**
   * Get current quota status for a user
   */
  async getQuotaStatus(userId: string): Promise<
    Record<
      QuotaKey,
      {
        used: number;
        limit: number;
        resetsAt: Date;
        remaining: number;
        percentageUsed: number;
      }
    >
  > {
    const { data: quotas, error } = await this.supabase
      .from("usage_quotas")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return quotas.reduce(
      (acc, quota) => ({
        ...acc,
        [quota.quota_key]: {
          used: quota.used_count,
          limit: quota.quota_limit,
          resetsAt: new Date(quota.next_reset_at),
          remaining: quota.quota_limit - quota.used_count,
          percentageUsed: (quota.used_count / quota.quota_limit) * 100,
        },
      }),
      {}
    );
  }
}
