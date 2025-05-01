/**
 * @file Razorpay integration utilities and types with official SDK
 */

import Razorpay from "razorpay";

// Server-side instance
export const razorpayServer = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
});

export interface RazorpayCheckoutOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  callback_url: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
}

export interface RazorpaySubscriptionCreateOptions {
  plan_id: string;
  total_count: number;
  quantity?: number;
  customer_notify?: 0 | 1;
  notes?: Record<string, string>;
  offer_id?: string;
  start_at?: number;
  expire_by?: number;
}

export class RazorpayError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = "RazorpayError";
  }
}

export const handleRazorpayError = (error: any) => {
  if (error.error) {
    const { code, description } = error.error;
    throw new RazorpayError(description, code, error.status);
  }
  throw error;
};

export const verifyRazorpayPayment = async (
  razorpay_payment_id: string,
  razorpay_subscription_id: string,
  razorpay_signature: string
) => {
  const text = razorpay_payment_id + "|" + razorpay_subscription_id;
  const crypto = require("crypto");
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest("hex");

  return generated_signature === razorpay_signature;
};

export const verifyWebhookSignature = (
  payload: any,
  signature: string | null
): boolean => {
  if (!signature) return false;

  const crypto = require("crypto");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(payload));
  const digest = shasum.digest("hex");

  return digest === signature;
};

export const initializeRazorpayCheckout = async (
  options: RazorpayCheckoutOptions
) => {
  // Load Razorpay script if not already loaded
  if (!(window as any).Razorpay) {
    await loadRazorpayScript();
  }

  const razorpay = new (window as any).Razorpay(options);
  return razorpay;
};

const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};
