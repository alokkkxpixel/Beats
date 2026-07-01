/**
 * AuthSync
 *
 * A zero-UI bridge component that syncs Clerk's reactive user state into
 * the Zustand useAuthStore on every render. Mount it once inside
 * <ClerkProvider> (e.g., in _layout.tsx).
 */

import { useAuthStore } from "@/src/store/useAuthStore";
import { useAuth, useUser } from "@clerk/expo";
import { useEffect } from "react";
import { storage } from "@/src/lib/storage";

export function AuthSync() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  const syncFromClerk = useAuthStore((s) => s.syncFromClerk);

  const isLoaded = authLoaded && userLoaded;

  useEffect(() => {
    syncFromClerk({
      isLoaded,
      isSignedIn: !!isSignedIn,
      clerkUser: user ?? null,
    });
    if (isLoaded) {
      storage.set("is-user-signed-in", !!isSignedIn);
    }
  }, [isLoaded, isSignedIn, user, syncFromClerk]);

  return null;
}
