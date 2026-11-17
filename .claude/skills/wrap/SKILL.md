---
name: wrap
description: Close a session. Commit with approval, update the current GitHub issue, leave a three-line handover, park side tasks and say whether the next step can run unattended. Use when the author types /wrap.
disable-model-invocation: true
---

# /wrap

The last command of every session. A session leaves nothing behind except
commits and the issue, so the next session, or a cloud session overnight, can
start from `/next` with no handover prompt.

## 1. Commit

Show `git status --short`. If anything changed, propose a commit message
(English, UK spelling, no em dash, with the Co-Authored-By trailer when you
wrote the code) and wait for approval. After committing, run
`pnpm lang:check --commits`.

## 2. Update the issue

Tick the checklist items finished in this session by editing the issue body
(`gh issue edit <number> --body-file <file>`). Never tick an item that belongs
to the author unless the author says it is done.

Then comment on the issue with exactly three lines:

```
Done: ...
Next: ...
Blocked: ... (or "none")
```

## 3. Park side tasks

List anything noticed this session that is outside the issue, as proposed
issue titles. Create them in the "Parking lot" milestone only after the author
approves. Do not do them now.

## 4. Can the next step run unattended?

Only when both are true:

- A command can verify it is done, for example `pnpm test:unit --run` passes.
- It is not one of the author's three tasks: writing a spec, reviewing tests,
  keyboard and screen reader checks.

If it can, remind the author to push, then give one command for it:

```bash
claude --cloud "<task>. Done when <condition>. Open a draft pull request."
```

If the step relies on the test lock, the command must begin with
"First create .claude/lock-tests." The lock is ignored by git, so it does not
exist in a cloud clone until something creates it.
