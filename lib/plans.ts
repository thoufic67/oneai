/**
 * @file Plans configuration
 * @description Defines the available plans for the application
 */

interface Plan {
  name: string;
  price: number;
  currency: string;
  id: string;
  features: Feature[];
}

interface Feature {
  heading: string;
  subheading?: string;
  comingSoon?: boolean;
}

export const PLANS: Plan[] = [
  {
    name: "Basic",
    price: 999,
    currency: "INR",
    id: "plan_QTWQY2cqBWZ2ma", // Replace with your actual Razorpay plan ID
    features: [
      {
        heading: "Access to the best LLMs",
        subheading:
          "Claude, GPT-4o, Llama, Grok, Mistral, Gemini, DeepSeek, Perplexity",
      },
      {
        heading: "Documents up to 10k chars",
        comingSoon: true,
      },
      {
        heading: "Generate images",
        comingSoon: true,
        subheading:
          "Gpt Image, Midjourney, Dall-E, Stable Diffusion, Recraft & FLUX",
      },
      {
        heading: "Unlimited text messages",
        subheading: "fair usage policy applies",
      },
      {
        heading: "Cancel anytime",
      },
    ],
  },
];

// Helper function to get plan details - implement based on your setup
export async function getPlanDetails(planId: string) {
  return PLANS.find((plan) => plan.id === planId);
}
