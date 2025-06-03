"use client";
/**
 * @file security-banner.tsx
 * @description Client component for the landing page security & trust banner. Uses Lucide ShieldCheck and Tailwind for styling. Occupies full device width and height.
 */
import { ShieldCheck } from "lucide-react";
import { Image } from "@heroui/image";

export default function SecurityBanner() {
  return (
    <section className=" w-full flex items-center justify-center animate-blur-in-up">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4 bg-default-100 border border-default-200 rounded-xl p-6 shadow-sm">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <p className="text-center md:text-left">
          <span className="font-semibold">Your data, protected.</span> Secure
          authentication{" "}
          <span className="inline-flex items-center align-middle">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="h-6 bg-primary-500 p-1 border-box inline align-middle"
                src="/logos/supabase.webp"
                alt="Supabase"
              ></Image>
            </a>
          </span>
          , private uploads, and safe payments{" "}
          <span className="inline-flex items-center align-middle">
            <a
              href="https://razorpay.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="h-6 bg-primary-500 border-box filter blend-multiply inline align-middle"
                src="/logos/razorpay.webp"
                alt="Razorpay"
              ></Image>
            </a>
          </span>
          . Privacy by default
        </p>
      </div>
    </section>
  );
}
