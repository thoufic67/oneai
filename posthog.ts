// DEPRECATED: This file was used for server-side PostHog analytics with posthog-node. Do NOT import this in client components. Use posthog-js via PostHogProvider and usePostHog instead.
// If you need server-side analytics, use this only in API routes or server components.

// No exports. This file is intentionally left empty to prevent accidental usage in client code.

import { PostHog } from "posthog-node";

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
