/**
 * @file page.tsx
 * @description Highly converting landing page for Aiflo, showcasing unified AI access, top features, pricing preview, and trust signals. Reuses pricing components, model logos, and plan data. Follows HeroUI, Tailwind, and Framer Motion patterns.
 */
import Image from "next/image";
import LandingPageButton from "./components/landing-page-button";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Card, CardHeader, CardBody } from "@heroui/react";
import {
  Check,
  ShieldCheck,
  Sparkles,
  ImageIcon,
  History,
  Share2,
  FileUp,
  MessageSquare,
} from "lucide-react";
import { PLANS } from "@/lib/plans";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroSection from "./components/landing/hero-section";
import FeatureHighlights from "./components/landing/feature-highlights";
import PricingPreview from "./components/landing/pricing-preview";
import SecurityBanner from "./components/landing/security-banner";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "security", label: "Security" },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-0 m-0 w-full scroll-smooth relative p-4">
      {/* Vertical navigation dots/buttons */}
      <nav className="fixed right-4 top-1/2 z-50 flex flex-col gap-4 -translate-y-1/2 md:right-8">
        {/* {sections.map((section) => (
          <button
            key={section.id}
            aria-label={`Go to ${section.label}`}
            onClick={() => {
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-4 h-4 rounded-full border-2 border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary bg-default-200"
          />
        ))} */}
      </nav>
      <section id="hero" className="w-full">
        <HeroSection />
      </section>
      <section id="features" className="w-full">
        <FeatureHighlights />
      </section>
      <section id="pricing" className="w-full">
        <PricingPreview />
      </section>
      <section id="security" className="w-full">
        <SecurityBanner />
      </section>
    </main>
  );
}

// Add this function to dynamically set metadata for the landing page
export function generateMetadata(): Metadata {
  return {
    title: siteConfig.name,
    description: siteConfig.description,
  };
}
