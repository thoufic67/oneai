/**
 * @file Pricing.tsx
 * @description Self-contained component for rendering all pricing plans with payment logic and success modal. Used in both pricing page and preview.
 */
"use client";

import React, { useState } from "react";
import { PLANS } from "@/lib/plans";
import PricingCard from "./PricingCard";
import { useAuth } from "@/app/components/auth-provider";
import { usePostHog } from "posthog-js/react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const posthog = usePostHog();
  const router = useRouter();
  const [isPaymentSuccessful, setPaymentSuccessful] = useState(false);

  // Refresh user on payment success
  React.useEffect(() => {
    if (isPaymentSuccessful) refreshUser();
  }, [isPaymentSuccessful]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 w-full">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            user={user}
            posthog={posthog}
            router={router}
            onPaymentSuccess={() => setPaymentSuccessful(true)}
          />
        ))}
      </div>
      <Modal
        backdrop="transparent"
        isOpen={isPaymentSuccessful}
        hideCloseButton
      >
        {isPaymentSuccessful && (
          <Confetti
            height={typeof window !== "undefined" ? window.innerHeight : 600}
            numberOfPieces={400}
            recycle={false}
            width={typeof window !== "undefined" ? window.innerWidth : 800}
          />
        )}
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-green-100 p-4 mb-2"
              initial={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
              className="w-full z-50"
              color="primary"
              radius="lg"
              size="lg"
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
