-- Partner tracking links + flexible outbound webhooks + commission maturity

-- PartnerLink (campaign links for sales partners)
CREATE TABLE "PartnerLink" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT,
    "destinationUrl" TEXT NOT NULL DEFAULT '/',
    "label" TEXT,
    "campaignId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "leadCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerLink_code_key" ON "PartnerLink"("code");
CREATE INDEX "PartnerLink_code_idx" ON "PartnerLink"("code");
CREATE INDEX "PartnerLink_partnerId_idx" ON "PartnerLink"("partnerId");

ALTER TABLE "PartnerLink" ADD CONSTRAINT "PartnerLink_partnerId_fkey"
    FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partner click totals
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "totalClicks" INTEGER NOT NULL DEFAULT 0;

-- Click: support partner attribution alongside affiliate
ALTER TABLE "Click" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
ALTER TABLE "Click" ADD COLUMN IF NOT EXISTS "partnerLinkId" TEXT;
ALTER TABLE "Click" ALTER COLUMN "affiliateId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "Click_partnerId_idx" ON "Click"("partnerId");

ALTER TABLE "Click" ADD CONSTRAINT "Click_partnerId_fkey"
    FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Click" ADD CONSTRAINT "Click_partnerLinkId_fkey"
    FOREIGN KEY ("partnerLinkId") REFERENCES "PartnerLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Require at least one attribution owner per click
ALTER TABLE "Click" ADD CONSTRAINT "Click_attribution_owner_check"
    CHECK ("affiliateId" IS NOT NULL OR "partnerId" IS NOT NULL);

-- Commission maturity (NET-15 / hold window before payout eligibility)
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "maturesAt" TIMESTAMP(3);

-- Outbound webhook subscriptions (n8n, Zapier, custom)
CREATE TABLE "OutboundWebhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundWebhook_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OutboundWebhook_isActive_idx" ON "OutboundWebhook"("isActive");

CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "responseCode" INTEGER,
    "lastError" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");
CREATE INDEX "WebhookDelivery_eventType_idx" ON "WebhookDelivery"("eventType");
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey"
    FOREIGN KEY ("webhookId") REFERENCES "OutboundWebhook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
