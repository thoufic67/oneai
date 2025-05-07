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
import { Info } from "lucide-react";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Avatar } from "@heroui/avatar";
import { useQuota } from "@/app/hooks/useQuota";
import { Skeleton } from "@heroui/skeleton";

function SettingsPage() {
  const { user } = useAuth();
  const {
    data: quotaData,
    loading: quotaLoading,
    error: quotaError,
  } = useQuota();
  const [monthlySpendingLimit, setMonthlySpendingLimit] = useState("20");
  const [usageBasedPricing, setUsageBasedPricing] = useState(true);
  const [usageBasedPricingPremium, setUsageBasedPricingPremium] =
    useState(true);
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
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {quotaData?.subscription.tier.toUpperCase() || "FREE"}
              </span>
            </CardHeader>
            <CardBody>
              <Button
                as={Link}
                href="/pricing"
                variant="bordered"
                size="md"
                radius="lg"
              >
                {quotaData?.subscription.tier === "pro"
                  ? "MANAGE SUBSCRIPTION"
                  : "UPGRADE TO PRO"}
              </Button>
              <div className="mt-4">
                <Button
                  className="text-sm text-default-500"
                  endContent={<Info className="w-4 h-4" />}
                  variant="light"
                >
                  Advanced
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
        {/* Usage Section */}
        <div className="col-span-1 md:col-span-2">
          <Card className="w-full">
            <CardHeader>
              <h2 className="text-xl font-semibold">Usage</h2>
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
                      .filter(([key]) => key === "small_messages")
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
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}
