"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/authService";
import { User } from "@supabase/supabase-js";
import { isPublicRoute } from "@/config/site";
import { useQuota, QuotaStatusResponse } from "../hooks/useQuota";
import {
  useSubscription,
  SubscriptionStatusResponse,
} from "../hooks/useSubscription";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  quotaData: QuotaStatusResponse | null;
  quotaLoading: boolean;
  quotaError: string | null;
  subscriptionData: SubscriptionStatusResponse | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  quotaData: null,
  quotaLoading: false,
  quotaError: null,
  subscriptionData: null,
  logout: async () => {},
  refreshUser: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: quotaData,
    loading: quotaLoading,
    error: quotaError,
    refetch: refetchQuota,
  } = useQuota();
  const { data: subscriptionData, refetch: refetchSubscription } =
    useSubscription();

  // Function to fetch user data
  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      await refetchQuota();
      await refetchSubscription();
      return currentUser;
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setError("Failed to refresh user data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on initial load and route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        console.log("checkAuth Current user:", currentUser);
        setUser(currentUser);

        // If not authenticated and trying to access a protected route
        if (!currentUser && !isPublicRoute(pathname)) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to authenticate");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Set up token refresh interval
  // useEffect(() => {
  //   // Refresh token periodically (e.g., every 30 days)
  //   const refreshInterval = setInterval(
  //     async () => {
  //       if (await authService.isAuthenticated()) {
  //         try {
  //           await authService.refreshToken();
  //           // Refresh user data after token refresh
  //           await refreshUser();
  //         } catch (err) {
  //           console.error("Token refresh error:", err);
  //           // If token refresh fails, user might need to re-authenticate
  //           setError("Session expired. Please log in again.");
  //           await logout();
  //         }
  //       }
  //     },
  //     30 * 60 * 60 * 1000
  //   ); // 30 days

  //   return () => clearInterval(refreshInterval);
  // }, []);

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to log out");
    }
  };

  const value = {
    user,
    loading,
    error,
    quotaData,
    quotaLoading,
    quotaError,
    subscriptionData,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
