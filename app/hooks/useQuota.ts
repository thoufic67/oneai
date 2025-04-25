/**
 * Custom hook for fetching and managing quota status
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuotaKey, QuotaStatus } from "@/config/quota";

export interface QuotaStatusResponse {
  subscription: {
    tier: string;
    status: string;
  };
  quotas: Record<QuotaKey, QuotaStatus>;
}

export function useQuota() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuotaStatusResponse | null>(null);

  const fetchQuotaStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/quota/status");
      if (!response.ok) {
        throw new Error("Failed to fetch quota status");
      }
      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error("Error fetching quota status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch quota status"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotaStatus();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchQuotaStatus,
  };
}
