#!/usr/bin/env bash
set -euo pipefail

ROOT="/root/dolor3v-microcloud"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is not set}"
API_TOKEN="${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is not set}"
SCRIPT_NAME="dolor3v-microcloud"
BASE="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}"
LIVE_URL="https://dolor3v-microcloud.personaldolor.workers.dev"

cd "$ROOT"

echo "============================================================"
echo " DOLOR3V MICROCLOUD DIRECT CLOUDFLARE API DEPLOY"
echo "============================================================"

test -f dist/index.js || {
  echo "FAIL: dist/index.js missing"
  echo "Run: npm run build"
  exit 1
}

grep -q '"tag": "v1"' wrangler.jsonc || {
  echo "FAIL: migration v1 missing"
  exit 1
}

grep -q '"MicrocloudAgentDO"' wrangler.jsonc || {
  echo "FAIL: MicrocloudAgentDO missing"
  exit 1
}

echo "PASS: DIST BUNDLE"
echo "PASS: MIGRATION v1 PRESERVED"
echo "PASS: MicrocloudAgentDO PRESERVED"

echo
echo "STEP 1/3 — VERIFY CLOUDFLARE API"

AUTH_TMP="$(mktemp)"

AUTH_STATUS="$(
  curl -sS \
    --connect-timeout 15 \
    --max-time 45 \
    -o "$AUTH_TMP" \
    -w '%{http_code}' \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    -H "Content-Type: application/json"
)"

if [ "$AUTH_STATUS" != "200" ]; then
  echo "FAIL: CLOUDFLARE API AUTH HTTP $AUTH_STATUS"
  cat "$AUTH_TMP"
  rm -f "$AUTH_TMP"
  exit 1
fi

rm -f "$AUTH_TMP"

echo "PASS: CLOUDFLARE API AUTH"

echo
echo "STEP 2/3 — UPLOAD COMPLETE ES MODULE GRAPH"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cp -a dist/. "$TMP_DIR/"

test -f "$TMP_DIR/index.js" || {
  echo "FAIL: index.js missing"
  exit 1
}

MODULE_COUNT="$(find "$TMP_DIR" -type f | wc -l | tr -d ' ')"

echo "PASS: MAIN MODULE: index.js"
echo "PASS: MODULE FILES: $MODULE_COUNT"

METADATA='{"main_module":"index.js"}'
UPLOAD_TMP="$TMP_DIR/upload-response.json"

FORM_ARGS=(
  -F "metadata=${METADATA};type=application/json"
)

while IFS= read -r -d '' FILE; do
  REL="${FILE#"$TMP_DIR"/}"

  case "$REL" in
    *.js|*.mjs)
      FORM_ARGS+=(
        -F "files=@${FILE};filename=${REL};type=application/javascript+module"
      )
      ;;
    *.map)
      FORM_ARGS+=(
        -F "files=@${FILE};filename=${REL};type=application/source-map"
      )
      ;;
    *)
      FORM_ARGS+=(
        -F "files=@${FILE};filename=${REL};type=application/octet-stream"
      )
      ;;
  esac
done < <(find "$TMP_DIR" -type f -print0)

HTTP_STATUS="$(
  curl -sS \
    --connect-timeout 30 \
    --max-time 300 \
    -o "$UPLOAD_TMP" \
    -w '%{http_code}' \
    -X PUT \
    "$BASE/content" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    "${FORM_ARGS[@]}"
)"

echo "UPLOAD HTTP STATUS: $HTTP_STATUS"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "FAIL: DIRECT WORKER CONTENT UPLOAD"
  cat "$UPLOAD_TMP"
  exit 1
fi

if ! grep -Eq '"success"[[:space:]]*:[[:space:]]*true' "$UPLOAD_TMP"; then
  echo "FAIL: CLOUDFLARE REJECTED WORKER CONTENT"
  cat "$UPLOAD_TMP"
  exit 1
fi

echo "PASS: DIRECT WORKER CONTENT UPLOAD"

echo
echo "STEP 3/3 — VERIFY REMOTE APPLICATION"

HEALTH_TMP="$TMP_DIR/health.json"
HEALTH_OK="false"

for ATTEMPT in 1 2 3 4 5 6 7 8 9 10; do
  echo "Health check ${ATTEMPT}/10..."

  STATUS="$(
    curl -sS \
      --connect-timeout 10 \
      --max-time 30 \
      -o "$HEALTH_TMP" \
      -w '%{http_code}' \
      "${LIVE_URL}/api/health" \
      || true
  )"

  if [ "$STATUS" = "200" ] &&
     grep -Eq '"ok"[[:space:]]*:[[:space:]]*true' "$HEALTH_TMP"; then
    HEALTH_OK="true"
    echo "PASS: REMOTE APPLICATION RESPONDS"
    cat "$HEALTH_TMP"
    break
  fi

  sleep 3
done

if [ "$HEALTH_OK" != "true" ]; then
  echo
  echo "FAIL: REMOTE APPLICATION HEALTH CHECK"
  echo "HTTP STATUS: ${STATUS:-unknown}"
  cat "$HEALTH_TMP" 2>/dev/null || true
  exit 1
fi

echo
echo "============================================================"
echo " DEPLOYMENT VERIFIED"
echo "============================================================"
