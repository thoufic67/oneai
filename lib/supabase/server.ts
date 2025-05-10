import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createClientSupabase } from "@supabase/supabase-js";

export async function createClient(serviceRoleKey: string) {
  console.log("Creating client with service role key:", serviceRoleKey);
  if (serviceRoleKey) {
    console.log("Creating service role client");
    return createClientSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
  }
  const cookieStore = await cookies();

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error("Error setting cookies", error);
          }
        },
      },
    }
  );
}
