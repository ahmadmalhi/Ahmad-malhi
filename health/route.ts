import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    providers: {
      textGeneration: Boolean(process.env.OPEN_AI),
      voice: Boolean(process.env.VOICE_API),
      googleAuth: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    },
  });
}
