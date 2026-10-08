#!/usr/bin/env bash
set -uo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

run_id="$(date -u '+%Y%m%d-%H%M%S')"
results_directory="$(mktemp -d "$repo_root/test-results/local-$run_id-XXXXXX")"
started_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
summary_path="$results_directory/summary.md"
failed=0

printf '# Local test run\n\n- Started: %s\n- Results: `test-results/%s/`\n\n| Check | Result | Exit code | Log |\n| --- | --- | ---: | --- |\n' \
  "$started_at" "${results_directory##*/}" > "$summary_path"

run_check() {
  local name="$1"
  shift
  local log_path="$results_directory/$name.log"

  printf '\n==> %s\n' "$name"
  "$@" 2>&1 | tee "$log_path"
  local exit_code="${PIPESTATUS[0]}"
  local status='PASS'
  if [[ "$exit_code" -ne 0 ]]; then
    status='FAIL'
    failed=1
  fi
  printf '%s (%s): %s\n' "$status" "$exit_code" "$name"
  printf '| %s | %s | %s | `%s.log` |\n' "$name" "$status" "$exit_code" "$name" >> "$summary_path"
}

playwright_path() {
  if ! command -v node >/dev/null 2>&1 && command -v wslpath >/dev/null 2>&1; then
    wslpath -w "$1"
  else
    printf '%s' "$1"
  fi
}

run_check check npm run check
run_check unit npm test
run_check build npm run build

artifact_output_path="$(playwright_path "$results_directory/playwright-artifacts")"
unset PLAYWRIGHT_HTML_OUTPUT_DIR
run_check playwright npm run test:e2e -- --reporter=list,html --output "$artifact_output_path"
if [[ -f "$repo_root/playwright-report/index.html" ]]; then
  mv "$repo_root/playwright-report" "$results_directory/playwright-report"
fi

printf '\nPlaywright report: `playwright-report/index.html`\n' >> "$summary_path"
printf '\nResults saved to: %s\n' "$results_directory"
exit "$failed"