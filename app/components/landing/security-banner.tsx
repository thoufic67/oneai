"use client";
/**
 * @file security-banner.tsx
 * @description Client component for the landing page security & trust banner. Uses Lucide ShieldCheck and Tailwind for styling. Occupies full device width and height.
 */
import { ShieldCheck } from "lucide-react";

export default function SecurityBanner() {
  return (
    <section className=" w-full flex items-center justify-center animate-blur-in-up">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4 bg-default-100 border border-default-200 rounded-xl p-6 shadow-sm">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div className="text-center md:text-left">
          <span className="font-semibold">Your data, protected.</span> Secure
          authentication (Supabase), private uploads, and safe payments
          (Razorpay). Privacy by default.
        </div>
      </div>
    </section>
  );
}
