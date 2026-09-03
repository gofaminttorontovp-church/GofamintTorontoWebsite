"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content";
import { api, resizeImage, slugify, randomSuffix, timeAgo } from "./lib";
import {
  AnnouncementsEditor,
  EventsEditor,
  GroupsEditor,
  ServiceTimesEditor,
  VideosEditor,
  type EditorProps,
  type ImageFolder,
} from "./editors";

/**
 * The editing tool itself: sign in with a passcode, change what needs
 * changing, describe the change, send it for approval. Every submission
 * becomes a pull request on GitHub; nothing reaches the live site until an
 * admin approves it, here or there.
 */

type SessionInfo = { name: string; role: "admin" | "editor" };

type Change = {
  number: number;
  title: string;
  description: string;
  editor: string;
  branch: string;
  headSha: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  preview: { url: string; ready: boolean } | null;
  mine: boolean;
  canApprove: boolean;
};

/**
 * The photo gallery is not among these. It reads the church's Facebook album
 * by itself now, so there is nothing left to upload by hand; the photographs
 * still in the content file are only the fallback for when Facebook cannot be
 * reached, and are left alone rather than edited here.
 */
const SECTIONS: { key: string; label: string; blurb: string }[] = [
  { key: "announcements", label: "Announcements", blurb: "The flyers on the Events page" },
  { key: "events", label: "Upcoming events", blurb: "The dated list on the Events page" },
  { key: "services", label: "Service times", blurb: "The weekly rhythm" },
  { key: "groups", label: "Groups & leaders", blurb: "Photos and words on the Groups page" },
  { key: "videos", label: "Videos", blurb: "The YouTube gallery on the Media page" },
];

export default function AdminApp() {
  const [session, setSession] = useState<SessionInfo | null | undefined>(undefined);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [baseline, setBaseline] = useState<string>("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [editingPr, setEditingPr] = useState<Change | null>(null);
  const [tab, setTab] = useState<"edit" | "changes">("edit");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const dirty = useMemo(
    () => content !== null && JSON.stringify(content) !== baseline,
    [content, baseline],
  );

  const showError = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 6000);
  }, []);

  const loadContent = useCallback(
    async (ref?: string) => {
      try {
        const result = await api<{ content: SiteContent }>(
          `/content${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`,
        );
        setContent(result.content);
        setBaseline(JSON.stringify(result.content));
        setUploads({});
      } catch (error) {
        showError(error instanceof Error ? error.message : "The content couldn't be loaded.");
      }
    },
    [showError],
  );

  useEffect(() => {
    (async () => {
      try {
        const who = await api<SessionInfo>("/auth");
        setSession(who);
        await loadContent();
      } catch {
        setSession(null);
      }
    })();
  }, [loadContent]);

  const update = useCallback((mutate: (draft: SiteContent) => void) => {
    setContent((current) => {
      if (!current) return current;
      const draft = structuredClone(current);
      mutate(draft);
      return draft;
    });
  }, []);

  const stageImage = useCallback(
    async (folder: ImageFolder, file: File) => {
      const resized = await resizeImage(file);
      const name = `${slugify(file.name)}-${randomSuffix()}.jpg`;
      const url = `/${folder}/${name}`;
      setUploads((current) => ({ ...current, [url]: resized.base64 }));
      setPreviews((current) => ({ ...current, [url]: resized.dataUrl }));
      return { url, width: resized.width, height: resized.height };
    },
    [],
  );

  const imgSrc = useCallback((url: string) => previews[url] ?? url, [previews]);

  const discard = useCallback(() => {
    if (!window.confirm("Throw away everything you've changed since you opened this?")) return;
    setEditingPr(null);
    setUploads({});
    void loadContent();
  }, [loadContent]);

  const startEditingChange = useCallback(
    async (change: Change) => {
      try {
        const result = await api<{ content: SiteContent }>(
          `/content?ref=${encodeURIComponent(change.branch)}`,
        );
        setContent(result.content);
        setBaseline(JSON.stringify(result.content));
        setUploads({});
        setEditingPr(change);
        setTab("edit");
        setOpenSection(null);
      } catch (error) {
        showError(error instanceof Error ? error.message : "That change couldn't be opened.");
      }
    },
    [showError],
  );

  if (session === undefined) {
    return <Centered>Loading…</Centered>;
  }

  if (session === null) {
    return <LoginCard onSignedIn={(who) => { setSession(who); void loadContent(); }} />;
  }

  const editorProps: EditorProps | null = content
    ? { content, update, stageImage, imgSrc, onError: showError }
    : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-32 pt-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] leading-tight text-neutral-900">
            Website updates
          </h1>
          <p className="mt-1 text-[14px] text-neutral-500">
            Signed in as <strong className="text-neutral-800">{session.name}</strong>
            {session.role === "admin" ? " (admin)" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await api("/auth", { method: "DELETE" });
            setSession(null);
          }}
          className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-[13px] text-neutral-600 active:bg-neutral-100"
        >
          Sign out
        </button>
      </header>

      <nav className="mb-6 flex gap-2">
        <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
          Make changes
        </TabButton>
        <TabButton active={tab === "changes"} onClick={() => setTab("changes")}>
          Waiting for approval
        </TabButton>
      </nav>

      {notice && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {notice}
        </div>
      )}

      {tab === "edit" && (
        <>
          {editingPr && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
              You are editing a change that is already waiting for approval:{" "}
              <strong>{editingPr.title}</strong>. Submitting will update it.
            </div>
          )}

          {!editingPr && (
            <p className="mb-5 text-[15px] leading-relaxed text-neutral-500">
              Open a section, make your edits, then press <strong>Review &amp; send</strong>.
              Nothing appears on the website until it has been approved.
            </p>
          )}

          {editorProps === null ? (
            <Centered>Loading the site's content…</Centered>
          ) : (
            <div className="space-y-3">
              {SECTIONS.map((section) => (
                <div key={section.key} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span>
                      <span className="block text-[16px] font-semibold text-neutral-900">{section.label}</span>
                      <span className="block text-[13px] text-neutral-400">{section.blurb}</span>
                    </span>
                    <span className="text-neutral-400">{openSection === section.key ? "−" : "+"}</span>
                  </button>
                  {openSection === section.key && (
                    <div className="border-t border-neutral-100 px-5 py-5">
                      {section.key === "announcements" && <AnnouncementsEditor {...editorProps} />}
                      {section.key === "events" && <EventsEditor {...editorProps} />}
                      {section.key === "services" && <ServiceTimesEditor {...editorProps} />}
                      {section.key === "groups" && <GroupsEditor {...editorProps} />}
                      {section.key === "videos" && <VideosEditor {...editorProps} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "changes" && (
        <ChangesView
          onEdit={startEditingChange}
          onError={showError}
        />
      )}

      {dirty && tab === "edit" && (
        <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
            <button type="button" onClick={discard} className="text-[14px] text-neutral-500 underline">
              Discard
            </button>
            <button
              type="button"
              onClick={() => setSubmitOpen(true)}
              className="rounded-full bg-indigo-950 px-6 py-3 text-[15px] font-semibold text-white active:opacity-80"
            >
              {editingPr ? "Review & update" : "Review & send"}
            </button>
          </div>
        </div>
      )}

      {submitOpen && content && (
        <SubmitModal
          content={content}
          uploads={uploads}
          editingPr={editingPr}
          onClose={() => setSubmitOpen(false)}
          onDone={() => {
            setSubmitOpen(false);
            setEditingPr(null);
            setUploads({});
            setBaseline(JSON.stringify(content));
            setTab("changes");
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Pieces
   --------------------------------------------------------------- */

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-neutral-400">
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-neutral-900 px-4 py-2 text-[14px] font-medium text-white"
          : "rounded-full border border-neutral-300 px-4 py-2 text-[14px] font-medium text-neutral-600 active:bg-neutral-100"
      }
    >
      {children}
    </button>
  );
}

function LoginCard({ onSignedIn }: { onSignedIn: (who: SessionInfo) => void }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const who = await api<SessionInfo>("/auth", {
        method: "POST",
        body: JSON.stringify({ passcode }),
      });
      onSignedIn(who);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-neutral-200 bg-white p-8">
        <h1 className="font-serif text-[26px] text-neutral-900">Gofamint Toronto</h1>
        <p className="text-[14px] leading-relaxed text-neutral-500">
          The website editing tool. Enter the passcode you were given.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Your passcode"
          autoFocus
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-[16px] outline-none focus:border-indigo-500"
        />
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !passcode.trim()}
          className="w-full rounded-full bg-indigo-950 py-3 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function SubmitModal({
  content,
  uploads,
  editingPr,
  onClose,
  onDone,
}: {
  content: SiteContent;
  uploads: Record<string, string>;
  editingPr: Change | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [description, setDescription] = useState(editingPr?.description ?? "");
  const [step, setStep] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      setStep("Preparing…");
      const started = await api<{ branch: string }>("/changes/start", {
        method: "POST",
        body: JSON.stringify(editingPr ? { prNumber: editingPr.number } : {}),
      });

      // Only what the final content actually points at travels.
      const json = JSON.stringify(content);
      const used = Object.entries(uploads).filter(([url]) => json.includes(url));
      let index = 0;
      for (const [url, base64] of used) {
        index += 1;
        setStep(`Uploading photo ${index} of ${used.length}…`);
        await api("/changes/upload", {
          method: "POST",
          body: JSON.stringify({
            branch: started.branch,
            path: `public${url}`,
            dataBase64: base64,
          }),
        });
      }

      setStep("Sending for approval…");
      const finished = await api<{ prNumber: number; url: string }>(
        "/changes/finish",
        {
          method: "POST",
          body: JSON.stringify({
            branch: started.branch,
            prNumber: editingPr?.number,
            description,
            content,
          }),
        },
      );
      setStep(null);
      setResult({ url: finished.url });
    } catch (err) {
      setStep(null);
      setError(err instanceof Error ? err.message : "The change couldn't be sent.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        {result ? (
          <div className="space-y-4">
            <h2 className="font-serif text-[24px] text-neutral-900">Sent ✓</h2>
            <p className="text-[15px] leading-relaxed text-neutral-600">
              Your change is in. It will appear on the website once an admin approves it. A
              preview of the whole site with your change in it is being built now — give it a
              minute, then look under <strong>Waiting for approval</strong>.
            </p>
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-full bg-indigo-950 py-3 text-[15px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-serif text-[24px] text-neutral-900">
              {editingPr ? "Update this change" : "Send for approval"}
            </h2>
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-neutral-500">
                Briefly, what did you change?
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="e.g. Swapped six gallery photos for ones from Sunday's service"
                className="w-full resize-y rounded-xl border border-neutral-200 px-3.5 py-2.5 text-[16px] leading-relaxed outline-none focus:border-indigo-500"
                autoFocus
              />
            </label>
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            {step ? (
              <p className="text-center text-[14px] text-neutral-500">{step}</p>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-neutral-300 py-3 text-[15px] font-medium text-neutral-700"
                >
                  Not yet
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!description.trim()}
                  className="flex-1 rounded-full bg-indigo-950 py-3 text-[15px] font-semibold text-white disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChangesView({
  onEdit,
  onError,
}: {
  onEdit: (change: Change) => void;
  onError: (message: string) => void;
}) {
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await api<{ changes: Change[] }>("/changes");
      setChanges(result.changes);
    } catch (error) {
      setChanges([]);
      onError(error instanceof Error ? error.message : "The list couldn't be loaded.");
    }
  }, [onError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const act = async (change: Change, action: "merge" | "close") => {
    const question =
      action === "merge"
        ? `Publish "${change.title}" to the live website?`
        : `Withdraw "${change.title}"? The change will be discarded.`;
    if (!window.confirm(question)) return;
    setBusy(change.number);
    try {
      await api(`/changes/${action}`, {
        method: "POST",
        body: JSON.stringify({ prNumber: change.number }),
      });
      await refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "That didn't work.");
    } finally {
      setBusy(null);
    }
  };

  if (changes === null) return <Centered>Loading changes…</Centered>;

  if (changes.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-10 text-center text-[15px] text-neutral-400">
        Nothing is waiting for approval right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change) => (
        <div key={change.number} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <div>
            <h3 className="text-[16px] font-semibold text-neutral-900">{change.title}</h3>
            <p className="mt-0.5 text-[13px] text-neutral-400">
              {change.editor} · {timeAgo(change.updatedAt)}
            </p>
          </div>
          {change.description && change.description !== change.title && (
            <p className="text-[14px] leading-relaxed text-neutral-600">{change.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {change.preview?.ready ? (
              <a
                href={change.preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-neutral-300 px-4 py-2 text-[13px] font-medium text-neutral-700 active:bg-neutral-100"
              >
                See preview
              </a>
            ) : (
              <span className="rounded-full border border-dashed border-neutral-200 px-4 py-2 text-[13px] text-neutral-400">
                Preview building…
              </span>
            )}
            {(change.mine || change.canApprove) && (
              <button
                type="button"
                onClick={() => onEdit(change)}
                className="rounded-full border border-neutral-300 px-4 py-2 text-[13px] font-medium text-neutral-700 active:bg-neutral-100"
              >
                Open & edit
              </button>
            )}
            {(change.mine || change.canApprove) && (
              <button
                type="button"
                disabled={busy === change.number}
                onClick={() => act(change, "close")}
                className="rounded-full border border-red-200 px-4 py-2 text-[13px] font-medium text-red-600 active:bg-red-50 disabled:opacity-40"
              >
                Withdraw
              </button>
            )}
            {change.canApprove && (
              <button
                type="button"
                disabled={busy === change.number}
                onClick={() => act(change, "merge")}
                className="rounded-full bg-emerald-700 px-4 py-2 text-[13px] font-semibold text-white active:opacity-80 disabled:opacity-40"
              >
                {busy === change.number ? "Publishing…" : "Approve & publish"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
