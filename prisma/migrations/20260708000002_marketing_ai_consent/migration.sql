-- Separate marketing + AI-follow-up consent flags on Lead, independently
-- timestamped (service/SMS consent already exists as smsConsent).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "marketingConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "marketingConsentAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "aiFollowupConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "aiFollowupConsentAt" TIMESTAMP(3);
