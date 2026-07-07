/**
 * useAuthStore
 *
 * A thin Zustand store that mirrors the Clerk user session so any component
 * can consume auth data without importing @clerk/expo directly.
 *
 * Call `syncFromClerk()` once inside a component that has access to Clerk
 * hooks (e.g. the root layout or a dedicated AuthSync component), passing
 * the values returned by `useUser()` and `useAuth()`.
 */

import { create } from "zustand";
import { storage } from "@/src/lib/storage";

export interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  emailAddress: string | null;
  imageUrl: string | null;
  hasImage?: boolean;
  /** "google" | "github" | "email" | null */
  provider: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  /** Called by the AuthSync bridge component on every render */
  syncFromClerk: (params: {
    isLoaded: boolean;
    isSignedIn: boolean;
    clerkUser: any | null;
  }) => void;
  clearUser: () => void;
}

const getInitialUser = (): AuthUser | null => {
  try {
    const data = storage.getString("cached-user-data");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const getInitialIsSignedIn = (): boolean => {
  return storage.getBoolean("is-user-signed-in") ?? false;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  isSignedIn: getInitialIsSignedIn(),
  isLoaded: false,

  syncFromClerk: ({ isLoaded, isSignedIn, clerkUser }) => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      set({ user: null, isSignedIn: false, isLoaded: true });
      return;
    }

    // Detect primary OAuth provider from external accounts
    const externalAccounts: any[] = clerkUser.externalAccounts ?? [];
    let provider: string | null = null;
    if (externalAccounts.length > 0) {
      provider = externalAccounts[0].provider ?? null; // e.g. "google", "github"
    } else {
      // Fell back to email/password
      provider = "email";
    }

    const primaryEmail =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      null;

    const user: AuthUser = {
      id: clerkUser.id,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      fullName:
        clerkUser.fullName ??
        ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          null),
      emailAddress: primaryEmail,
      imageUrl: clerkUser.imageUrl ?? null,
      hasImage: clerkUser.hasImage,
      provider,
    };

    set({ user, isSignedIn: true, isLoaded: true });
  },

  clearUser: () => set({ user: null, isSignedIn: false, isLoaded: true }),
}));
