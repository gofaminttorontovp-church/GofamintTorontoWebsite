import { NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure } from "@/lib/admin/api";
import { listContentPRs, previewUrlFor } from "@/lib/admin/github";

export const runtime = "nodejs";

/** The open changes — every pull request the tool has made that awaits a decision. */
export async function GET() {
  const session = await requireSession();
  if (isResponse(session)) return session;

  try {
    const prs = await listContentPRs();
    return NextResponse.json({
      changes: prs.map((pr) => ({
        ...pr,
        previewUrl: previewUrlFor(pr.branch),
        mine: pr.editor === session.name,
        canApprove: session.role === "admin",
      })),
    });
  } catch (error) {
    return handleFailure("list changes", error);
  }
}
