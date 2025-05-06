/**
 * @file page.tsx
 * @description Landing page component that showcases the AI model access platform with pricing and features
 */
import Image from "next/image";
import LandingPageButton from "./components/landing-page-button";

export default function Home() {
  const aiModels = [
    {
      name: "Gemini",
      logo: "/logos/gemini.svg",
    },
    {
      name: "ChatGPT",
      logo: "/logos/openai.svg",
    },
    {
      name: "Claude",
      logo: "/logos/anthropic.svg",
    },
    {
      name: "Mistral",
      logo: "/logos/mistral.svg",
    },
    {
      name: "Grok",
      logo: "/logos/grok.svg",
    },
    {
      name: "Perplexity",
      logo: "/logos/perplexity.svg",
    },
    {
      name: "DeepSeek",
      logo: "/logos/deepseek.svg",
    },
  ];

  return (
    <main className="flex max-h-[100dvh] h-full flex-col items-center justify-center p-8 md:p-24 animate-blur-in">
      <div className="text-center space-y-8 max-w-4xl">
        {/* Logo and Title */}
        <div className="space-y-4 animate-blur-in-up">
          <Image
            src="/favicon.svg"
            alt="Aiflo Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            AI Flo
          </h1>
        </div>

        {/* AI Models Grid */}
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
          <p className="mt-4 text-muted-foreground overflow-hidden whitespace-nowrap  animate-typewriter animate-blink inline-block">
            in one place for price of a 🍕
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-blur-in-down delay-1000">
          <LandingPageButton />
        </div>
      </div>
    </main>
  );
}
