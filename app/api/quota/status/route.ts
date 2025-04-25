/**
 * API endpoint for getting quota status
 * Returns current quota usage and limits for the user
 */

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { QuotaManager } from "@/lib/quota";

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotaManager = new QuotaManager();
    const quotaStatus = await quotaManager.getQuotaStatus(user.id);

    const { data: userData } = await supabase
      .from("users")
      .select("subscription_tier, subscription_status")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      subscription: {
        tier: userData?.subscription_tier || "free",
        status: userData?.subscription_status || "active",
      },
      quotas: quotaStatus,
    });
  } catch (error) {
    console.error("Quota status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
