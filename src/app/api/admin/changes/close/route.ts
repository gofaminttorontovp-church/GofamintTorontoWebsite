import { NextRequest, NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure, jsonError } from "@/lib/admin/api";
import { closePR, deleteBranch, getContentPR } from "@/lib/admin/github";

export const runtime = "nodejs";

/** Withdraw a pending change — its own editor, or an admin. */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (isResponse(session)) return session;

  try {
    const body = (await request.json()) as { prNumber?: number };
    if (typeof body.prNumber !== "number") return jsonError("Bad request", 400);

    const pr = await getContentPR(body.prNumber);
    if (pr.editor !== session.name && session.role !== "admin") {
      return jsonError("Only the person who made this change (or an admin) can withdraw it.", 403);
    }

    await closePR(pr.number);
    await deleteBranch(pr.branch).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleFailure("close change", error);
  }
}
