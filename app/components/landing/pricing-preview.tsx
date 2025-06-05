"use client";
/**
 * @file pricing-preview.tsx
 * @description Client component for the landing page pricing preview section. Uses HeroUI Card and displays the first plan from PLANS with features and a 'See all plans' button. Occupies full device width and height.
 */
import Link from "next/link";

import { PLANS } from "@/lib/plans";
import PricingCard from "@/app/components/pricing/PricingCard";
import Pricing from "@/app/components/pricing/Pricing";

export default function PricingPreview() {
  return (
    <section className=" w-full flex flex-col gap-8 items-center justify-center animate-blur-in-up">
      <div className="flex flex-col items-center justify-center text-primary font-semibold text-xs rounded-full px-4 py-2 mb-2 shadow-sm bg-primary/10">
        Pricing
      </div>
      <div className="w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Simple, Transparent Pricing
        </h2>
        <Pricing />
      </div>
    </section>
  );
}
