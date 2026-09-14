# Nexora AI v2.1

A premium Next.js AI workspace. Sign in, get greeted by name, chat with a large-type reading surface, talk to it with your mic, hear replies read back, and export any conversation as a file.

## What's new in this build

- Full sign-up / login screen: **Google** or **email + name**
- Personalized greeting on every new chat ("Hello, Ahmad")
- New chat opens automatically when you land on the site
- Large, Claude-sized chat typography for easy reading
- Voice input (mic → text) and voice output (text → speech)
- Export any conversation as **.txt**, **.md**, or **.pdf**
- Redesigned visual identity — an "aurora" gradient mark, dark workspace, Fraunces + Sora type pairing
- SEO metadata, sitemap, robots.txt, Open Graph tags, web app manifest
- `/api/health` deployment diagnostics

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Required environment variables

| Variable | What it's for |
|---|---|
| `OPEN_AI` | Groq API key — powers chat replies (the chat route calls Groq's OpenAI-compatible endpoint) |
| `AUTH_SECRET` | Random secret NextAuth uses to sign sessions. Generate with `npx auth secret` |

### Optional environment variables

| Variable | What it's for |
|---|---|
| `VOICE_API` | ElevenLabs API key. Without it, voice output automatically falls back to the browser's built-in speech synthesis — voice still works, just with the system voice instead of ElevenLabs. |
| `ELEVENLABS_VOICE_ID`, `ELEVENLABS_TTS_MODEL` | Pick a specific ElevenLabs voice/model |
| `OPENAI_TEXT_MODEL` | Override the Groq model (defaults to `openai/gpt-oss-120b`) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Enables "Continue with Google" |

**Without the Google variables set**, that button shows a friendly "not configured yet" message instead of erroring — email sign-up always works.

### Setting up Google sign-in

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth Client ID (Web application).
3. Add authorized redirect URI: `https://YOUR-SITE.netlify.app/api/auth/callback/google`
4. Copy the Client ID/Secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

### A note on accounts

This project intentionally has **no database** (see the original roadmap below), so:
- Google/Apple sign-in uses secure OAuth session tokens — no passwords stored anywhere.
- "Email + name" sign-up is a lightweight local profile (stored in your browser) used purely to personalize greetings. It is **not** a secured account system — anyone on the same browser is treated as that user. For real multi-device email/password accounts, add a database (Postgres, etc.) and a proper credentials provider.

## Netlify deployment

1. Push this project to GitHub.
2. In Netlify: **Add new project → Import an existing project** → select the repo.
3. Netlify detects Next.js automatically via `netlify.toml` (build command `npm run build`, Node 20).
4. In **Project configuration → Environment variables**, add the variables from the table above.
5. Deploy, then verify at `https://YOUR-SITE.netlify.app/api/health`.

## Production roadmap

For a public SaaS release on top of this: add a database-backed account system (so email login works across devices), rate limiting and usage caps, billing, content moderation, and analytics.
