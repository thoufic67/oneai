/**
 * @file Pricing page component with Razorpay subscription integration
 */

"use client";

import { title } from "@/app/components/primitives";
import PostHogClient from "@/posthog";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Check } from "lucide-react";
import { useAuth } from "../components/auth-provider";
import { useRouter } from "next/navigation";
import { RazorpayCheckoutOptions } from "@/lib/razorpay";
import { useState } from "react";
import Script from "next/script";

export const initializeRazorpayCheckout = async (
  options: RazorpayCheckoutOptions
) => {
  // Load Razorpay script if not already loaded
  if (!(window as any).Razorpay) {
    // await loadRazorpayScript();
  }

  const razorpay = new (window as any).Razorpay(options);
  return razorpay;
};

// const loadRazorpayScript = (): Promise<void> => {
//   return new Promise((resolve) => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve();
//     document.body.appendChild(script);
//   });
// };

type PricingPlan = {
  name: string;
  price: number;
  planId: string; // Razorpay plan ID
  features: { heading: string; subheading?: string }[];
};

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Pro",
    price: 10,
    planId: "plan_QNLdiIIYp1E5G5", // Replace with your actual Razorpay plan ID
    features: [
      {
        heading: "Access to the best LLMs",
        subheading:
          "Claude, GPT-4o, Llama, Grok, Mistral, Gemini, DeepSeek, Perplexity",
      },
      // {
      //   heading: "Reasoning model (CoT)",
      //   subheading: "o4-mini, DeepSeek R1",
      // },
      // {
      //   heading: "Generate images",
      //   subheading: "Midjourney, Dall-E, Stable Diffusion, Recraft & FLUX",
      // },
      {
        heading: "Unlimited text messages",
        subheading: "fair usage policy applies",
      },
      // {
      //   heading: "Documents up to 10k chars (~3 pages)",
      // },
      {
        heading: "Cancel anytime",
      },
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const posthog = PostHogClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const createSubscription = async (planId: string) => {
    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const data = await response.json();
      return data.subscription_id;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  };

  const handlePayment = async (subscriptionId: string, plan: PricingPlan) => {
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: subscriptionId,
        name: "OneAI",
        description: `${plan.name} Subscription`,
        image: "/favicon.svg", // Add your logo path
        callback_url: `${window.location.origin}/api/subscription/verify`,
        prefill: {
          name: user?.user_metadata?.full_name,
          email: user?.email,
        },
        theme: {
          color: "#6366f1", // Match your primary color
        },
      };

      const razorpay = await initializeRazorpayCheckout(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    }
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    try {
      setIsLoading(true);
      posthog.capture({
        distinctId: user?.id || "anonymous",
        event: "pricing_page_subscribe",
        properties: {
          plan: plan.name,
          price: plan.price,
        },
      });

      if (!user) {
        router.push("/login");
        return;
      }

      const subscriptionId = await createSubscription(plan.planId);
      await handlePayment(subscriptionId, plan);
    } catch (error) {
      console.error("Subscription error:", error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 min-h-full">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="text-center space-y-4 mb-12 animate-blur-in-up">
        <h1 className={title({ color: "violet" })}>Pricing</h1>
        <p className="text-default-600 max-w-lg mx-auto">
          Get access to multiple AI models for the price of one.
        </p>
      </div>

      <div className="flex justify-center w-full max-w-md">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.name}
            className="animate-blur-in w-full border-2 border-primary-500 hover:border-primary-600  hover:shadow-default-300/50 transition-all duration-300 backdrop-blur-[43px] bg-[rgba(237,237,237,0.65)]"
          >
            <CardHeader className="flex flex-col gap-2 p-6">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-default-600">Best for casual use.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-default-600">/month</span>
              </div>
            </CardHeader>
            <CardBody className="p-6 pt-0">
              <Button
                color="primary"
                size="lg"
                radius="lg"
                className="w-full mb-6"
                variant="solid"
                onPress={() => handleSubscribe(plan)}
                isLoading={isLoading}
              >
                {isLoading ? "Processing..." : "Subscribe"}
              </Button>
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div className="flex items-start gap-2" key={index}>
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <p className="flex flex-col">
                      <span className="font-bold">{feature.heading}</span>
                      {feature.subheading && (
                        <span className="text-default-600">
                          {feature.subheading}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
