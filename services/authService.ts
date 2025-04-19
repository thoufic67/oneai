import type { User } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@/lib/supabase/client";
import { SignInWithOAuthCredentials } from "@supabase/supabase-js";

class AuthService {
  private supabase = createClient();

  // Redirect to Google login page
  async initiateGoogleLogin() {
    try {
      const options: SignInWithOAuthCredentials = {
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            next: "/new",
          },
        },
      };
      console.log(
        "Initiating Google login with options:",
        JSON.stringify(options)
      );
      const { error } = await this.supabase.auth.signInWithOAuth(options);
      if (error) {
        console.log("Google login error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error;
    }
  }

  // Get the current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      console.log("Current user:", user);
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  // Logout the user
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    console.log("Session:", session);
    return !!session;
  }
}

export const authService = new AuthService();
