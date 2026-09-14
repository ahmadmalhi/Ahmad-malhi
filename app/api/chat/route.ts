import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPEN_AI; // holds a Groq key — see README
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing the OPEN_AI (Groq) API key. Add it in Netlify env vars." },
      { status: 500 }
    );
  }

  let body: { messages?: IncomingMessage[]; userName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "`messages` must be a non-empty array." }, { status: 400 });
  }

  const model = process.env.OPENAI_TEXT_MODEL || "openai/gpt-oss-120b";
  const systemPrompt = body.userName
    ? `You are Nexora, a helpful, warm AI assistant. The person you're talking to is named ${body.userName}. You may address them by name occasionally, but don't overdo it.`
    : "You are Nexora, a helpful, warm AI assistant.";

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return NextResponse.json(
        { error: "Upstream model provider error.", detail },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach the model provider.", detail: String(err) },
      { status: 502 }
    );
  }
}
