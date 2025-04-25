"use client";

import { title } from "@/app/components/primitives";
import PostHogClient from "@/posthog";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Check } from "lucide-react";
import { useAuth } from "../components/auth-provider";
import { useRouter } from "next/navigation";

type PricingPlan = {
  name: string;
  price: number;
  features: { heading: string; subheading?: string }[];
};

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Pro",
    price: 10,
    features: [
      {
        heading: "Access to the best LLMs",
        subheading:
          "Claude, GPT-4o, Llama, Grok, Mistral, Gemini, DeepSeek, Perplexity",
      },
      // {
      //   heading: "Reasoning model (CoT)",
      //   subheading: "o4-mini, DeepSeek R1",
      // },
      // {
      //   heading: "Generate images",
      //   subheading: "Midjourney, Dall-E, Stable Diffusion, Recraft & FLUX",
      // },
      {
        heading: "Unlimited text messages",
        subheading: "fair usage policy applies",
      },
      // {
      //   heading: "Documents up to 10k chars (~3 pages)",
      // },
      {
        heading: "Cancel anytime",
      },
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const posthog = PostHogClient();
  const router = useRouter();

  const handleSubscribe = (plan: PricingPlan) => {
    console.log("Subscribing to plan:", plan);
    posthog.capture({
      distinctId: user?.id || "anonymous",
      event: "pricing_page_subscribe",
      properties: {
        plan: plan.name,
        price: plan.price,
      },
    });
    if (user) {
      router.push("/checkout");
    } else {
      router.push("/login");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 min-h-full">
      <div className="text-center space-y-4 mb-12 animate-blur-in-up">
        <h1 className={title({ color: "violet" })}>Pricing</h1>
        <p className="text-default-600 max-w-lg mx-auto">
          Get access to multiple AI models for the price of one.
        </p>
      </div>

      <div className="flex justify-center w-full max-w-md">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.name}
            className="animate-blur-in w-full border-2 border-primary-500 hover:border-primary-600  hover:shadow-default-300/50 transition-all duration-300 backdrop-blur-[43px] bg-[rgba(237,237,237,0.65)]"
          >
            <CardHeader className="flex flex-col gap-2 p-6">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-default-600">Best for casual use.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  ${PRICING_PLANS[0].price}
                </span>
                <span className="text-default-600">/month</span>
              </div>
            </CardHeader>
            <CardBody className="p-6 pt-0">
              <Button
                color="primary"
                size="lg"
                radius="lg"
                className="w-full mb-6"
                variant="solid"
                onPress={() => handleSubscribe(plan)}
              >
                Subscribe
              </Button>
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div className="flex items-start gap-2" key={index}>
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <p className="flex flex-col">
                      <span className="font-bold">{feature.heading}</span>
                      {feature.subheading && (
                        <span className="text-default-600">
                          {feature.subheading}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
