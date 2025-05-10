// Privacy Policy Page
// This file renders the privacy policy for the app, using HeroUI components and Tailwind for styling. Scrolling is handled by the layout.

import { title, subtitle } from "@/app/components/primitives";
import Link from "next/link";
export default function PrivacyPolicyPage() {
  return (
    <div className="inline-block max-w-5xl w-full text-left justify-center">
      <h1 className={title()}>Privacy Policy</h1>
      <p className={subtitle() + " mb-6"}>
        Your privacy is important to us. This Privacy Policy explains how you
        collect, use, and protect your information when you use our services.
      </p>
      <section>
        <h2 className="font-semibold text-lg mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Account information (such as email address and name)</li>
          <li>
            Usage data (such as pages visited, features used, and actions taken)
          </li>
          <li>Cookies and similar tracking technologies</li>
          <li>Analytics data (collected via tools like PostHog)</li>
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>To provide and maintain our services</li>
          <li>To improve and personalize your experience</li>
          <li>To analyze usage and trends to improve our product</li>
          <li>To communicate with you about updates, security, and support</li>
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">3. Cookies & Analytics</h2>
        <p>
          We use cookies and analytics tools (such as PostHog) to understand how
          you use our app and to improve your experience. You can control
          cookies through your browser settings.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">
          4. Data Sharing & Security
        </h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>We do not sell your personal information to third parties.</li>
          <li>
            We may share data with trusted service providers who help us operate
            our app, under strict confidentiality agreements.
          </li>
          <li>
            We implement industry-standard security measures to protect your
            data.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">5. Your Rights</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            You can access, update, or delete your account information at any
            time.
          </li>
          <li>
            You may request a copy of your data or ask us to delete it by
            contacting support.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">
          6. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any significant changes by posting the new policy on this page.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at <Link href="mailto:support@aiflo.space">support@yourapp.com</Link>.
        </p>
      </section>
    </div>
  );
}
