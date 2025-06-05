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
      <footer className="w-full flex   items-center justify-between p-8">
        <div>
          <p className="text-sm text-default-800">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 flex-col">
            <h3 className="text-sm font-semibold">Resources</h3>
            <Link
              href="/privacy"
              className="text-sm hover:underline focus:underline"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-sm hover:underline focus:underline"
            >
              Terms of Service
            </Link>

            <Link
              href="/cancellation"
              className="text-sm hover:underline focus:underline"
            >
              Cancellation & Refunds
            </Link>

            <Link
              href="/contact"
              className="text-sm hover:underline focus:underline"
            >
              Contact
            </Link>
          </nav>
          <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 flex-col">
            <h3 className="text-sm font-semibold">Product</h3>
            <Link
              href="/pricing"
              className="text-sm hover:underline focus:underline"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-sm hover:underline focus:underline"
            >
              Blog
            </Link>
          </nav>
        </div>
      </footer>
    )
  );
};
