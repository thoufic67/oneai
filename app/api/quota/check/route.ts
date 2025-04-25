/**
 * API endpoint for checking quota availability
 * Returns whether the requested quota usage is allowed
 */

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { QuotaManager } from "@/lib/quota";
import { QuotaExceededError } from "@/config/quota";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quotaKey, units = 1 } = await req.json();
    const quotaManager = new QuotaManager();

    try {
      await quotaManager.checkQuota(user.id, quotaKey, units);
      return NextResponse.json({ allowed: true });
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            allowed: false,
            error: "QUOTA_EXCEEDED",
            details: error.details,
          },
          { status: 429 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Quota check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
