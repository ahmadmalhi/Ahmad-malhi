"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { LocalProfile } from "./types";

const LOCAL_PROFILE_KEY = "nexora:profile";

export function useProfile() {
  const { data: session, status } = useSession();
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
      // Hydration is the synchronization point for browser-only storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLocalProfile(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const saveLocalProfile = useCallback((profile: LocalProfile) => {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    setLocalProfile(profile);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(LOCAL_PROFILE_KEY);
    setLocalProfile(null);
    if (session) await nextAuthSignOut({ redirect: false });
  }, [session]);

  const name = session?.user?.name || localProfile?.name || null;
  const email = session?.user?.email || localProfile?.email || null;
  const isSignedIn = Boolean(name);
  const loading = status === "loading" || !hydrated;

  return { name, email, isSignedIn, loading, saveLocalProfile, signOut };
}
