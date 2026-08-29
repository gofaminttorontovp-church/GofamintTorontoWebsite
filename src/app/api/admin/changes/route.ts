import { NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure } from "@/lib/admin/api";
import { getPreview, listContentPRs } from "@/lib/admin/github";

export const runtime = "nodejs";

/** The open changes — every pull request the tool has made that awaits a decision. */
export async function GET() {
  const session = await requireSession();
  if (isResponse(session)) return session;

  try {
    const prs = await listContentPRs();
    // Each preview costs two calls, so the changes are asked about together
    // rather than one after another.
    const previews = await Promise.all(prs.map((pr) => getPreview(pr.headSha)));

    return NextResponse.json({
      changes: prs.map((pr, index) => ({
        ...pr,
        preview: previews[index],
        mine: pr.editor === session.name,
        canApprove: session.role === "admin",
      })),
    });
  } catch (error) {
    return handleFailure("list changes", error);
  }
}
