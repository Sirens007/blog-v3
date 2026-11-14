#!/usr/bin/env bash
# Executed through SSH stdin. Nginx continues to serve /var/www/blog/dist.
set -euo pipefail

action=${1:?Missing action}
release_id=${2:?Missing release ID}
commit=${3:?Missing commit SHA}
[[ "$release_id" =~ ^[0-9]+-[0-9]+$ ]]
[[ "$commit" =~ ^[a-f0-9]{40}$ ]]
[[ "$action" == prepare || "$action" == activate || "$action" == rollback ]]

root=/var/www/blog
state=$root/.blog-v3
live=$root/dist
release=$state/releases/$release_id
journal=$state/deployments/$release_id.previous
next=$state/next-$release_id

# Refuse unexpected symlinks before writing or moving any directories.
[[ -d "$root" && "$(realpath "$root")" == "$root" ]]
for directory in "$state" "$state/releases" "$state/backups" "$state/deployments"; do
  [[ ! -L "$directory" ]]
  mkdir -p "$directory"
  chmod 755 "$directory"
done
exec 9> "$state/deploy.lock"
flock -x 9
[[ ! -L "$release" && ! -L "$journal" && ! -e "$next" && ! -L "$next" ]]

validate_previous() {
  local previous=$1
  case "$previous" in
    "$state/releases/"*|"$state/backups/"*) ;;
    *) echo 'Unexpected previous deployment path.' >&2; return 1 ;;
  esac
  [[ -d "$previous" && "$(realpath "$previous")" == "$previous" && -s "$previous/index.html" ]]
}

case "$action" in
  prepare)
    [[ ! -e "$release" ]]
    mkdir -m 755 "$release"
    ;;
  activate)
    [[ -s "$release/index.html" && -s "$release/archive/index.html" && -s "$release/link/index.html" ]]
    [[ "$(cat "$release/deploy-version.txt")" == "$commit" ]]
    [[ ! -e "$journal" ]]

    if [[ -L "$live" ]]; then
      previous=$(realpath "$live")
      validate_previous "$previous"
    else
      [[ -d "$live" && -s "$live/index.html" ]]
      previous=$state/backups/initial-$release_id
      [[ ! -e "$previous" ]]
    fi
    printf '%s\n' "$previous" > "$journal"
    ln -s "$release" "$next"

    # Preserve the original Shirone directory on the first deployment.
    if [[ ! -L "$live" ]]; then
      mv -T "$live" "$previous"
    fi
    if ! mv -Tf "$next" "$live"; then
      rm -f "$next"
      if [[ ! -e "$live" && ! -L "$live" ]]; then
        mv -T "$previous" "$live"
      fi
      exit 1
    fi
    printf 'Activated release %s (%s)\n' "$release_id" "$commit"
    ;;
  rollback)
    # A failed SSH command may have stopped before activation; then leave live alone.
    if [[ ! -L "$live" || "$(realpath "$live")" != "$release" ]]; then
      echo 'This release is not live; no rollback needed.'
      exit 0
    fi
    previous=$(cat "$journal")
    validate_previous "$previous"
    ln -s "$previous" "$next"
    mv -Tf "$next" "$live"
    printf 'Restored previous deployment: %s\n' "$previous"
    ;;
esac
