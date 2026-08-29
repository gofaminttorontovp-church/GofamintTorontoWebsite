# Together Now — the website editing tool

A page at **`/admin`** where the media team updates the website's photos and
text from a phone or laptop, with no GitHub account and nothing technical.
Every submission becomes a pull request; nothing reaches the live site until
an admin approves it.

## How it works

1. An editor opens `yoursite.com/admin` and signs in with their passcode.
2. They open a section — photo gallery, announcements, events, service
   times, groups, videos, or the home page backdrop — and make their edits.
   Photos are picked straight from the phone's camera roll and are resized
   in the browser before upload.
3. They press **Review & send**, describe the change in a sentence, and
   send it. Behind the scenes the server creates a branch, commits the
   photos and the content file, and opens a pull request.
4. Vercel builds a preview of the whole site with the change in it. The
   editor can look at it, and can keep editing their pending change
   (**Waiting for approval → Open & edit**) until it's right.
5. An admin approves — either with **Approve & publish** in the tool, or by
   merging the pull request on GitHub. Vercel redeploys `main` and the
   change is live. Editors can also **Withdraw** their own change.

What editors can touch is fenced in on the server: only
`content/site-content.json` and images under `public/photos`,
`public/groups`, `public/announcements` and `public/hero` can ever be
written, and the same allowlist is re-checked against the pull request's
real file list right before merging.

## One-time setup (you)

### 1. Create the GitHub token

The tool needs one token, held only on the server. Create a **fine-grained
personal access token** from the account that owns the repo (or a machine
account in the org):

1. GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → **Generate new token**.
2. Resource owner: `gofaminttorontovp-church`. Repository access: **Only
   select repositories** → `GofamintTorontoWebsite`.
3. Permissions → Repository permissions:
   - **Contents: Read and write**
   - **Pull requests: Read and write**
   - **Deployments: Read-only** — lets the tool show each change's Vercel
     preview link. Without it everything else still works; pending changes
     just never leave "Preview building…".
   - everything else: No access.
4. Set an expiry you're comfortable with (you'll rotate it when it lapses),
   generate, and copy the token.

If the organization hasn't enabled fine-grained tokens, either enable them
(org Settings → Third-party access → Personal access tokens) or fall back
to a classic token with the `repo` scope — it works, but it reaches every
repo the account can see, so the fine-grained one is worth the enabling.

### 2. Set the environment variables in Vercel

Project → **Settings → Environment Variables** (Production, and Preview if
you want the tool usable on previews too):

| Variable | Value |
| --- | --- |
| `GITHUB_TOKEN` | the token from step 1 |
| `GITHUB_REPO` | `gofaminttorontovp-church/GofamintTorontoWebsite` |
| `ADMIN_SESSION_SECRET` | any long random string (`openssl rand -hex 32`) |
| `EDITOR_PASSCODES` | see below |

**`EDITOR_PASSCODES`** is the whole user system. One entry per person,
comma-separated; add `:admin` to anyone allowed to approve and publish:

```
Elijah:9-strong-words-here:admin, Grace:another-passcode, Tunde:a-third-one
```

Make each passcode long enough that it can't be guessed (a short phrase
works well — easy to type on a phone, hard to guess). To **add** someone,
add an entry and redeploy. To **remove** someone, delete their entry and
redeploy — their signed-in sessions keep working up to 30 days, so if it's
urgent, also change `ADMIN_SESSION_SECRET`, which signs everyone out at
once.

### Preview links

The tool asks GitHub for the preview URL Vercel recorded against each
change and shows it as **See preview**, or **Preview building…** while the
build is still running. There is no URL pattern to configure — Vercel trims
these addresses to the 63 characters DNS allows and appends a hash of its
own, so a branch called `content-edit/elijah-20260829194855` ends up served
at `...-git-content-ed-277d1d-...`, which cannot be worked out from
outside. (If you set a `VERCEL_PREVIEW_TEMPLATE` variable during an earlier
setup, delete it; it is no longer read.)

**One setting is still needed**, because Vercel puts preview deployments
behind its own login and your editors have no Vercel account. Go to the
project's **Settings → Deployment Protection**. Either:

- **Turn on Protection Bypass for Automation** (recommended). Vercel
  generates a secret and publishes it to the deployment itself as
  `VERCEL_AUTOMATION_BYPASS_SECRET` — you do not copy it anywhere. The tool
  picks it up and appends it to the links it hands out, so previews open
  for your team and stay shut to everyone else. Redeploy once after
  enabling it, so the running deployment picks the secret up.
- **Or set protection to None.** Previews become readable by anyone holding
  the link. The links are unguessable and Vercel marks previews `noindex`,
  so this is a reasonable choice for a site whose content is public anyway
  — it just means a forwarded link works for whoever receives it.

Password Protection is the third possibility, but it is Enterprise-only or
a $150/month Pro add-on, so it isn't worth it here.

If neither is done, everything else still works and **See preview** simply
lands on a Vercel login page.

### 3. Share the link and the passcodes

Send each person `yoursite.com/admin` and their own passcode (ideally not
in the same message as the link). That's their entire onboarding.

## Safeguards, in short

- **No public write path.** Every button in the tool requires a signed-in
  session; sessions come only from passcodes you issued. A stranger who
  finds `/admin` sees a passcode box and nothing else, and sign-in attempts
  are rate-limited.
- **Nothing publishes itself.** Editors can only open pull requests. Only
  `:admin` entries can merge, and you can always review on GitHub first.
- **The tool can't reach the code.** Uploads are confined to the image
  folders; the content file is validated against the site's schema before
  every commit; merges re-check the pull request's actual file list and
  refuse anything outside the allowlist.
- **The token stays server-side.** Editors' browsers never see it.

## Day to day (you)

- New pending changes show under **Waiting for approval** in the tool, and
  as pull requests on GitHub — same thing, pick whichever is closer.
- The Vercel preview on the PR shows the site exactly as it would look.
- **Approve & publish** squash-merges and deletes the branch. Vercel
  redeploys `main` automatically.

## Local development

Copy `.env.example` to `.env.local`, fill in `EDITOR_PASSCODES` and
`ADMIN_SESSION_SECRET`, and leave `GITHUB_TOKEN` empty — without a token
the tool reads the local content file so the editing screens can be tried,
and submitting will tell you GitHub isn't connected.
