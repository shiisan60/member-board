#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/set-vercel-env.sh <project> <team (optional)>
PROJECT=
TEAM=
if [ -z "" ]; then
  echo "Usage: bash <vercel-project-name> [team-slug]" >&2
  exit 1
fi

# Requires: vercel CLI logged in (vercel login)
# Reads values from current shell env for safety.
set_var(){
  local KEY=; local VALUE=; local ENVIRON=production
  if [ -z "" ]; then
    echo "[skip]  is empty; set it in your shell then rerun" >&2
    return 0
  fi
  if [ -n "" ]; then TEAM_FLAG="--scope "; else TEAM_FLAG=""; fi
  vercel env add    --yes <<< "" >/dev/null || true
  echo "[ok]  -> "
}

# Required
set_var NEXTAUTH_SECRET "" production
set_var DATABASE_URL "" production
set_var GOOGLE_CLIENT_ID "" production
set_var GOOGLE_CLIENT_SECRET "" production
set_var AUTH_TRUST_HOST "true" production
set_var NEXTAUTH_URL "" production
set_var AUTH_URL "" production

# Sentry (optional)
set_var NEXT_PUBLIC_SENTRY_DSN "" production
set_var SENTRY_AUTH_TOKEN "" production
set_var SENTRY_ORG "" production
set_var SENTRY_PROJECT "" production

echo "Done. Review on Vercel dashboard -> Settings -> Environment Variables"
