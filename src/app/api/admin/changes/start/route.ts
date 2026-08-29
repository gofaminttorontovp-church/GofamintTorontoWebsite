import { NextRequest, NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure, jsonError } from "@/lib/admin/api";
import { createEditBranch, getContentPR, EDIT_BRANCH_PREFIX } from "@/lib/admin/github";

export const runtime = "nodejs";

/**
 * Open a branch for a change to land on.
 *
 * A fresh submission gets a new branch off main, named after the editor and
 * the moment. Updating a pending change reuses that change's own branch, so
 * the additions join the same pull request.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (isResponse(session)) return session;

  try {
    const body = (await request.json().catch(() => ({}))) as { prNumber?: number };

    if (typeof body.prNumber === "number") {
      const pr = await getContentPR(body.prNumber);
      if (pr.editor !== session.name && session.role !== "admin") {
        return jsonError("Only the person who made this change (or an admin) can update it.", 403);
      }
      return NextResponse.json({ branch: pr.branch, prNumber: pr.number });
    }

    const slug = session.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "editor";
    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const branch = `${EDIT_BRANCH_PREFIX}${slug}-${stamp}`;
    await createEditBranch(branch);
    return NextResponse.json({ branch });
  } catch (error) {
    return handleFailure("start change", error);
  }
}
