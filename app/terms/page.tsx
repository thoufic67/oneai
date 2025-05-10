// Terms of Service Page
// This file renders the terms of service for the app, using HeroUI components and Tailwind for styling. Scrolling is handled by the layout.

import { title, subtitle } from "@/app/components/primitives";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="inline-block max-w-5xl w-full text-left justify-center">
      <h1 className={title()}>Terms of Service</h1>
      <p className={subtitle() + " mb-6"}>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before
        using our services. By accessing or using our app, you agree to be bound
        by these Terms.
      </p>
      <section>
        <h2 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our services, you agree to comply with and be
          bound by these Terms. If you do not agree, please do not use our
          services.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">2. Use of Service</h2>
        <ul className="list-disc ml-6 space-y-1">
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
        <h2 className="font-semibold text-lg mb-2">3. User Responsibilities</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            You are responsible for all activities that occur under your
            account.
          </li>
          <li>
            You must not misuse, disrupt, or attempt to gain unauthorized access
            to the service or its related systems.
          </li>
          <li>
            You must not upload or transmit any harmful, unlawful, or infringing
            content.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">4. Intellectual Property</h2>
        <p>
          All content, trademarks, and data on this app, including but not
          limited to software, databases, text, graphics, icons, and hyperlinks,
          are the property of the company or its licensors.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">5. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the
          service at our sole discretion, without notice, for conduct that we
          believe violates these Terms or is harmful to other users or the
          service.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">6. Disclaimers</h2>
        <p>
          The service is provided on an &quot;AS IS&quot; and &quot;AS
          AVAILABLE&quot; basis. We disclaim all warranties of any kind, whether
          express or implied, including but not limited to merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">
          7. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, the company shall not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits or revenues, whether incurred
          directly or indirectly.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">8. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of any
          significant changes by posting the new Terms on this page. Continued
          use of the service after changes constitutes acceptance of the new
          Terms.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <Link href="mailto:support@aiflo.space">support@aiflo.space</Link>.
        </p>
      </section>
    </div>
  );
}
