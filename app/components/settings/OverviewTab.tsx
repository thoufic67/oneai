// app/components/settings/OverviewTab.tsx
// Overview tab for the settings page: shows user info, subscription tier, billing, and cancel subscription logic.
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import { Crown } from "lucide-react";
import React from "react";

interface OverviewTabProps {
  user: any;
  quotaData: any;
  subscriptionData: any;
  cancelLoading: boolean;
  handleCancelSubscription: () => void;
  getStatusBadge: (status: string | undefined) => {
    text: string;
    color: string;
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  quotaData,
  subscriptionData,
  cancelLoading,
  handleCancelSubscription,
  getStatusBadge,
}) => {
  return (
    <section
      key="overview"
      className="w-full max-w-6xl flex flex-col gap-8 animate-blur-in-down-x"
    >
      {/* User Card */}
      <Card className="w-full bg-gradient-to-br from-primary-50/60 to-cyan-50/40 dark:from-primary-900/40 dark:to-cyan-900/20 shadow-xl rounded-2xl border border-primary-100 dark:border-primary-900">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar
            className="w-16 h-16 ring-4 ring-primary-200 dark:ring-primary-800 shadow-lg"
            src={user?.user_metadata?.avatar_url}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-primary-700 dark:text-primary-200">
              {user?.user_metadata?.name || "User"}
            </span>
            <span className="text-gray-500 text-sm">{user?.email}</span>
            <span className="flex items-center gap-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-1 w-fit mt-1 shadow">
              {quotaData?.subscription.tier.toUpperCase() || "FREE"}
              {quotaData?.subscription.tier !== "free" && (
                <Crown className="w-4 h-4 text-orange-500" />
              )}
            </span>
          </div>
        </CardHeader>
      </Card>
      {/* Billing & Invoices Card */}
      <Card className="w-full bg-gradient-to-br from-primary-50/60 to-cyan-50/40 dark:from-primary-900/40 dark:to-cyan-900/20 shadow-xl rounded-2xl border border-primary-100 dark:border-primary-900">
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
          {/* Status Badge */}
          {subscriptionData?.subscription?.status && (
            <span
              className={`ml-2 px-2 py-1 border rounded-full text-xs font-medium ${getStatusBadge(subscriptionData.subscription.status).color}`}
            >
              {getStatusBadge(subscriptionData.subscription.status).text}
            </span>
          )}
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {/* Optionally show a warning if not active */}
          {subscriptionData?.subscription?.status &&
            subscriptionData.subscription.status !== "active" && (
              <div
                className={`text-xs rounded p-2 mb-2 border ${
                  subscriptionData.subscription.status === "unpaid"
                    ? "text-red-700 bg-red-50 border-red-200"
                    : "text-yellow-600 bg-yellow-50 border-yellow-200"
                }`}
              >
                {subscriptionData.subscription.status === "unpaid" ? (
                  <span>
                    Your subscription is <b>Unpaid</b>. Please update your
                    payment method to restore access.
                  </span>
                ) : (
                  <span>
                    Your subscription is currently{" "}
                    <b>
                      {
                        getStatusBadge(subscriptionData.subscription.status)
                          .text
                      }
                    </b>
                    . Some features may be limited.
                  </span>
                )}
              </div>
            )}
          {quotaData?.subscription.tier === "free" ? (
            <Button
              as={Link}
              className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
              href="/pricing"
              radius="lg"
              size="md"
              variant="bordered"
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
                className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                href={
                  subscriptionData?.subscription?.metadata?.short_url ||
                  "/pricing"
                }
                radius="lg"
                size="md"
                target="_blank"
                variant="bordered"
              >
                MANAGE SUBSCRIPTION
              </Button>
              {/* Cancel Subscription Button */}
              {subscriptionData?.subscription?.status === "active" && (
                <Button
                  className="mt-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  color="danger"
                  disabled={cancelLoading}
                  isLoading={cancelLoading}
                  radius="lg"
                  size="md"
                  variant="ghost"
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </Button>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default OverviewTab;
