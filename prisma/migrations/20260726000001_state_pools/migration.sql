-- Sales-partner state pools: each partner claims one state; capacity per
-- state is enforced in the app layer (AppSetting-driven, default 1).
ALTER TABLE "PartnerProfile" ADD COLUMN "assignedState" TEXT;
CREATE INDEX "PartnerProfile_assignedState_idx" ON "PartnerProfile"("assignedState");
