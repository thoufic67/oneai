// Contact Page
// This file renders the contact page for the app, using HeroUI components, Tailwind, and Lucide icons. It provides users with ways to contact support via email or Discord.
"use client";
import { title, subtitle } from "@/app/components/primitives";
import { Mail } from "lucide-react";
import { Button } from "@heroui/button";
import { useState } from "react";

const EMAIL = "contact@aiflo.space";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className={title() + " text-brown-800 mb-2"}>Contact Us</h1>
      <p className="text-lg text-gray-700 mb-2">
        Have a question? Get in touch with us using your preferred method.
      </p>
      <p className="text-base text-gray-600 mb-8 max-w-2xl">
        We are a French company in Paris, super enthusiastic about the future of
        Artificial Intelligence. We aim to develop a big platform to cover many
        use cases for consumers.
      </p>
      <div className="flex flex-col md:flex-row gap-6  justify-center">
        {/* Email Card */}
        <div className="flex-1 border border-neutral-200 rounded-xl p-6 flex flex-col items-start shadow-sm min-w-96">
          <div className="flex items-start gap-3 mb-2">
            <Mail className="w-6 h-6 text-brown-700" />
            <div className="flex flex-col gap-1 text-left">
              <div className="font-semibold text-base text-brown-800">
                Email
              </div>
              <div className="text-xs text-gray-500">{EMAIL}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Typically replies in 1 day.
          </div>
          <Button
            className="w-full"
            variant="solid"
            color="primary"
            onPress={handleCopy}
            aria-label="Copy Email"
          >
            {copied ? "Copied!" : "Copy Email"}
          </Button>
        </div>
      </div>
    </div>
  );
}
