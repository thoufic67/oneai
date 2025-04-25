/**
 * @file RazorpayCheckoutButton component for handling subscription payments
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id,
        name: "OneAI Platform",
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
        toast({
          title: "Payment successful!",
          description: "Your subscription has been activated.",
        });
        router.push("/dashboard");
      });

      razorpay.on("payment.error", (error: any) => {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.error.description || "Please try again.",
        });
      });

      razorpay.open();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize checkout. Please try again.",
      });
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? "Processing..." : `Subscribe to ${plan.name}`}
    </Button>
  );
};
