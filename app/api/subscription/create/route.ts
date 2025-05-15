/**
 * @file API route for creating Razorpay subscriptions. If a user subscription exists with the plan, returns the existing subscription instead of creating a new one.
 */

import { NextResponse } from "next/server";
import {
  razorpayServer,
  RazorpaySubscriptionCreateOptions,
} from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { getPlanDetails } from "@/lib/plans";
import { getSubscriptionTierFromPlanId } from "@/config/quota";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    // Check if a subscription already exists for this user and plan
    const { data: existingSubscriptions, error: existingError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("plan_id", planId)
      .limit(1);

    if (existingError) {
      console.error("Error checking existing subscription:", existingError);
      return NextResponse.json(
        {
          error:
            existingError.message || "Failed to check existing subscription",
        },
        { status: 500 }
      );
    }

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // If the subscription is active, throw an error
      if (
        existingSubscriptions[0].status !== "unpaid" &&
        existingSubscriptions[0].status !== "cancelled"
      ) {
        return NextResponse.json(
          {
            subscription: existingSubscriptions[0],
            error: "Subscription is already active for this user and plan.",
          },
          { status: 400 }
        );
      }
      // Subscription exists but is not active, return it
      return NextResponse.json({
        subscription: existingSubscriptions[0],
        subscription_id: existingSubscriptions[0].provider_subscription_id,
        message: "Subscription already exists for this user and plan.",
      });
    }

    // Get plan details from your database or config
    const plan = await getPlanDetails(planId);

    console.log("plan", { plan, planId });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Create subscription options
    const subscriptionOptions: RazorpaySubscriptionCreateOptions = {
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months billing cycle
      notes: {
        user_id: user.id,
      },
    };

    // Create Razorpay subscription using the official SDK
    const subscription =
      await razorpayServer.subscriptions.create(subscriptionOptions);

    // Store subscription details in your database
    const subscriptionTier = getSubscriptionTierFromPlanId(planId);
    const { data, error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      subscription_tier: subscriptionTier,
      status: "unpaid",
      payment_provider: "razorpay",
      provider_subscription_id: subscription.id,
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: subscription,
    });

    if (error) {
      console.error("Subscription creation error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create subscription" },
        { status: 500 }
      );
    }

    console.log("Subscription created:", data);

    return NextResponse.json({
      subscription_id: subscription.id,
    });
  } catch (error: any) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
