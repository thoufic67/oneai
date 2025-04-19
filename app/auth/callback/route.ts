import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

async function syncUserData(supabase: any, user: any) {
  try {
    // Check if user already exists in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      // Insert new user
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0],
        picture_url: user.user_metadata?.avatar_url,
        provider_type: user.app_metadata?.provider,
        provider_id: user.app_metadata?.provider_id,
      });

      if (insertError) throw insertError;

      // Create initial usage quota for the user
      const { error: quotaError } = await supabase.from("usage_quotas").insert({
        user_id: user.id,
        model_id: "claude-3-opus-20240229", // Default model
        messages_limit: 100, // Free tier limit
        reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      if (quotaError) throw quotaError;
    }
  } catch (error) {
    console.error("Error syncing user data:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  console.log("Auth callback ", { code, next, origin });

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      try {
        // Sync user data to our database
        await syncUserData(supabase, user);

        // Get the protocol from the request
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host =
          request.headers.get("x-forwarded-host") ||
          request.headers.get("host") ||
          "";
        const baseUrl = `${protocol}://${host}`;

        console.log("Redirecting to:", `${baseUrl}${next}`);

        // Redirect to the appropriate URL
        return NextResponse.redirect(`${baseUrl}${next}`);
      } catch (syncError) {
        console.error("Error during user sync:", syncError);
        // Even if sync fails, we'll redirect the user but log the error
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host =
          request.headers.get("x-forwarded-host") ||
          request.headers.get("host") ||
          "";
        const baseUrl = `${protocol}://${host}`;
        return NextResponse.redirect(`${baseUrl}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const baseUrl = `${protocol}://${host}`;
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}
