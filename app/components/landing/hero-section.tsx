/**
 * @file hero-section.tsx
 * @description Server component for the landing page hero section. Displays logo, headline, subheadline, model grid, and CTA button. SSR compatible. Occupies full device width and height.
 */
import Image from "next/image";
import LandingPageButton from "../landing-page-button";

export default function HeroSection() {
  const aiModels = [
    { name: "Gemini", logo: "/logos/gemini.svg" },
    { name: "ChatGPT", logo: "/logos/openai.svg" },
    { name: "Claude", logo: "/logos/anthropic.svg" },
    { name: "Mistral", logo: "/logos/mistral.svg" },
    { name: "Grok", logo: "/logos/grok.svg" },
    { name: "Perplexity", logo: "/logos/perplexity.svg" },
    { name: "DeepSeek", logo: "/logos/deepseek.svg" },
    { name: "Llama", logo: "/logos/llama.svg" },
  ];
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full text-center space-y-8 max-w-4xl mx-auto">
      <div className="bg-primary/10 text-primary font-semibold text-xs md:text-md rounded-full px-4 py-2 mb-2 shadow-sm">
        All the World&apos;s Best AI Models.{" "}
        <span className="text-primary">One Platform.</span>
      </div>
      <div className="space-y-4 animate-blur-in-up">
        <Image
          src="/favicon.svg"
          alt="Aiflo Logo"
          width={80}
          height={80}
          className="mx-auto"
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="text-danger line-through">Stop paying $20</span> for
          each AI model.{" "}
          <span className="text-primary">Save $100+ with Aiflo.</span>
        </h1>
      </div>
      <div className="animate-blur-in-down delay-500">
        <p className="text-lg mb-4">Get access to</p>
        <div className="flex flex-wrap justify-center gap-4 overflow-wrap-anywhere max-w-xl">
          {aiModels.map((model) => (
            <div
              key={model.name}
              className="flex flex-row items-center gap-2 p-1 px-2 bg-default-100 rounded-full w-fit h-8 box-border"
            >
              <Image
                src={model.logo}
                alt={`${model.name} logo`}
                width={20}
                height={20}
              />
              <p className="text-xs w-fit">{model.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-muted-foreground overflow-hidden whitespace-nowrap animate-typewriter animate-blink inline-block">
          in one place for the price of a 🍕
        </p>
      </div>
      <div className="animate-blur-in-down delay-1000">
        <LandingPageButton />
      </div>
    </div>
  );
}
