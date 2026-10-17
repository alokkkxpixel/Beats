import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { clientStorage } from "./storage";

// Connect TanStack Query to NetInfo for React Native
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const isOnline = !!state.isConnected && state.isInternetReachable !== false;
    setOnline(isOnline);
  });
});

/**
 * Configure the QueryClient with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      retry: 2,
      networkMode: "offlineFirst",
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
