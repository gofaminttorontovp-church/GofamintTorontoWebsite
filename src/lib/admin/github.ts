/**
 * The one GitHub account the whole tool uses.
 *
 * Editors never see GitHub. The server holds a single token (GITHUB_TOKEN in
 * Vercel, scoped to just this repository) and does the git work on their
 * behalf: a branch per change, a commit per file, a pull request to main.
 * Approving and merging that pull request — from GitHub or from the tool's
 * own Approve button — is what publishes, because Vercel deploys main.
 *
 * Every branch the tool creates starts with `content-edit/`, and merge/close
 * refuse to touch anything else, so the token's reach through this code is
 * narrower than the token itself.
 */

const API = "https://api.github.com";

/** Branches the tool owns. Nothing outside this prefix is ever written. */
export const EDIT_BRANCH_PREFIX = "content-edit/";

/** The marker that identifies a pull request as one of ours, with its metadata. */
const META_PREFIX = "<!--together-now:";
const META_SUFFIX = "-->";

export type ContentPR = {
  number: number;
  title: string;
  description: string;
  editor: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  url: string;
};

function repoPath(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo || !repo.includes("/")) {
    throw new Error("GITHUB_REPO is not set (expected owner/name)");
  }
  return repo;
}

export function baseBranch(): string {
  return process.env.GITHUB_BASE_BRANCH || "main";
}

async function gh<T>(path: string, init?: RequestInit & { allow404?: boolean }): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
  if (init?.allow404 && response.status === 404) return null as T;
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub ${init?.method ?? "GET"} ${path} failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

/* ---------------------------------------------------------------
   Branches and files
   --------------------------------------------------------------- */

async function branchHeadSha(branch: string): Promise<string> {
  const ref = await gh<{ object: { sha: string } }>(
    `/repos/${repoPath()}/git/ref/${encodeURIComponent(`heads/${branch}`)}`,
  );
  return ref.object.sha;
}

/** Create a `content-edit/...` branch off the tip of main. */
export async function createEditBranch(branch: string): Promise<void> {
  assertEditBranch(branch);
  const sha = await branchHeadSha(baseBranch());
  await gh(`/repos/${repoPath()}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });
}

export async function deleteBranch(branch: string): Promise<void> {
  assertEditBranch(branch);
  await gh(`/repos/${repoPath()}/git/refs/${encodeURIComponent(`heads/${branch}`)}`, {
    method: "DELETE",
    allow404: true,
  });
}

export function assertEditBranch(branch: string) {
  if (!branch.startsWith(EDIT_BRANCH_PREFIX) || branch.includes("..") || /[^a-zA-Z0-9/_-]/.test(branch)) {
    throw new Error(`Refusing to touch branch "${branch}" — not a content edit branch`);
  }
}

/** Read a file's text content at a ref (branch, sha, or tag). */
export async function readFile(path: string, ref: string): Promise<string | null> {
  const file = await gh<{ content: string; encoding: string } | null>(
    `/repos/${repoPath()}/contents/${path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}?ref=${encodeURIComponent(ref)}`,
    { allow404: true },
  );
  if (!file) return null;
  return Buffer.from(file.content, "base64").toString("utf8");
}

/**
 * Commit a set of files to an edit branch in one commit, via the git data
 * API — the contents API does one file per commit, and a photo swap plus its
 * JSON entry should land together.
 */
export async function commitFiles(
  branch: string,
  message: string,
  files: { path: string; contentBase64: string }[],
): Promise<void> {
  assertEditBranch(branch);
  const repo = repoPath();
  const headSha = await branchHeadSha(branch);
  const headCommit = await gh<{ tree: { sha: string } }>(`/repos/${repo}/git/commits/${headSha}`);

  const treeEntries = [];
  for (const file of files) {
    const blob = await gh<{ sha: string }>(`/repos/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: file.contentBase64, encoding: "base64" }),
    });
    treeEntries.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const tree = await gh<{ sha: string }>(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: treeEntries }),
  });

  const commit = await gh<{ sha: string }>(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  });

  await gh(`/repos/${repo}/git/refs/${encodeURIComponent(`heads/${branch}`)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
}

/* ---------------------------------------------------------------
   Pull requests
   --------------------------------------------------------------- */

function buildBody(editor: string, description: string): string {
  const meta = JSON.stringify({ editor });
  return `${META_PREFIX}${meta}${META_SUFFIX}\n\n${description.trim()}\n\n---\n_Opened from the church website's editing tool by **${editor}**._`;
}

function parseBody(body: string | null): { editor: string; description: string } | null {
  if (!body || !body.startsWith(META_PREFIX)) return null;
  const end = body.indexOf(META_SUFFIX);
  if (end === -1) return null;
  try {
    const meta = JSON.parse(body.slice(META_PREFIX.length, end)) as { editor?: string };
    const rest = body.slice(end + META_SUFFIX.length);
    const description = rest.split("\n---\n")[0]?.trim() ?? "";
    return { editor: meta.editor ?? "someone", description };
  } catch {
    return null;
  }
}

type RawPR = {
  number: number;
  title: string;
  body: string | null;
  head: { ref: string };
  created_at: string;
  updated_at: string;
  html_url: string;
};

function toContentPR(raw: RawPR): ContentPR | null {
  if (!raw.head.ref.startsWith(EDIT_BRANCH_PREFIX)) return null;
  const meta = parseBody(raw.body);
  if (!meta) return null;
  return {
    number: raw.number,
    title: raw.title,
    description: meta.description,
    editor: meta.editor,
    branch: raw.head.ref,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    url: raw.html_url,
  };
}

/** All open pull requests created by the tool. */
export async function listContentPRs(): Promise<ContentPR[]> {
  const raw = await gh<RawPR[]>(
    `/repos/${repoPath()}/pulls?state=open&base=${encodeURIComponent(baseBranch())}&per_page=50`,
  );
  return raw.map(toContentPR).filter((pr): pr is ContentPR => pr !== null);
}

/** One of the tool's pull requests, by number. Throws if it isn't ours. */
export async function getContentPR(prNumber: number): Promise<ContentPR> {
  const raw = await gh<RawPR & { state: string }>(`/repos/${repoPath()}/pulls/${prNumber}`);
  const pr = toContentPR(raw);
  if (!pr) throw new Error(`Pull request #${prNumber} was not created by the editing tool`);
  if (raw.state !== "open") throw new Error(`Pull request #${prNumber} is no longer open`);
  return pr;
}

export async function createPR(
  branch: string,
  title: string,
  editor: string,
  description: string,
): Promise<{ number: number; url: string }> {
  assertEditBranch(branch);
  const raw = await gh<{ number: number; html_url: string }>(`/repos/${repoPath()}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title,
      head: branch,
      base: baseBranch(),
      body: buildBody(editor, description),
    }),
  });
  return { number: raw.number, url: raw.html_url };
}

export async function updatePRDescription(prNumber: number, editor: string, description: string, title?: string) {
  await gh(`/repos/${repoPath()}/pulls/${prNumber}`, {
    method: "PATCH",
    body: JSON.stringify({
      body: buildBody(editor, description),
      ...(title ? { title } : {}),
    }),
  });
}

/** The paths a pull request touches, for the pre-merge allowlist check. */
export async function listPRFiles(prNumber: number): Promise<string[]> {
  const files = await gh<{ filename: string }[]>(
    `/repos/${repoPath()}/pulls/${prNumber}/files?per_page=100`,
  );
  return files.map((file) => file.filename);
}

export async function mergePR(prNumber: number, title: string): Promise<void> {
  await gh(`/repos/${repoPath()}/pulls/${prNumber}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "squash", commit_title: title }),
  });
}

export async function closePR(prNumber: number): Promise<void> {
  await gh(`/repos/${repoPath()}/pulls/${prNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
}

/* ---------------------------------------------------------------
   Vercel preview links
   --------------------------------------------------------------- */

/**
 * Vercel names each branch preview predictably. Set VERCEL_PREVIEW_TEMPLATE
 * to that pattern with `{branch}` where the slug goes — e.g.
 * "https://gofamint-toronto-git-{branch}-yourteam.vercel.app" — and every
 * pending change gets a "See preview" link. Left unset, the link is omitted.
 */
export function previewUrlFor(branch: string): string | null {
  const template = process.env.VERCEL_PREVIEW_TEMPLATE;
  if (!template) return null;
  const slug = branch.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return template.replace("{branch}", slug);
}
