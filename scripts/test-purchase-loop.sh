#!/usr/bin/env bash
# End-to-end purchase-loop test: /s/ link → attribution cookie → v1 purchase
# → idempotency guards → commission expectations.
#
# Usage:
#   BASE_URL=https://weshare.orengen.io \
#   WESHARE_API_KEY=wsk_... \
#   PARTNER_CODE=P<code> \
#   TEST_EMAIL="loop-test+$(date +%s)@orengen.io" \
#   bash scripts/test-purchase-loop.sh
#
# Safe to run against prod with a throwaway TEST_EMAIL: it creates one test
# lead + one SETUP_FEE and one MONTHLY conversion attributed to PARTNER_CODE.
# Clean up after: delete the lead in admin (or ignore — it's inert test data).
# NOTE: this WILL create real PENDING commissions for that partner — use a
# house/test partner account, then void via admin if needed.

set -euo pipefail

: "${BASE_URL:?set BASE_URL}"
: "${WESHARE_API_KEY:?set WESHARE_API_KEY}"
: "${PARTNER_CODE:?set PARTNER_CODE}"
TEST_EMAIL="${TEST_EMAIL:-loop-test+$(date +%s)@orengen.io}"

pass() { printf '  \033[32m✓ %s\033[0m\n' "$1"; }
fail() { printf '  \033[31m✗ %s\033[0m\n' "$1"; exit 1; }

echo "1) /s/${PARTNER_CODE} redirect + attribution cookie"
HDRS=$(curl -sS -o /dev/null -D - "${BASE_URL}/s/${PARTNER_CODE}?dest=https://orengen.io/")
echo "$HDRS" | grep -qE "^HTTP/[0-9.]+ 30[27]" && pass "redirects (302/307)" || fail "no redirect — is the partner code active?"
echo "$HDRS" | grep -qi "set-cookie: ws_vid=" && pass "ws_vid attribution cookie set" || fail "no ws_vid cookie"

echo "2) v1 purchase — SETUP_FEE attributed to ${PARTNER_CODE}"
R1=$(curl -sS -X POST "${BASE_URL}/api/v1/track/purchase" \
  -H "Content-Type: application/json" -H "X-WeShare-Api-Key: ${WESHARE_API_KEY}" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"amount\":1244,\"type\":\"SETUP_FEE\",\"partnerCode\":\"${PARTNER_CODE}\",\"traceId\":\"loop-test\"}")
echo "$R1" | grep -q '"conversionId"' && pass "conversion created: $R1" || fail "no conversion: $R1"

echo "3) idempotency — same purchase again must NOT double-pay"
R2=$(curl -sS -X POST "${BASE_URL}/api/v1/track/purchase" \
  -H "Content-Type: application/json" -H "X-WeShare-Api-Key: ${WESHARE_API_KEY}" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"amount\":1244,\"type\":\"SETUP_FEE\",\"partnerCode\":\"${PARTNER_CODE}\"}")
echo "$R2" | grep -q '"duplicate":true' && pass "duplicate SETUP_FEE rejected" || fail "DOUBLE-PAY RISK: $R2"

echo "4) monthly residual + its idempotency"
R3=$(curl -sS -X POST "${BASE_URL}/api/v1/track/purchase" \
  -H "Content-Type: application/json" -H "X-WeShare-Api-Key: ${WESHARE_API_KEY}" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"amount\":247,\"type\":\"MONTHLY_MAINTENANCE\",\"partnerCode\":\"${PARTNER_CODE}\"}")
echo "$R3" | grep -q '"conversionId"' && pass "monthly conversion created" || fail "monthly failed: $R3"
R4=$(curl -sS -X POST "${BASE_URL}/api/v1/track/purchase" \
  -H "Content-Type: application/json" -H "X-WeShare-Api-Key: ${WESHARE_API_KEY}" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"amount\":247,\"type\":\"MONTHLY_MAINTENANCE\",\"partnerCode\":\"${PARTNER_CODE}\"}")
echo "$R4" | grep -q '"duplicate":true' && pass "duplicate monthly (same month) rejected" || fail "DOUBLE-PAY RISK: $R4"

echo "5) bad key must be rejected"
CODE=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/v1/track/purchase" \
  -H "Content-Type: application/json" -H "X-WeShare-Api-Key: wrong-key" -d '{}')
[ "$CODE" = "401" ] && pass "401 on bad key" || fail "expected 401, got $CODE"

cat <<EOF

ALL AUTOMATED CHECKS PASSED ✅

Manual verification (admin dashboard):
  • Admin → Commissions: PARTNER_SETUP \$249.25 (25% of \$997 — note the \$1,244
    bundle was normalized to the \$997 package fee) + PARTNER_RESIDUAL \$61.75,
    both PENDING with maturesAt ≈ +15 days, for partner ${PARTNER_CODE}.
  • Admin → Leads: test lead ${TEST_EMAIL} attributed to the partner.
  • Then void/clean the test data.
EOF
