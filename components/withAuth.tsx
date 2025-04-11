"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

interface User {
  id: string;
  email: string;
  name?: string;
  picture_url?: string;
}

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P & { user: User }>
) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      async function checkAuth() {
        try {
          const currentUser = await authService.getCurrentUser();

          if (!currentUser) {
            // Redirect to login if not authenticated
            router.replace("/login");
            return;
          }

          setUser(currentUser);
          setLoading(false);
        } catch (error) {
          console.error("Authentication check failed:", error);
          router.replace("/login");
        }
      }

      checkAuth();
    }, [router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // This should not happen due to the redirect, but TypeScript needs it
    }

    return <WrappedComponent {...props} user={user} />;
  };
}
