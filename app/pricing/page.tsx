/**
 * @file Pricing page component with Razorpay subscription integration
 */

import { PLANS, Plan } from "@/lib/plans";
import { title } from "@/app/components/primitives";
import Pricing from "@/app/components/pricing/Pricing";

export default function PricingPage() {
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

export async function generateMetadata() {
  return {
    title: "Pricing",
    description: `Pricing for Aiflo, starts at ${PLANS[0].price}$ / month`,
    openGraph: {
      title: "Pricing",
      description: `Pricing for Aiflo, starts at ${PLANS[0].price}$ / month`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Pricing",
      description: `Pricing for Aiflo, starts at ${PLANS[0].price}$ / month`,
    },
  };
}
