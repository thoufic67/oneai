// app/components/settings/UsageTab.tsx
// Usage tab for the settings page: shows usage quotas, progress bars, and credits info.
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Skeleton } from "@heroui/skeleton";
import { Info } from "lucide-react";
import React from "react";

interface UsageTabProps {
  quotaData: any;
  quotaLoading: boolean;
  quotaError: string | null;
  formatResetDate: (date: Date) => number;
}

const UsageTab: React.FC<UsageTabProps> = ({
  quotaData,
  quotaLoading,
  quotaError,
  formatResetDate,
}) => {
  return (
    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 animate-blur-in-down-x">
      <div className="flex-1">
        {/* Usage Section */}
        <Card className="w-full bg-gradient-to-br from-primary-50/60 to-cyan-50/40 dark:from-primary-900/40 dark:to-cyan-900/20 shadow-xl rounded-2xl border border-primary-100 dark:border-primary-900">
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
                      <Skeleton className="h-4 w-24 rounded-lg animate-pulse bg-primary-100/40 dark:bg-primary-900/20" />
                      <Skeleton className="h-4 w-20 rounded-lg animate-pulse bg-primary-100/40 dark:bg-primary-900/20" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-lg animate-pulse bg-primary-100/40 dark:bg-primary-900/20" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-32 rounded-lg animate-pulse bg-primary-100/40 dark:bg-primary-900/20" />
                      <Skeleton className="h-3 w-24 rounded-lg animate-pulse bg-primary-100/40 dark:bg-primary-900/20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : quotaError ? (
              <div className="text-danger text-center py-8">
                {typeof quotaError === "string"
                  ? quotaError
                  : "Failed to load quota information"}
              </div>
            ) : (
              <div>
                {quotaData &&
                  Object.entries(quotaData.quotas)
                    .filter(([key]) => key !== "large_messages")
                    .map(([key, quota]: any) => {
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
                            className="w-full transition-all duration-500 bg-primary-100/30 dark:bg-primary-900/10"
                            color={
                              quota.percentageUsed > 90
                                ? "danger"
                                : quota.percentageUsed > 70
                                  ? "warning"
                                  : "primary"
                            }
                            size="md"
                            value={Math.min(100, quota.percentageUsed)}
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
        <Card className="w-full mt-8 bg-gradient-to-br from-primary-50/60 to-cyan-50/40 dark:from-primary-900/40 dark:to-cyan-900/20 shadow-xl rounded-2xl border border-primary-100 dark:border-primary-900">
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
  );
};

export default UsageTab;
