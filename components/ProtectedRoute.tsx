import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null; // Or show a loading spinner
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <>{children}</>;
}
