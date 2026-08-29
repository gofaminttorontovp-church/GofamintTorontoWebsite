import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Passcode sign-in for /admin, with no accounts anywhere.
 *
 * Editors are listed in the EDITOR_PASSCODES environment variable, set in
 * Vercel (and .env.local for development), one entry per person:
 *
 *   EDITOR_PASSCODES="Elijah:some-code:admin, Grace:other-code"
 *
 * Name, passcode, and an optional `admin` flag. Admins can approve and
 * publish changes; everyone listed can propose them. Removing a person's
 * entry (and redeploying) revokes their access without touching anyone else.
 *
 * A successful sign-in sets an HttpOnly cookie holding the person's name and
 * role, signed with ADMIN_SESSION_SECRET so it cannot be forged. No passcode
 * is ever stored in the cookie.
 */

export type Session = { name: string; role: "admin" | "editor"; exp: number };

const COOKIE = "gt_admin";
const SESSION_DAYS = 30;

type EditorEntry = { name: string; passcode: string; role: "admin" | "editor" };

function editors(): EditorEntry[] {
  const rawList = process.env.EDITOR_PASSCODES ?? "";
  return rawList
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, passcode, flag] = entry.split(":").map((part) => part.trim());
      return {
        name: name ?? "",
        passcode: passcode ?? "",
        role: flag === "admin" ? ("admin" as const) : ("editor" as const),
      };
    })
    .filter((editor) => editor.name && editor.passcode);
}

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not set");
  return value;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Same-length copies, so the comparison cost never depends on the input.
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Check a passcode against the list. Returns who it belongs to, or null. */
export function verifyPasscode(passcode: string): { name: string; role: "admin" | "editor" } | null {
  const attempt = passcode.trim();
  if (!attempt) return null;
  let found: EditorEntry | null = null;
  // Every entry is checked even after a match, so timing says nothing.
  for (const editor of editors()) {
    if (safeEqual(editor.passcode, attempt)) found = editor;
  }
  return found ? { name: found.name, role: found.role } : null;
}

export function createSessionToken(name: string, role: "admin" | "editor"): string {
  const session: Session = {
    name,
    role,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(sign(payload), signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (typeof session.name !== "string" || Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

/** The signed-in editor for this request, or null. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return parseSessionToken(store.get(COOKIE)?.value);
}

export async function setSessionCookie(name: string, role: "admin" | "editor") {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(name, role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
