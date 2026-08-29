import { NextRequest, NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure, jsonError } from "@/lib/admin/api";
import { deleteBranch, getContentPR, listPRFiles, mergePR } from "@/lib/admin/github";
import { isAllowedPRPath } from "@/lib/admin/validate";

export const runtime = "nodejs";

/**
 * Approve & publish — admins only.
 *
 * Before merging, the pull request's actual file list is checked against the
 * allowlist one last time. A change that somehow touched anything beyond the
 * content file and the image folders is refused, whatever the tool thought
 * it was doing when it made it.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (isResponse(session)) return session;
  if (session.role !== "admin") {
    return jsonError("Only an admin can approve and publish changes.", 403);
  }

  try {
    const body = (await request.json()) as { prNumber?: number };
    if (typeof body.prNumber !== "number") return jsonError("Bad request", 400);

    const pr = await getContentPR(body.prNumber);

    const files = await listPRFiles(pr.number);
    const outside = files.filter((file) => !isAllowedPRPath(file));
    if (outside.length > 0) {
      return jsonError(
        `This change touches files it shouldn't (${outside.slice(0, 3).join(", ")}). Review it on GitHub instead.`,
        400,
      );
    }

    await mergePR(pr.number, `${pr.title} (by ${pr.editor})`);
    await deleteBranch(pr.branch).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleFailure("merge change", error);
  }
}
