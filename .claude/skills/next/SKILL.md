---
name: next
description: Report where the project stands and the single next step, rebuilt from git and GitHub issues. Use when the author types /next at the start of a session.
disable-model-invocation: true
---

# /next

The first command of every session. Project state lives in the repository and
in GitHub issues, never in a chat, so this command rebuilds it from those two
sources instead of from memory or an old handover note.

## Gather

Run these and show the raw output before saying anything else:

```bash
git branch --show-current
git status --short
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

In the author's language, exactly three lines:

1. Where we are: one sentence.
2. Next step: one action, with the exact command or skill to run.
3. Done when: one condition a command can verify.

Do not offer alternatives. Do not start the work until the author says go.

If the git state and the issue disagree (for example the issue says tests are
not written but the test file exists), trust the git state and point out the
difference in one extra line.
