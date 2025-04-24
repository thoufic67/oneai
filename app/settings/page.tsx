"use client";

/**
 * Settings page component that displays user settings including basic information,
 * account details, and usage statistics
 */

import { useAuth } from "@/app/components/auth-provider";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { useState } from "react";
import { Info } from "lucide-react";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Avatar } from "@heroui/avatar";

function SettingsPage() {
  const { user } = useAuth();
  const [monthlySpendingLimit, setMonthlySpendingLimit] = useState("20");
  const [usageBasedPricing, setUsageBasedPricing] = useState(true);
  const [usageBasedPricingPremium, setUsageBasedPricingPremium] =
    useState(true);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You can manage your account, billing, and team settings here.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <label className="text-sm font-medium">Name</label>
                <Input
                  isDisabled
                  defaultValue={user?.user_metadata?.name || ""}
                  placeholder="Your name"
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
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
                Pro
              </span>
              <Button className="ml-auto" variant="ghost">
                UPGRADE TO BUSINESS
              </Button>
            </CardHeader>
            <CardBody>
              <Button variant="bordered">MANAGE SUBSCRIPTION</Button>
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
        <div className="col-span-2">
          <Card className="w-full">
            <CardHeader>
              <h2 className="text-xl font-semibold">Usage</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <p className="text-sm text-default-500 mb-2">
                  Fast requests will refresh in 9 days
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Premium models</span>
                      <div className="text-right">
                        <span>4 / No Limit</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: "40%" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>You've hit your limit of 500 fast requests</span>
                      <span>
                        You've used 4 fast requests of this model. You have no
                        monthly quota.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="space-y-4">
              <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-900 rounded-lg flex items-start gap-2">
                <Info className="w-5 h-5 text-warning mt-0.5" />
                <p className="text-sm text-warning-800 dark:text-warning-300">
                  Usage-based pricing allows you to pay for extra fast requests
                  beyond your plan limits.{" "}
                  <a href="#" className="underline">
                    Learn more
                  </a>
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Settings</h3>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium">Enable usage-based pricing</p>
                    <p className="text-sm text-gray-500">
                      Pay for usage beyond your plan limits
                    </p>
                  </div>
                  <Switch
                    isSelected={usageBasedPricing}
                    onValueChange={setUsageBasedPricing}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium">
                      Enable usage-based pricing for premium models
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay for premium model usage beyond your plan limits
                    </p>
                  </div>
                  <Switch
                    isSelected={usageBasedPricingPremium}
                    onValueChange={setUsageBasedPricingPremium}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Monthly spending limit:</p>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-24"
                        startContent="$"
                        type="number"
                        value={monthlySpendingLimit}
                        onChange={(e) =>
                          setMonthlySpendingLimit(e.target.value)
                        }
                      />
                      <Button>Save</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Usage</h3>
                <div className="flex justify-between items-center">
                  <span>$11.23</span>
                  <span className="text-sm text-gray-500">of $20 limit</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>April 2025</span>
                  </div>
                  <table className="w-full">
                    <tbody className="space-y-2">
                      <tr className="flex justify-between py-1">
                        <td className="text-sm">
                          11 gemini-2.5-pro-exp-max requests * 5 cents per such
                          request
                        </td>
                        <td className="text-sm">$0.55</td>
                      </tr>
                      <tr className="flex justify-between py-1">
                        <td className="text-sm">
                          207 extra fast premium requests beyond 500/month * 4
                          cents per such request
                        </td>
                        <td className="text-sm">$8.28</td>
                      </tr>
                      <tr className="flex justify-between py-1">
                        <td className="text-sm">
                          37 premium tool calls * 5 cents per tool call
                        </td>
                        <td className="text-sm">$1.85</td>
                      </tr>
                      <tr className="flex justify-between py-1">
                        <td className="text-sm">
                          11 claude-3.7-sonnet-thinking-max requests * 5 cents
                          per such request
                        </td>
                        <td className="text-sm">$0.55</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div> */}
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
