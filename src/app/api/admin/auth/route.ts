import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  verifyPasscode,
} from "@/lib/admin/auth";
import { jsonError } from "@/lib/admin/api";

export const runtime = "nodejs";

/**
 * Sign in, sign out, and "who am I".
 *
 * Wrong guesses are slowed per-IP: after five misses in a quarter hour the
 * address waits. The map lives in the server instance's memory, so it is a
 * speed bump rather than a wall — the passcodes themselves, and the fact
 * that nothing publishes without an approval, are the actual protection.
 */

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Not signed in", 401);
  return NextResponse.json({ name: session.name, role: session.role });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooManyAttempts(ip)) {
    return jsonError("Too many tries. Wait fifteen minutes and try again.", 429);
  }

  let passcode = "";
  try {
    const body = (await request.json()) as { passcode?: string };
    passcode = body.passcode ?? "";
  } catch {
    return jsonError("Bad request", 400);
  }

  const match = verifyPasscode(passcode);
  if (!match) {
    return jsonError("That passcode doesn't match anyone. Check it and try again.", 401);
  }

  await setSessionCookie(match.name, match.role);
  return NextResponse.json({ name: match.name, role: match.role });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
