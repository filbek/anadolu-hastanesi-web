#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="$script_dir/.env.glm"

if [ ! -f "$env_file" ]; then
  echo ".env.glm not found next to this script." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

echo "GLM-5.2 aktif (ANTHROPIC_BASE_URL=$ANTHROPIC_BASE_URL, model=$ANTHROPIC_MODEL)"
exec claude "$@"
