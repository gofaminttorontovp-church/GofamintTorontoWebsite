import { NextRequest, NextResponse } from "next/server";
import { requireSession, isResponse, handleFailure, jsonError } from "@/lib/admin/api";
import { commitFiles } from "@/lib/admin/github";
import { isAllowedImagePath, MAX_UPLOAD_BYTES } from "@/lib/admin/validate";

export const runtime = "nodejs";

/**
 * One photograph onto the change's branch.
 *
 * Images travel one per request — the client has already resized them, but
 * a batch of gallery photos in a single body would still brush against the
 * platform's request limit. The path must sit inside the image folders; the
 * allowlist in validate.ts is the whole of where this endpoint can write.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (isResponse(session)) return session;

  try {
    const body = (await request.json()) as {
      branch?: string;
      path?: string;
      dataBase64?: string;
    };

    if (!body.branch || !body.path || !body.dataBase64) {
      return jsonError("Bad request", 400);
    }
    if (!isAllowedImagePath(body.path)) {
      return jsonError("That file can't be saved there.", 400);
    }
    const size = Math.floor((body.dataBase64.length * 3) / 4);
    if (size > MAX_UPLOAD_BYTES) {
      return jsonError("That image is too large even after compression.", 413);
    }

    const filename = body.path.slice(body.path.lastIndexOf("/") + 1);
    await commitFiles(body.branch, `Add ${filename}\n\nUploaded by ${session.name} from the editing tool.`, [
      { path: body.path, contentBase64: body.dataBase64 },
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleFailure("upload image", error);
  }
}
