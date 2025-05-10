"use client";
import { Link } from "@heroui/link";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { isPublicRoute } from "@/config/site";

export const Footer = () => {
  const pathname = usePathname();
  const isPublic = useMemo(() => {
    return isPublicRoute(pathname);
  }, [pathname]);

  return (
    isPublic && (
      <footer className="w-full flex items-center justify-between p-8">
        <p className="text-sm text-default-800">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
        <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/privacy"
            className="text-sm hover:underline focus:underline"
          >
            Privacy Policy
          </Link>
          <span aria-hidden="true">|</span>
          <Link
            href="/terms"
            className="text-sm hover:underline focus:underline"
          >
            Terms of Service
          </Link>
          <span aria-hidden="true">|</span>
          <Link
            href="/contact"
            className="text-sm hover:underline focus:underline"
          >
            Contact
          </Link>
        </nav>
      </footer>
    )
  );
};
