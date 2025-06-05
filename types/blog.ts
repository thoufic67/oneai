// @file types/blog.ts
// @description Blog post types and static blog post data for the Aiflo blog. Used for both the blog list and detail pages.
import { Sparkles, Layers, Rocket } from "lucide-react";

export type BlogPost = {
  id: string;
  image: string;
  imageAlt: string;
  icon: "sparkles" | "layers" | "rocket";
  title: string;
  date: string;
  excerpt: string;
  content?: string | null;
  mdPath?: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
};

export const blogPosts: BlogPost[] = [
  {
    id: "welcome-aiflo",
    image: "/logos/openai.svg",
    imageAlt: "Aiflo platform illustration",
    icon: "sparkles",
    title: "Welcome to Aiflo: Unified AI Platform",
    date: "2024-06-01",
    excerpt:
      "Aiflo brings together the world's best AI models—GPT-4, Gemini, Claude, and more—under a single subscription. Enjoy seamless chat, image generation, and file uploads in a modern, unified interface. Discover how Aiflo is redefining AI accessibility.",
    content: `Aiflo is a unified AI platform that provides users with access to multiple leading Large Language Models (LLMs) and image generation models under a single subscription. The platform is designed to offer a seamless, ChatGPT-like experience, allowing users to interact with models such as OpenAI's GPT-4, Google Gemini, Anthropic Claude, Mistral, Perplexity, and more. Additionally, Aiflo supports advanced image generation (e.g., DALL-E) and file/image uploads, all managed with robust quota and subscription controls.`,
    author: {
      name: "Aiflo Team",
      role: "Product & Engineering",
      avatar: "/logos/openai.svg",
    },
    tags: ["aiflo", "platform", "introduction"],
  },
  {
    id: "features-overview",
    image: "/logos/gemini.svg",
    imageAlt: "Aiflo features overview illustration",
    icon: "layers",
    title: "Aiflo Features Overview",
    date: "2024-06-01",
    excerpt:
      "Explore Aiflo's core functionalities: multi-model chat, image generation, quota management, sharing, and more. See what makes Aiflo the one-stop shop for AI.",
    content: null,
    mdPath: "app/content/features-overview.md",
    author: {
      name: "Aiflo Team",
      role: "Product & Engineering",
      avatar: "/logos/gemini.svg",
    },
    tags: ["features", "overview", "aiflo"],
  },
  {
    id: "aiflo-roadmap",
    image: "/logos/rocket.svg",
    imageAlt: "Aiflo roadmap illustration",
    icon: "rocket",
    title: "What's Next: Aiflo Roadmap",
    date: "2024-06-01",
    excerpt:
      "See what's coming soon to Aiflo: API access, team features, advanced analytics, and more. We're building the future of unified AI access.",
    content: `Upcoming features on our roadmap include:\n- API Access: User-generated API keys for programmatic use.\n- Team/Org Features: Shared workspaces and team management.\n- Advanced Analytics: Usage analytics and reporting.\n- More Models: Continuous addition of new LLMs and image models.\n- Enhanced Admin Tools: For quota, subscription, and user management.`,
    author: {
      name: "Aiflo Team",
      role: "Product & Engineering",
      avatar: "/logos/rocket.svg",
    },
    tags: ["roadmap", "future", "aiflo"],
  },
  {
    id: "aiflo-use-cases",
    image: "/logos/openai.svg",
    imageAlt: "Aiflo use cases illustration",
    icon: "sparkles",
    title: "Unlocking the Power of Unified AI: Real-World Use Cases for Aiflo",
    date: "2024-06-08",
    excerpt:
      "Discover how Aiflo's unified platform empowers professionals, developers, creatives, teams, and educators with real-world AI use cases. Explore the full feature set and see why Aiflo is the one-stop shop for all your AI needs.",
    content: null,
    mdPath: "app/content/aiflo-use-cases.md",
    author: {
      name: "Aiflo Team",
      role: "Product & Engineering",
      avatar: "/logos/openai.svg",
    },
    tags: ["use cases", "aiflo", "ai"],
  },
];

// Ensure this is a module
export {};
