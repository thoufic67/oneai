// @file types/blog.ts
// @description Blog post types and static blog post data for the Aiflo blog. Used for both the blog list and detail pages. Blog posts are now rendered from MDX files via dynamic import, not by path.

export type BlogPost = {
  id: string;
  image: string;
  imageAlt: string;
  icon: "sparkles" | "layers" | "rocket";
  title: string;
  date: string;
  excerpt: string;
  content?: string | null;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
};

const blogPosts: BlogPost[] = [
  // {
  //   id: "welcome-aiflo",
  //   image: "/logos/openai.svg",
  //   imageAlt: "Aiflo platform illustration",
  //   icon: "sparkles",
  //   title: "Welcome to Aiflo: Unified AI Platform",
  //   date: "2024-06-01",
  //   excerpt:
  //     "Aiflo brings together the world's best AI models—GPT-4, Gemini, Claude, and more—under a single subscription. Enjoy seamless chat, image generation, and file uploads in a modern, unified interface. Discover how Aiflo is redefining AI accessibility.",
  //   content: `Aiflo is a unified AI platform that provides users with access to multiple leading Large Language Models (LLMs) and image generation models under a single subscription. The platform is designed to offer a seamless, ChatGPT-like experience, allowing users to interact with models such as OpenAI's GPT-4, Google Gemini, Anthropic Claude, Mistral, Perplexity, and more. Additionally, Aiflo supports advanced image generation (e.g., DALL-E) and file/image uploads, all managed with robust quota and subscription controls.`,
  //   author: {
  //     name: "Aiflo Team",
  //     role: "Product & Engineering",
  //     avatar: "/logos/openai.svg",
  //   },
  //   tags: ["aiflo", "platform", "introduction"],
  // },
  {
    id: "features-overview",
    image: "/logos/gemini.svg",
    imageAlt: "Aiflo features overview illustration",
    icon: "layers",
    title: "Aiflo Features Overview",
    date: "2024-06-01",
    excerpt:
      "Explore Aiflo's core functionalities: multi-model chat, image generation, quota management, sharing, and more. See what makes Aiflo the one-stop shop for AI.",
    content: `

# Aiflo Features Overview

Key features include:

- **Multi-Model Chat:** Access GPT-4, Gemini, Claude, and more in one chat.
- **Image Generation:** Create images with DALL-E and other models.
- **File/Image Upload:** Attach and share images in chat.
- **Subscription & Quota Management:** Flexible plans, real-time usage dashboard.
- **Conversation Sharing:** Public, read-only links for conversations.
- **Revision History:** Full versioning for all messages.
- **Modern UI/UX:** Built with HeroUI, TailwindCSS, Framer Motion, and Lucide icons.

    
    `,
    author: {
      name: "Aiflo Team",
      role: "Product & Engineering",
      avatar: "/logos/gemini.svg",
    },
    tags: ["features", "overview", "aiflo"],
  },
  // {
  //   id: "aiflo-roadmap",
  //   image: "/logos/rocket.svg",
  //   imageAlt: "Aiflo roadmap illustration",
  //   icon: "rocket",
  //   title: "What's Next: Aiflo Roadmap",
  //   date: "2024-06-01",
  //   excerpt:
  //     "See what's coming soon to Aiflo: API access, team features, advanced analytics, and more. We're building the future of unified AI access.",
  //   content: `Upcoming features on our roadmap include:\n- API Access: User-generated API keys for programmatic use.\n- Team/Org Features: Shared workspaces and team management.\n- Advanced Analytics: Usage analytics and reporting.\n- More Models: Continuous addition of new LLMs and image models.\n- Enhanced Admin Tools: For quota, subscription, and user management.`,
  //   author: {
  //     name: "Aiflo Team",
  //     role: "Product & Engineering",
  //     avatar: "/logos/rocket.svg",
  //   },
  //   tags: ["roadmap", "future", "aiflo"],
  // },
  {
    id: "aiflo-use-cases",
    image: "/logos/openai.svg",
    imageAlt: "Aiflo use cases illustration",
    icon: "sparkles",
    title: "Unlocking the Power of Unified AI: Real-World Use Cases for Aiflo",
    date: "2024-06-08",
    excerpt:
      "Discover how Aiflo's unified platform empowers professionals, developers, creatives, teams, and educators with real-world AI use cases. Explore the full feature set and see why Aiflo is the one-stop shop for all your AI needs.",
    content: `

# Unlocking the Power of Unified AI: Real-World Use Cases for Aiflo

## Introduction

Artificial Intelligence is transforming the way we work, create, and solve problems. Yet, the landscape is fragmented: each leading AI model—OpenAI's GPT-4, Google Gemini, Anthropic Claude, and others—offers unique strengths, but accessing them all means juggling multiple accounts, subscriptions, and interfaces. Enter **Aiflo**: a unified AI platform that brings the world's best models and image generators together under one roof, with a seamless, modern user experience.

In this post, we'll explore how Aiflo's comprehensive feature set empowers individuals, teams, and enterprises to unlock new levels of productivity, creativity, and insight. We'll walk through real-world scenarios, highlight the platform's unique capabilities, and show why Aiflo is the one-stop shop for all your AI needs.

---

## What is Aiflo?

Aiflo is more than just another AI chat tool. It's a robust, extensible platform designed to:

- **Aggregate top LLMs and image models** (GPT-4, Gemini, Claude, Mistral, Perplexity, DALL-E, and more)
- **Offer a unified, modern chat and image generation interface**
- **Manage quotas and subscriptions** with real-time dashboards
- **Enable secure sharing, collaboration, and extensibility**
- **Support both individuals and organizations** with flexible plans and admin tools

Let's dive into the features that make Aiflo stand out—and see how they translate into real-world value.

---

## Core Features: The Aiflo Advantage

### 1. Multi-Model Chat Access

- **Curated Model List:** Instantly access GPT-4, Gemini, Claude, Mistral, Perplexity, DeepSeek, Llama, Grok, and more.
- **Unified Chat UI:** No more switching tabs or tools—chat with any model from a single, beautiful interface.
- **Model Switching:** Choose the best model for each conversation or message, on the fly.
- **Streaming Responses:** Enjoy real-time, token-by-token output for a natural, interactive feel.
- **Conversation Management:** Create, rename, delete, and organize conversations with ease.
- **Revision History:** Every message and assistant response is versioned—edit, regenerate, and browse full history.

### 2. Image Generation & Uploads

- **DALL-E Integration:** Generate stunning images with OpenAI's DALL-E, with support for multi-turn prompts.
- **Prompt Engineering:** Let Aiflo auto-generate image prompts based on chat context for better results.
- **Image Uploads:** Attach images (compressed to webp, <200kb) to chat messages for richer conversations.
- **Inline Display & Download:** View images inline, expand in a modal, and download with a click.
- **Quota Management:** Image generation is quota-limited per plan, with clear usage tracking.

### 3. Subscription & Quota Management

- **Flexible Plans:** Free, Pro, and Enterprise tiers, each with tailored quotas for messages and images.
- **Razorpay Integration:** Secure, seamless payment flows for upgrades, downgrades, and cancellations.
- **Real-Time Usage Dashboard:** Instantly see your usage, remaining quota, and reset dates.
- **Quota Enforcement:** Never worry about surprise overages—Aiflo enforces quotas and notifies you as you approach limits.

### 4. Authentication & User Management

- **Supabase Auth:** Secure, reliable authentication and user management.
- **Profile Management:** Update your email, name, and avatar with ease.
- **API Keys (Planned):** Generate and manage API keys for programmatic access (coming soon).

### 5. Conversation Sharing

- **Shareable Links:** Generate public, read-only links to share conversations with anyone.
- **Share Management:** Deactivate or delete share links at any time for full control.
- **Security:** Only owners can share/unshare; public access is strictly read-only.

### 6. Documentation, Blog, and Public Pages

- **In-App Docs:** Access documentation and search directly within the app.
- **Blog:** Stay updated with platform news and AI trends.
- **Legal Pages:** Privacy, Terms, and Refunds are always accessible.

### 7. Admin & Analytics (Planned/Partial)

- **Admin Dashboard:** Manage users, quotas, subscriptions, and analytics.
- **Audit Logs:** All critical actions are logged for compliance and debugging.

---

## Real-World Use Cases: How Aiflo Empowers You

### 1. For Knowledge Workers & Professionals

#### **Research & Content Creation**

- **Unified Research Assistant:** Seamlessly query multiple LLMs to compare answers, synthesize information, and generate high-quality content.
- **Drafting & Editing:** Use revision history to iterate on drafts, regenerate responses, and track changes over time.
- **Image-Enhanced Reports:** Generate or upload images to enrich presentations, reports, and proposals.

#### **Example:**

> _A marketing manager uses Aiflo to brainstorm campaign ideas with GPT-4, fact-check with Gemini, and generate custom visuals with DALL-E—all in one place. Revision history lets her refine copy and track feedback from her team._

### 2. For Developers & Technical Teams

#### **Code Generation & Review**

- **Model Comparison:** Test code snippets with different LLMs to find the most accurate or efficient solution.
- **Documentation Generation:** Use chat to generate, edit, and version technical docs, then share with teammates via public links.
- **API Access (Planned):** Integrate Aiflo's capabilities into your own tools and workflows.

#### **Example:**

> _A developer uses Aiflo to generate code in Python, TypeScript, and Go, comparing outputs from Claude and GPT-4. She shares a conversation link with her team for peer review, and uploads screenshots of error messages for context._

### 3. For Creatives & Designers

#### **Visual Brainstorming**

- **Prompt Engineering:** Let Aiflo help craft the perfect image prompt, then generate multiple variations with DALL-E.
- **Multi-Turn Image Generation:** Refine images with follow-up prompts, referencing previous outputs for continuity.
- **Image Uploads:** Attach sketches or reference images to guide the AI's creativity.

#### **Example:**

> _A designer iterates on logo concepts by uploading sketches and generating AI variations. She uses the chat to discuss ideas with her team, all within Aiflo._

### 4. For Teams & Enterprises

#### **Collaboration & Knowledge Sharing**

- **Shared Workspaces (Planned):** Organize conversations and assets by project or team.
- **Quota Management:** Admins can monitor and allocate usage across the organization.
- **Audit Trails:** All critical actions are logged for compliance and transparency.

#### **Example:**

> _An enterprise uses Aiflo to centralize AI usage, ensuring compliance and cost control. Teams share research, code, and creative assets securely, with full auditability._

### 5. For Educators & Students

#### **Learning & Tutoring**

- **Multi-Model Exploration:** Compare how different LLMs explain complex topics.
- **Revision History:** Track learning progress and revisit previous answers.
- **Image Generation:** Create visual aids for lessons and presentations.

#### **Example:**

> _A teacher uses Aiflo to generate lesson plans, quiz questions, and visual aids. Students use the platform to ask questions, compare model explanations, and share their findings._

---

## Why Aiflo? The Unique Value Proposition

### 1. **All-in-One Access**

No more juggling accounts or subscriptions. Aiflo brings the best of AI to your fingertips, with a single login and a unified interface.

### 2. **Productivity & Creativity, Unleashed**

Switch between models, generate images, and manage conversations—all without leaving the platform. Revision history and sharing make collaboration effortless.

### 3. **Transparent, Predictable Pricing**

Clear quotas, real-time dashboards, and flexible plans mean you're always in control. No hidden fees, no surprises.

### 4. **Security & Compliance**

Built on Supabase and Razorpay, Aiflo ensures your data and payments are secure. Audit logs and admin tools support enterprise needs.

### 5. **Future-Proof & Extensible**

Aiflo's pluggable architecture means new models and features are always on the horizon. API access and team features are coming soon.

---

## Deep Dive: Feature Highlights

### Multi-Model Chat in Action

- **Scenario:** A journalist is researching a breaking news story. She asks the same question to GPT-4, Gemini, and Claude, comparing their answers for accuracy and bias. She uses revision history to track changes as new information emerges.

### Image Generation for Every Need

- **Scenario:** A product manager needs visuals for a pitch deck. He describes the concept in chat, lets Aiflo generate a prompt, and creates multiple DALL-E images. He uploads a hand-drawn sketch for further refinement.

### Quota Management & Transparency

- **Scenario:** A startup uses Aiflo's Pro plan. The CTO monitors team usage in real time, ensuring they stay within budget. When a designer nears her image quota, she gets a notification and can request an upgrade.

### Sharing & Collaboration

- **Scenario:** A research team shares a conversation with external collaborators via a public link. The conversation is read-only, ensuring data integrity, but everyone can see the full revision history and attached images.

---

## The Road Ahead: Aiflo's Vision

Aiflo is built for the future. Here's what's coming next:

- **API Access:** Programmatic integration for custom workflows.
- **Team/Org Features:** Shared workspaces, team management, and role-based access.
- **Advanced Analytics:** Usage analytics and reporting for users and admins.
- **More Models:** Continuous addition of new LLMs and image generators.
- **Enhanced Admin Tools:** For quota, subscription, and user management.

---

## Conclusion: Why You Should Try Aiflo Today

Aiflo isn't just another AI tool—it's the platform that unifies, simplifies, and amplifies your AI experience. Whether you're a solo creator, a developer, a team leader, or an enterprise admin, Aiflo gives you the power, flexibility, and control you need to get the most out of the world's best AI models.

**Ready to experience the future of unified AI? [Sign up for Aiflo today](http://localhost:3001/) and unlock your creative and productive potential!**

---

    
    `,
    author: {
      name: "Aiflo Team",
      role: "Product & Engineering",
      avatar: "/logos/openai.svg",
    },
    tags: ["use cases", "aiflo", "ai"],
  },
];

// Ensure this is a module
export { blogPosts };
