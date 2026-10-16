"use client";

import { useAuth } from "@/context/AuthContext";

export default function AuthButton() {
  const { user, enabled, signIn, signOutUser } = useAuth();
  if (!enabled) return null;
  if (!user) {
    return (
      <button
        onClick={() => void signIn()}
        className="bc-btn bc-btn-cottage px-4 py-2"
      >
        Sign in
      </button>
    );
  }
  return (
    <button
      onClick={() => void signOutUser()}
      className="bc-link text-on-ink"
      title={user.displayName ?? "Signed in"}
    >
      Sign out
    </button>
  );
}
