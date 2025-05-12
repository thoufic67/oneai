/**
 * @file API route for canceling the current user's active subscription
 * Cancels the subscription in Razorpay and updates the local database
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelRazorpaySubscription } from "@/lib/razorpay";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the latest active subscription for the user
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel the subscription in Razorpay (at period end by default)
    await cancelRazorpaySubscription(
      subscription.provider_subscription_id,
      true
    );

    // Update the subscription status in the database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        canceled_at: new Date().toISOString(),
        metadata: {
          ...subscription.metadata,
          last_event: "user_cancelled",
          last_event_at: new Date().toISOString(),
        },
      })
      .eq("id", subscription.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
