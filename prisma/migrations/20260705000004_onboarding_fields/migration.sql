-- Onboarding: document acknowledgment + interactive-tour completion flags.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "docsAcknowledgedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingTourDone" BOOLEAN NOT NULL DEFAULT false;
