#!/usr/bin/env bash
# PreToolUse: while .claude/lock-tests exists, the tests are the fixed answer
# key. Exit code 2 here blocks the tool call, so the file is never touched.
#
# Two holes to cover, not one: editing a test file, and removing the lock to get
# at the test file afterwards. Only the author removes the lock, after the pull
# request is merged.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f .claude/lock-tests ] || exit 0

payload=$(cat)
tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')
command=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')

deny() {
  printf 'Tests are frozen, because .claude/lock-tests exists. %s\nChange the implementation instead. If an acceptance criterion is itself wrong, stop and tell the author.\n' "$1" >&2
  exit 2
}

if [ "$tool" = "Bash" ] && printf '%s' "$command" | grep -q 'lock-tests'; then
  deny "Only the author removes the lock."
fi

# Story files hold the play-function tests for the browser acceptance criteria,
# so they are part of the answer key too.
case "$file" in
  *.test.ts | *.test.tsx | *e2e/*.spec.ts | *.stories.ts | *.stories.tsx) deny "Refusing to modify $file." ;;
esac
