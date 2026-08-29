import { NextRequest, NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure, jsonError } from "@/lib/admin/api";
import { commitFiles, createPR, getContentPR, updatePRDescription } from "@/lib/admin/github";
import { CONTENT_FILE, validateContent } from "@/lib/admin/validate";

export const runtime = "nodejs";

/**
 * Land the content file and raise (or refresh) the pull request.
 *
 * The description the editor wrote becomes the pull request: its first line
 * the title, the whole of it the body, alongside who made it. Updating a
 * pending change commits to the same branch and rewrites the description.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (isResponse(session)) return session;

  try {
    const body = (await request.json()) as {
      branch?: string;
      prNumber?: number;
      description?: string;
      content?: unknown;
    };

    const description = (body.description ?? "").trim();
    if (!body.branch || !description || body.content === undefined) {
      return jsonError("Bad request", 400);
    }
    if (description.length > 4000) {
      return jsonError("The description is too long.", 400);
    }

    const contentError = validateContent(body.content);
    if (contentError) {
      return jsonError(`Something in the content isn't right: ${contentError}`, 400);
    }

    const firstLine = description.split("\n")[0].trim();
    const title = firstLine.length > 70 ? `${firstLine.slice(0, 67)}...` : firstLine;

    const json = JSON.stringify(body.content, null, 2) + "\n";
    await commitFiles(
      body.branch,
      `Update site content\n\nChange by ${session.name}: ${title}`,
      [{ path: CONTENT_FILE, contentBase64: Buffer.from(json).toString("base64") }],
    );

    if (typeof body.prNumber === "number") {
      const pr = await getContentPR(body.prNumber);
      if (pr.editor !== session.name && session.role !== "admin") {
        return jsonError("Only the person who made this change (or an admin) can update it.", 403);
      }
      await updatePRDescription(pr.number, pr.editor, description, title);
      return NextResponse.json({ prNumber: pr.number, url: pr.url });
    }

    // No preview to hand back yet: Vercel has only just been told about the
    // branch. It appears against the change under "Waiting for approval"
    // once the build finishes.
    const created = await createPR(body.branch, title, session.name, description);
    return NextResponse.json({ prNumber: created.number, url: created.url });
  } catch (error) {
    return handleFailure("finish change", error);
  }
}
