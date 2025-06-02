/**
 * @file Pricing page component with Razorpay subscription integration
 */

"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import Confetti from "react-confetti"; // Confetti animation for payment success
import { usePostHog } from "posthog-js/react";

import { useAuth } from "../components/auth-provider";

import { PLANS, Plan } from "@/lib/plans";
import { title } from "@/app/components/primitives";
import PricingCard from "@/app/components/pricing/PricingCard";
import Pricing from "@/app/components/pricing/Pricing";

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const posthog = usePostHog();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSuccessful, setPaymentSuccessful] = useState(false);

  useEffect(() => {
    if (isPaymentSuccessful) {
      refreshUser();
    }
  }, [isPaymentSuccessful]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 min-h-full">
      <div className="text-center space-y-4 mb-12 animate-blur-in-up">
        <h1 className={title({ color: "violet" })}>Pricing</h1>
        <p className="text-default-600 max-w-lg mx-auto">
          Get access to multiple AI models for the price of one.
        </p>
      </div>
      <Pricing />
    </div>
  );
}
