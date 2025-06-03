export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "AI Flo",
  description:
    "Aiflo is a unified AI platform offering seamless access to top AI chat models (GPT-4, Gemini, Claude, Mistral, Perplexity, and more) and advanced image generation (DALL-E) under one subscription. Enjoy real-time, multi-model conversations, image uploads, quota management, and a modern, responsive UI. Perfect for individuals and teams seeking the best AI tools in one place.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};

// Public routes that don't require authentication
export const publicRoutes = [
  "/login",
  "/auth/callback",
  "/signup",
  "/about",
  "/docs",
  "/blog",
  "/privacy",
  "/terms",
  "/contact",
  "/pricing",
  "/share",
  "/cancellation",
];

export const isPublicRoute = (path: string) => {
  return publicRoutes.some((route) => path.startsWith(route)) || path === "/";
};
