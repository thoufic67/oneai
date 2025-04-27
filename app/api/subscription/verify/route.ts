/**
 * @file API route for verifying Razorpay payments and updating subscription status
 */

import { NextResponse } from "next/server";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("user", { user, req });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form-urlencoded body
    const text = await req.text();
    const body = Object.fromEntries(new URLSearchParams(text));

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = body;

    console.log("razor pay verify req", {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    // Verify the payment signature
    const isValid = await verifyRazorpayPayment(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Record the payment in subscription_payments table
    const { data: subscriptionPayment, error: subscriptionPaymentError } =
      await supabase.from("subscription_payments").insert({
        subscription_id: razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "verified",
        metadata: {
          verified_at: new Date().toISOString(),
        },
      });

    if (subscriptionPaymentError) {
      console.error("Error recording payment", subscriptionPaymentError);
    }

    // Update subscription status to 'active' if not already
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        payment_status: "captured",
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", razorpay_subscription_id);

    if (subscriptionError) {
      console.error("Error updating subscription", subscriptionError);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
