"use client";

/**
 * Settings page component that displays user settings including basic information,
 * account details, and usage statistics
 */

import Link from "next/link";
import { useAuth } from "@/app/components/auth-provider";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Progress } from "@heroui/progress";
import { useState } from "react";
import {
  Activity,
  CreditCard,
  Crown,
  Info,
  Mail,
  ChartBar,
  Settings2,
} from "lucide-react";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Avatar } from "@heroui/avatar";
import { useQuota } from "@/app/hooks/useQuota";
import { Skeleton } from "@heroui/skeleton";
import { useSubscription } from "../hooks/useSubscription";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

function SettingsPage() {
  const { user, subscriptionData, quotaData, quotaLoading, quotaError } =
    useAuth();

  const [monthlySpendingLimit, setMonthlySpendingLimit] = useState("20");
  const [usageBasedPricing, setUsageBasedPricing] = useState(true);
  const [usageBasedPricingPremium, setUsageBasedPricingPremium] =
    useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  console.log("quotaData", quotaData);
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
      // Optionally refetch subscription/quota data
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 h-full overflow-y-auto">
      <h1 className="text-4xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You can manage your account, billing, and team settings here.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-fit overflow-y-auto p-4 md:p-2 mx-auto">
        <div className="flex flex-col gap-6">
          {/* Basic Information Section */}
          <Card className="w-full">
            <CardHeader className="flex flex-row  items-center gap-3">
              <Avatar
                src={user?.user_metadata?.avatar_url}
                className="w-10 h-10"
              />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <Input
                  label="Name"
                  isDisabled
                  defaultValue={user?.user_metadata?.name || ""}
                  placeholder="Your name"
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <Input
                  label="Email"
                  defaultValue={user?.email || ""}
                  isDisabled
                  placeholder="Your email"
                  type="email"
                />
              </div>
            </CardBody>
          </Card>

          {/* Account Section */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <h2 className="text-xl font-semibold">Account</h2>
              <span className="px-2 py-1 flex items-center gap-2 text-xs bg-primary/10 text-primary rounded-full">
                {quotaData?.subscription.tier.toUpperCase() || "FREE"}
                {quotaData?.subscription.tier !== "free" && (
                  <span className="text-xs text-gray-500">
                    <Crown className="w-4 h-4 text-orange-500" />
                  </span>
                )}
              </span>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              {quotaData?.subscription.tier === "free" ? (
                <Button
                  as={Link}
                  href="/pricing"
                  variant="bordered"
                  size="md"
                  radius="lg"
                >
                  UPGRADE
                </Button>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-500">
                      Next Billing Date:{" "}
                      {new Date(
                        subscriptionData?.subscription?.current_period_end || ""
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    as={Link}
                    href={
                      subscriptionData?.subscription?.metadata?.short_url ||
                      "/pricing"
                    }
                    variant="bordered"
                    size="md"
                    radius="lg"
                    target="_blank"
                  >
                    MANAGE SUBSCRIPTION
                  </Button>
                  {/* Cancel Subscription Button */}
                  {subscriptionData?.subscription?.status === "active" && (
                    <Button
                      variant="ghost"
                      color="danger"
                      size="md"
                      radius="lg"
                      className="mt-2"
                      onClick={handleCancelSubscription}
                      isLoading={cancelLoading}
                      disabled={cancelLoading}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>
        {/* Usage Section */}
        <div className="col-span-1 md:col-span-2">
          <Card className="w-full">
            <CardHeader className="flex flex-col items-start gap-3">
              <h2 className="text-xl font-semibold">Usage</h2>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span>
                  <Info className="w-4 h-4" />
                </span>{" "}
                Usage usually gets updated within couple of hours.
              </p>
            </CardHeader>
            <CardBody className="space-y-6">
              {quotaLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-20 rounded-lg" />
                      </div>
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-24 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : quotaError ? (
                <div className="text-danger text-center py-8">
                  Failed to load quota information
                </div>
              ) : (
                <div>
                  {quotaData &&
                    Object.entries(quotaData.quotas)
                      .filter(([key]) => key !== "large_messages")
                      .map(([key, quota]) => {
                        const resetDays = formatResetDate(quota.resetsAt);
                        return (
                          <div key={key} className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                              <div className="text-right">
                                <span>
                                  {quota.used} / {quota.limit}
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={Math.min(100, quota.percentageUsed)}
                              className="w-full"
                              size="md"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>
                                {quota.used >= quota.limit
                                  ? `You've hit your limit of ${quota.limit} requests`
                                  : `${quota.remaining} requests remaining`}
                              </span>
                              <span>Resets in {resetDays} days</span>
                            </div>
                          </div>
                        );
                      })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedSettingsPage() {
  const { user, subscriptionData, quotaData, quotaLoading, quotaError } =
    useAuth();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selected, setSelected] = useState("Overview");
  const router = useRouter();

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
    { label: "Billing & Invoices", icon: <CreditCard className="w-4 h-4" /> },
    // { label: "Settings", icon: <Settings2 className="w-4 h-4" /> },
    { label: "Contact Us", icon: <Mail className="w-4 h-4" /> },
  ];

  // Sidebar click handler
  const handleSidebarClick = (label: string) => {
    if (label === "Contact Us") {
      router.push("/contact");
      return;
    }
    setSelected(label);
  };

  return (
    <div className="flex h-full max-w-6xl mx-auto p-8">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 px-4 h-fit bg-default-100/10 backdrop-blur-sm rounded-lg">
        <h2 className="text-2xl font-bold mb-8">Settings</h2>
        <nav className="flex flex-col gap-1 text-base">
          {sidebarOptions.map((opt) => (
            <SidebarItem
              key={opt.label}
              label={opt.label}
              icon={opt.icon}
              selected={selected === opt.label}
              onClick={() => handleSidebarClick(opt.label)}
            />
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-8 animate-blur-in-down">
        {selected === "Overview" && (
          <section className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 mb-8 flex flex-col gap-8">
            {/* User Card */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  className="w-14 h-14"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">
                    {user?.user_metadata?.name || "User"}
                  </span>
                  <span className="text-gray-500 text-sm">{user?.email}</span>
                  <span className="flex items-center gap-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-1 w-fit mt-1">
                    {quotaData?.subscription.tier.toUpperCase() || "FREE"}
                    {quotaData?.subscription.tier !== "free" && (
                      <Crown className="w-4 h-4 text-orange-500" />
                    )}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </section>
        )}
        {selected === "Usage" && (
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 animate-blur-in-down">
            <div className="flex-1">
              {/* Usage Section */}
              <Card className="w-full">
                <CardHeader className="flex flex-col items-start gap-3">
                  <h2 className="text-xl font-semibold">Usage</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>
                      <Info className="w-4 h-4" />
                    </span>{" "}
                    Usage usually gets updated within couple of hours.
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  {quotaLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24 rounded-lg" />
                            <Skeleton className="h-4 w-20 rounded-lg" />
                          </div>
                          <Skeleton className="h-4 w-full rounded-lg" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-3 w-32 rounded-lg" />
                            <Skeleton className="h-3 w-24 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : quotaError ? (
                    <div className="text-danger text-center py-8">
                      Failed to load quota information
                    </div>
                  ) : (
                    <div>
                      {quotaData &&
                        Object.entries(quotaData.quotas)
                          .filter(([key]) => key !== "large_messages")
                          .map(([key, quota]) => {
                            const resetDays = formatResetDate(quota.resetsAt);
                            return (
                              <div key={key} className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="capitalize">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <div className="text-right">
                                    <span>
                                      {quota.used} / {quota.limit}
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={Math.min(100, quota.percentageUsed)}
                                  className="w-full"
                                  size="md"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>
                                    {quota.used >= quota.limit
                                      ? `You've hit your limit of ${quota.limit} requests`
                                      : `${quota.remaining} requests remaining`}
                                  </span>
                                  <span>Resets in {resetDays} days</span>
                                </div>
                              </div>
                            );
                          })}
                    </div>
                  )}
                </CardBody>
              </Card>
              {/* Credits Section */}
              <Card className="w-full mt-8">
                <CardHeader className="flex flex-row items-center gap-3">
                  <h2 className="text-xl font-semibold">Credits</h2>
                </CardHeader>
                <CardBody className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Available Credits</span>
                    {/* Credits are not available in quotaData. Placeholder shown. */}
                    <span className="font-bold text-lg text-gray-400">N/A</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Credits can be used for additional requests or features.
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
        {selected === "Billing & Invoices" && (
          <div className="w-full max-w-2xl flex flex-col gap-6 animate-blur-in-down">
            {/* Account Section (Manage Payment) */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <h2 className="text-xl font-semibold">Billing & Invoices</h2>
                <span className="px-2 py-1 flex items-center gap-2 text-xs bg-primary/10 text-primary rounded-full">
                  {quotaData?.subscription.tier.toUpperCase() || "FREE"}
                  {quotaData?.subscription.tier !== "free" && (
                    <span className="text-xs text-gray-500">
                      <Crown className="w-4 h-4 text-orange-500" />
                    </span>
                  )}
                </span>
              </CardHeader>
              <CardBody className="flex flex-col gap-2">
                {quotaData?.subscription.tier === "free" ? (
                  <Button
                    as={Link}
                    href="/pricing"
                    variant="bordered"
                    size="md"
                    radius="lg"
                  >
                    UPGRADE
                  </Button>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-gray-500">
                        Next Billing Date:{" "}
                        {new Date(
                          subscriptionData?.subscription?.current_period_end ||
                            ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      as={Link}
                      href={
                        subscriptionData?.subscription?.metadata?.short_url ||
                        "/pricing"
                      }
                      variant="bordered"
                      size="md"
                      radius="lg"
                      target="_blank"
                    >
                      MANAGE SUBSCRIPTION
                    </Button>
                    {/* Cancel Subscription Button */}
                    {subscriptionData?.subscription?.status === "active" && (
                      <Button
                        variant="ghost"
                        color="danger"
                        size="md"
                        radius="lg"
                        className="mt-2"
                        onClick={handleCancelSubscription}
                        isLoading={cancelLoading}
                        disabled={cancelLoading}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        )}
        {selected === "Settings" && (
          <section className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 mb-8 animate-blur-in-down">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Voice</h3>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  Play
                </Button>
                <Button variant="bordered" size="sm">
                  Sol
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Main Language</span>
              <Button variant="bordered" size="sm">
                Auto-Detect
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              For best results, select the language you mainly speak. If it's
              not listed, it may still be supported via auto-detection.
            </p>
          </section>
        )}
      </main>
    </div>
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
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        selected
          ? "bg-gray-100 dark:bg-gray-800 text-primary font-semibold"
          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      }`}
      onClick={onClick}
    >
      {/* Replace with Lucide icons as needed */}
      <span className="w-4 h-4">
        {/* Placeholder for icon, replace with <IconName /> from Lucide if desired */}
        {icon}
      </span>
      {label}
    </div>
  );
}
