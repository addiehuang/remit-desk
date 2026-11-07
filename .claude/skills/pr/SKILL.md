---
name: pr
description: Run every local gate, fill in the pull request template, and open the pull request once the author has signed off the manual checks. Use when the author types /pr.
disable-model-invocation: true
---

# /pr

Steps 9 and 11 of the component cycle. Nothing leaves the machine until the
gates are green and the author has answered the manual checks.

## Run the gates

In this order, stopping at the first failure:

```
pnpm lint
pnpm lang:check
pnpm typecheck
pnpm test --run
pnpm e2e          # only when this change touches a flow
```

Report the result of each as a table. On a failure, say what failed and stop.
Do not open a pull request with a red gate on the assumption that CI will sort
it out.

## Check the language of the history

```
node scripts/check-english.mjs --commits
```

This checks the branch name and the commit messages on this branch, which the
file scan does not cover. If a commit subject or the branch name is not in
English, tell the author to rewrite the history before merging:

```
git rebase -i main      # reword the offending commits
git branch -m <new-english-branch-name>
```

Do not rebase or rename anything yourself.

## Check the shape of the change

Report, and flag anything odd:

- `git diff --stat main..HEAD`
- Is `.claude/lock-tests` still present? It must be removed only after the
  merge, so its presence here is correct.
- `git diff --stat main..HEAD -- '*.test.tsx' 'e2e/'`: were tests changed after
  they were locked?
- Is the spec's `Status` still `draft`? It should be `implemented` by now.
- Does `docs/a11y/<name>.md` have its result columns filled in?

## Ask the author the manual checks

You cannot answer these. Ask them as a list and wait.

1. Did you complete the keyboard-only walkthrough?
2. Did you complete the screen reader walkthrough, and is the result recorded?
3. Did you deliberately break a line and watch a test go red?
4. Zoomed to 400% with no horizontal scrolling?
5. Checked with reduced motion enabled?
6. Did an agent make a mistake on this change that belongs in the AI log?

Leave every checkbox in the template unticked until the author has answered.
Tick only what they confirmed.

## Fill in the template and open the pull request

Use `.github/pull_request_template.md` exactly as it stands. Answer all four
design system questions in full: keyboard, accessibility, documentation,
versioning. These are the questions a live component exercise ends with, so
write them as though you were answering out loud.

Title and body in English, UK spelling, no em dashes.

Then show the author the complete body and ask for approval. Only after they
approve:

```
git push -u origin HEAD
gh pr create --title "<title>" --body-file <path>
```

Finish by reporting the pull request URL and reminding the author to check CI,
add the preview link, and merge.

## Do not

- Do not push or open a pull request before the author approves the body
- Do not tick an acceptance checkbox the author has not confirmed
- Do not commit on the author's behalf
- Do not rebase, amend, rename a branch or force-push
- Do not merge
