// Privacy Policy Page
// This file renders a minimal, clean privacy policy page using HeroUI components and Tailwind for styling. Layout is whitespace-focused and visually calm.

import { title, subtitle } from "@/app/components/primitives";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <h1 className={title() + " mb-8 text-center"}>Privacy Policy</h1>
      <p className={subtitle() + " mb-16 text-center text-gray-500"}>
        Please read our Privacy Policy carefully to understand how we collect,
        use, and protect your information.
      </p>
      <div className="space-y-16">
        {/* Example sections, update with actual content as needed */}
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            1. Information We Collect
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We collect information you provide directly to us, such as when you
            create an account, update your profile, or contact support.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            2. How We Use Information
          </h2>
          <ul className="list-disc ml-7 space-y-2 text-gray-600 text-sm">
            <li>To provide, maintain, and improve our services.</li>
            <li>To communicate with you about updates, offers, and support.</li>
            <li>To ensure the security and integrity of our platform.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            3. Sharing of Information
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We do not share your personal information with third parties except
            as necessary to provide our services, comply with the law, or
            protect our rights.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            4. Data Security
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We implement reasonable security measures to protect your
            information from unauthorized access, alteration, or disclosure.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            5. Changes to This Policy
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We may update this Privacy Policy from time to time. We will notify
            you of any significant changes by posting the new policy on this
            page.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            6. Contact Us
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
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
