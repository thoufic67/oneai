// Cancellation Policy Page
// This file renders a minimal, clean cancellation policy page using HeroUI components and Tailwind for styling. Layout is whitespace-focused and visually calm.

import { title, subtitle } from "@/app/components/primitives";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cancellation & Refunds",
    description: "Learn about Aiflo's cancellation and refund policies.",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/cancellation`,
    },
  };
}

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <h1 className={title() + " mb-8 text-center"}>Cancellation Policy</h1>
      <p className={subtitle() + " mb-16 text-center text-gray-500"}>
        Please review our Cancellation Policy to understand your rights and
        obligations regarding cancellations and refunds.
      </p>
      <div className="space-y-16">
        {/* Example sections, update with actual content as needed */}
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            1. Cancellation by User
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            You may cancel your subscription at any time through your account
            settings. Cancellations will take effect at the end of the current
            billing cycle.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            2. Refund Policy
          </h2>
          <ul className="list-disc ml-7 space-y-2 text-gray-600 text-sm">
            <li>Refunds are only provided where required by law.</li>
            <li>
              Partial refunds may be considered in exceptional circumstances at
              our discretion.
            </li>
            <li>
              All refund requests must be submitted in writing to our support
              team.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            3. Service Changes or Termination
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We reserve the right to modify or terminate the service at any time.
            In such cases, we will provide notice and refund any prepaid fees
            for unused services, where applicable.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            4. Contact Us
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            If you have any questions about this Cancellation Policy, please
            contact us at{" "}
            <Link
              href="mailto:thoufic@achieveit.ai"
              className="underline hover:text-blue-600 transition-colors"
            >
              thoufic@achieveit.ai
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
