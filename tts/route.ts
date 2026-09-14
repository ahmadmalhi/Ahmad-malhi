import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.VOICE_API; // ElevenLabs key — see README
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice is not configured (missing VOICE_API)." },
      { status: 501 }
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body.text || "").slice(0, 2000); // guard against runaway TTS cost
  if (!text.trim()) {
    return NextResponse.json({ error: "`text` is required." }, { status: 400 });
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const model = process.env.ELEVENLABS_TTS_MODEL || "eleven_flash_v2_5";

  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: 0.45, similarity_boost: 0.8 },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return NextResponse.json(
        { error: "Voice provider error.", detail },
        { status: upstream.status }
      );
    }

    const audio = await upstream.arrayBuffer();
    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach the voice provider.", detail: String(err) },
      { status: 502 }
    );
  }
}
