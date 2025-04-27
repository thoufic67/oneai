/**
 * @file Razorpay webhook handler for subscription events
 */

import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature using utility function
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (payload.event) {
      case "subscription.activated": {
        // Update subscription status and assign quotas
        const { subscription } = payload;
        const { notes } = subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date(subscription.current_start),
            current_period_end: new Date(subscription.current_end),
            metadata: subscription,
          })
          .eq("provider_subscription_id", subscription.id);

        // Update user's subscription tier
        await supabase
          .from("users")
          .update({
            subscription_tier: subscription.plan_id,
            subscription_status: "active",
          })
          .eq("id", notes.user_id);

        // Initialize quotas for the new subscription
        await initializeQuotas(notes.user_id, subscription.plan_id);
        break;
      }

      case "subscription.charged": {
        // Record successful payment
        const { subscription, payment } = payload;

        await supabase.from("subscription_payments").insert({
          subscription_id: subscription.id,
          razorpay_payment_id: payment.id,
          razorpay_signature: signature,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          metadata: payment,
        });
        break;
      }

      case "subscription.cancelled": {
        // Update subscription status
        const { subscription } = payload;

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            canceled_at: new Date(),
            metadata: subscription,
          })
          .eq("provider_subscription_id", subscription.id);

        // Update user's subscription status
        await supabase
          .from("users")
          .update({
            subscription_status: "cancelled",
          })
          .eq("id", subscription.notes.user_id);
        break;
      }

      case "subscription.pending": {
        // Handle pending payment
        const { subscription } = payload;

        await supabase
          .from("subscriptions")
          .update({
            status: "pending",
            metadata: subscription,
          })
          .eq("provider_subscription_id", subscription.id);
        break;
      }

      case "subscription.halted": {
        // Handle failed payments
        const { subscription } = payload;

        await supabase
          .from("subscriptions")
          .update({
            status: "halted",
            metadata: subscription,
          })
          .eq("provider_subscription_id", subscription.id);

        // Update user's subscription status
        await supabase
          .from("users")
          .update({
            subscription_status: "halted",
          })
          .eq("id", subscription.notes.user_id);
        break;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper function to initialize quotas for a new subscription
async function initializeQuotas(userId: string, planId: string) {
  const supabase = await createClient();

  // Get quota limits for the plan
  const quotaLimits = getQuotaLimitsForPlan(planId);

  // Initialize each quota type
  for (const [quotaKey, limit] of Object.entries(quotaLimits)) {
    await supabase.from("usage_quotas").upsert({
      user_id: userId,
      quota_key: quotaKey,
      used_count: 0,
      quota_limit: limit,
      reset_frequency: "monthly",
      last_reset_at: new Date(),
      next_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  }
}

// Helper function to get quota limits for a plan
function getQuotaLimitsForPlan(planId: string) {
  // This is a placeholder - implement based on your plan configuration
  const quotaLimits = {
    plan_basic: {
      small_messages: 100,
      large_messages: 20,
      image_generation: 5,
    },
    plan_pro: {
      small_messages: 500,
      large_messages: 100,
      image_generation: 10,
    },
  };

  return (
    quotaLimits[planId as keyof typeof quotaLimits] || quotaLimits.plan_basic
  );
}
