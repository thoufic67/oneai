/**
 * @file PricingCard.tsx
 * @description Shared component for displaying a pricing plan card with features and optional action button. Handles payment logic if needed. Used in pricing page and preview.
 */
"use client";

import { Card, CardHeader, CardBody, Button } from "@heroui/react";
import { Check } from "lucide-react";
import React, { useState } from "react";
import { Plan } from "@/lib/plans";
import Script from "next/script";

interface PricingCardProps {
  plan: Plan;
  featuresToShow?: number; // If set, only show this many features
  action?: React.ReactNode; // Optional action button or element
  className?: string;
  // Payment logic props
  user?: any;
  posthog?: any;
  router?: any;
  onPaymentSuccess?: () => void;
}

export default function PricingCard({
  plan,
  featuresToShow,
  action,
  className = "",
  user,
  posthog,
  router,
  onPaymentSuccess,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Payment logic only if user, posthog, router are provided
  const createSubscription = async (planId: string) => {
    const response = await fetch("/api/subscription/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (!response.ok) throw new Error("Failed to create subscription");
    const data = await response.json();
    return data.subscription_id;
  };

  const handlePayment = async (subscriptionId: string, plan: Plan) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      subscription_id: subscriptionId,
      name: "Aiflo",
      description: `${plan.name} Subscription`,
      image: "/favicon.svg",
      handler: (response: any) => {
        setIsLoading(true);
        fetch("/api/subscription/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              onPaymentSuccess?.();
            } else {
              throw new Error("Payment failed" + data.error);
            }
          })
          .catch((err) => {
            // Optionally handle error
          })
          .finally(() => setIsLoading(false));
      },
      prefill: {
        name: user?.user_metadata?.full_name,
        email: user?.email,
      },
      theme: { color: "#6366f1" },
    };
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      posthog?.capture?.("pricing_page_subscribe", {
        distinctId: user?.id || "anonymous",
        event: "pricing_page_subscribe",
        properties: { plan: plan.name, price: plan.price },
      });
      if (!user) {
        router?.push?.("/login");
        return;
      }
      const subscriptionId = await createSubscription(plan.id);
      await handlePayment(subscriptionId, plan);
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Razorpay script only if payment logic is enabled */}
      {user && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          type="text/javascript"
        />
      )}
      <Card
        className={`w-full border-2 border-primary-500 bg-[rgba(237,237,237,0.65)] backdrop-blur-[43px] ${className}`}
      >
        <CardHeader className="flex flex-col gap-2 p-6">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${plan.price}</span>
            <span className="text-default-600">/month</span>
          </div>
        </CardHeader>
        <CardBody className="p-6 pt-0">
          <div className="space-y-3">
            {(featuresToShow
              ? plan.features.slice(0, featuresToShow)
              : plan.features
            ).map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <p className="flex flex-col">
                  <span className="font-bold">
                    {feature.heading}
                    {feature.comingSoon && (
                      <span className="ml-2 px-1 mb-1 bg-primary-500 rounded-full text-xs text-default-100">
                        coming soon
                      </span>
                    )}
                  </span>
                  {feature.subheading && (
                    <span className="text-default-600">
                      {feature.subheading}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
          {/* If action is provided, render it. Otherwise, show subscribe button if payment logic is enabled. */}
          {action ? (
            <div className="mt-6">{action}</div>
          ) : (
            <Button
              className="w-full mt-6"
              color="primary"
              isLoading={isLoading}
              radius="lg"
              size="lg"
              variant="solid"
              onPress={handleSubscribe}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          )}
        </CardBody>
      </Card>
    </>
  );
}
