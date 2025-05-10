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

    console.log("[Webhook] Received payload:", JSON.stringify(payload));
    console.log("[Webhook] Signature:", signature);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("[Webhook] Invalid webhook signature", {
        signature,
        payload,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient(process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const subscriptionEntity = payload.payload.subscription.entity;
    const { notes } = subscriptionEntity;

    console.log(
      "[Webhook] Subscription entity:",
      JSON.stringify(subscriptionEntity)
    );
    console.log("[Webhook] Notes:", JSON.stringify(notes));

    console.log("[Webhook] Processing event:", payload.event, {
      subscription_id: subscriptionEntity.id,
      status: subscriptionEntity.status,
    });

    switch (payload.event) {
      case "subscription.created": {
        console.log(
          "[Webhook] Event: subscription.created - No action taken (handled elsewhere)"
        );
        break;
      }

      case "subscription.authenticated": {
        console.log(
          "[Webhook] Event: subscription.authenticated - Updating subscription status to authenticated"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription updated for authentication");
        }
        break;
      }

      case "subscription.activated": {
        console.log(
          "[Webhook] Event: subscription.activated - Activating subscription"
        );
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              payment_status: "captured",
              current_period_start: new Date(
                subscriptionEntity.current_start * 1000
              ),
              current_period_end: new Date(
                subscriptionEntity.current_end * 1000
              ),
              metadata: {
                ...subscriptionEntity,
                last_event: payload.event,
                last_event_at: new Date().toISOString(),
              },
            })
            .eq("provider_subscription_id", subscriptionEntity.id);
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription activated in DB");
        }

        // Update user's subscription tier
        if (notes.user_id) {
          console.log("[Webhook] Updating user subscription tier", {
            user_id: notes.user_id,
            plan_id: subscriptionEntity.plan_id,
          });
          const { data: userData, error: userError } = await supabase
            .from("users")
            .update({
              subscription_tier: "basic",
              subscription_status: "active",
            })
            .eq("id", notes.user_id);
          if (userError) {
            console.error("[Webhook] Error updating user", {
              error: userError,
            });
          } else {
            console.log("[Webhook] User subscription tier updated");
          }
          // Initialize quotas for the new subscription
          console.log("[Webhook] Initializing quotas for user", {
            user_id: notes.user_id,
            plan_id: subscriptionEntity.plan_id,
          });
          await initializeQuotas(notes.user_id, subscriptionEntity.plan_id);
        } else {
          console.warn(
            "[Webhook] No user_id found in notes for subscription activation"
          );
        }
        break;
      }

      case "subscription.charged": {
        console.log(
          "[Webhook] Event: subscription.charged - Recording payment"
        );
        const paymentEntity = payload.payload.payment?.entity;
        if (!paymentEntity) {
          console.warn(
            "[Webhook] No payment entity found in payload for charged event"
          );
          break;
        }

        const { data, error } = await supabase
          .from("subscription_payments")
          .insert({
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
        if (error) {
          console.error("[Webhook] Error recording payment", { error });
        } else {
          console.log("[Webhook] Payment recorded in subscription_payments", {
            payment_id: paymentEntity.id,
          });
        }

        // Update subscription with new period dates
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .update({
              current_period_start: new Date(
                subscriptionEntity.current_start * 1000
              ),
              current_period_end: new Date(
                subscriptionEntity.current_end * 1000
              ),
              payment_status: "captured",
              metadata: {
                ...subscriptionEntity,
                last_payment: paymentEntity,
                last_event: payload.event,
                last_event_at: new Date().toISOString(),
              },
            })
            .eq("provider_subscription_id", subscriptionEntity.id);
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription updated after charge");
        }
        break;
      }

      case "subscription.pending": {
        console.log(
          "[Webhook] Event: subscription.pending - Marking as pending"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription marked as pending");
        }
        break;
      }

      case "subscription.halted": {
        console.log("[Webhook] Event: subscription.halted - Marking as halted");
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription marked as halted");
        }

        if (notes?.user_id) {
          console.log("[Webhook] Updating user status to halted", {
            user_id: notes.user_id,
          });
          await supabase
            .from("users")
            .update({
              subscription_status: "halted",
            })
            .eq("id", notes.user_id);
        } else {
          console.warn("[Webhook] No user_id found in notes for halted event");
        }
        break;
      }

      case "subscription.cancelled": {
        console.log(
          "[Webhook] Event: subscription.cancelled - Cancelling subscription"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription cancelled in DB");
        }

        if (notes.user_id) {
          console.log("[Webhook] Updating user status to cancelled", {
            user_id: notes.user_id,
          });
          await supabase
            .from("users")
            .update({
              subscription_status: "cancelled",
            })
            .eq("id", notes.user_id);
        } else {
          console.warn(
            "[Webhook] No user_id found in notes for cancelled event"
          );
        }
        break;
      }

      case "subscription.completed": {
        console.log(
          "[Webhook] Event: subscription.completed - Completing subscription"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription marked as completed");
        }

        if (notes.user_id) {
          console.log("[Webhook] Updating user status to completed", {
            user_id: notes.user_id,
          });
          const { data: userData, error: userError } = await supabase
            .from("users")
            .update({
              subscription_status: "completed",
            })
            .eq("id", notes.user_id);
          if (userError) {
            console.error("[Webhook] Error updating user", {
              error: userError,
            });
          } else {
            console.log("[Webhook] User status updated to completed");
          }
        } else {
          console.warn(
            "[Webhook] No user_id found in notes for completed event"
          );
        }
        break;
      }

      case "subscription.paused": {
        console.log(
          "[Webhook] Event: subscription.paused - Pausing subscription"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription paused in DB");
        }

        if (notes.user_id) {
          console.log("[Webhook] Updating user status to paused", {
            user_id: notes.user_id,
          });
          const { data: userData, error: userError } = await supabase
            .from("users")
            .update({
              subscription_status: "paused",
            })
            .eq("id", notes.user_id);
          if (userError) {
            console.error("[Webhook] Error updating user", {
              error: userError,
            });
          } else {
            console.log("[Webhook] User status updated to paused");
          }
        } else {
          console.warn("[Webhook] No user_id found in notes for paused event");
        }
        break;
      }

      case "subscription.resumed": {
        console.log(
          "[Webhook] Event: subscription.resumed - Resuming subscription"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription resumed in DB");
        }

        if (notes.user_id) {
          console.log("[Webhook] Updating user status to active", {
            user_id: notes.user_id,
          });
          const { data: userData, error: userError } = await supabase
            .from("users")
            .update({
              subscription_status: "active",
            })
            .eq("id", notes.user_id);
          if (userError) {
            console.error("[Webhook] Error updating user", {
              error: userError,
            });
          } else {
            console.log("[Webhook] User status updated to active");
          }
        } else {
          console.warn("[Webhook] No user_id found in notes for resumed event");
        }
        break;
      }

      case "subscription.updated": {
        console.log(
          "[Webhook] Event: subscription.updated - Updating subscription metadata"
        );
        const { data: subscriptionData, error: subscriptionError } =
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
        if (subscriptionError) {
          console.error("[Webhook] Error updating subscription", {
            error: subscriptionError,
          });
        } else {
          console.log("[Webhook] Subscription metadata updated");
        }
        break;
      }
    }

    console.log("[Webhook] Successfully processed event:", payload.event);
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper function to initialize quotas for a new subscription
async function initializeQuotas(userId: string, planId: string) {
  const supabase = await createClient(process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Get quota limits for the plan
  const quotaLimits = getQuotaLimitsForPlan(planId);
  console.log("[Quotas] Initializing quotas for user", {
    userId,
    planId,
    quotaLimits,
  });

  // Initialize each quota type
  for (const [quotaKey, limit] of Object.entries(quotaLimits)) {
    console.log(
      `[Quotas] Upserting quota: ${quotaKey} with limit: ${limit} for user: ${userId}`
    );
    const { data: quotaData, error: quotaError } = await supabase
      .from("usage_quotas")
      .upsert(
        {
          user_id: userId,
          quota_key: quotaKey,
          used_count: 0,
          quota_limit: limit,
          subscription_tier: "basic",
          reset_frequency: "monthly",
          last_reset_at: new Date(),
          next_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        { onConflict: "user_id,quota_key" }
      );
    if (quotaError) {
      console.error("[Quotas] Error upserting quota", {
        error: quotaError,
      });
    } else {
      console.log("[Quotas] Quota upserted successfully", { quotaData });
    }
  }
  console.log("[Quotas] Quotas initialized for user", { userId });
}

// Helper function to get quota limits for a plan
function getQuotaLimitsForPlan(planId: string) {
  // This is a placeholder - implement based on your plan configuration
  const quotaLimits = {
    pro: {
      small_messages: 1000,
      large_messages: 200,
      image_generation: 100,
    },
    basic: {
      small_messages: 500,
      large_messages: 100,
      image_generation: 50,
    },
  };

  const limits =
    quotaLimits[planId as keyof typeof quotaLimits] || quotaLimits.basic;
  console.log("[Quotas] Fetched quota limits for plan", { planId, limits });
  return limits;
}
