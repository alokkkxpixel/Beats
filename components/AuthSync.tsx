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
      if (isSignedIn && user) {
        // Detect primary OAuth provider from external accounts
        const externalAccounts: any[] = user.externalAccounts ?? [];
        let provider: string | null = null;
        if (externalAccounts.length > 0) {
          provider = externalAccounts[0].provider ?? null;
        } else {
          provider = "email";
        }

        const primaryEmail =
          user.primaryEmailAddress?.emailAddress ??
          user.emailAddresses?.[0]?.emailAddress ??
          null;

        const cachedUser = {
          id: user.id,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          fullName:
            user.fullName ??
            ([user.firstName, user.lastName].filter(Boolean).join(" ") || null),
          emailAddress: primaryEmail,
          imageUrl: user.imageUrl ?? null,
          hasImage: user.hasImage,
          provider,
        };
        storage.set("cached-user-data", JSON.stringify(cachedUser));
      } else if (!isSignedIn) {
        storage.remove("cached-user-data");
      }
    }
  }, [isLoaded, isSignedIn, user, syncFromClerk]);

  return null;
}
