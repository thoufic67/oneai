/**
 * @file Payment verification endpoint for Razorpay subscriptions
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyRazorpayPayment } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = await req.json();

    // Verify payment signature
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

    const supabase = await createClient();

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        metadata: {
          razorpay_payment_id,
          razorpay_signature,
          verified_at: new Date().toISOString(),
        },
      })
      .eq("provider_subscription_id", razorpay_subscription_id);

    // Record the payment
    await supabase.from("subscription_payments").insert({
      subscription_id: razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "verified",
      verified_at: new Date(),
    });

    console.log("Payment verified successfully");

    return NextResponse.json({
      status: "success",
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
