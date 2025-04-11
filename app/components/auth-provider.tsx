"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/authService";

interface User {
  id: string;
  email: string;
  name?: string;
  picture_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
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

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/auth/callback",
    "/signup",
    "/",
    "/about",
    "/docs",
    "/blog",
  ];

  // Function to fetch user data
  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
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
        setUser(currentUser);

        // If not authenticated and trying to access a protected route
        if (
          !currentUser &&
          !publicRoutes.some((route) => pathname?.startsWith(route))
        ) {
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
  useEffect(() => {
    // Refresh token periodically (e.g., every 15 minutes)
    const refreshInterval = setInterval(
      async () => {
        if (authService.isAuthenticated()) {
          try {
            await authService.refreshToken();
            // Refresh user data after token refresh
            await refreshUser();
          } catch (err) {
            console.error("Token refresh error:", err);
            // If token refresh fails, user might need to re-authenticate
            setError("Session expired. Please log in again.");
            await logout();
          }
        }
      },
      15 * 60 * 1000
    ); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

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
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
