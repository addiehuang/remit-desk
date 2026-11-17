---
name: next
description: Report where the project stands and the single next step, in plain language, rebuilt from git and GitHub issues. Use when the author types /next at the start of a session.
disable-model-invocation: true
---

# /next

The first command of every session. Project state lives in the repository and
in GitHub issues, never in a chat, so this command rebuilds it from those two
sources instead of from memory or an old handover note.

The author is a designer who is still learning git and the terminal. Write so
that someone who has not opened the repository for a week understands every
line without asking a follow-up question.

## Gather

Run these. Use the output to write the reply; do not paste raw output.

```bash
git branch --show-current
git status --short
git log --oneline origin/main..HEAD
gh issue list --state open --limit 30 --json number,title,milestone
gh pr list --author @me --state open
ls .claude/lock-tests 2>/dev/null || echo "no test lock"
```

## Choose one issue

- If the author named an issue, use it.
- If the branch name carries an issue number (`feat/12-button`), use that issue.
- Otherwise take the oldest open issue in the open milestone with the earliest
  due date. Ignore the "Parking lot" milestone.

Read it with `gh issue view <number>` and find the first unchecked item in its
checklist.

## Reply

Write the reply in Traditional Chinese unless the author writes to you in
another language. Never mention a file, branch, command or term without saying
in a few plain words what it is. Use three headed parts, in this order.

### 1. Where we are

One sentence: the issue number, what the issue is about in plain words, the
milestone and its due date.

Then, if any file is changed, uncommitted or unpushed, a table with four
columns: the file, what it is in one plain phrase (for example "the Button
spec, the answer key the tests are written from"), what the author did to it,
and which stage it is in. Show the three stages above the table, translated:

```
1 edited and saved (this computer only) -> 2 committed (saved in the version history) -> 3 pushed (on GitHub)
```

Say plainly whether anything at stage 1 or 2 needs action now, or waits for a
later step of the issue. Skip the table when nothing is changed or unpushed.

### 2. Next step

Exactly one action. Say where to do it (which app or window), exactly what to
open, type or run, and in one sentence why this step matters.

### 3. Done when

One check the author can run, and what success looks like in words, for
example "prints nothing" or "shows Status: ready".

### When the issue and the files disagree

Trust the files. Say in plain words what disagrees and where (the checklist
box on the GitHub issue page, with its URL). Offer to tick or untick the box
with `gh issue edit`; do it only after the author agrees.

Do not offer alternatives. Do not start the work until the author says go.
