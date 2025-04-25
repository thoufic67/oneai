/**
 * @file API route for creating Razorpay subscriptions
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  razorpayServer,
  RazorpaySubscriptionCreateOptions,
} from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    // Get plan details from your database or config
    const plan = await getPlanDetails(planId);
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
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      status: "created",
      payment_provider: "razorpay",
      provider_subscription_id: subscription.id,
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: subscription,
    });

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

// Helper function to get plan details - implement based on your setup
async function getPlanDetails(planId: string) {
  // This is a placeholder - implement based on your plan storage
  const plans = {
    plan_basic: {
      id: "plan_basic",
      name: "Basic Plan",
      price: 999,
      // Add other plan details
    },
    plan_pro: {
      id: "plan_pro",
      name: "Pro Plan",
      price: 1999,
      // Add other plan details
    },
  };

  return plans[planId as keyof typeof plans];
}
