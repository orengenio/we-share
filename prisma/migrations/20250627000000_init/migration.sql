-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AFFILIATE', 'PARTNER');

-- CreateEnum
CREATE TYPE "AffiliateRank" AS ENUM ('CATALYST', 'BUILDER', 'ARCHITECT', 'SOVEREIGN');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('SETUP_FEE', 'MONTHLY_MAINTENANCE', 'FAST_START_BONUS', 'ARMY_OVERRIDE_SETUP', 'ARMY_OVERRIDE_RESIDUAL', 'PARTNER_SETUP', 'PARTNER_RESIDUAL', 'LEADER_SETUP_OVERRIDE', 'LEADER_RESIDUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CLAWBACK', 'VOID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'APPOINTMENT', 'PROPOSAL', 'WON', 'LOST', 'NURTURE');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConversionType" AS ENUM ('SETUP_FEE', 'MONTHLY_MAINTENANCE');

-- CreateEnum
CREATE TYPE "FraudSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FraudResolution" AS ENUM ('DISMISSED', 'WARNED', 'SUSPENDED', 'TERMINATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AFFILIATE',
    "emailVerified" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "phone" TEXT,
    "timezone" TEXT DEFAULT 'America/Chicago',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "affiliateCode" TEXT NOT NULL,
    "rank" "AffiliateRank" NOT NULL DEFAULT 'CATALYST',
    "lifetimeSales" INTEGER NOT NULL DEFAULT 0,
    "uplineId" TEXT,
    "stripeConnectId" TEXT,
    "stripeAccountStatus" TEXT,
    "taxId" TEXT,
    "w9Submitted" BOOLEAN NOT NULL DEFAULT false,
    "payoutMinimum" DOUBLE PRECISION NOT NULL DEFAULT 25.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "terminatedAt" TIMESTAMP(3),
    "strikeCount" INTEGER NOT NULL DEFAULT 0,
    "builderAt" TIMESTAMP(3),
    "architectAt" TIMESTAMP(3),
    "sovereignAt" TIMESTAMP(3),
    "firstSaleAt" TIMESTAMP(3),
    "fastStartBonusEarned" BOOLEAN NOT NULL DEFAULT false,
    "fastStartBonusPaid" BOOLEAN NOT NULL DEFAULT false,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
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

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "ghlContactId" TEXT,
    "ghlUserId" TEXT,
    "assignedPhoneNumber" TEXT,
    "crmSeatGrantedAt" TIMESTAMP(3),
    "stripeConnectId" TEXT,
    "stripeAccountStatus" TEXT,
    "taxId" TEXT,
    "w9Submitted" BOOLEAN NOT NULL DEFAULT false,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "promotedLeaderAt" TIMESTAMP(3),
    "uplineLeaderId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCertified" BOOLEAN NOT NULL DEFAULT false,
    "certifiedAt" TIMESTAMP(3),
    "leadsUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "leadsUnlockedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "terminatedAt" TIMESTAMP(3),
    "totalLeadsAssigned" INTEGER NOT NULL DEFAULT 0,
    "totalDealsWon" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLeaderOverrides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "linkId" TEXT,
    "visitorToken" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "fraudReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT,
    "partnerId" TEXT,
    "clickId" TEXT,
    "attributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attributionLocked" BOOLEAN NOT NULL DEFAULT true,
    "cookieExpiry" TIMESTAMP(3),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT,
    "source" TEXT,
    "ghlContactId" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedPartnerId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "lastTouchedAt" TIMESTAMP(3),
    "touchCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "firstTouchDeadline" TIMESTAMP(3),
    "firstTouchAt" TIMESTAMP(3),
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "isRecycled" BOOLEAN NOT NULL DEFAULT false,
    "recycledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "affiliateId" TEXT,
    "partnerId" TEXT,
    "type" "ConversionType" NOT NULL DEFAULT 'SETUP_FEE',
    "grossRevenue" DOUBLE PRECISION NOT NULL,
    "stripePaymentId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeChargeId" TEXT,
    "billingPeriod" TIMESTAMP(3),
    "subscriptionId" TEXT,
    "invoiceId" TEXT,
    "clawbackDeadline" TIMESTAMP(3) NOT NULL,
    "isRefunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMP(3),
    "stripeRefundId" TEXT,
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "conversionId" TEXT NOT NULL,
    "affiliateId" TEXT,
    "partnerId" TEXT,
    "type" "CommissionType" NOT NULL,
    "rankAtTime" "AffiliateRank",
    "grossRevenue" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "residualMonth" INTEGER,
    "residualExpiresAt" TIMESTAMP(3),
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "clawbackAt" TIMESTAMP(3),
    "clawbackReason" TEXT,
    "clawbackExecutedBy" TEXT,
    "isVoidEntry" BOOLEAN NOT NULL DEFAULT false,
    "originalCommId" TEXT,
    "voidMemo" TEXT,
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Override" (
    "id" TEXT NOT NULL,
    "conversionId" TEXT NOT NULL,
    "earnerId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "overrideType" TEXT NOT NULL,
    "rankAtTime" "AffiliateRank" NOT NULL,
    "overrideRate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "batchLabel" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "initiatedById" TEXT,
    "notes" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutItem" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "affiliateId" TEXT,
    "partnerId" TEXT,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "adjustments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "stripeTransferId" TEXT,
    "stripeAccountId" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT,
    "partnerId" TEXT,
    "commissionId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "filedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileDeadline" TIMESTAMP(3) NOT NULL,
    "statementDate" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GHLOpportunity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "partnerId" TEXT NOT NULL,
    "ghlOpportunityId" TEXT NOT NULL,
    "ghlPipelineId" TEXT,
    "ghlStageId" TEXT,
    "ghlContactId" TEXT,
    "title" TEXT,
    "status" TEXT,
    "monetaryValue" DOUBLE PRECISION,
    "assignedToGhlUserId" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GHLOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudFlag" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "FraudSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "ipAddress" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "resolution" "FraudResolution",
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FraudFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProfile_userId_key" ON "AffiliateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProfile_affiliateCode_key" ON "AffiliateProfile"("affiliateCode");

-- CreateIndex
CREATE INDEX "AffiliateProfile_affiliateCode_idx" ON "AffiliateProfile"("affiliateCode");

-- CreateIndex
CREATE INDEX "AffiliateProfile_uplineId_idx" ON "AffiliateProfile"("uplineId");

-- CreateIndex
CREATE INDEX "AffiliateProfile_rank_idx" ON "AffiliateProfile"("rank");

-- CreateIndex
CREATE INDEX "AffiliateProfile_isActive_idx" ON "AffiliateProfile"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateLink_code_key" ON "AffiliateLink"("code");

-- CreateIndex
CREATE INDEX "AffiliateLink_code_idx" ON "AffiliateLink"("code");

-- CreateIndex
CREATE INDEX "AffiliateLink_affiliateId_idx" ON "AffiliateLink"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_userId_key" ON "PartnerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_partnerCode_key" ON "PartnerProfile"("partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_ghlContactId_key" ON "PartnerProfile"("ghlContactId");

-- CreateIndex
CREATE INDEX "PartnerProfile_partnerCode_idx" ON "PartnerProfile"("partnerCode");

-- CreateIndex
CREATE INDEX "PartnerProfile_ghlContactId_idx" ON "PartnerProfile"("ghlContactId");

-- CreateIndex
CREATE INDEX "PartnerProfile_isActive_idx" ON "PartnerProfile"("isActive");

-- CreateIndex
CREATE INDEX "PartnerProfile_isLeader_idx" ON "PartnerProfile"("isLeader");

-- CreateIndex
CREATE INDEX "PartnerProfile_uplineLeaderId_idx" ON "PartnerProfile"("uplineLeaderId");

-- CreateIndex
CREATE INDEX "Click_affiliateId_idx" ON "Click"("affiliateId");

-- CreateIndex
CREATE INDEX "Click_visitorToken_idx" ON "Click"("visitorToken");

-- CreateIndex
CREATE INDEX "Click_ipHash_idx" ON "Click"("ipHash");

-- CreateIndex
CREATE INDEX "Click_createdAt_idx" ON "Click"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_clickId_key" ON "Lead"("clickId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_ghlContactId_key" ON "Lead"("ghlContactId");

-- CreateIndex
CREATE INDEX "Lead_affiliateId_idx" ON "Lead"("affiliateId");

-- CreateIndex
CREATE INDEX "Lead_partnerId_idx" ON "Lead"("partnerId");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_ghlContactId_idx" ON "Lead"("ghlContactId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_stripePaymentId_key" ON "Conversion"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Conversion_affiliateId_idx" ON "Conversion"("affiliateId");

-- CreateIndex
CREATE INDEX "Conversion_partnerId_idx" ON "Conversion"("partnerId");

-- CreateIndex
CREATE INDEX "Conversion_leadId_idx" ON "Conversion"("leadId");

-- CreateIndex
CREATE INDEX "Conversion_stripePaymentId_idx" ON "Conversion"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Conversion_stripeCustomerId_idx" ON "Conversion"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Conversion_createdAt_idx" ON "Conversion"("createdAt");

-- CreateIndex
CREATE INDEX "Commission_affiliateId_idx" ON "Commission"("affiliateId");

-- CreateIndex
CREATE INDEX "Commission_partnerId_idx" ON "Commission"("partnerId");

-- CreateIndex
CREATE INDEX "Commission_status_idx" ON "Commission"("status");

-- CreateIndex
CREATE INDEX "Commission_conversionId_idx" ON "Commission"("conversionId");

-- CreateIndex
CREATE INDEX "Commission_payoutId_idx" ON "Commission"("payoutId");

-- CreateIndex
CREATE INDEX "Commission_createdAt_idx" ON "Commission"("createdAt");

-- CreateIndex
CREATE INDEX "Override_earnerId_idx" ON "Override"("earnerId");

-- CreateIndex
CREATE INDEX "Override_sourceId_idx" ON "Override"("sourceId");

-- CreateIndex
CREATE INDEX "Override_conversionId_idx" ON "Override"("conversionId");

-- CreateIndex
CREATE INDEX "Override_status_idx" ON "Override"("status");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_periodStart_idx" ON "Payout"("periodStart");

-- CreateIndex
CREATE INDEX "Payout_scheduledDate_idx" ON "Payout"("scheduledDate");

-- CreateIndex
CREATE INDEX "PayoutItem_payoutId_idx" ON "PayoutItem"("payoutId");

-- CreateIndex
CREATE INDEX "PayoutItem_affiliateId_idx" ON "PayoutItem"("affiliateId");

-- CreateIndex
CREATE INDEX "PayoutItem_partnerId_idx" ON "PayoutItem"("partnerId");

-- CreateIndex
CREATE INDEX "PayoutItem_status_idx" ON "PayoutItem"("status");

-- CreateIndex
CREATE INDEX "Dispute_affiliateId_idx" ON "Dispute"("affiliateId");

-- CreateIndex
CREATE INDEX "Dispute_partnerId_idx" ON "Dispute"("partnerId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_createdAt_idx" ON "Dispute"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GHLOpportunity_leadId_key" ON "GHLOpportunity"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "GHLOpportunity_ghlOpportunityId_key" ON "GHLOpportunity"("ghlOpportunityId");

-- CreateIndex
CREATE INDEX "GHLOpportunity_partnerId_idx" ON "GHLOpportunity"("partnerId");

-- CreateIndex
CREATE INDEX "GHLOpportunity_ghlOpportunityId_idx" ON "GHLOpportunity"("ghlOpportunityId");

-- CreateIndex
CREATE INDEX "GHLOpportunity_ghlContactId_idx" ON "GHLOpportunity"("ghlContactId");

-- CreateIndex
CREATE INDEX "FraudFlag_affiliateId_idx" ON "FraudFlag"("affiliateId");

-- CreateIndex
CREATE INDEX "FraudFlag_type_idx" ON "FraudFlag"("type");

-- CreateIndex
CREATE INDEX "FraudFlag_severity_idx" ON "FraudFlag"("severity");

-- CreateIndex
CREATE INDEX "FraudFlag_createdAt_idx" ON "FraudFlag"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_idx" ON "WebhookEvent"("source");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_processed_idx" ON "WebhookEvent"("processed");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- CreateIndex
CREATE INDEX "AppSetting_key_idx" ON "AppSetting"("key");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProfile" ADD CONSTRAINT "AffiliateProfile_uplineId_fkey" FOREIGN KEY ("uplineId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProfile" ADD CONSTRAINT "AffiliateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_uplineLeaderId_fkey" FOREIGN KEY ("uplineLeaderId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "AffiliateLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "Click"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_conversionId_fkey" FOREIGN KEY ("conversionId") REFERENCES "Conversion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Override" ADD CONSTRAINT "Override_conversionId_fkey" FOREIGN KEY ("conversionId") REFERENCES "Conversion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Override" ADD CONSTRAINT "Override_earnerId_fkey" FOREIGN KEY ("earnerId") REFERENCES "AffiliateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Override" ADD CONSTRAINT "Override_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AffiliateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutItem" ADD CONSTRAINT "PayoutItem_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GHLOpportunity" ADD CONSTRAINT "GHLOpportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GHLOpportunity" ADD CONSTRAINT "GHLOpportunity_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudFlag" ADD CONSTRAINT "FraudFlag_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

