---
name: ai-log
description: Add an entry to the AI log, update the per-gate counts, and judge whether the mistake should become a new rule or a new gate. Use when the author types /ai-log followed by a description of what an agent got wrong.
disable-model-invocation: true
---

# /ai-log

Step 11 of the component cycle, and any other time an agent gets something
wrong. The log turns individual mistakes into rules, and that trail is itself
evidence of how the author works with AI.

## Add the entry

Append one row to the table in `docs/ai-log.md`:

| # | Date | What the agent did | Gate that caught it | Became a rule? |

- One row per mistake. One line each, factual, no excuses and no apology.
- Describe the behaviour, not the intent: "used a div with onClick instead of a
  button", not "misunderstood the requirement".
- Name the gate that caught it from the table at the top of the file. If no
  gate caught it and a human did, the gate is `human`, and that is the
  interesting case.
- English only, UK spelling, no em dashes.

Then update the counts table in the same file. Increment exactly one gate.

## Judge it

Report your assessment in your reply, not in the file:

1. Has this kind of mistake happened before in the log? Name the entry numbers.
2. If it has happened twice or more, it should become a rule. Quote the one
   AGENTS.md line you would add, in `MUST` / `SHOULD` / `MAY` form.
3. Could a cheaper gate have caught it? A lint rule beats a review comment,
   because it catches it the moment it happens and it never gets tired. If a
   lint rule would have caught this, name the rule and the plugin.
4. If no gate could have caught it, say so. Some mistakes are only visible to a
   person, and knowing which ones those are is the point of the log.

## Stop and ask the author before

- Editing AGENTS.md
- Editing the ESLint configuration
- Adding or changing a hook

Propose the exact change, say what it would have caught, and wait.

## Do not

- Do not soften an entry or leave one out because it reflects badly on an agent
- Do not record the same mistake twice; update the existing row instead
- Do not change the counts of more than one gate
- Do not commit
