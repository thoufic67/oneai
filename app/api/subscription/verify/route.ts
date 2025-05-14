/**
 * @file API route for verifying Razorpay subscription authorization payments and creating subscription if not exists
 */

import { NextResponse } from "next/server";
import { verifyRazorpayPayment, getRazorpaySubscription } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { Subscriptions } from "razorpay/dist/types/subscriptions";
import { QuotaManager } from "@/lib/quota";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON body
    const body = await req.json();

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = body;

    console.log("Razorpay verification request:", {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    // 1. First verify the payment signature as per Razorpay docs
    const isValid = await verifyRazorpayPayment(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error("Invalid payment signature");
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 2. Get subscription details from Razorpay to confirm the payment amount
    const subscriptionDetails: Awaited<
      ReturnType<typeof getRazorpaySubscription>
    > = await getRazorpaySubscription(razorpay_subscription_id);
    console.log("Fetched subscriptionDetails from razorpay", {
      subscriptionDetails: JSON.stringify(subscriptionDetails),
    });

    // 3. Check if subscription exists
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("provider_subscription_id", razorpay_subscription_id)
      .single();

    // If subscription doesn't exist, create it
    if (!existingSubscription) {
      const { error: createError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: subscriptionDetails.plan_id,
          payment_provider: "razorpay",
          provider_subscription_id: razorpay_subscription_id,
          status: "active",
          payment_status: "authorized",
          current_period_start: new Date(
            (subscriptionDetails.current_start || 0) * 1000
          ).toISOString(),
          current_period_end: new Date(
            (subscriptionDetails.current_end || 0) * 1000
          ).toISOString(),
          cancel_at_period_end: false,
          metadata: {
            razorpay_subscription_details: subscriptionDetails,
            last_payment_id: razorpay_payment_id,
            last_verified_at: new Date().toISOString(),
          },
        });

      if (createError) {
        console.error("Error creating subscription", createError);
        return NextResponse.json(
          { error: "Failed to create subscription" },
          { status: 500 }
        );
      }
    }

    // 4. Record the verified payment in subscription_payments table
    const { data: subscriptionPayment, error: subscriptionPaymentError } =
      await supabase.from("subscription_payments").insert({
        subscription_id: razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
        idempotency_key: razorpay_subscription_id + "-" + razorpay_payment_id,
        amount: subscriptionDetails.amount,
        currency: subscriptionDetails.currency || "INR",
        status: "authorized", // Initial state after successful authorization
        metadata: {
          verified_at: new Date().toISOString(),
          razorpay_subscription_details: subscriptionDetails,
        },
      });

    if (subscriptionPaymentError) {
      console.error("Error recording payment", subscriptionPaymentError);
      return NextResponse.json(
        { error: "Failed to record payment" },
        { status: 500 }
      );
    }

    console.log("Payment recorded successfully", { subscriptionPayment });

    // 5. Update subscription status (if it already existed)
    if (existingSubscription) {
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          payment_status: "authorized",
          updated_at: new Date().toISOString(),
          metadata: {
            ...existingSubscription.metadata,
            last_payment_id: razorpay_payment_id,
            last_verified_at: new Date().toISOString(),
          },
        })
        .eq("provider_subscription_id", razorpay_subscription_id);

      if (subscriptionError) {
        console.error("Error updating subscription", subscriptionError);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 }
        );
      }
    }

    // 6. Update user quota
    const quotaManager = new QuotaManager(supabase);
    await quotaManager.initializeAllQuotasForPlan(
      user.id,
      subscriptionDetails.plan_id
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription updated successfully",
      data: {
        payment_id: razorpay_payment_id,
        subscription_id: razorpay_subscription_id,
      },
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
