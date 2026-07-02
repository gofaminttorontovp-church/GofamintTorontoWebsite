# Contributing to Gofamint Toronto

Welcome! This guide walks you through everything from creating a GitHub
account to opening your first Pull Request (PR) on this repo — no prior
experience assumed.

You've been added as a **collaborator**, which means you can push branches
directly to this repo (no need to "fork" it). You just can't push straight
to `main` — every change goes through a reviewed PR. That's intentional and
protects the live site.

---

## 1. Create a GitHub account

1. Go to [github.com/signup](https://github.com/signup) and create a free account.
2. Send your GitHub **username** to Elijah — he needs it to add you as a collaborator (step 2).

## 2. Accept the collaborator invite

Elijah will add you at:
`github.com/gofaminttorontovp-church/GofamintTorontoWebsite` → **Settings** → **Collaborators**

You'll get an email (or a notification on GitHub) inviting you to the repo.
Click **Accept invitation**. You now have push access to branches (but not
directly to `main`).

## 3. Install the tools you need

- **Git** — [git-scm.com/downloads](https://git-scm.com/downloads) (or on a Mac, run `git --version` in Terminal; it'll offer to install it if missing).
- **Node.js** — [nodejs.org](https://nodejs.org) (get the LTS version). This project was built with Node v24, but any recent LTS works fine.
- A code editor — [VS Code](https://code.visualstudio.com/) is the common free choice.

## 4. Clone the repo

Open a terminal and run:

```bash
git clone https://github.com/gofaminttorontovp-church/GofamintTorontoWebsite.git
cd GofamintTorontoWebsite
```

The first time you push, Git will ask you to sign in — a browser window
opens for you to log into GitHub. Approve it and you're set for future pushes.

## 5. Install dependencies and run the site locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. This is
a live-reloading copy of the site running on your machine — editing a file
updates the page instantly. Nothing you do here affects the real site until
you open a PR and it gets merged.

## 6. Create a branch for your change

Never edit `main` directly. Start a new branch named after what you're doing:

```bash
git checkout main
git pull
git checkout -b your-name/short-description
```

Example: `git checkout -b sarah/update-service-times`

## 7. Make your changes

Edit the files you need in your editor. The site's pages live in
`src/app/` — see the [README](README.md) for the project structure. Save,
and check `localhost:3000` to confirm it looks right.

## 8. Commit and push

```bash
git add .
git commit -m "Update Sunday service time to 10:30am"
git push -u origin your-name/short-description
```

## 9. Open a Pull Request

After pushing, GitHub prints a link in the terminal like:

```
Create a pull request for 'your-name/short-description' on GitHub by visiting:
     https://github.com/gofaminttorontovp-church/GofamintTorontoWebsite/pull/new/your-name/short-description
```

Open that link (or go to the repo on GitHub — it'll show a **"Compare & pull
request"** banner). Make sure:

- **base: `main`** ← **compare: `your-name/short-description`**
- Give it a clear title and a sentence or two describing what changed and why.

Click **Create pull request**.

## 10. Wait for review

Every PR needs **1 approval** before it can merge — this is a safety rule on
`main`, not a judgment on your code. Someone (Elijah or another
collaborator) will review it, maybe leave comments, and approve once it
looks good.

- If they request changes: edit the same files, `git add`, `git commit`,
  `git push` again — the PR updates automatically. No need to open a new one.
- Once approved, click **Merge pull request** on GitHub (or ask the
  reviewer to merge it).

## 11. Clean up

After merging, GitHub offers a **Delete branch** button — click it. Branches
are free and disposable; delete after merge is normal practice.

Back in your terminal, get back in sync:

```bash
git checkout main
git pull
```

You're ready to start your next branch whenever you like.

---

## Quick reference

| I want to... | Command |
|---|---|
| Start fresh work | `git checkout main && git pull && git checkout -b my-branch` |
| See what changed | `git status` |
| Save my work | `git add . && git commit -m "message"` |
| Send it to GitHub | `git push` (add `-u origin my-branch` the first time) |
| Run the site locally | `npm run dev` |

## Questions?

If anything in this guide doesn't work as described, or you get stuck, reach
out to Elijah — this is a young project and the process may need tweaking as
more people join.
