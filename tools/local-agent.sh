#!/usr/bin/env bash
set -Eeuo pipefail

readonly EXIT_USAGE=2
readonly EXIT_PREREQUISITE=3
readonly EXIT_REPOSITORY=4
readonly EXIT_AGENT=5

usage() {
  cat <<'EOF'
Sicherer lokaler Aider-Worker in einem separaten Git-Worktree.

Aufruf:
  tools/local-agent.sh AUFGABENDATEI RELATIVE_DATEI [RELATIVE_DATEI ...]

Beispiel:
  mkdir -p .local-agent/tasks
  printf '%s\n' 'Korrigiere nur Rechtschreibung; ändere keine Aussagen.' \
    > .local-agent/tasks/task.md
  tools/local-agent.sh .local-agent/tasks/task.md README.md docs/product/VISION.md

Voraussetzungen:
  - sauberes Git-Arbeitsverzeichnis (auch keine unversionierten Dateien)
  - lokal laufendes Ollama mit qwen2.5-coder:3b
  - Aider im PATH

Das Skript erzeugt weder Commit noch Push. Der Worktree und das Log bleiben
unter .local-agent/ zur manuellen Prüfung erhalten.

Exit-Codes: 0 Erfolg, 2 Bedienfehler, 3 Voraussetzung fehlt,
            4 Repository/Worktree-Fehler, 5 Aider fehlgeschlagen.
EOF
}

fail() {
  local code="$1"
  shift
  printf 'Fehler: %s\n' "$*" >&2
  exit "$code"
}

[[ "${1:-}" != "--help" && "${1:-}" != "-h" ]] || { usage; exit 0; }
(( $# >= 2 )) || { usage >&2; exit "$EXIT_USAGE"; }

command -v git >/dev/null 2>&1 || fail "$EXIT_PREREQUISITE" "git fehlt im PATH."
command -v ollama >/dev/null 2>&1 || fail "$EXIT_PREREQUISITE" "Ollama fehlt im PATH."
command -v aider >/dev/null 2>&1 || fail "$EXIT_PREREQUISITE" "Aider fehlt im PATH."

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || \
  fail "$EXIT_REPOSITORY" "Aufruf muss innerhalb eines Git-Repositorys erfolgen."
[[ "$PWD" == "$repo_root" ]] || \
  fail "$EXIT_USAGE" "Bitte vom Repository-Stamm aus aufrufen: $repo_root"
[[ -z "$(git status --porcelain --untracked-files=all)" ]] || \
  fail "$EXIT_REPOSITORY" "Arbeitsverzeichnis ist nicht sauber. Änderungen zuerst sichern oder committen."
agent_root="$repo_root/.local-agent"
agent_root_physical="$(cd "$agent_root" 2>/dev/null && pwd -P)" || \
  fail "$EXIT_REPOSITORY" "Lokales Agentenverzeichnis fehlt oder ist nicht lesbar: .local-agent"

task_file="$1"
shift
[[ "$task_file" == .local-agent/tasks/* && "$task_file" != *".."* ]] || \
  fail "$EXIT_USAGE" "Die Aufgabendatei muss unter .local-agent/tasks/ liegen und darf kein '..' enthalten."
[[ -f "$task_file" && ! -L "$task_file" ]] || \
  fail "$EXIT_USAGE" "Aufgabendatei fehlt, ist kein reguläres File oder ist ein Symlink: $task_file"
task_directory="$(cd "$(dirname "$task_file")" 2>/dev/null && pwd -P)" || \
  fail "$EXIT_USAGE" "Verzeichnis der Aufgabendatei ist nicht lesbar: $task_file"
case "$task_directory/" in
  "$agent_root_physical/tasks/"*) ;;
  *) fail "$EXIT_USAGE" "Die Aufgabendatei darf nicht über einen Symlink aus .local-agent/tasks/ herausführen." ;;
esac
task_file_abs="$task_directory/$(basename "$task_file")"

declare -a allowed_files=()
for file in "$@"; do
  [[ -n "$file" && "$file" != /* && "$file" != *".."* && "$file" != .git && "$file" != .git/* ]] || \
    fail "$EXIT_USAGE" "Nur relative Dateipfade ohne '..' oder .git sind erlaubt: $file"
  tracked_file="$(git ls-files --full-name --error-unmatch -- "$file" 2>/dev/null)" || \
    fail "$EXIT_USAGE" "Datei ist nicht versioniert: $file"
  [[ "$tracked_file" != *$'\n'* && -f "$tracked_file" && ! -L "$tracked_file" ]] || \
    fail "$EXIT_USAGE" "Erlaubte Datei ist kein eindeutiges reguläres File oder ist ein Symlink: $file"
  duplicate=false
  if (( ${#allowed_files[@]} > 0 )); then
    for allowed_file in "${allowed_files[@]}"; do
      [[ "$allowed_file" == "$tracked_file" ]] && duplicate=true
    done
  fi
  [[ "$duplicate" == true ]] && continue
  allowed_files+=("$tracked_file")
done
(( ${#allowed_files[@]} > 0 )) || fail "$EXIT_USAGE" "Mindestens eine Datei ist erforderlich."

ollama list 2>/dev/null | awk 'NR > 1 {print $1}' | grep -Eq '^qwen2\.5-coder:3b($|-)' || \
  fail "$EXIT_PREREQUISITE" "Ollama-Modell qwen2.5-coder:3b ist lokal nicht verfügbar oder Ollama antwortet nicht."

run_id="$(date -u '+%Y%m%dT%H%M%SZ')-$$"
worktree="$agent_root/worktrees/$run_id"
log_file="$agent_root/logs/$run_id.log"
mkdir -p "$agent_root/worktrees" "$agent_root/logs"

base_commit="$(git rev-parse HEAD)" || \
  fail "$EXIT_REPOSITORY" "Ausgangs-Commit konnte nicht bestimmt werden."
git worktree add --detach "$worktree" HEAD >/dev/null || \
  fail "$EXIT_REPOSITORY" "Worktree konnte nicht erzeugt werden."

{
  printf 'Start (UTC): %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  printf 'Ausgangs-Commit: %s\n' "$base_commit"
  printf 'Worktree: %s\n' "$worktree"
  printf 'Modell: ollama_chat/qwen2.5-coder:3b\n'
  printf 'Erlaubte Dateien:\n'
  printf '  %s\n' "${allowed_files[@]}"
} >"$log_file"

set +e
(
  cd "$worktree"
  aider \
    --model ollama_chat/qwen2.5-coder:3b \
    --message-file "$task_file_abs" \
    --yes \
    --no-auto-commits \
    --no-dirty-commits \
    --no-suggest-shell-commands \
    --no-gitignore \
    --map-tokens 0 \
    --input-history-file "$agent_root/logs/$run_id.input-history" \
    --chat-history-file "$agent_root/logs/$run_id.chat-history.md" \
    --analytics-disable \
    --no-check-update \
    -- "${allowed_files[@]}"
) 2>&1 | tee -a "$log_file"
agent_status=${PIPESTATUS[0]}
set -e

if (( agent_status != 0 )); then
  printf '\nAider ist mit Status %d fehlgeschlagen. Worktree zur Diagnose: %s\n' \
    "$agent_status" "$worktree" >&2
  printf 'Log (kann Prompt-/Codeinhalt enthalten): %s\n' "$log_file" >&2
  exit "$EXIT_AGENT"
fi

worktree_commit="$(git -C "$worktree" rev-parse HEAD)" || \
  fail "$EXIT_REPOSITORY" "Worktree-Commit konnte nach dem Agentenlauf nicht bestimmt werden."
if [[ "$worktree_commit" != "$base_commit" ]]; then
  printf 'Scope-Verstoß: Der lokale Agent hat den Worktree-Commit verändert.\n' \
    | tee -a "$log_file" >&2
  printf 'Es wurde nichts übernommen. Prüfe oder verwirf den isolierten Worktree: %s\n' \
    "$worktree" >&2
  exit "$EXIT_AGENT"
fi

scope_violation=false
while IFS= read -r -d '' changed_file; do
  file_allowed=false
  for allowed_file in "${allowed_files[@]}"; do
    [[ "$changed_file" == "$allowed_file" ]] && file_allowed=true
  done
  if [[ "$file_allowed" == false ]]; then
    printf 'Scope-Verstoß: Aider hat die nicht freigegebene Datei %q geändert.\n' \
      "$changed_file" | tee -a "$log_file" >&2
    scope_violation=true
  fi
done < <(
  git -C "$worktree" diff --name-only -z HEAD
  git -C "$worktree" ls-files --others --exclude-standard -z
)

if [[ "$scope_violation" == true ]]; then
  printf 'Es wurde nichts übernommen. Prüfe oder verwirf den isolierten Worktree: %s\n' \
    "$worktree" >&2
  exit "$EXIT_AGENT"
fi

printf '\nLokaler Agent beendet. Es wurde nichts übernommen oder committet.\n'
printf 'Review:\n  git -C %q status --short\n  git -C %q diff --check\n  git -C %q diff\n' \
  "$worktree" "$worktree" "$worktree"
printf 'Log (kann Prompt-/Codeinhalt enthalten): %s\n' "$log_file"
printf '\nNach erfolgreichem Review gibt es zwei bewusste Wege:\n'
printf '  1. Patch übernehmen: git -C %q diff > .local-agent/%s.patch\n' "$worktree" "$run_id"
printf '     danach im Haupt-Worktree: git apply --check .local-agent/%s.patch && git apply .local-agent/%s.patch\n' "$run_id" "$run_id"
printf '  2. Nur bei ausdrücklichem Commit-Auftrag im Agent-Worktree committen;\n'
printf '     anschließend den angezeigten Commit mit git cherry-pick <COMMIT> übernehmen.\n'
