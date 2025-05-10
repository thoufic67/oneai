"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { Spinner } from "@heroui/spinner";
import { publicRoutes } from "@/config/site";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !loading &&
      !user &&
      !publicRoutes.some((route) => pathname?.startsWith(route))
    ) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", pathname || "/");
      router.push("/login");
    }

    // Optional role-based access control
    if (user && allowedRoles && !allowedRoles.includes(user.role as string)) {
      router.push("/unauthorized");
    }
  }, [user, loading, router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="lg" className="text-primary" />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If it's a public route or user is authenticated, render the children
  if (publicRoutes.some((route) => pathname?.startsWith(route)) || user) {
    console.log("Rendering children");
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}
