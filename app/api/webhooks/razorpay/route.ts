/**
 * @file Razorpay webhook handler for subscription events
 */

import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { Webhooks } from "razorpay/dist/types/webhooks";

// Razorpay webhook payload types
type RazorpayWebhookEvent =
  | "subscription.authenticated"
  | "subscription.activated"
  | "subscription.charged"
  | "subscription.completed"
  | "subscription.cancelled"
  | "subscription.pending"
  | "subscription.halted"
  | "subscription.created"
  | "subscription.paused"
  | "subscription.resumed"
  | "subscription.updated";

interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: RazorpayWebhookEvent;
  contains: string[];
  payload: {
    subscription: {
      entity: {
        id: string;
        entity: string;
        plan_id: string;
        customer_id: string;
        status: string;
        current_start: number;
        current_end: number;
        ended_at: number | null;
        quantity: number;
        notes: {
          user_id: string;
          [key: string]: string;
        };
        charge_at: number;
        start_at: number;
        end_at: number;
        auth_attempts: number;
        total_count: number;
        paid_count: number;
        customer_notify: boolean;
        created_at: number;
        expire_by: number | null;
        short_url: string | null;
        has_scheduled_changes: boolean;
        change_scheduled_at: number | null;
        source: string;
        payment_method: string;
        offer_id: string | null;
        remaining_count: number;
      };
    };
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id: string;
        international: boolean;
        method: string;
        amount_refunded: number;
        amount_transferred: number;
        refund_status: string | null;
        captured: string;
        description: string;
        card_id: string;
        card: {
          number: string;
          network: string;
          color: string;
        };
        bank: any | null;
        wallet: any | null;
        vpa: any | null;
        email: string;
        contact: string;
        customer_id: string;
        token_id: string;
        notes: any[];
        fee: number;
        tax: number;
        error_code: string | null;
        error_description: string | null;
        acquirer_data: {
          auth_code: string;
        };
        created_at: number;
      };
    };
  };
  created_at: number;
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as RazorpayWebhookPayload;
    const signature = req.headers.get("x-razorpay-signature");

    console.log("payload", payload);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();
    const subscriptionEntity = payload.payload.subscription.entity;
    const { notes } = subscriptionEntity;

    console.log("notes", {
      subscription: JSON.stringify(subscriptionEntity),
      notes: JSON.stringify(notes),
    });

    console.log("Processing webhook event:", payload.event, {
      subscription_id: subscriptionEntity.id,
      status: subscriptionEntity.status,
    });

    switch (payload.event) {
      case "subscription.created": {
        // Initial subscription creation - may not need action if handled in verify endpoint
        break;
      }

      case "subscription.authenticated": {
        // Payment authentication successful
        await supabase
          .from("subscriptions")
          .update({
            status: "authenticated",
            payment_status: "authorized",
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);
        break;
      }

      case "subscription.activated": {
        // Subscription is now active after successful payment
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            payment_status: "captured",
            current_period_start: new Date(
              subscriptionEntity.current_start * 1000
            ),
            current_period_end: new Date(subscriptionEntity.current_end * 1000),
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);

        // Update user's subscription tier
        if (notes.user_id) {
          await supabase
            .from("users")
            .update({
              subscription_tier: subscriptionEntity.plan_id,
              subscription_status: "active",
            })
            .eq("id", notes.user_id);

          // Initialize quotas for the new subscription
          await initializeQuotas(notes.user_id, subscriptionEntity.plan_id);
        }
        break;
      }

      case "subscription.charged": {
        // Record successful payment
        const paymentEntity = payload.payload.payment?.entity;
        if (!paymentEntity) break;

        await supabase.from("subscription_payments").insert({
          subscription_id: subscriptionEntity.id,
          razorpay_payment_id: paymentEntity.id,
          razorpay_signature: signature || "",
          amount: paymentEntity.amount,
          currency: paymentEntity.currency,
          status: paymentEntity.status,
          metadata: {
            ...paymentEntity,
            last_event: payload.event,
            last_event_at: new Date().toISOString(),
          },
        });

        // Update subscription with new period dates
        await supabase
          .from("subscriptions")
          .update({
            current_period_start: new Date(
              subscriptionEntity.current_start * 1000
            ),
            current_period_end: new Date(subscriptionEntity.current_end * 1000),
            payment_status: "captured",
            metadata: {
              ...subscriptionEntity,
              last_payment: paymentEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);
        break;
      }

      case "subscription.pending": {
        // Payment is pending
        await supabase
          .from("subscriptions")
          .update({
            status: "pending",
            payment_status: "pending",
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);
        break;
      }

      case "subscription.halted": {
        // Subscription halted due to payment failure
        await supabase
          .from("subscriptions")
          .update({
            status: "halted",
            payment_status: "failed",
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);

        if (notes?.user_id) {
          await supabase
            .from("users")
            .update({
              subscription_status: "halted",
            })
            .eq("id", notes.user_id);
        }
        break;
      }

      case "subscription.cancelled": {
        // Subscription cancelled by user or admin
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            canceled_at: new Date(),
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);

        if (notes.user_id) {
          await supabase
            .from("users")
            .update({
              subscription_status: "cancelled",
            })
            .eq("id", notes.user_id);
        }
        break;
      }

      case "subscription.completed": {
        // All installments completed
        await supabase
          .from("subscriptions")
          .update({
            status: "completed",
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);

        if (notes.user_id) {
          await supabase
            .from("users")
            .update({
              subscription_status: "completed",
            })
            .eq("id", notes.user_id);
        }
        break;
      }

      case "subscription.paused": {
        // Subscription has been paused (e.g., by user or admin)
        await supabase
          .from("subscriptions")
          .update({
            status: "paused",
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);

        if (notes.user_id) {
          await supabase
            .from("users")
            .update({
              subscription_status: "paused",
            })
            .eq("id", notes.user_id);
        }
        break;
      }

      case "subscription.resumed": {
        // Subscription has been resumed after being paused
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);

        if (notes.user_id) {
          await supabase
            .from("users")
            .update({
              subscription_status: "active",
            })
            .eq("id", notes.user_id);
        }
        break;
      }

      case "subscription.updated": {
        // Subscription details updated (e.g., plan, quantity, etc.)
        await supabase
          .from("subscriptions")
          .update({
            metadata: {
              ...subscriptionEntity,
              last_event: payload.event,
              last_event_at: new Date().toISOString(),
            },
          })
          .eq("provider_subscription_id", subscriptionEntity.id);
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
