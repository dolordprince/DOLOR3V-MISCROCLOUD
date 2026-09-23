#!/usr/bin/env bash
set -euo pipefail

BASE="https://dolor3v-microcloud.personaldolor.workers.dev"

echo "============================================================"
echo " DOLOR3V MICROCLOUD — STRICT LIVE TERMINAL TEST"
echo "============================================================"
echo "BASE: $BASE"

request() {
  local NAME="$1"
  local METHOD="$2"
  local URL="$3"
  local DATA="${4:-}"
  local EXPECTED="${5:-200}"

  echo
  echo "------------------------------------------------------------"
  echo "$NAME"
  echo "------------------------------------------------------------"
  echo "$METHOD $URL"

  local TMP
  TMP="$(mktemp)"

  local STATUS

  if [ "$METHOD" = "GET" ]; then
    STATUS="$(
      curl -sS \
        --connect-timeout 10 \
        --max-time 120 \
        -o "$TMP" \
        -w '%{http_code}' \
        "$URL" || true
    )"
  else
    STATUS="$(
      curl -sS \
        --connect-timeout 10 \
        --max-time 180 \
        -o "$TMP" \
        -w '%{http_code}' \
        -X "$METHOD" \
        "$URL" \
        -H "Content-Type: application/json" \
        --data "$DATA" || true
    )"
  fi

  echo "HTTP STATUS: $STATUS"
  echo "RESPONSE:"
  cat "$TMP"
  echo

  if [ "$STATUS" != "$EXPECTED" ]; then
    echo "FAIL: $NAME — expected HTTP $EXPECTED, got $STATUS"
    rm -f "$TMP"
    return 1
  fi

  echo "PASS: $NAME — HTTP $STATUS"
  rm -f "$TMP"
}

request \
  "HEALTH" \
  "GET" \
  "$BASE/api/health"

request \
  "ROOT APPLICATION" \
  "GET" \
  "$BASE/"

request \
  "MODELS ENDPOINT" \
  "GET" \
  "$BASE/v1/models"

request \
  "POLLINATIONS AI" \
  "POST" \
  "$BASE/api/ai" \
  '{"prompt":"Reply with exactly: DOLOR3V LIVE AI WORKING"}'

request \
  "IMAGE GENERATION" \
  "POST" \
  "$BASE/api/image" \
  '{"prompt":"luxury futuristic AI cloud workspace, DOLOR3V Microcloud, cinematic 3D interface","width":512,"height":512}'

request \
  "BROWSER RUN" \
  "POST" \
  "$BASE/api/browser" \
  '{"url":"https://example.com"}'

echo
echo "============================================================"
echo " ALL STRICT LIVE TESTS PASSED"
echo "============================================================"
echo "REMOTE: $BASE"
echo "============================================================"
echo "DEPLOYMENT VERIFIED"
