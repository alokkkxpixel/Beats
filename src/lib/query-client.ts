import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { clientStorage } from "./storage";

/**
 * Configure the QueryClient with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      retry: 2,
    },
  },
});

/**
 * Persister for TanStack Query using MMKV
 */
export const persister = createSyncStoragePersister({
  storage: clientStorage,
  key: "BEATS_OFFLINE_CACHE",
});
