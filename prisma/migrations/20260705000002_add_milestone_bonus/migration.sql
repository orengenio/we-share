-- Add MILESTONE_BONUS to the CommissionType enum.
-- Placed after FAST_START_BONUS to keep related bonus types adjacent.
ALTER TYPE "CommissionType" ADD VALUE IF NOT EXISTS 'MILESTONE_BONUS' AFTER 'FAST_START_BONUS';
