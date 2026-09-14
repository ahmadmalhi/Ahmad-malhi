"use client";

import AuthGate from "@/components/AuthGate";
import ChatApp from "@/components/ChatApp";
import { useProfile } from "@/lib/useProfile";

export default function Home() {
  const { name, isSignedIn, loading, saveLocalProfile, signOut } = useProfile();

  if (loading) {
    return (
      <div className="auth-overlay">
        <div className="aurora-orb-sm" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthGate onLocalSignIn={saveLocalProfile} />;
  }

  return <ChatApp name={name!} onSignOut={signOut} />;
}
