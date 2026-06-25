/**
 * Commission calculation engine for WeShare affiliate & partner programs.
 *
 * Affiliate tiers:
 *   Catalyst (0 sales):  10% setup / 5% residual x12 mo
 *   Builder  (3 sales):  15% setup / 5% residual x24 mo / 5% override x12 mo
 *   Architect(10 sales): 20% setup / 7.5% residual ∞  / 5% override x24 mo
 *   Sovereign(25 sales): 25% setup / 10% residual ∞   / 5% setup override ∞ + 2.5% residual override ∞
 *
 * Partner tier:
 *   35% of $997 setup = $348.95 upfront
 *   25% of $247 maintenance = $61.75/mo for life
 */

import { AffiliateRank, CommissionType } from "@prisma/client";
import { addMonths } from "date-fns";
import {
  COMMISSION_CONFIGS,
  PARTNER_COMMISSION,
  PRODUCT_PRICING,
  RANK_THRESHOLDS,
} from "@/types";
import db from "./db";

// ─── Rank calculation ─────────────────────────────────────────────────────────

export function calculateRank(lifetimeSales: number): AffiliateRank {
  if (lifetimeSales >= RANK_THRESHOLDS.SOVEREIGN) return "SOVEREIGN";
  if (lifetimeSales >= RANK_THRESHOLDS.ARCHITECT) return "ARCHITECT";
  if (lifetimeSales >= RANK_THRESHOLDS.BUILDER) return "BUILDER";
  return "CATALYST";
}

export function nextRankInfo(
  lifetimeSales: number
): { rank: AffiliateRank; salesNeeded: number } | null {
  if (lifetimeSales < RANK_THRESHOLDS.BUILDER) {
    return {
      rank: "BUILDER",
      salesNeeded: RANK_THRESHOLDS.BUILDER - lifetimeSales,
    };
  }
  if (lifetimeSales < RANK_THRESHOLDS.ARCHITECT) {
    return {
      rank: "ARCHITECT",
      salesNeeded: RANK_THRESHOLDS.ARCHITECT - lifetimeSales,
    };
  }
  if (lifetimeSales < RANK_THRESHOLDS.SOVEREIGN) {
    return {
      rank: "SOVEREIGN",
      salesNeeded: RANK_THRESHOLDS.SOVEREIGN - lifetimeSales,
    };
  }
  return null; // already Sovereign
}

// ─── Setup fee commission ─────────────────────────────────────────────────────

export function calculateSetupCommission(rank: AffiliateRank): {
  rate: number;
  amount: number;
  type: CommissionType;
} {
  const config = COMMISSION_CONFIGS[rank];
  return {
    rate: config.setupFeeRate,
    amount: parseFloat(config.setupFeeAmount.toFixed(2)),
    type: "SETUP_FEE",
  };
}

// ─── Residual (monthly maintenance) commission ────────────────────────────────

export function calculateResidualCommission(
  rank: AffiliateRank,
  monthNumber: number // 1-based: which billing cycle is this?
): { eligible: boolean; rate: number; amount: number; expiresAt: Date | null } {
  const config = COMMISSION_CONFIGS[rank];

  if (config.residualMonths !== null && monthNumber > config.residualMonths) {
    return { eligible: false, rate: 0, amount: 0, expiresAt: null };
  }

  const expiresAt =
    config.residualMonths !== null
      ? addMonths(new Date(), config.residualMonths - monthNumber + 1)
      : null;

  return {
    eligible: true,
    rate: config.residualRate,
    amount: parseFloat(config.residualAmount.toFixed(2)),
    expiresAt,
  };
}

// ─── Override commission (Army Builder) ───────────────────────────────────────

export function calculateOverrideSetup(
  earnerRank: AffiliateRank,
  conversionDate: Date
): { eligible: boolean; rate: number; amount: number; expiresAt: Date | null } {
  const config = COMMISSION_CONFIGS[earnerRank];

  if (config.overrideSetupRate === 0) {
    return { eligible: false, rate: 0, amount: 0, expiresAt: null };
  }

  const expiresAt =
    config.overrideMonths !== null
      ? addMonths(conversionDate, config.overrideMonths)
      : null;

  const amount = parseFloat(
    (PRODUCT_PRICING.setupFee * config.overrideSetupRate).toFixed(2)
  );

  return {
    eligible: true,
    rate: config.overrideSetupRate,
    amount,
    expiresAt,
  };
}

export function calculateOverrideResidual(
  earnerRank: AffiliateRank,
  enrollmentDate: Date,
  monthNumber: number
): { eligible: boolean; rate: number; amount: number; expiresAt: Date | null } {
  const config = COMMISSION_CONFIGS[earnerRank];

  // Only Sovereign earns residual overrides
  if (config.overrideResidualRate === 0) {
    return { eligible: false, rate: 0, amount: 0, expiresAt: null };
  }

  const expiresAt =
    config.overrideMonths !== null
      ? addMonths(enrollmentDate, config.overrideMonths)
      : null;

  if (expiresAt && new Date() > expiresAt) {
    return { eligible: false, rate: 0, amount: 0, expiresAt };
  }

  const amount = parseFloat(
    (PRODUCT_PRICING.monthlyMaintenance * config.overrideResidualRate).toFixed(2)
  );

  return {
    eligible: true,
    rate: config.overrideResidualRate,
    amount,
    expiresAt,
  };
}

// ─── Partner commission ───────────────────────────────────────────────────────

export function calculatePartnerSetupCommission() {
  return {
    rate: PARTNER_COMMISSION.setupFeeRate,
    amount: parseFloat(PARTNER_COMMISSION.setupFeeAmount.toFixed(2)),
    type: "PARTNER_SETUP" as CommissionType,
  };
}

export function calculatePartnerResidualCommission() {
  return {
    rate: PARTNER_COMMISSION.residualRate,
    amount: parseFloat(PARTNER_COMMISSION.residualAmount.toFixed(2)),
    type: "PARTNER_RESIDUAL" as CommissionType,
  };
}

// ─── Fast-start bonus ─────────────────────────────────────────────────────────

export function isEligibleForFastStart(
  joinedAt: Date,
  firstSaleAt: Date
): boolean {
  const msWindow = PRODUCT_PRICING.fastStartWindowDays * 24 * 60 * 60 * 1000;
  return firstSaleAt.getTime() - joinedAt.getTime() <= msWindow;
}

// ─── Full conversion processing ───────────────────────────────────────────────

export async function processSetupFeeConversion(conversionId: string) {
  const conversion = await db.conversion.findUniqueOrThrow({
    where: { id: conversionId },
    include: {
      affiliate: true,
      partner: true,
    },
  });

  const commissionsToCreate: {
    conversionId: string;
    affiliateId?: string;
    partnerId?: string;
    type: CommissionType;
    rankAtTime?: AffiliateRank;
    grossRevenue: number;
    commissionRate: number;
    amount: number;
    status: "PENDING";
  }[] = [];

  // Affiliate commission
  if (conversion.affiliateId && conversion.affiliate) {
    const rank = conversion.affiliate.rank;
    const { rate, amount } = calculateSetupCommission(rank);
    commissionsToCreate.push({
      conversionId,
      affiliateId: conversion.affiliateId,
      type: "SETUP_FEE",
      rankAtTime: rank,
      grossRevenue: conversion.grossRevenue,
      commissionRate: rate,
      amount,
      status: "PENDING",
    });

    // Army override (upline earns on downline's sale)
    if (conversion.affiliate.uplineId) {
      const upline = await db.affiliateProfile.findUnique({
        where: { id: conversion.affiliate.uplineId },
      });
      if (upline) {
        const override = calculateOverrideSetup(upline.rank, conversion.createdAt);
        if (override.eligible) {
          await db.override.create({
            data: {
              conversionId,
              earnerId: upline.id,
              sourceId: conversion.affiliateId,
              overrideType: "SETUP_FEE",
              rankAtTime: upline.rank,
              overrideRate: override.rate,
              amount: override.amount,
              expiresAt: override.expiresAt,
              status: "PENDING",
            },
          });
        }
      }
    }
  }

  // Partner commission
  if (conversion.partnerId) {
    const { rate, amount, type } = calculatePartnerSetupCommission();
    commissionsToCreate.push({
      conversionId,
      partnerId: conversion.partnerId,
      type,
      grossRevenue: conversion.grossRevenue,
      commissionRate: rate,
      amount,
      status: "PENDING",
    });
  }

  if (commissionsToCreate.length > 0) {
    await db.commission.createMany({ data: commissionsToCreate });
  }

  // Update affiliate stats and check rank promotion
  if (conversion.affiliateId && conversion.affiliate) {
    const newSalesCount = conversion.affiliate.lifetimeSales + 1;
    const newRank = calculateRank(newSalesCount);
    const rankPromoted = newRank !== conversion.affiliate.rank;

    const rankTimestamps: Record<string, Date> = {};
    if (rankPromoted) {
      if (newRank === "BUILDER") rankTimestamps.builderAt = new Date();
      if (newRank === "ARCHITECT") rankTimestamps.architectAt = new Date();
      if (newRank === "SOVEREIGN") rankTimestamps.sovereignAt = new Date();
    }

    // Fast-start bonus
    let fastStartBonus = false;
    if (
      !conversion.affiliate.fastStartBonusEarned &&
      conversion.affiliate.firstSaleAt === null &&
      isEligibleForFastStart(conversion.affiliate.createdAt, new Date())
    ) {
      fastStartBonus = true;
      commissionsToCreate.push({
        conversionId,
        affiliateId: conversion.affiliateId,
        type: "FAST_START_BONUS",
        rankAtTime: newRank,
        grossRevenue: 0,
        commissionRate: 1,
        amount: PRODUCT_PRICING.fastStartBonus,
        status: "PENDING",
      });
      await db.commission.create({
        data: {
          conversionId,
          affiliateId: conversion.affiliateId,
          type: "FAST_START_BONUS",
          rankAtTime: newRank,
          grossRevenue: 0,
          commissionRate: 1,
          amount: PRODUCT_PRICING.fastStartBonus,
          status: "PENDING",
        },
      });
    }

    await db.affiliateProfile.update({
      where: { id: conversion.affiliateId },
      data: {
        lifetimeSales: newSalesCount,
        rank: newRank,
        totalConversions: { increment: 1 },
        ...(rankPromoted ? rankTimestamps : {}),
        ...(fastStartBonus ? { fastStartBonusEarned: true, firstSaleAt: new Date() } : {}),
        ...(conversion.affiliate.firstSaleAt === null ? { firstSaleAt: new Date() } : {}),
      },
    });
  }

  // Update partner stats
  if (conversion.partnerId) {
    await db.partnerProfile.update({
      where: { id: conversion.partnerId },
      data: { totalDealsWon: { increment: 1 } },
    });
  }

  return { commissionsCreated: commissionsToCreate.length };
}

// ─── Clawback processing ──────────────────────────────────────────────────────

export async function processClawback(
  conversionId: string,
  reason: string,
  executedBy: string
) {
  // Void all PENDING/APPROVED commissions for this conversion
  const commissions = await db.commission.findMany({
    where: {
      conversionId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });

  const overrides = await db.override.findMany({
    where: {
      conversionId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });

  const now = new Date();

  await db.$transaction([
    db.commission.updateMany({
      where: { conversionId, status: { in: ["PENDING", "APPROVED"] } },
      data: {
        status: "CLAWBACK",
        clawbackAt: now,
        clawbackReason: reason,
        clawbackExecutedBy: executedBy,
      },
    }),
    db.override.updateMany({
      where: { conversionId, status: { in: ["PENDING", "APPROVED"] } },
      data: { status: "CLAWBACK" },
    }),
    // Create void ledger entries for any already-PAID commissions
    ...commissions
      .filter((c) => c.status === "APPROVED")
      .map((c) =>
        db.commission.create({
          data: {
            conversionId: c.conversionId,
            affiliateId: c.affiliateId,
            partnerId: c.partnerId,
            type: c.type,
            rankAtTime: c.rankAtTime,
            grossRevenue: c.grossRevenue,
            commissionRate: c.commissionRate,
            amount: -Math.abs(c.amount),
            status: "VOID",
            isVoidEntry: true,
            originalCommId: c.id,
            voidMemo: `Clawback: ${reason}`,
            clawbackAt: now,
            clawbackExecutedBy: executedBy,
          },
        })
      ),
  ]);

  return {
    commissionsVoided: commissions.length,
    overridesVoided: overrides.length,
  };
}
