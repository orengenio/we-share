/**
 * Commission calculation engine for WeShare affiliate & partner programs.
 *
 * Affiliate tiers (rate × actual package price):
 *   Catalyst (0 sales):  10% setup / 5% residual x12 mo
 *   Builder  (3 sales):  15% setup / 5% residual x24 mo / 5% override x12 mo
 *   Architect(10 sales): 20% setup / 7.5% residual ∞  / 5% override x24 mo
 *   Sovereign(25 sales): 25% setup / 10% residual ∞   / 5% setup override ∞ + 2.5% residual override ∞
 *
 * Partner tier (flat, any package):
 *   25% of setup fee
 *   25% of monthly maintenance for life
 *
 * Partner Leader (internal promotion only):
 *   Full partner commissions PLUS 5% team setup override + 5% team residual override
 */

import { AffiliateRank, CommissionType } from "@prisma/client";
import { addMonths, addDays } from "date-fns";
import {
  COMMISSION_CONFIGS,
  PARTNER_COMMISSION,
  LEADER_COMMISSION,
  PRODUCT_PRICING,
  MILESTONE_BONUSES,
  RANK_THRESHOLDS,
  WEBSITE_PACKAGES,
} from "@/types";
import db from "./db";

/** Days before a commission becomes payout-eligible (NET-15 default). */
export function commissionMaturityDate(from: Date = new Date()): Date {
  const days = parseInt(process.env.COMMISSION_MATURITY_DAYS ?? "15", 10);
  return addDays(from, days);
}

// ─── Package fee resolution ───────────────────────────────────────────────────

const SETUP_FEES = Object.values(WEBSITE_PACKAGES).map((p) => p.setupFee);
const MONTHLY_FEES = Object.values(WEBSITE_PACKAGES).map((p) => p.monthlyFee);

/**
 * Map a paid dollar amount to the canonical package fee it corresponds to.
 * Commissions must be computed on the real package price, not a hardcoded
 * Standard-tier figure. The three tiers are far enough apart that closest-match
 * is robust even when a checkout bundles the setup fee with the first month
 * (e.g. Standard $997+$247=$1,244 is still closest to the $997 setup fee).
 */
export function resolvePackageFee(amountDollars: number, kind: "setup" | "monthly"): number {
  const fees = kind === "setup" ? SETUP_FEES : MONTHLY_FEES;
  return fees.reduce(
    (best, f) => (Math.abs(f - amountDollars) < Math.abs(best - amountDollars) ? f : best),
    fees[0]
  );
}

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
    return { rank: "BUILDER", salesNeeded: RANK_THRESHOLDS.BUILDER - lifetimeSales };
  }
  if (lifetimeSales < RANK_THRESHOLDS.ARCHITECT) {
    return { rank: "ARCHITECT", salesNeeded: RANK_THRESHOLDS.ARCHITECT - lifetimeSales };
  }
  if (lifetimeSales < RANK_THRESHOLDS.SOVEREIGN) {
    return { rank: "SOVEREIGN", salesNeeded: RANK_THRESHOLDS.SOVEREIGN - lifetimeSales };
  }
  return null;
}

// ─── Setup fee commission ─────────────────────────────────────────────────────

export function calculateSetupCommission(rank: AffiliateRank, grossRevenue: number): {
  rate: number;
  amount: number;
  type: CommissionType;
} {
  const config = COMMISSION_CONFIGS[rank];
  return {
    rate: config.setupFeeRate,
    amount: parseFloat((grossRevenue * config.setupFeeRate).toFixed(2)),
    type: "SETUP_FEE",
  };
}

// ─── Residual (monthly maintenance) commission ────────────────────────────────

export function calculateResidualCommission(
  rank: AffiliateRank,
  monthlyFee: number,
  monthNumber: number
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
    amount: parseFloat((monthlyFee * config.residualRate).toFixed(2)),
    expiresAt,
  };
}

// ─── Override commission (Army Builder) ───────────────────────────────────────

export function calculateOverrideSetup(
  earnerRank: AffiliateRank,
  grossRevenue: number,
  enrollmentDate: Date,
  conversionDate: Date
): { eligible: boolean; rate: number; amount: number; expiresAt: Date | null } {
  const config = COMMISSION_CONFIGS[earnerRank];

  if (config.overrideSetupRate === 0) {
    return { eligible: false, rate: 0, amount: 0, expiresAt: null };
  }

  // The override window is anchored to when the downline enrolled, not to the
  // sale date. Builder = 12 months, Architect = 24, Sovereign = unlimited.
  const expiresAt =
    config.overrideMonths !== null
      ? addMonths(enrollmentDate, config.overrideMonths)
      : null;

  if (expiresAt && conversionDate > expiresAt) {
    return { eligible: false, rate: 0, amount: 0, expiresAt };
  }

  return {
    eligible: true,
    rate: config.overrideSetupRate,
    amount: parseFloat((grossRevenue * config.overrideSetupRate).toFixed(2)),
    expiresAt,
  };
}

export function calculateOverrideResidual(
  earnerRank: AffiliateRank,
  monthlyFee: number,
  enrollmentDate: Date,
  monthNumber: number
): { eligible: boolean; rate: number; amount: number; expiresAt: Date | null } {
  const config = COMMISSION_CONFIGS[earnerRank];

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

  return {
    eligible: true,
    rate: config.overrideResidualRate,
    amount: parseFloat((monthlyFee * config.overrideResidualRate).toFixed(2)),
    expiresAt,
  };
}

// ─── Partner commission ───────────────────────────────────────────────────────

export function calculatePartnerSetupCommission(grossRevenue: number) {
  return {
    rate: PARTNER_COMMISSION.setupFeeRate,
    amount: parseFloat((grossRevenue * PARTNER_COMMISSION.setupFeeRate).toFixed(2)),
    type: "PARTNER_SETUP" as CommissionType,
  };
}

export function calculatePartnerResidualCommission(monthlyFee: number) {
  return {
    rate: PARTNER_COMMISSION.residualRate,
    amount: parseFloat((monthlyFee * PARTNER_COMMISSION.residualRate).toFixed(2)),
    type: "PARTNER_RESIDUAL" as CommissionType,
  };
}

// ─── Partner Leader override commission ───────────────────────────────────────

export function calculateLeaderSetupOverride(grossRevenue: number) {
  return {
    rate: LEADER_COMMISSION.setupOverrideRate,
    amount: parseFloat((grossRevenue * LEADER_COMMISSION.setupOverrideRate).toFixed(2)),
    type: "LEADER_SETUP_OVERRIDE" as CommissionType,
  };
}

export function calculateLeaderResidualOverride(monthlyFee: number) {
  return {
    rate: LEADER_COMMISSION.residualOverrideRate,
    amount: parseFloat((monthlyFee * LEADER_COMMISSION.residualOverrideRate).toFixed(2)),
    type: "LEADER_RESIDUAL_OVERRIDE" as CommissionType,
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

  // Affiliate commission — rate × actual package gross revenue
  if (conversion.affiliateId && conversion.affiliate) {
    const rank = conversion.affiliate.rank;
    const { rate, amount } = calculateSetupCommission(rank, conversion.grossRevenue);
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
        const override = calculateOverrideSetup(
          upline.rank,
          conversion.grossRevenue,
          conversion.affiliate.createdAt, // downline's enrollment date anchors the window
          conversion.createdAt
        );
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

  // Partner commission — 25% × actual package gross revenue
  if (conversion.partnerId) {
    const { rate, amount, type } = calculatePartnerSetupCommission(conversion.grossRevenue);
    commissionsToCreate.push({
      conversionId,
      partnerId: conversion.partnerId,
      type,
      grossRevenue: conversion.grossRevenue,
      commissionRate: rate,
      amount,
      status: "PENDING",
    });

    // Partner Leader override — 5% × gross revenue paid to the upline leader
    const partnerForLeader = await db.partnerProfile.findUnique({
      where: { id: conversion.partnerId },
      select: { uplineLeaderId: true },
    });
    if (partnerForLeader?.uplineLeaderId) {
      const leader = await db.partnerProfile.findUnique({
        where: { id: partnerForLeader.uplineLeaderId },
        select: { id: true, isLeader: true, isActive: true },
      });
      if (leader?.isLeader && leader.isActive) {
        const override = calculateLeaderSetupOverride(conversion.grossRevenue);
        commissionsToCreate.push({
          conversionId,
          partnerId: leader.id,
          type: override.type,
          grossRevenue: conversion.grossRevenue,
          commissionRate: override.rate,
          amount: override.amount,
          status: "PENDING",
        });
      }
    }
  }

  if (commissionsToCreate.length > 0) {
    const maturesAt = commissionMaturityDate();
    await db.commission.createMany({
      data: commissionsToCreate.map((c) => ({ ...c, maturesAt })),
    });
    const { emitEvent } = await import("./events");
    emitEvent("commission.created", { conversionId, count: commissionsToCreate.length });
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

    // One-time milestone bonus, automatic on first promotion to each rank.
    if (rankPromoted && MILESTONE_BONUSES[newRank] !== undefined) {
      await db.commission.create({
        data: {
          conversionId,
          affiliateId: conversion.affiliateId,
          type: "MILESTONE_BONUS",
          rankAtTime: newRank,
          grossRevenue: 0,
          commissionRate: 1,
          amount: MILESTONE_BONUSES[newRank],
          status: "PENDING",
          maturesAt: commissionMaturityDate(),
        },
      });
    }

    // Fast-start bonus — flat $50 on first sale within 14 days of joining
    let fastStartBonus = false;
    if (
      !conversion.affiliate.fastStartBonusEarned &&
      conversion.affiliate.firstSaleAt === null &&
      isEligibleForFastStart(conversion.affiliate.createdAt, new Date())
    ) {
      fastStartBonus = true;
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
          maturesAt: commissionMaturityDate(),
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

// ─── Residual (monthly maintenance) conversion processing ─────────────────────

/**
 * Process a MONTHLY_MAINTENANCE conversion. Unlike setup, this pays residual
 * rates (with the per-rank duration cap), creates residual overrides, and does
 * NOT touch lifetimeSales / rank / fast-start / deal counts — a recurring
 * payment is not a new "sale".
 */
export async function processResidualConversion(conversionId: string) {
  const conversion = await db.conversion.findUniqueOrThrow({
    where: { id: conversionId },
    include: { affiliate: true, partner: true },
  });

  const monthlyFee = conversion.grossRevenue;

  // Month number = how many maintenance payments this client has generated so
  // far (this one included). Drives the Catalyst 12mo / Builder 24mo caps.
  const monthNumber = await db.conversion.count({
    where: {
      leadId: conversion.leadId,
      type: "MONTHLY_MAINTENANCE",
      createdAt: { lte: conversion.createdAt },
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

  // Affiliate residual — rate × monthly fee, capped by rank duration.
  if (conversion.affiliateId && conversion.affiliate) {
    const rank = conversion.affiliate.rank;
    const residual = calculateResidualCommission(rank, monthlyFee, monthNumber);
    if (residual.eligible) {
      commissionsToCreate.push({
        conversionId,
        affiliateId: conversion.affiliateId,
        type: "MONTHLY_MAINTENANCE",
        rankAtTime: rank,
        grossRevenue: monthlyFee,
        commissionRate: residual.rate,
        amount: residual.amount,
        status: "PENDING",
      });
    }

    // Army residual override (Sovereign only, 2.5%), window anchored to the
    // downline's enrollment date.
    if (conversion.affiliate.uplineId) {
      const upline = await db.affiliateProfile.findUnique({
        where: { id: conversion.affiliate.uplineId },
      });
      if (upline) {
        const override = calculateOverrideResidual(
          upline.rank,
          monthlyFee,
          conversion.affiliate.createdAt,
          monthNumber
        );
        if (override.eligible) {
          await db.override.create({
            data: {
              conversionId,
              earnerId: upline.id,
              sourceId: conversion.affiliateId,
              overrideType: "MONTHLY_RESIDUAL",
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

  // Partner residual — flat 25% of monthly fee, for life.
  if (conversion.partnerId) {
    const partnerResidual = calculatePartnerResidualCommission(monthlyFee);
    commissionsToCreate.push({
      conversionId,
      partnerId: conversion.partnerId,
      type: partnerResidual.type,
      grossRevenue: monthlyFee,
      commissionRate: partnerResidual.rate,
      amount: partnerResidual.amount,
      status: "PENDING",
    });

    // Partner Leader residual override — 5% of monthly fee to the upline leader.
    const partnerForLeader = await db.partnerProfile.findUnique({
      where: { id: conversion.partnerId },
      select: { uplineLeaderId: true },
    });
    if (partnerForLeader?.uplineLeaderId) {
      const leader = await db.partnerProfile.findUnique({
        where: { id: partnerForLeader.uplineLeaderId },
        select: { id: true, isLeader: true, isActive: true },
      });
      if (leader?.isLeader && leader.isActive) {
        const override = calculateLeaderResidualOverride(monthlyFee);
        commissionsToCreate.push({
          conversionId,
          partnerId: leader.id,
          type: override.type,
          grossRevenue: monthlyFee,
          commissionRate: override.rate,
          amount: override.amount,
          status: "PENDING",
        });
      }
    }
  }

  if (commissionsToCreate.length > 0) {
    const maturesAt = commissionMaturityDate();
    await db.commission.createMany({
      data: commissionsToCreate.map((c) => ({ ...c, maturesAt })),
    });
  }

  return { commissionsCreated: commissionsToCreate.length };
}

// ─── Commission maturation ────────────────────────────────────────────────────

/**
 * Promote PENDING commissions whose hold window has passed (and whose
 * conversion wasn't refunded) to APPROVED — payout-eligible. Shared by the
 * admin "mature" action and payout generation, so a payout run can never
 * silently exclude commissions just because nobody clicked the button.
 */
export async function matureEligibleCommissions(actorUserId?: string) {
  const now = new Date();

  const pending = await db.commission.findMany({
    where: {
      status: "PENDING",
      OR: [{ maturesAt: null }, { maturesAt: { lte: now } }],
      conversion: { isRefunded: false },
    },
    select: { id: true, conversionId: true },
  });

  if (pending.length === 0) return { approved: 0, overridesApproved: 0 };

  const ids = pending.map((c) => c.id);
  const conversionIds = [...new Set(pending.map((c) => c.conversionId))];

  const [result, overrideResult] = await db.$transaction([
    db.commission.updateMany({
      where: { id: { in: ids } },
      data: { status: "APPROVED", approvedAt: now },
    }),
    db.override.updateMany({
      where: { conversionId: { in: conversionIds }, status: "PENDING" },
      data: { status: "APPROVED" },
    }),
  ]);

  await db.auditLog.create({
    data: {
      ...(actorUserId ? { userId: actorUserId } : {}),
      action: "COMMISSIONS_MATURED",
      resource: "Commission",
      details: { count: result.count, commissionIds: ids },
    },
  });

  return { approved: result.count, overridesApproved: overrideResult.count };
}

// ─── Clawback processing ──────────────────────────────────────────────────────

export async function processClawback(
  conversionId: string,
  reason: string,
  executedBy: string
) {
  const commissions = await db.commission.findMany({
    where: {
      conversionId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });

  // Already-paid commissions can't be voided — the money left. Net them
  // instead: a negative APPROVED adjustment flows into the earner's next
  // payout aggregation and settles the debt automatically.
  const paidCommissions = await db.commission.findMany({
    where: { conversionId, status: "PAID", isVoidEntry: false },
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
    // Negative adjustments for paid-out commissions: APPROVED so the next
    // payout run's period aggregation nets them against new earnings.
    ...paidCommissions.map((c) =>
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
          status: "APPROVED",
          approvedAt: now,
          isVoidEntry: true,
          originalCommId: c.id,
          voidMemo: `Clawback (already paid — nets against next payout): ${reason}`,
          clawbackAt: now,
          clawbackExecutedBy: executedBy,
        },
      })
    ),
    ...(paidCommissions.length > 0
      ? [
          db.commission.updateMany({
            where: { id: { in: paidCommissions.map((c) => c.id) } },
            data: {
              clawbackAt: now,
              clawbackReason: reason,
              clawbackExecutedBy: executedBy,
            },
          }),
        ]
      : []),
  ]);

  const { emitEvent } = await import("./events");
  emitEvent("commission.clawback", {
    conversionId,
    reason,
    executedBy,
    commissionsVoided: commissions.length,
    overridesVoided: overrides.length,
    paidNetted: paidCommissions.length,
  });

  return {
    commissionsVoided: commissions.length,
    overridesVoided: overrides.length,
    paidNetted: paidCommissions.length,
  };
}
