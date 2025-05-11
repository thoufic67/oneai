// Cancellation & Refunds Page
// This file renders the cancellation and refunds policy for the app, using HeroUI components and Tailwind for styling. Scrolling is handled by the layout.

import { title, subtitle } from "@/app/components/primitives";
import Link from "next/link";

export default function CancellationPage() {
  return (
    <div className="inline-block max-w-5xl w-full text-left ">
      <h1 className={title() + " mb-2"}>Cancellation & Refunds</h1>
      <p className={subtitle() + " mb-6"}>
        Please review our cancellation and refund policy below. We aim to
        provide a fair and transparent process for all users.
      </p>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">1. Cancellation Policy</h2>
        <p>
          You may cancel your subscription at any time from your account
          settings. Upon cancellation, you will continue to have access to the
          service until the end of your current billing period.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">
          2. How to Request a Cancellation
        </h2>
        <p>
          To cancel your subscription, please log in to your account and
          navigate to the subscription management section. If you encounter any
          issues, contact our support team at{" "}
          <Link href="mailto:support@aiflo.space">support@aiflo.space</Link>.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">3. Refund Eligibility</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            Refunds are generally not provided for partial billing periods or
            unused services.
          </li>
          <li>
            In exceptional cases (such as technical issues or accidental
            charges), you may request a refund by contacting support within 7
            days of the charge.
          </li>
          <li>
            Refunds are issued at our sole discretion and may be subject to
            review.
          </li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">4. Refund Process</h2>
        <p>
          If your refund request is approved, the refund will be processed to
          your original payment method within 5-10 business days. You will
          receive a confirmation email once the refund has been issued.
        </p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">5. Contact Us</h2>
        <p>
          If you have any questions about our cancellation or refund policy,
          please contact us at{" "}
          <Link href="mailto:support@aiflo.space">support@aiflo.space</Link>.
        </p>
      </section>
    </div>
  );
}
