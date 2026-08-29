import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireSession, isResponse, handleFailure, jsonError } from "@/lib/admin/api";
import { assertEditBranch, baseBranch, readFile } from "@/lib/admin/github";
import { CONTENT_FILE, validateContent } from "@/lib/admin/validate";

export const runtime = "nodejs";

/**
 * The content the editor starts from.
 *
 * Always read fresh from GitHub rather than from what this deployment was
 * built with, so an editor opening the tool minutes after a merge starts
 * from the site as it now is, not as it was. `?ref=` points at a pending
 * change's branch instead, for picking an open change back up.
 *
 * Without a GitHub token (local development), the local file stands in.
 */
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (isResponse(session)) return session;

  const ref = request.nextUrl.searchParams.get("ref") ?? baseBranch();

  try {
    let text: string | null;
    if (!process.env.GITHUB_TOKEN) {
      text = await fs.readFile(path.join(process.cwd(), CONTENT_FILE), "utf8");
    } else {
      if (ref !== baseBranch()) assertEditBranch(ref);
      text = await readFile(CONTENT_FILE, ref);
    }
    if (!text) return jsonError("The content file could not be found.", 404);

    const content = JSON.parse(text) as unknown;
    const error = validateContent(content);
    if (error) return jsonError(`The content file has a problem: ${error}`, 500);

    return NextResponse.json({ content, ref });
  } catch (error) {
    return handleFailure("load content", error);
  }
}
