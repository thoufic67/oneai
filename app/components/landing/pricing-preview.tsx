"use client";
/**
 * @file pricing-preview.tsx
 * @description Client component for the landing page pricing preview section. Uses HeroUI Card and displays the first plan from PLANS with features and a 'See all plans' button. Occupies full device width and height.
 */
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import Link from "next/link";

export default function PricingPreview() {
  const plan = PLANS[0];
  return (
    <section className="min-h-screen w-full flex flex-col gap-8 items-center justify-center animate-blur-in-up">
      <div className="flex flex-col items-center justify-center text-primary font-semibold text-xs rounded-full px-4 py-2 mb-2 shadow-sm bg-primary/10">
        Aiflo Features
      </div>
      <div className="w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Simple, Transparent Pricing
        </h2>
        <Card className="w-full border-2 border-primary-500 bg-[rgba(237,237,237,0.65)] backdrop-blur-[43px]">
          <CardHeader className="flex flex-col gap-2 p-6">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-default-600">/month</span>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-3">
              {plan.features.slice(0, 4).map((feature, index) => (
                <div className="flex items-start gap-2" key={index}>
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <p className="flex flex-col">
                    <span className="font-bold">
                      {feature.heading}
                      {feature.comingSoon && (
                        <span className="ml-2 px-1 mb-1 bg-primary-500 rounded-full text-xs text-default-100">
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
            <Link href="/pricing" className="block mt-6 text-center">
              <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition">
                See all plans
              </button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
