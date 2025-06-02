# Product Requirements Document (PRD): Aiflo Platform

## 1. Product Overview

Aiflo is a unified AI platform that provides users with access to multiple leading Large Language Models (LLMs) and image generation models under a single subscription. The platform is designed to offer a seamless, ChatGPT-like experience, allowing users to interact with models such as OpenAI's GPT-4, Google Gemini, Anthropic Claude, Mistral, Perplexity, and more. Additionally, Aiflo supports advanced image generation (e.g., DALL-E) and file/image uploads, all managed with robust quota and subscription controls.

---

## 2. Core Functionalities

### 2.1. Multi-Model Chat Access

- **Supported Models:** Users can select from a curated list of top LLMs, including:
  - OpenAI GPT-4
  - Google Gemini
  - Anthropic Claude
  - Mistral
  - Perplexity
  - DeepSeek
  - Llama
  - Grok
- **Unified Chat Interface:** All models are accessible from a single, modern chat UI.
- **Model Switching:** Users can switch models per conversation or message.
- **Streaming Responses:** Real-time, token-by-token streaming of model outputs.
- **Conversation Management:** Users can create, rename, delete, and manage multiple conversations.
- **Revision History:** Every message (user or assistant) supports revision tracking, including user edits and assistant regenerations, with full version history.

### 2.2. Image Generation

- **Image Models:** Support for image generation via OpenAI (DALL-E) and planned support for Midjourney.
- **Prompt Engineering:** The system can auto-generate image prompts based on chat context for better results.
- **Multi-turn Image Generation:** Supports follow-up image requests using previous response IDs for context.
- **Image Uploads:** Users can upload images (compressed to webp, <200kb) as part of chat messages.
- **Image Display & Download:** Images are shown inline, can be expanded in a modal, and downloaded with a single click.
- **Quota Management:** Image generation is quota-limited per subscription tier.

### 2.3. Subscription & Quota Management

- **Subscription Tiers:** Free, Pro, and Enterprise plans, each with different quotas for:
  - Small messages
  - Large messages
  - Image generations
- **Payment Integration:** Razorpay is used for subscription management, including plan selection, upgrades, cancellations, and webhook-based status updates.
- **Quota Enforcement:** All usage (messages, images) is tracked and enforced per user and plan. Users are notified when they approach or exceed quotas.
- **Usage Dashboard:** Users can view their current usage, remaining quota, and reset dates in real time.

### 2.4. Authentication & User Management

- **Supabase Auth:** Secure authentication and user management.
- **Profile Management:** Users can view and update their profile, including email, name, and avatar.
- **API Keys:** (Planned) Users can generate and manage API keys for programmatic access.

### 2.5. Conversation Sharing

- **Shareable Links:** Users can generate public, read-only links to share conversations.
- **Share Management:** Owners can deactivate or delete share links at any time.
- **Security:** Only owners can share or unshare; public access is strictly read-only.

### 2.6. Documentation, Blog, and Public Pages

- **Docs:** In-app documentation and search.
- **Blog:** Platform updates and AI news.
- **Legal Pages:** Privacy, Terms, Cancellation/Refunds, all accessible from the footer.

### 2.7. Admin & Analytics (Planned/Partial)

- **Admin Dashboard:** For managing users, quotas, subscriptions, and analytics.
- **Audit Logs:** All critical actions (subscription changes, share actions) are logged for auditability.

---

## 3. Technical Architecture

- **Frontend:** Next.js 14 (App Router), HeroUI, TailwindCSS, Framer Motion, Lucide icons.
- **Backend:** Next.js API routes, Server-Sent Events (SSE) for streaming, Supabase for DB/auth, Razorpay for payments.
- **State Management:** React Context.
- **Storage:** Supabase Storage for image uploads.
- **External APIs:** OpenRouter for LLM access, OpenAI SDK for image generation.

---

## 4. Detailed Feature Descriptions

### 4.1. Chat & Conversation System

- **Message Lifecycle:** Each message is versioned, supporting edits and assistant regenerations. All revisions are preserved and can be browsed.
- **Threaded Context:** Messages can reference parent messages for context.
- **Real-Time Updates:** All chat and revision actions update the UI instantly.
- **Attachments:** Users can attach images to messages; images are uploaded, compressed, and stored in Supabase.

### 4.2. Model Management

- **Model List:** Models are defined centrally (`lib/models.ts`) and exposed to the UI for selection.
- **Variants:** Models are categorized as Chat or Image for appropriate UI/UX.
- **Dynamic Model Switching:** The chat input allows users to select the model for each message.

### 4.3. Image Generation

- **Unified Provider Interface:** All image generation services implement a common interface for extensibility.
- **OpenAI Integration:** Uses the official OpenAI SDK for DALL-E image generation, including multi-turn support.
- **Image Storage:** Generated images are uploaded to Supabase and served via public URLs.
- **UI:** Images are shown inline, with expand/download options, and are always cleaned up after use.

### 4.4. Subscription & Quota

- **Quota Enforcement:** Every message/image generation checks quota before proceeding. Exceeding quota triggers user notifications and blocks further actions.
- **Quota Reset:** Quotas reset based on plan (monthly, daily, or 3-hour rolling).
- **Subscription Management:** Users can upgrade, downgrade, or cancel subscriptions from the dashboard. All changes are reflected in real time.

### 4.5. Sharing & Collaboration

- **Share Dialog:** Accessible from conversation pages, allows users to generate, copy, and manage share links.
- **Public View:** Shared conversations are accessible via `/share/[id]` in a read-only format.

### 4.6. Admin & Analytics

- **Admin APIs:** Endpoints for managing users, quotas, subscriptions, and analytics.
- **Audit Trails:** All critical actions are logged for compliance and debugging.

---

## 5. User Experience & UI

- **Modern, Responsive UI:** Built with HeroUI and TailwindCSS, with smooth animations via Framer Motion.
- **Accessibility:** All interactive elements are accessible and keyboard-navigable.
- **Consistent Theming:** Light/dark mode support.
- **Error Handling:** All errors are surfaced to the user with actionable messages.

---

## 6. Security & Compliance

- **Authentication:** All sensitive actions require authentication via Supabase.
- **Data Privacy:** User data is never shared; all uploads are private unless explicitly shared.
- **Payment Security:** All payment flows are handled via Razorpay with webhook verification.

---

## 7. Extensibility & Future Roadmap

- **Pluggable Model Architecture:** New LLMs or image models can be added easily.
- **API Access:** Planned support for user-generated API keys for programmatic access.
- **Team/Org Features:** (Planned) Shared workspaces and team management.
- **Advanced Analytics:** (Planned) Usage analytics and reporting for users and admins.

---

# Summary Table of Key Features

| Feature              | Description                                                                        |
| -------------------- | ---------------------------------------------------------------------------------- |
| Multi-LLM Chat       | Access to GPT-4, Gemini, Claude, Mistral, Perplexity, etc. in one chat interface   |
| Image Generation     | DALL-E (OpenAI) image generation, with prompt engineering and multi-turn support   |
| File/Image Upload    | Upload and attach images to chat messages                                          |
| Subscription Plans   | Free, Pro, Enterprise with quota-based usage and Razorpay integration              |
| Quota Management     | Per-user, per-plan quotas for messages and images, with real-time usage dashboard  |
| Conversation Sharing | Public, read-only share links for conversations                                    |
| Revision History     | Full versioning for all messages and assistant responses                           |
| Admin & Analytics    | User, quota, and subscription management (admin only)                              |
| Documentation & Blog | In-app docs, blog, and legal pages                                                 |
| Modern UI/UX         | HeroUI, TailwindCSS, Framer Motion, Lucide icons, responsive and accessible design |

---

# Conclusion

Aiflo is a robust, extensible platform for unified access to the world's best AI models, with a focus on usability, transparency, and flexible subscription management. It is designed to be the "one-stop shop" for AI chat and image generation, with a modern, user-friendly interface and strong technical foundations.
