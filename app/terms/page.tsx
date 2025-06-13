// Terms of Service Page
// This file renders a minimal, clean terms of service page using HeroUI components and Tailwind for styling. Layout is whitespace-focused and visually calm.

import { title, subtitle } from "@/app/components/primitives";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms of Service",
    description:
      "Aiflo's terms of service - Learn about our terms and conditions.",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    },
  };
}

export default function TermsOfServicePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <h1 className={title() + " mb-8 text-center"}>Terms of Service</h1>
      <p className={subtitle() + " mb-16 text-center text-gray-500"}>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before
        using our services. By accessing or using our app, you agree to be bound
        by these Terms.
      </p>
      <div className="space-y-16">
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            By accessing or using our services, you agree to comply with and be
            bound by these Terms. If you do not agree, please do not use our
            services.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            2. Use of Service
          </h2>
          <ul className="list-disc ml-7 space-y-2 text-gray-600 text-sm">
            <li>
              You must be at least 18 years old or have legal parental/guardian
              consent to use our services.
            </li>
            <li>
              You agree to use the service only for lawful purposes and in
              accordance with these Terms.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              account credentials.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            3. User Responsibilities
          </h2>
          <ul className="list-disc ml-7 space-y-2 text-gray-600 text-sm">
            <li>
              You are responsible for all activities that occur under your
              account.
            </li>
            <li>
              You must not misuse, disrupt, or attempt to gain unauthorized
              access to the service or its related systems.
            </li>
            <li>
              You must not upload or transmit any harmful, unlawful, or
              infringing content.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            4. Intellectual Property
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            All content, trademarks, and data on this app, including but not
            limited to software, databases, text, graphics, icons, and
            hyperlinks, are the property of the company or its licensors.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            5. Termination
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We reserve the right to suspend or terminate your access to the
            service at our sole discretion, without notice, for conduct that we
            believe violates these Terms or is harmful to other users or the
            service.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            6. Disclaimers
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            The service is provided on an &quot;AS IS&quot; and &quot;AS
            AVAILABLE&quot; basis. We disclaim all warranties of any kind,
            whether express or implied, including but not limited to
            merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            To the fullest extent permitted by law, the company shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, whether
            incurred directly or indirectly.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            8. Changes to Terms
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We may update these Terms from time to time. We will notify you of
            any significant changes by posting the new Terms on this page.
            Continued use of the service after changes constitutes acceptance of
            the new Terms.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-4 text-gray-800">
            9. Contact Us
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            If you have any questions about these Terms, please contact us at{" "}
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
