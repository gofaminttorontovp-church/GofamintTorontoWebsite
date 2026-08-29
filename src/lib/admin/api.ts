import { NextResponse } from "next/server";
import { getSession, type Session } from "./auth";

/** Small shared pieces for the /api/admin routes. */

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** The signed-in session, or a ready-made 401 response. */
export async function requireSession(): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Please sign in again.", 401);
  return session;
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/**
 * Turn an unexpected failure into a message an editor can act on, and log
 * the real one for the deploy logs.
 */
export function handleFailure(context: string, error: unknown) {
  console.error(`[admin] ${context}:`, error);
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("GITHUB_TOKEN") || message.includes("GITHUB_REPO")) {
    return jsonError(
      "The tool isn't connected to GitHub yet. Ask the site administrator to finish the setup.",
      500,
    );
  }
  return jsonError(`Something went wrong: ${message}`, 500);
}
