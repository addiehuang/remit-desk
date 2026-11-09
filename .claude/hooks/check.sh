#!/usr/bin/env bash
# PostToolUse: lint the file the agent just wrote and report the problems back
# to it. The file is already written at this point, so exit code 2 does not undo
# the edit; it feeds stderr to the agent so it fixes the file itself.
#
# Deliberately eslint only. `pnpm typecheck` runs `next typegen && tsc` over the
# whole project and takes too long to sit on every write. Types are checked by
# the /pr skill and by CI.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

payload=$(cat)
file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')

case "$file" in
  *.ts | *.tsx | *.mjs) ;;
  *) exit 0 ;;
esac

[ -f "$file" ] || exit 0

if ! output=$(pnpm exec eslint --no-warn-ignored --max-warnings=0 "$file" 2>&1); then
  printf 'ESLint failed on %s. Fix this before moving on:\n%s\n' "$file" "$output" >&2
  exit 2
fi
