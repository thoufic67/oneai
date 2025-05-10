/**
 * Custom hook for fetching and managing subscription details
 */

import { useEffect, useState } from "react";

export interface SubscriptionStatusResponse {
  subscription: {
    tier: string;
    status: string;
    [key: string]: any;
  } | null;
}

export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SubscriptionStatusResponse | null>(null);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription/status");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }
      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch subscription status"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchSubscriptionStatus,
  };
}
