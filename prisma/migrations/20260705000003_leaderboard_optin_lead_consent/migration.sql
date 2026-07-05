-- Public-leaderboard opt-in consent (default false = not published)
ALTER TABLE "AffiliateProfile" ADD COLUMN IF NOT EXISTS "showOnLeaderboard" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PartnerProfile"   ADD COLUMN IF NOT EXISTS "showOnLeaderboard" BOOLEAN NOT NULL DEFAULT false;

-- TCPA consent capture on leads
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "smsConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "consentText" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "consentCapturedAt" TIMESTAMP(3);
