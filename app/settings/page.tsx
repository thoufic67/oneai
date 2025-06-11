"use client";

/**
 * Settings page component that displays user settings including basic information,
 * account details, usage statistics, and billing/invoices (now combined with Overview)
 *
 * Updated: Combined Overview and Billing & Invoices sections for a more streamlined UI.
 */

import Link from "next/link";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { useState, useEffect, Suspense } from "react";
import { Activity, Crown, Info, Mail, ChartBar } from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { Skeleton } from "@heroui/skeleton";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/app/components/auth-provider";
import { BackgroundGradient } from "@/app/components/background-gradient";
import OverviewTab from "@/app/components/settings/OverviewTab";
import UsageTab from "@/app/components/settings/UsageTab";
import SettingsTab from "@/app/components/settings/SettingsTab";

// Settings content component that uses search params
function SettingsContent() {
  const { user, subscriptionData, quotaData, quotaLoading, quotaError } =
    useAuth();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selected, setSelected] = useState("Overview");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Helper function to format the reset date
  const formatResetDate = (date: Date) => {
    const now = new Date();
    const resetDate = new Date(date);
    const diffDays = Math.ceil(
      (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffDays;
  };

  // Cancel subscription handler
  const handleCancelSubscription = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? You will retain access until the end of your billing period."
      )
    )
      return;
    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to cancel subscription");
      toast.success(
        "Subscription cancelled. You will retain access until the end of your billing period."
      );
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  // Sidebar options
  const sidebarOptions = [
    { label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { label: "Usage", icon: <ChartBar className="w-4 h-4" /> },
    { label: "Contact Us", icon: <Mail className="w-4 h-4" /> },
  ];

  // Sync tab with URL matrix param
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (tabParam) {
      const tabLabel =
        sidebarOptions.find(
          (opt) => opt.label.toLowerCase() === tabParam.toLowerCase()
        )?.label || "Overview";

      setSelected(tabLabel);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleSidebarClick = (label: string) => {
    if (label === "Contact Us") {
      router.push("/contact");

      return;
    }
    setSelected(label);
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    params.set("tab", label.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Helper to map subscription status to display text and color
  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return {
          text: "Active",
          color: "bg-green-100 text-green-700 border-green-300",
        };
      case "pending":
        return {
          text: "Pending",
          color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        };
      case "halted":
        return {
          text: "Halted",
          color: "bg-red-100 text-red-700 border-red-300",
        };
      case "cancelled":
        return {
          text: "Cancelled",
          color: "bg-gray-100 text-gray-700 border-gray-300",
        };
      case "unpaid":
        return {
          text: "Unpaid",
          color: "bg-red-100 text-red-700 border-red-300",
        };
      default:
        return {
          text: status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : "Unknown",
          color: "bg-gray-100 text-gray-700 border-gray-300",
        };
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Modern animated background */}
      <BackgroundGradient />
      <div className="flex flex-col md:flex-row items-start h-full max-w-6xl mx-auto p-4 md:p-8 gap-8 z-10 relative">
        {/* Sidebar with glassmorphism and animated pill */}
        <aside className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex md:flex-col flex-row p-8 h-fit bg-white/60 dark:bg-default-100/20 backdrop-blur-lg rounded-2xl shadow-lg overflow-x-auto md:overflow-x-visible relative">
          <h2 className="text-2xl font-bold mb-4 md:mb-8 hidden md:block text-gradient bg-gradient-to-r from-primary-500 to-cyan-500 bg-clip-text text-transparent">
            Settings
          </h2>
          <nav className="flex md:flex-col flex-row gap-2 md:gap-4 text-base w-full relative">
            {sidebarOptions.map((opt, idx) => (
              <motion.div
                key={opt.label}
                layout
                className="relative"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <SidebarItem
                  icon={opt.icon}
                  label={opt.label}
                  selected={selected === opt.label}
                  onClick={() => handleSidebarClick(opt.label)}
                />
                {selected === opt.label && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-200/60 to-cyan-200/40 dark:from-primary-900/40 dark:to-cyan-900/20 z-[-1] shadow-md"
                    layoutId="sidebar-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </nav>
        </aside>
        {/* Main Content with animated transitions */}
        <main className="flex-1 flex flex-col items-center justify-start p-8 rounded-2xl shadow-lg bg-white/80 dark:bg-gray-900/80 animate-blur-in-down-x w-full">
          <AnimatePresence mode="wait">
            {selected === "Overview" && (
              <OverviewTab
                cancelLoading={cancelLoading}
                getStatusBadge={getStatusBadge}
                handleCancelSubscription={handleCancelSubscription}
                quotaData={quotaData}
                subscriptionData={subscriptionData}
                user={user}
              />
            )}
            {selected === "Usage" && (
              <UsageTab
                formatResetDate={formatResetDate}
                quotaData={quotaData}
                quotaError={quotaError}
                quotaLoading={quotaLoading}
              />
            )}
            {selected === "Settings" && <SettingsTab />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Loading fallback component
function SettingsLoadingFallback() {
  return (
    <div className="relative min-h-screen">
      <BackgroundGradient />
      <div className="flex flex-col md:flex-row items-start h-full max-w-6xl mx-auto p-4 md:p-8 gap-8 z-10 relative">
        <aside className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex md:flex-col flex-row p-8 h-fit bg-white/60 dark:bg-default-100/20 backdrop-blur-lg rounded-2xl shadow-lg overflow-x-auto md:overflow-x-visible relative">
          <Skeleton className="h-8 w-32 mb-8 hidden md:block" />
          <div className="flex md:flex-col flex-row gap-2 md:gap-4 text-base w-full relative">
            {[1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </aside>
        <main className="flex-1 flex flex-col items-center justify-start p-8 rounded-2xl shadow-lg bg-white/80 dark:bg-gray-900/80 animate-blur-in-down-x w-full">
          <div className="w-full space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedSettingsPage() {
  return (
    <Suspense fallback={<SettingsLoadingFallback />}>
      <SettingsContent />
    </Suspense>
  );
}

// Sidebar item component
function SidebarItem({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: JSX.Element;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      fullWidth
      className={`transition-all duration-200 rounded-lg px-4 py-2 font-medium shadow-sm ${selected ? "scale-105 shadow-lg" : "hover:scale-105 hover:shadow-md"}`}
      color={selected ? "primary" : "default"}
      startContent={icon}
      variant={selected ? "solid" : "flat"}
      onPress={onClick}
    >
      {label}
    </Button>
  );
}
