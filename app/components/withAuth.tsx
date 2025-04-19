"use client";

import { useAuth } from "@/app/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface WithAuthProps {
  WrappedComponent: React.ComponentType;
  allowedRoles?: string[];
}

const withAuth = ({ WrappedComponent, allowedRoles }: WithAuthProps) => {
  return function AuthenticatedComponent(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        // Store the attempted URL to redirect back after login
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        router.push("/login");
      }

      // Optional role-based access control
      if (user && allowedRoles && !allowedRoles.includes(user.role as string)) {
        router.push("/unauthorized");
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
