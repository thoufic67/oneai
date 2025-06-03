/**
 * @file API route for fetching the current user's subscription details
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the latest subscription for the user
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "unpaid")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .single();

    console.log("Subscription details", {
      userid: user.id,
      subscription,
      error,
    });

    if (error && error.code !== "PGRST116") {
      // PGRST116: No rows found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      subscription: subscription || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
