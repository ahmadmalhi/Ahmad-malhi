import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Nexora AI handles your data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", color: "#edeef4" }}>
      <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 32, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#9a9ab0", marginBottom: 32 }}>Last updated: September 2026</p>

      <section style={{ marginBottom: 28, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>What we collect</h2>
        <p>
          When you sign in with Google or Apple, we receive your name and email address from
          that provider to personalize your greeting. When you sign up with email instead, the
          name and email you enter are stored only in your browser&apos;s local storage — they
          are never sent to our servers.
        </p>
      </section>

      <section style={{ marginBottom: 28, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Your conversations</h2>
        <p>
          Chat messages are sent to our server so it can forward them to our AI model provider
          (Groq) and return a reply. Conversation history is stored in your browser&apos;s local
          storage, not in a database we control. Clearing your browser storage deletes it.
        </p>
      </section>

      <section style={{ marginBottom: 28, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Voice</h2>
        <p>
          If you use the read-aloud feature, the message text is sent to our voice provider
          (ElevenLabs) to generate audio. Microphone audio used for voice input is processed by
          your browser&apos;s built-in speech recognition and is not sent to our servers.
        </p>
      </section>

      <section style={{ marginBottom: 28, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Third parties</h2>
        <p>
          We use Google and Apple only to authenticate you (we never see or store your
          password). We use Groq to generate chat replies and, optionally, ElevenLabs to
          generate voice audio. Each provider processes only what&apos;s needed to perform that
          function.
        </p>
      </section>

      <section style={{ marginBottom: 28, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Contact</h2>
        <p>Questions about this policy can be sent to the site owner&apos;s support email.</p>
      </section>
    </main>
  );
}
