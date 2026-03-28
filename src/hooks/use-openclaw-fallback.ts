import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface UseOpenClawFallbackOptions<T> {
  apiQueryKey: string[];
  apiFn: () => Promise<T>;
  ghQueryKey: string[];
  ghFn: () => Promise<T>;
  apiStaleTime?: number;
  apiRefetchInterval?: number;
  ghRefetchInterval?: number;
  enabled?: boolean;
}

/**
 * Try OpenClaw API first; fall back to GitHub polling on failure.
 * Shows stale API data while revalidating. If API consistently fails,
 * GitHub data takes over seamlessly.
 */
export function useOpenClawWithFallback<T>({
  apiQueryKey,
  apiFn,
  ghQueryKey,
  ghFn,
  apiStaleTime = 30000,
  apiRefetchInterval = 30000,
  ghRefetchInterval = 60000,
  enabled = true,
}: UseOpenClawFallbackOptions<T>) {
  const apiQuery = useQuery({
    queryKey: apiQueryKey,
    queryFn: apiFn,
    staleTime: apiStaleTime,
    refetchInterval: apiRefetchInterval,
    retry: 1,
    retryDelay: 5000,
    enabled,
  });

  const ghQuery = useQuery({
    queryKey: ghQueryKey,
    queryFn: ghFn,
    refetchInterval: ghRefetchInterval,
    enabled: enabled && (apiQuery.isError || !apiQuery.data),
  });

  const isLive = !apiQuery.isError && !!apiQuery.data;

  return {
    data: isLive ? apiQuery.data : ghQuery.data,
    isLoading: apiQuery.isLoading && ghQuery.isLoading,
    isError: apiQuery.isError && ghQuery.isError,
    isLive,
    dataUpdatedAt: isLive ? apiQuery.dataUpdatedAt : ghQuery.dataUpdatedAt,
  };
}
