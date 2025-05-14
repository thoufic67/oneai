/**
 * @file Pricing page component with Razorpay subscription integration
 */

"use client";

import { title } from "@/app/components/primitives";
import PostHogClient from "@/posthog";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Check } from "lucide-react";
import { useAuth } from "../components/auth-provider";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import Confetti from "react-confetti"; // Confetti animation for payment success
import { PLANS, Plan } from "@/lib/plans";

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const posthog = PostHogClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSuccessful, setPaymentSuccessful] = useState(false);

  useEffect(() => {
    if (isPaymentSuccessful) {
      refreshUser();
    }
  }, [isPaymentSuccessful, refreshUser]);

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

  const handlePayment = async (subscriptionId: string, plan: Plan) => {
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: subscriptionId,
        name: "Aiflo",
        description: `${plan.name} Subscription`,
        image: "/favicon.svg", // Add your logo path
        // callback_url: `${window.location.origin}/api/subscription/verify`,
        handler: (response: any) => {
          setIsLoading(true);
          console.log("Razorpay response:", response);
          const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
          } = response;
          fetch("/api/subscription/verify", {
            method: "POST",
            body: JSON.stringify({
              razorpay_payment_id,
              razorpay_subscription_id,
              razorpay_signature,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Razorpay verification response:", data);
              if (data.success) {
                setPaymentSuccessful(true);
              } else {
                setPaymentSuccessful(false);
                throw new Error("Payment failed" + data.error);
              }
            })
            .catch((err) => {
              console.error("Razorpay verification error:", err);
            })
            .finally(() => {
              setIsLoading(false);
            });
        },
        prefill: {
          name: user?.user_metadata?.full_name,
          email: user?.email,
        },
        theme: {
          color: "#6366f1", // Match your primary color
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    }
  };

  const handleSubscribe = async (plan: Plan) => {
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

      const subscriptionId = await createSubscription(plan.id);
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
      {/* Show confetti when payment is successful */}

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

      {!isPaymentSuccessful && (
        <div className="flex justify-center w-full max-w-md">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className="animate-blur-in w-full border-2 border-primary-500 hover:border-primary-600  hover:shadow-default-300/50 transition-all duration-300 backdrop-blur-[43px] bg-[rgba(237,237,237,0.65)]"
            >
              <CardHeader className="flex flex-col gap-2 p-6">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="text-default-600">Best for casual use.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
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
                        <span className="font-bold">
                          {feature.heading}
                          {feature.comingSoon && (
                            <span className="ml-2 px-1 mb-1 bg-primary-500  rounded-full text-xs text-default-100">
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
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isPaymentSuccessful}
        // onOpenChange={setOpen}
        hideCloseButton
        backdrop="transparent"
      >
        {isPaymentSuccessful && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={400}
          />
        )}
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-full bg-green-100 p-4 mb-2"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <span className="text-2xl font-bold text-center text-green-700">
              Subscription Successful!
            </span>
          </ModalHeader>
          <ModalBody>
            <p className="text-center text-default-700 mb-2">
              Thank you for subscribing. Your journey with OneAI starts now.
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-center">
            <Button
              color="primary"
              size="lg"
              radius="lg"
              className="w-full z-50"
              onPress={() => {
                router.push("/new");
              }}
            >
              Start your journey
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
