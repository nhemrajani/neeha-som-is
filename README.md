# Independent Study — Fall 2026

Neeharika Hemrajani · Advisor: _TBD_

> **Research log (password protected):** _deployment URL goes here_
>
> The password is shared separately — ask me if you need it again.

The log is the living record of this study: what I worked on each session,
what I found, what changed, and where the deliverables stand. It updates
automatically whenever a new entry is pushed to this repository.

---

## The question

_TBD — the central research question this study is trying to answer._

**Why it matters.** _TBD_

**Approach.** _TBD_

## Deliverables

| Deliverable              | Due | Status      |
| ------------------------ | --- | ----------- |
| Literature review memo   | TBD | Not started |
| Mid-semester check-in    | TBD | Not started |
| Final paper              | TBD | Not started |
| Final presentation       | TBD | Not started |

## What's in this repo

```
content/study.json      Study overview shown at the top of the dashboard
content/log/*.md        One markdown file per log entry
content/TEMPLATE.md     Copy this to start a new entry
app/                    The dashboard (Next.js)
middleware.ts           Password gate in front of every page
```

## Adding a log entry

1. Copy `content/TEMPLATE.md` to `content/log/YYYY-MM-DD-short-slug.md`.
2. Fill in the frontmatter (`title`, `date`, `week`, `hours`, `tags`, `summary`)
   and write the entry in markdown.
3. Commit and push. The live log redeploys on its own — nothing to upload.

```bash
git add . && git commit -m "Log: week 2" && git push
```

## Running it locally

```bash
npm install
cp .env.example .env.local   # then set RESEARCH_LOG_PASSWORD
npm run dev
```

Open http://localhost:3000 and sign in with the password from `.env.local`.

## How the password works

Every route sits behind `middleware.ts`. Anyone without a valid session cookie
is sent to `/login`, which checks the submitted password against the
`RESEARCH_LOG_PASSWORD` environment variable and sets an HttpOnly cookie good
for 30 days. The password itself is never stored in this repository, and if the
variable is missing the site fails closed rather than exposing the log.

To change the password, update `RESEARCH_LOG_PASSWORD` in the hosting
environment and redeploy.
