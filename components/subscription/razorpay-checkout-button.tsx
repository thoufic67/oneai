/**
 * @file RazorpayCheckoutButton component for handling subscription payments
 */

"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { initializeRazorpayCheckout } from "@/lib/razorpay";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface RazorpayCheckoutButtonProps {
  plan: Plan;
  className?: string;
}

export const RazorpayCheckoutButton = ({
  plan,
  className,
}: RazorpayCheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Create subscription on backend
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const { subscription_id } = await response.json();

      // 2. Initialize Razorpay checkout
      const options = {
        key: process.env.RAZORPAY_KEY_ID!,
        subscription_id,
        name: "Aiflo Platform",
        description: `${plan.name} Subscription`,
        image: "/logo.png",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/verify`,
        prefill: {
          // These will be filled from the user context in the API
          name: "",
          email: "",
        },
        theme: {
          color: "#0F172A",
        },
      };

      const razorpay = await initializeRazorpayCheckout(options);

      // 3. Handle payment events
      razorpay.on("payment.success", (response: any) => {
        enqueueSnackbar("Payment successful!", {
          variant: "success",
        });
        router.push("/dashboard");
      });

      razorpay.on("payment.error", (error: any) => {
        enqueueSnackbar("Payment failed. Please try again.", {
          variant: "error",
        });
      });

      razorpay.open();
    } catch (error) {
      enqueueSnackbar("Failed to initialize checkout. Please try again.", {
        variant: "error",
      });
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SnackbarProvider />
      <Button onPress={handleCheckout} disabled={loading} className={className}>
        {loading ? "Processing..." : `Subscribe to ${plan.name}`}
      </Button>
    </>
  );
};
