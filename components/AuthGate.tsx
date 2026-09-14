"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import type { LocalProfile } from "@/lib/types";

const ACCOUNTS_KEY = "nexora:accounts"; // { [email]: name } — local-only "accounts"

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

export default function AuthGate({
  onLocalSignIn,
}: {
  onLocalSignIn: (profile: LocalProfile) => void;
}) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [providerNotice, setProviderNotice] = useState("");

  function handleGoogleSignIn() {
    setProviderNotice("");
    signIn("google").catch(() => {
      setProviderNotice("Google sign-in isn't configured on this deployment yet.");
    });
  }

  function readAccounts(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    const accounts = readAccounts();

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Enter your name so Nexora can greet you.");
        return;
      }
      accounts[cleanEmail] = name.trim();
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      onLocalSignIn({ name: name.trim(), email: cleanEmail, provider: "email" });
    } else {
      const found = accounts[cleanEmail];
      if (!found) {
        setError("No account found for that email. Try signing up instead.");
        return;
      }
      onLocalSignIn({ name: found, email: cleanEmail, provider: "email" });
    }
  }

  return (
    <div className="auth-overlay">
      <div className="aurora-field">
        <span /><span /><span />
      </div>
      <div className="auth-card">
        <div className="auth-mark">
          <div className="aurora-orb-sm" style={{ width: 40, height: 40 }} />
        </div>
        <h1 className="auth-title">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="auth-sub">
          {mode === "signup"
            ? "Free to start. No credit card required."
            : "Sign in to pick up where you left off."}
        </p>

        {providerNotice && <div className="auth-error">{providerNotice}</div>}

        <button type="button" className="oauth-btn" onClick={handleGoogleSignIn}>
          <GoogleMark /> Continue with Google
        </button>

        <div className="auth-divider">or with email</div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                type="text"
                placeholder="Ahmad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <button type="submit" className="auth-submit">
            {mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "signup" ? (
            <>Already have an account? <button onClick={() => setMode("login")}>Log in</button></>
          ) : (
            <>New here? <button onClick={() => setMode("signup")}>Sign up</button></>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--text-faint)", marginTop: 16 }}>
          By continuing, you agree to our{" "}
          <a href="/terms" style={{ color: "var(--text-dim)" }}>Terms</a> and{" "}
          <a href="/privacy" style={{ color: "var(--text-dim)" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
